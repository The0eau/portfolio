import {fetchJSON} from 'https://the0eau.github.io/portfolio/global.js';
const educations = await fetchJSON('https://raw.githubusercontent.com/The0eau/portfolio/main/lib/education.json');
function renderEducation(education, containerElement, headingLevel = 'h2') {
    // Your code will go here
    containerElement.innerHTML = '';
    education.forEach(education => {
      const article = document.createElement('article');
      article.innerHTML = `
      <h3>${education.title}</h3>
      <p>${educations.place}</p>
      <p>${education.year}</p>
      <img src="${education.image}" alt="${education.title}">
      <p>${education.description}</p>
      <a href = "${education.link}"> Lien </a>
      `;
      containerElement.appendChild(article);
  });
  }
  const educationsContainer = document.querySelector('.educations');

renderEducation(educations,educationsContainer,'h2')