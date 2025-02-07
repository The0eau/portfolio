import { fetchJSON, renderProjects } from 'https://the0eau.github.io/portfolio/global.js';
const projects = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/main/lib/project.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');


const projectCount = document.querySelectorAll(".projects article").length;

document.querySelector(".projects-title").textContent = `${projectCount} projects`;



import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let data = [1, 2, 3, 4, 5, 5];
let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);
arcs.forEach(arc => {
    // TODO, fill in step for appending path to svg using D3
    d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr("fill", (d, i) => colors(i))
  })

