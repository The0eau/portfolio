import { fetchJSON, renderProjects } from 'https://the0eau.github.io/portfolio/global.js';
const projects = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/main/lib/project.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');


const projectCount = document.querySelectorAll(".projects article").length;

document.querySelector(".projects-title").textContent = `${projectCount} projects`;



import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
  );
  
let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach((arc, i) => {
    // TODO, fill in step for appending path to svg using D3
    d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr("fill", colors(i))
  })

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`) // set the inner html of <li>
          .attr("class", "legend-item")
          .attr(`--color:${colors(idx)}`)
})




