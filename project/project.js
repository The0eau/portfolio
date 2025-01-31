import { fetchJSON, renderProjects } from 'https://raw.githubusercontent.com/The0eau/portfolio/refs/heads/main/global.js';
const projects = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/refs/heads/main/lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');


const projectCount = document.querySelectorAll(".projects article").length;

document.querySelector(".projects-title").textContent = `Projects (${projectCount})`;