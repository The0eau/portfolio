console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a"); // Get all navigation links
console.log(navLinks); // Check if links are correctly selected

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
  );
console.log(currentLink);
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

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // TODO create link and add it to nav
  }

// Create link and add it to nav
nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);

const ARE_WE_HOME = document.documentElement.classList.contains('home');
url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
let a = document.createElement('a');
a.href = url;
a.textContent = title;
nav.append(a);
if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

a.classList.toggle(
'current',
a.host === location.host && a.pathname === location.pathname
);


document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
                <option value="light dark">Automatic</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
          </select>
      </label>`
  );