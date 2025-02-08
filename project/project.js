import { fetchJSON, renderProjects } from 'https://the0eau.github.io/portfolio/global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let projects = []; // Global variable to store project data

// Async function to load and render data
async function loadData() {
    // Fetch projects data
    projects = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/main/lib/project.json');

    renderProjects_(projects);

    // Render Pie Chart
    renderPieChart(projects);
}

// Function render projects, count projects and update title
function renderProjects_(projects){
  // Select project container and render projects
  const projectsContainer = document.querySelector('.projects');
  renderProjects(projects, projectsContainer, 'h2');

  // Count projects and update the title
  const projectCount = document.querySelectorAll(".projects article").length;
  document.querySelector(".projects-title").textContent = `${projectCount} projects`;
}


// Function to render pie chart
function renderPieChart(projectsGiven) {
    // Recalculate rolled data
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );
    
    // Recalculate data
    let newData = newRolledData.map(([year, count]) => ({
        value: count,
        label: year 
    }));

    // Choose colors  
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Calculate slice generator and arc data
    let newSliceGenerator = d3.pie().value((d) => d.value);

    // D3 Arc Generator
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    
    // Clear existing paths
    d3.select('svg').selectAll('path').remove();

    // Append new arcs to SVG
    let svg = d3.select("svg");
    newArcs.forEach((arc, i) => {
        svg.append("path")
           .attr("d", arc)
           .attr("fill", colors(i))
           .on("click", () => filterByYear(newData[i].label, projectsGiven));
    });

    // Clear existing legend and render legend
    d3.select('.legend').selectAll('li').remove();
    renderLegend(newData, colors, projectsGiven);
}

// Function to render the legend
function renderLegend(data, colors, projects) {
    let legend = d3.select(".legend");
    legend.selectAll("li").remove(); // Clean legend

    data.forEach((d, idx) => {
        legend.append("li")
              .attr("style", `--color:${colors(idx)}`)
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
              .on("click", () => filterByYear(d.label, projects));
    });
}

// Function to filter the projects by year
function filterByYear(year, allProjects) {
    let filteredProjects = allProjects.filter(project => project.year == year);
    renderPieChart(filteredProjects);
}

// Search functionality (Uses existing data instead of refetching)
document.querySelector(".searchBar").addEventListener("input", (event) => {
  let query = event.target.value.toLowerCase();

  let filteredProjects = projects.filter(project => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
  });

  renderProjects_(filteredProjects);
});

// Load data initially
loadData();
