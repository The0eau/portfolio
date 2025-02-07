import { fetchJSON, renderProjects } from 'https://the0eau.github.io/portfolio/global.js';
const projects = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/main/lib/project.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');


const projectCount = document.querySelectorAll(".projects article").length;

document.querySelector(".projects-title").textContent = `${projectCount} projects`;



import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";






// Function to render pie chart
function renderPieChart(projectsGiven) {
    // Recalculate rolled data
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
    
    // Recalculate data
    let newData = newRolledData.map(([year, count]) => ({
       value: count,
        label: year 
      }));
    

    // Chose colors  
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
    newArcs.forEach((arc, i) => {
        d3.select('svg')
            .append('path')
            .attr('d', arc)
            .attr('fill', colors(i))
            .on("click", () => filterByYear(data[idx].label));
    });
    
    // Clear existing legend and render legend
    d3.select('.legend').selectAll('li').remove();
    renderLegend(data, colors);
}

// Function to render the legend

function renderLegend(data, colors) {
  let legend = d3.select(".legend");
  legend.selectAll("li").remove(); // Nettoyer la légende avant de la redessiner

  data.forEach((d, idx) => {
      legend.append("li")
            .attr("style", `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .on("click", () => filterByYear(d.label));
  });
}

// Function to filter the projects by year
function filterByYear(year) {
  d3.json("data.json").then(projects => {
      let filteredProjects = projects.filter(project => project.year == year);
      renderPieChart(filteredProjects);
  });
}


document.querySelector(".searchBar").addEventListener("input", (event) => {
  let query = event.target.value.toLowerCase();

  d3.json("data.json").then(projects => {
      let filteredProjects = projects.filter(project => {
          let values = Object.values(project).join('\n').toLowerCase();
          return values.includes(query);
      });
      renderPieChart(filteredProjects);
    });
});

// Render Pie Chart
renderPieChart(projects);


