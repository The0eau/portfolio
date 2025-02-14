import {fetchJSON} from 'https://the0eau.github.io/portfolio/global.js';
const pro = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/main/lib/pro.json');
function renderPro(pro, containerElement, headingLevel = 'h2') {
    // Your code will go here
    containerElement.innerHTML = '';
    pro.forEach(pro => {
      const article = document.createElement('article');
      article.innerHTML = `
      <h3>${pro.title}</h3>
      <p>${pro.place}</p>
      <p>${pro.year}</p>
      <img src="${pro.image}" alt="${pro.title}">
      <p>${pro.description}</p>
      <a href = "${pro.link}"> Link </a>
      `;
      containerElement.appendChild(article);
  });
  }
const proContainer = document.querySelector('.pro');

renderPro(pro,proContainer,'h2')