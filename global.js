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

const form = document.querySelector("form");

form?.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission

    const data = new FormData(form); // Create FormData object

    const params = new URLSearchParams(); // Initialize URL parameters

    for (let [name, value] of data) {
        console.log(name, encodeURIComponent(value)); // Log form field names and values
        params.append(name, encodeURIComponent(value)); // Append to URL parameters
    }
    const mailtoUrl = `${form.action}?${params.toString()}`;
    console.log(mailtoUrl);
    location.href = mailtoUrl;
});



export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
         
      }
      console.log(response)
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}


export function renderProjects(project, containerElement, headingLevel = 'h2') {
  // Your code will go here
  containerElement.innerHTML = '';
  project.forEach(project => {
    const article = document.createElement('article');
    article.innerHTML = `
    <h3>${project.title}</h3>
    <p>${project.year}</p>
    <img src="${project.image}" alt="${project.title}">
    <p>${project.description}</p>
    <a 'href = "${project.link}"> Lien </a>
    `;
    containerElement.appendChild(article);
});
  

}

export async function fetchGitHubData(username) {
  // return statement here
  return fetchJSON(`https://api.github.com/users/${username}`);
}

const githubData = await fetchGitHubData('The0eau');
const profileStats = document.querySelector('#profile-stats');
console.log("test")
if (profileStats) {
  profileStats.innerHTML = `
        <dl>
          <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
          <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
          <dt>Followers:</dt><dd>${githubData.followers}</dd>
          <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>
    `;
}
