import { fetchJSON, getRelativePath } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/project.json');
const contentContainer = document.querySelector('#content');
const pageTitle = document.querySelector('#page-title');
const pageSubtitle = document.querySelector('.page-header p');

// Helper to categorize projects
function getProjectCategory(project) {
    const text = (project.title + ' ' + project.description).toLowerCase();
    if (/\bai\b/.test(text) || text.includes('machine learning') || text.includes('deep learning') || text.includes('llm') || text.includes('nlp') || text.includes('generative') || text.includes('neural') || text.includes('pytorch') || text.includes('tensorflow') || text.includes('openai') || text.includes('langchain')) {
        return 'ai-ml';
    }
    if (text.includes('dashboard') || text.includes('d3.js') || text.includes('mapbox') || text.includes('visualization') || text.includes('analytics')) {
        return 'data-viz';
    }
    return 'other'; // A fallback category
}

function findItem(id) {
    return projects.find(item => item.id === id);
}

// Renders a single project card for a list view
function renderCard(item) {
    const article = document.createElement('article');
    // This reuses the structure from education/pro pages but is adapted for projects
    article.innerHTML = `
      <div class="content">
        <h3>${item.title}</h3>
        <div class="meta">
            <span class="year">${item.year}</span>
        </div>
      </div>
    `;
    if (item.id) {
        article.style.cursor = 'pointer';
        article.onclick = (e) => {
            e.preventDefault();
            updateView('detail', item.id);
        };
    }
    return article;
}

// Renders the main category menu
function renderMenu() {
    pageTitle.textContent = "Projects";
    if (pageSubtitle) pageSubtitle.style.display = '';
    contentContainer.innerHTML = '';
    contentContainer.className = 'projects category-menu'; // Set class for styling
    
    const categories = [
        { title: "AI/ML Products", view: "ai-ml", description: "Applications using AI, Machine Learning, and LLMs." },
        { title: "Data Visualization & Analytics", view: "data-viz", description: "Interactive dashboards and data studies." },
        { title: "All Projects (with filters)", view: "all", description: "View all projects with advanced filtering tools." }
    ];

    categories.forEach(cat => {
        const article = document.createElement('article');
        article.innerHTML = `
            <h3>${cat.title}</h3>
            <p>${cat.description}</p>
        `;
        article.style.cursor = 'pointer';
        article.onclick = () => {
            updateView(cat.view);
        };
        contentContainer.appendChild(article);
    });
}

// Renders a simple list of projects for a category
function renderList(items, title) {
    pageTitle.innerHTML = '';
    if (pageSubtitle) pageSubtitle.style.display = 'none';
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Projects';
    link.onclick = (e) => {
        e.preventDefault();
        updateView('menu');
    };
    pageTitle.appendChild(link);
    pageTitle.appendChild(document.createTextNode(` > ${title}`));

    contentContainer.innerHTML = '';
    contentContainer.className = 'projects items-list'; // Set class for styling
    items.forEach(item => contentContainer.appendChild(renderCard(item)));
}

function renderDetail(id) {
    const item = findItem(id);
    if (!item) return;

    const category = getProjectCategory(item);
    let parentTitle = 'Projects';
    if (category === 'ai-ml') parentTitle = 'AI/ML Products';
    else if (category === 'data-viz') parentTitle = 'Data Visualization & Analytics';
    
    pageTitle.innerHTML = '';
    if (pageSubtitle) pageSubtitle.style.display = 'none';
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = parentTitle;
    link.onclick = (e) => {
        e.preventDefault();
        updateView(category);
    };
    pageTitle.appendChild(link);
    pageTitle.appendChild(document.createTextNode(` > ${item.title}`));

    if (item.details) {
        contentContainer.innerHTML = `
            <header class="hero">
                <div class="hero-text">
                    <h1>${item.title}</h1>
                    ${item.details.subtitle ? `<p class="subtitle">${item.details.subtitle}</p>` : ''}
                    ${item.details.intro ? `<p class="detail-intro">${item.details.intro}</p>` : ''}
                </div>
            </header>
            ${item.details.sections ? item.details.sections.map(section => `
                <section>
                    ${section.title ? `<h2>${section.title}</h2>` : ''}
                    ${section.content ? `<p>${section.content}</p>` : ''}
                    ${section.list ? `<ul>${section.list.map(li => `<li>${li}</li>`).join('')}</ul>` : ''}
                </section>
            `).join('') : ''}
            ${item.details.conclusion ? `<section><p>${item.details.conclusion}</p></section>` : ''}
        `;
    } else {
        contentContainer.innerHTML = "<p>No details available.</p>";
    }
    contentContainer.className = 'detail-view';
}

