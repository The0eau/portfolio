// meta/main.js

let data = [];
let commits = [];
const width = 700;
const height = 400;
let xScale, yScale;

// Load the CSV data
async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  processCommits();
  displayStats();
  createScatterplot();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

function processCommits() {
  commits = d3.groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: `https://github.com/YOUR_REPO/commit/${commit}`,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', { value: lines, enumerable: false });
      return ret;
    });
}

function displayStats() {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  dl.append('dt').text('Number of files');
  dl.append('dd').text(d3.group(data, (d) => d.file).size);

  dl.append('dt').text('Max file length');
  dl.append('dd').text(d3.max(data, (d) => d.line));

  const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (v) => v.line),
    (d) => d.file
  );
  const averageFileLength = d3.mean(fileLengths, (d) => d[1]);
  dl.append('dt').text('Average file length');
  dl.append('dd').text(averageFileLength.toFixed(2));
}

// Create scatterplot of commit times
function createScatterplot() {
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('overflow', 'visible');

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // X scale for date
  xScale = d3.scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  // Y scale for hours of the day
  yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.height, 0]);

  // Gridlines
  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // Create axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
    .attr('transform', `translate(0, ${usableArea.height})`)
    .call(xAxis);

  svg.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  // Create the dots
  const dots = svg.append('g').attr('class', 'dots');

  const rScale = d3.scaleSqrt()
    .domain(d3.extent(commits, (d) => d.totalLines))
    .range([5, 50]);

  dots.selectAll('circle')
    .data(d3.sort(commits, (d) => -d.totalLines))
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });

  // Ensure dots are in front of the brush
  svg.selectAll('.dots').raise();
}

// Tooltip functions
function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!commit) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
  tooltip.style.visibility = isVisible ? 'visible' : 'hidden';
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.style.top = `${event.clientY + 10}px`;
}
