import {fetchJSON} from '../global.js';

const educations = await fetchJSON('../lib/education.json');
const courses = await fetchJSON('../lib/courses.json');

const contentContainer = document.querySelector('#content');
const pageTitle = document.querySelector('#page-title');
const pageSubtitle = document.querySelector('.page-header p');

// Combine data for easier searching
const allItems = [...educations, ...courses];

function findItem(id) {
    return allItems.find(item => item.id === id);
}

function renderCard(item) {
    const article = document.createElement('article');
    article.innerHTML = `
      <div class="content">
        <h3>${item.title}</h3>
        <div class="meta">
            <span class="place">${item.place}</span>
            <span class="year">${item.year}</span>
        </div>
        <p>${item.description}</p>
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

function renderMenu() {
    pageTitle.textContent = "Education & Learning";
    if (pageSubtitle) pageSubtitle.style.display = '';
    contentContainer.innerHTML = '';
    contentContainer.classList.add('category-menu');
    contentContainer.classList.remove('items-list');
    contentContainer.classList.remove('detail-view');
    
    const categories = [
        { title: "Education", view: "education", description: "Academic degrees and formal education." },
        { title: "Certifications", view: "certifications", description: "Professional certifications and credentials." },
        { title: "Online Courses", view: "courses", description: "MOOCs and other online learning resources." }
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

function renderList(items, title) {
    pageTitle.innerHTML = '';
    if (pageSubtitle) pageSubtitle.style.display = 'none';
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Education & Learning';
    link.onclick = (e) => {
        e.preventDefault();
        updateView('menu');
    };
    pageTitle.appendChild(link);
    pageTitle.appendChild(document.createTextNode(` > ${title}`));

    contentContainer.innerHTML = '';
    contentContainer.classList.remove('category-menu');
    contentContainer.classList.add('items-list');
    contentContainer.classList.remove('detail-view');
    items.forEach(item => contentContainer.appendChild(renderCard(item)));
}

function renderDetail(id) {
    const item = findItem(id);
    if (!item) return;

    // Determine parent view for breadcrumb
    let parentView = 'menu';
    let parentTitle = 'Education & Learning';
    if (educations.includes(item)) {
        parentView = 'education';
        parentTitle = 'Education';
    } else {
        parentView = 'courses'; 
        parentTitle = 'Online Courses';
    }

    if (pageSubtitle) pageSubtitle.style.display = 'none';
    pageTitle.innerHTML = `<a href="#" id="back-link">Education & Learning</a> > ${item.title}`;
    document.getElementById('back-link').onclick = (e) => {
        e.preventDefault();
        updateView(parentView);
    };

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
    contentContainer.classList.remove('category-menu');
    contentContainer.classList.remove('items-list');
    contentContainer.classList.add('detail-view');
}

function updateView(viewName, param) {
    const url = new URL(window.location);
    url.searchParams.set('view', viewName);
    if (param) url.searchParams.set('id', param);
    else url.searchParams.delete('id');
    window.history.pushState({}, '', url);

    if (viewName === 'menu') {
        renderMenu();
    } else if (viewName === 'education') {
        renderList(educations, "Education");
    } else if (viewName === 'certifications') {
        renderList(courses, "Certifications");
    } else if (viewName === 'courses') {
        renderList(courses, "Online Courses");
    } else if (viewName === 'detail') {
        renderDetail(param);
    }
}

window.onpopstate = () => {
    const params = new URLSearchParams(window.location.search);
    updateView(params.get('view') || 'menu', params.get('id'));
};

// Initial render
const params = new URLSearchParams(window.location.search);
updateView(params.get('view') || 'menu', params.get('id'));