// Renders the full view with D3 chart and search
function renderAllView() {
    const title = "All Projects";
    pageTitle.innerHTML = '';
    if (pageSubtitle) pageSubtitle.style.display = 'none';
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Projects';
    link.onclick = (e) => {
        e.preventDefault();
        updateView('menu');
    };
    pageTitle.appendChild(link);
    pageTitle.appendChild(document.createTextNode(` > ${title}`));

    contentContainer.innerHTML = `
        <h2 class="projects-title" style="text-align: left; font-size: 1.5rem; margin-bottom: 1rem; padding-inline: 24px;"></h2>
        <input
            class="searchBar"
            type="search"
            aria-label="Search projects"
            placeholder="🔍 Search projects…"
        />
        <div class="container">
            <svg id="projects-plot" viewBox="-50 -50 100 100"></svg>
            <ul class="legend"></ul>
        </div>
        <div class="projects-container"></div>
    `;
    contentContainer.className = 'projects-all-view'; // Use a different class to avoid grid layout conflicts

    // Now, run the original D3/search logic
    runD3Logic(projects);
}

// Encapsulate all the D3 and filtering logic
function runD3Logic(projects) {
    // This function contains the logic from the original project.js file

    function renderProjects_(projectsToRender) {
        const projectsContainer = document.querySelector('.projects-container');
        projectsContainer.innerHTML = '';
        projectsContainer.className = 'projects items-list';
        projectsToRender.forEach(p => projectsContainer.appendChild(renderCard(p)));
        document.querySelector(".projects-title").textContent = `${projectsToRender.length} projects`;
    }

    function renderPieChart(projectsGiven, selectedYear = null) {
        let newRolledData = d3.rollups(projectsGiven, v => v.length, d => d.year);
        let newData = newRolledData.map(([year, count]) => ({ value: count, label: year }));
        let colors = d3.scaleOrdinal(d3.schemeTableau10);
        let newSliceGenerator = d3.pie().value(d => d.value);
        let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
        let newArcData = newSliceGenerator(newData);
        let newArcs = newArcData.map(d => arcGenerator(d));
        d3.select('svg').selectAll('path').remove();
        let svg = d3.select("svg");
        newArcs.forEach((arc, i) => {
            let year = newData[i].label;
            svg.append("path")
               .attr("d", arc)
               .attr("fill", year === selectedYear ? "#FF0000" : colors(i))
               .attr("data-year", year)
               .on("click", () => filterByYear(year)); 
        });
        d3.select('.legend').selectAll('li').remove();
        renderLegend(newData, colors, selectedYear);
    }

    function renderLegend(data, colors, selectedYear = null) {
        let legend = d3.select(".legend");
        legend.selectAll("li").remove();
        data.forEach((d, idx) => {
            legend.append("li")
                  .attr("style", `--color:${colors(idx)}`)
                  .attr("data-year", d.label)
                  .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
                  .classed("selected", d.label === selectedYear)
                  .on("click", () => filterByYear(d.label));
        });
    }

    function filterByYear(year) {
        let query = document.querySelector(".searchBar").value.toLowerCase();
        let searchedProjects = projects.filter(project => Object.values(project).join('\n').toLowerCase().includes(query));
        let filteredProjects = searchedProjects.filter(project => project.year == year);
        document.querySelectorAll(".legend li").forEach(li => li.classList.remove("selected"));
        document.querySelector(`.legend li[data-year='${year}']`)?.classList.add("selected");
        renderProjects_(filteredProjects);
        renderPieChart(projects, year);
    }

    document.querySelector(".searchBar").addEventListener("input", (event) => {
        let query = event.target.value.toLowerCase();
        let selectedYear = document.querySelector(".legend .selected")?.dataset.year;
        let filteredProjects = projects.filter(project => Object.values(project).join('\n').toLowerCase().includes(query));
        if (selectedYear) {
            filteredProjects = filteredProjects.filter(p => p.year == selectedYear);
        }
        renderProjects_(filteredProjects);
    });

    // Initial render for the 'all' view
    renderProjects_(projects);
    renderPieChart(projects);
}

function updateView(viewName, param) {
    const url = new URL(window.location);
    url.searchParams.set('view', viewName);
    if (param) url.searchParams.set('id', param);
    else url.searchParams.delete('id');
    window.history.pushState({}, '', url);

    render(viewName, param);
}

function render(view, param) {
    if (view === 'detail' && param) {
        renderDetail(param);
    } else if (view === 'all') {
        renderAllView();
    } else if (['ai-ml', 'data-viz'].includes(view)) {
        const filtered = projects.filter(p => getProjectCategory(p) === view);
        const title = view === 'ai-ml' ? 'AI/ML Products' : 'Data Visualization & Analytics';
        renderList(filtered, title);
    } else {
        renderMenu();
    }
}

window.onpopstate = () => {
    const params = new URLSearchParams(window.location.search);
    render(params.get('view') || 'menu', params.get('id'));
};

// Initial render
const params = new URLSearchParams(window.location.search);
render(params.get('view') || 'menu', params.get('id'));
