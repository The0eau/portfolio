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