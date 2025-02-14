import {fetchJSON} from 'https://the0eau.github.io/portfolio/global.js';
const pro = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/main/lib/pro.json');
function renderPro(pro, containerElement, headingLevel = 'h2') {
    // Your code will go here
    containerElement.innerHTML = '';
    prof.forEach(prof => {
      const prof = document.createElement('article');
      article.innerHTML = `
      <h3>${prof.title}</h3>
      <p>${prof.place}</p>
      <p>${prof.year}</p>
      <img src="${prof.image}" alt="${education.title}">
      <p>${prof.description}</p>
      <a href = "${prof.link}"> Link </a>
      `;
      containerElement.appendChild(article);
  });
  }
const proContainer = document.querySelector('.educations');

renderPro(pro,proContainer,'h2')