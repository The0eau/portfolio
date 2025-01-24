console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a"); // Get all navigation links
console.log(navLinks); // Check if links are correctly selected

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
  );

currentLink?.classList.add('current');

let pages = [
    { url: 'https://the0eau.github.io/portfolio/index.html', title: 'Me' },
    { url: 'https://the0eau.github.io/portfolio/project/index.html', title: 'Projects' },
    { url: 'https://the0eau.github.io/portfolio/contact/index.html', title: 'Contact' },
    { url: 'https://the0eau.github.io/portfolio/cv/index.html', title: 'Resume' },
    { url: 'https://github.com/The0eau', title: 'Github' },
    // add the rest of your pages here
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);