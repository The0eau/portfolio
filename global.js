console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a"); // Get all navigation links
console.log(navLinks); // Check if links are correctly selected

let pages = [
    { url: 'https://the0eau.github.io/portfolio/', title: 'Me' },
    { url: 'https://the0eau.github.io/portfolio/project/index.html', title: 'Projects' },
    { url: 'https://the0eau.github.io/portfolio/contact/index.html', title: 'Contact' },
    { url: 'https://the0eau.github.io/portfolio/cv/index.html', title: 'Resume' },
    { url: 'https://github.com/The0eau', title: 'Github' },
    // add the rest of your pages here
  ];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    a.classList.toggle(
      'current',
      a.host === location.host && a.pathname === location.pathname
    );

    a.toggleAttribute('target', a.host !== location.host);
    nav.append(a);
  }


  

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

const select = document.querySelector('.color-scheme select');


select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value
});

const savedScheme = localStorage.getItem('colorScheme');
if (savedScheme) {
    setColorScheme(savedScheme);
} else {
    // Détection du mode sombre du système
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setColorScheme("dark");
    }
}
