import { fetchJSON, renderProjects, fetchGitHubData } from 'https://the0eau.github.io/portfolio/global.js';
const projects = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/main/lib/project.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');