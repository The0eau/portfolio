console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

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


function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  localStorage.setItem('colorScheme', colorScheme);
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

const savedScheme = localStorage.getItem('colorScheme');
if (savedScheme) {
    setColorScheme(savedScheme);
  }


select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  setColorScheme(event.target.value);
});


