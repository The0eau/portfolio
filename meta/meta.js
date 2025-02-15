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

// Global variables for scales
let xScale, yScale, rScale;  // Define these globally


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
  console.log("B");
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const author = document.getElementById('commit-author');  // Added author element
  const time = document.getElementById('commit-time');      // Added time element
  const linesEdited = document.getElementById('commit-lines'); // Added lines edited element

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });

  // Display the author, time, and lines edited
  author.textContent = commit.author || 'Unknown'; // Default to 'Unknown' if no author
  time.textContent = commit.datetime?.toLocaleTimeString('en'); // Formats the time
  linesEdited.textContent = commit.totalLines || '0'; // Default to '0' if no lines edited
}


// Update the tooltip visibility
function updateTooltipVisibility(isVisible) {
    console.log("B");
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
    console.log(tooltip.hidden)
  }

// Update the tooltip position near the mouse cursor
function updateTooltipPosition(event) {
    console.log("D");
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

// Create scatterplot visualization
function createScatterplot() {
 // Sort commits by total lines in descending order
 const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

 // Create the scales globally
 xScale = d3.scaleTime()
   .domain(d3.extent(sortedCommits, (d) => d.datetime))
   .range([usableArea.left, usableArea.right])
   .nice();

 yScale = d3.scaleLinear()
   .domain([0, 24])
   .range([usableArea.height, 0]);

 const [minLines, maxLines] = d3.extent(sortedCommits, (d) => d.totalLines);

 rScale = d3.scaleSqrt()
   .domain([minLines, maxLines])
   .range([2, 30]);

  // Create SVG element
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width',width)
    .attr('height',height)
    .style('overflow', 'visible');

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
      console.log("A");
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




let brushSelection = null;

function brushSelector() {
    const svg = document.querySelector('svg');
    const brush = d3.brush()
      .extent([[0, 0], [width, height]])  // Set the brushable area to cover the entire SVG
      .on('start brush end', brushed);    // Listen for the brush events
  
    d3.select(svg).call(brush);  // Apply the brush to the SVG element
  
    // Raise dots and everything after overlay
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
  }

function brushed(event) {
    brushSelection = event.selection;
    
    if (!brushSelection) {  
        // If brushSelection is null (brush cleared), reset selection
        d3.selectAll('circle').classed('selected', false);
        document.getElementById('language-breakdown').innerHTML = ''; // Clear breakdown
        return;
    }

    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
}
  

  function isCommitSelected(commit) {
    if (!brushSelection) {
      return false;
    }
  
    const [[x0, y0], [x1, y1]] = brushSelection;
    const cx = xScale(commit.datetime);
    const cy = yScale(commit.hourFrac);
  
    return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
  }

function updateSelection() {
  // Update the visual state of the dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}


function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }

  


function updateLanguageBreakdown() {
    // Filter the selected commits using the brush selection
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';  // Clear the container if no commits are selected
      return;
    }
  
    // Use all commits if no selection or use the selected commits
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  
    // Flatten the lines from the required commits
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,  // Count the number of lines per language
      (d) => d.type      // Group by language type
    );
  
    // Update the DOM with the language breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;  // Calculate the proportion
      const formatted = d3.format('.1~%')(proportion);  // Format as percentage
  
      // Update the container with the language stats
      container.innerHTML += `
        <dt>${language}</dt>
        <dd>${count} lines (${formatted})</dd>
      `;
    }
  
    return breakdown;
  }
  

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
