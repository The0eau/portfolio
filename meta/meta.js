let data = [];
let commits = [];

const width = 1000;
const height = 600;

// Define margins for the chart
const margin = { top: 10, right: 10, bottom: 30, left: 20 };

// Define usable area within the chart (after accounting for margins)
const usableArea = {
  top: margin.top,
  right: width - margin.right,
  bottom: height - margin.bottom,
  left: margin.left,
  width: width - margin.left - margin.right,
  height: height - margin.top - margin.bottom,
};

// Load data from CSV and convert fields
async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),      // Convert line to a number
    depth: Number(row.depth),    // Convert depth to a number
    length: Number(row.length),  // Convert length to a number
    date: new Date(row.date + 'T00:00' + row.timezone),  // Parse date
    datetime: new Date(row.datetime),  // Parse datetime
  }));

  // Process commits and display stats
  processCommits();
  displayStats();
  createScatterplot();  // Create scatterplot after data is loaded
}

// Group data by commit
function groupByCommit() {
  commits = d3.groups(data, (d) => d.commit);
  console.log(commits); // Print grouped commits to check the structure
}

// Process grouped commit data
function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)  // Group by commit
    .map(([commit, lines]) => {
      let first = lines[0];  // The first line of the commit to extract common properties

      // Destructure properties from the first line in the commit group
      let { author, date, time, timezone, datetime } = first;

      // Prepare the commit object
      let ret = {
        id: commit,
        url: `https://github.com/YOUR_REPO/commit/${commit}`,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,  // Calculate hour as decimal
        totalLines: lines.length,  // Number of lines modified in the commit
      };

      // Hide the original lines data from direct printing
      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: true,     // Allow modification if necessary
        enumerable: false,  // Do not display 'lines' when logging the object
        configurable: true, // Allow property redefinition if needed
      });

      return ret;
    });
}

// Display stats in the <dl> list
function displayStats() {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC (Lines of Code)
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add other stats...
  const maxDepth = d3.max(data, d => d.depth);
  dl.append('dt').text('Maximum Depth');
  dl.append('dd').text(maxDepth);

  const avgDepth = d3.mean(data, d => d.depth);
  dl.append('dt').text('Average Depth');
  dl.append('dd').text(avgDepth.toFixed(2));
}

// Update the tooltip content and position near the mouse cursor
function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  time.textContent = commit.datetime?.toLocaleString('en', { timeStyle: 'short' });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

// Update the tooltip visibility
function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

// Update the tooltip position near the mouse cursor
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 10}px`;  // Slight offset to avoid overlap with the cursor
  tooltip.style.top = `${event.clientY + 10}px`;  // Slight offset to avoid overlap with the cursor
}

// Create scatterplot visualization
function createScatterplot() {
  // Sort commits by total lines in descending order (larger dots rendered first)
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  // Create SVG element
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // X scale (time scale for datetime)
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(sortedCommits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  // Y scale (linear scale for hours of the day)
  const yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.height, 0]);

  // Calculate the range of edited lines across all commits
  const [minLines, maxLines] = d3.extent(sortedCommits, (d) => d.totalLines);

  // Use a square root scale for the radius to correct the area perception
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]); // adjust min and max values as needed

  // Create gridlines
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines
    .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));  // No labels, long ticks

  // Append circles for each commit to the scatterplot
  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(sortedCommits) // Use sortedCommits here
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime)) // Position along the X axis
    .attr('cy', (d) => yScale(d.hourFrac)) // Position along the Y axis
    .attr('r', (d) => rScale(d.totalLines)) // Use the square root scale to set the size of the dot
    .style('fill', (d) => getColorByTime(d.hourFrac))  // Add color based on time of day
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', function (event, d) {
      d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
      updateTooltipContent(d); // Update tooltip content on hover
      updateTooltipVisibility(true); // Show tooltip
      updateTooltipPosition(event); // Position tooltip near the cursor
    })
    .on('mouseleave', function () {
      d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
      updateTooltipContent({}); // Clear tooltip content on mouseleave
      updateTooltipVisibility(false); // Hide tooltip
    });

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');  // Format Y-axis as time

  // Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.height})`)
    .call(xAxis);

  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  // Call brush selector to enable brushing
  brushSelector();
}

// Color the dots based on the time of day (bluer for night, orangish for day)
function getColorByTime(hourFrac) {
  const hour = Math.floor(hourFrac);  // Get the hour from the hour fraction

  if (hour >= 6 && hour < 12) {
    return '#FFA500'; // Morning: Orange
  } else if (hour >= 12 && hour < 18) {
    return '#FF6347'; // Afternoon: Tomato
  } else if (hour >= 18 && hour < 22) {
    return '#87CEEB'; // Evening: SkyBlue
  } else {
    return '#4682B4'; // Night: SteelBlue
  }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
