import { fetchJSON, renderProjects, fetchGithubData } from 'https://raw.githubusercontent.com/The0eau/portfolio/refs/heads/main/global.js';
const projects = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/refs/heads/main/projects.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');