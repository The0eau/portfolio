import {fetchJSON} from '../global.js';

const pro = await fetchJSON('../lib/pro.json');

const contentContainer = document.querySelector('#content');
const pageTitle = document.querySelector('#page-title');
const pageSubtitle = document.querySelector('.page-header p');

    // Helper to categorize items based on title keywords
    function getCategory(item) {
        return item.category;
    }

    function findItem(id) {
        return pro.find(item => item.id === id);
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
        pageTitle.textContent = "Professional Experience";
        if (pageSubtitle) pageSubtitle.style.display = '';
        contentContainer.innerHTML = '';
        contentContainer.classList.add('category-menu');
        contentContainer.classList.remove('items-list');
        contentContainer.classList.remove('detail-view');
        
        const categories = [
            { title: "Internships", view: "internships", description: "Corporate professional experiences." },
            { title: "Entrepreneurship", view: "entrepreneurship", description: "Startups and personal projects." },
            { title: "Missions", view: "missions", description: "Consulting, freelance, and specialized projects." }
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
        link.textContent = 'Professional Experience';
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

        const category = getCategory(item);
        let parentTitle = 'Professional Experience';
        if (category === 'internships') parentTitle = 'Internships';
        else if (category === 'entrepreneurship') parentTitle = 'Entrepreneurship';
        else parentTitle = 'Missions';

        if (pageSubtitle) pageSubtitle.style.display = 'none';
        pageTitle.innerHTML = `<a href="#" id="back-link">${parentTitle}</a> > ${item.title}`;
        document.getElementById('back-link').onclick = (e) => {
            e.preventDefault();
            updateView(category);
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

        render(viewName, param);
    }

    function render(view, detailId) {
        if (view === 'detail' && detailId) {
            renderDetail(detailId);
        } else if (['internships', 'entrepreneurship', 'missions'].includes(view)) {
            const filteredItems = pro.filter(item => getCategory(item) === view);
            let title = view.charAt(0).toUpperCase() + view.slice(1);
            if (view === 'internships') title = "Internships";
            if (view === 'entrepreneurship') title = "Entrepreneurship";
            if (view === 'missions') title = "Missions";
            renderList(filteredItems, title);
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