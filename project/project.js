import { fetchJSON, renderProjects } from 'https://the0eau.github.io/portfolio/global.js';
const projects = await fetchJSON('https://github.com/The0eau/portfolio/blob/main/lib/project.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');


const projectCount = document.querySelectorAll(".projects article").length;

document.querySelector(".projects-title").textContent = `Projects (${projectCount})`;