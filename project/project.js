import { fetchJSON, renderProjects } from 'https://the0eau.github.io/portfolio/global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let projects = []; // Global variable to store project data

// Async function to load and render data
async function loadData() {
    // Fetch projects data
    projects = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/main/lib/project.json');

    // Render projects
    renderProjects_(projects);

    // Render pie chart
    renderPieChart(projects);
}

// Function to render projects, count projects, and update the title
function renderProjects_(projects) {
    const projectsContainer = document.querySelector('.projects');
    renderProjects(projects, projectsContainer, 'h2');

    // Count projects and update the title
    const projectCount = document.querySelectorAll(".projects article").length;
    document.querySelector(".projects-title").textContent = `${projectCount} projects`;
}

// Function to render the pie chart
function renderPieChart(projectsGiven, selectedYear = null) {
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
        let year = newData[i].label;
        svg.append("path")
           .attr("d", arc)
           .attr("fill", year === selectedYear ? "#FF0000" : colors(i)) // Turn red if selected
           .attr("data-year", year)
           .on("click", () => filterByYear(year)); 
    });

    // Clear existing legend and render legend
    d3.select('.legend').selectAll('li').remove();
    renderLegend(newData, colors);
}

// Function to render the legend
function renderLegend(data, colors) {
    let legend = d3.select(".legend");
    legend.selectAll("li").remove(); // Clean legend

    data.forEach((d, idx) => {
        legend.append("li")
              .attr("style", `--color:${colors(idx)}`)
              .attr("data-year", d.label) // Add data-year attribute for filtering
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
              .on("click", () => filterByYear(d.label));
    });
}

// Function to filter the projects by year
function filterByYear(year) {
    let query = document.querySelector(".searchBar").value.toLowerCase();

    // Apply search filter first
    let searchedProjects = projects.filter(project => 
        Object.values(project).join('\n').toLowerCase().includes(query)
    );

    // Now apply the year filter on the search results
    let filteredProjects = searchedProjects.filter(project => project.year == year);

    // Update legend selection
    document.querySelectorAll(".legend li").forEach(li => li.classList.remove("selected"));
    document.querySelector(`.legend li[data-year='${year}']`)?.classList.add("selected");

    // Re-render projects and pie chart with updated color
    renderProjects_(filteredProjects);
    renderPieChart(projects, year);
}

// Search functionality
document.querySelector(".searchBar").addEventListener("input", (event) => {
    let query = event.target.value.toLowerCase();

    // Retrieve the currently selected year (if any)
    let selectedYear = document.querySelector(".legend .selected")?.dataset.year;

    let filteredProjects = projects.filter(project => 
        Object.values(project).join('\n').toLowerCase().includes(query)
    );

    // If a year is selected, apply year filter on top of search filter
    if (selectedYear) {
        filterByYear(selectedYear)
    }
    });

// Load data initially
loadData();
