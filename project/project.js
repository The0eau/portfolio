import { fetchJSON, renderProjects } from 'https://the0eau.github.io/portfolio/global.js';
const projects = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/main/lib/project.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');


const projectCount = document.querySelectorAll(".projects article").length;

document.querySelector(".projects-title").textContent = `${projectCount} projects`;