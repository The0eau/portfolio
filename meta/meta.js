let data = [];
let commits = [];
let filteredCommits = [];
let filteredLines = [];
let selectedCommits = [];
let files = [];

let xScale;
let yScale;

let NUM_ITEMS = 100; // Idéalement, utilisez la longueur de votre historique de commits
let ITEM_HEIGHT = 120; // Hauteur d'un élément dans le défilement
let VISIBLE_COUNT = 40; // Nombre visible d'éléments dans la fenêtre
let totalHeight = (NUM_ITEMS - 1) * ITEM_HEIGHT;
const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
spacer.style('height', `${totalHeight}px`); // Hauteur du conteneur de défilement
const itemsContainer = d3.select('#items-container');

// Gestionnaire d'événements de défilement
scrollContainer.on('scroll', () => {
  const scrollTop = scrollContainer.property('scrollTop');
  let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
  renderItems(startIndex);
});

let NUM_ITEMS_FILES = 100; // Nombre d'éléments pour les tailles de fichiers (selon tes données)
let ITEM_HEIGHT_FILES = 130; // Hauteur des éléments
let VISIBLE_COUNT_FILES = 40; // Nombre d'éléments visibles
let totalHeightFiles = (NUM_ITEMS_FILES - 1) * ITEM_HEIGHT_FILES;
const scrollContainerFileSizes = d3.select('#scroll-container-file-sizes');
const spacerFileSizes = d3.select('#spacer-file-sizes');
spacerFileSizes.style('height', `${totalHeightFiles}px`);
const itemsContainerFileSizes = d3.select('#items-container-file-sizes');

// Fonction de mise à jour des éléments de la taille des fichiers
scrollContainerFileSizes.on('scroll', () => {
  const scrollTop = scrollContainerFileSizes.property('scrollTop');
  let startIndex = Math.floor(scrollTop / ITEM_HEIGHT_FILES);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT_FILES));
  renderItemsFileSizes(startIndex);
});

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));

  displayStats();
}  



function displayStats() {
  processCommits();

  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  dl.append('dt').text('Commits:');
  dl.append('dd').text(commits.length);

  dl.append('dt').text('Files:');
  dl.append('dd').text(d3.group(data, d => d.file).size);

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>:');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Max Depth:');
  dl.append('dd').text(d3.max(data, d => d.depth));

  dl.append('dt').text('Avg. File Length:');
  const fileLengths = d3.rollups(
      data,
      v => d3.max(v, d => d.line),
      d => d.file
  );
  dl.append('dd').text(d3.mean(fileLengths, d => d[1]).toFixed(2));

  const workByPeriod = d3.rollups(
      data,
      v => v.length,
      d => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );
  const maxPeriod = d3.greatest(workByPeriod, d => d[1])?.[0];
  const capitalizedMaxPeriod = maxPeriod ? maxPeriod.charAt(0).toUpperCase() + maxPeriod.slice(1) : 'N/A';
  dl.append('dt').text('Most Activity:');
  dl.append('dd').text(capitalizedMaxPeriod);
}

function updateStats() {
  processCommits();

  const dl = d3.select('#stats').select('dl.stats');

  if (dl.empty()) {
    d3.select('#stats').append('dl').attr('class', 'stats');
  }

  // Effacer les anciennes valeurs sans recréer les balises
  dl.selectAll('*').remove();

  dl.append('dt').text('Commits:');
  dl.append('dd').text(filteredCommits.length);

  dl.append('dt').text('Files:');
  dl.append('dd').text(d3.group(filteredLines, d => d.file).size);

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>:');
  dl.append('dd').text(filteredLines.length);

  dl.append('dt').text('Max Depth:');
  dl.append('dd').text(d3.max(filteredLines, d => d.depth));

  dl.append('dt').text('Avg. File Length:');
  const fileLengths = d3.rollups(
    filteredLines,
    v => d3.max(v, d => d.line),
    d => d.file
  );
  dl.append('dd').text(d3.mean(fileLengths, d => d[1]).toFixed(2));

  const workByPeriod = d3.rollups(
    filteredLines,
    v => v.length,
    d => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );
  const maxPeriod = d3.greatest(workByPeriod, d => d[1])?.[0];
  const capitalizedMaxPeriod = maxPeriod ? maxPeriod.charAt(0).toUpperCase() + maxPeriod.slice(1) : 'N/A';

  dl.append('dt').text('Most Activity:');
  dl.append('dd').text(capitalizedMaxPeriod);
}



function processCommits() {
  commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
          let first = lines[0];
          let { author, date, time, timezone, datetime } = first;
          let ret = {
              id: commit,
              url: 'https://github.com/The0eau/portfolio/commit/' + commit,
              author,
              date,
              time,
              timezone,
              datetime,
              hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
              totalLines: lines.length,
          };

          Object.defineProperty(ret, 'lines', {
              value: lines,
              configurable: true,
              writable: true,
              enumerable: true,
          });

          return ret;
      });
}


function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const linesEdited = document.getElementById('commit-lines');

  if (!commit.id) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  time.textContent = commit.datetime?.toLocaleTimeString('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  author.textContent = commit.author;
  linesEdited.textContent = `${commit.totalLines} lines edited`;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}



function brushSelector() {
  const svg = document.querySelector('svg');
  d3.select(svg).call(d3.brush());

  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();

  d3.select(svg).call(d3.brush().on('start brush end', brushed));

}


function brushed(event) {
  let brushSelection = event.selection;
  selectedCommits = !brushSelection
      ? []
      : filteredCommits.filter(commit => {
          let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
          let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
          let x = xScale(commit.date);
          let y = yScale(commit.hourFrac);

          return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });

  updateSelection();
  updateLanguageBreakdown();
  updateSelectionCount();
}

function updateLanguageBreakdown() {
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}


function updateSelectionCount() {

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}


function isCommitSelected(commit) {
  return selectedCommits.includes(filteredCommits);
}

function updateSelection() {
// Update visual state of dots based on selection
d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}


function updateScatterplot(filteredCommits) {
  // Supprimer l'ancien graphique
  d3.select('svg').remove();

  const width = 1000;
  const height = 600;

  const svg = d3
      .select('#chart')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');

  // Mettre à jour les échelles avec les commits filtrés
  xScale = d3
      .scaleTime()
      .domain(d3.extent(filteredCommits, (d) => d.date))
      .range([0, width])
      .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
  };

  // Mettre à jour les gammes d'échelle
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  // Ajouter les axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat(d => `${d % 24}:00`);

  svg.append('g').attr('transform', `translate(0, ${usableArea.bottom})`).call(xAxis);
  svg.append('g').attr('transform', `translate(${usableArea.left}, 0)`).call(yAxis);

  const dots = svg.append('g').attr('class', 'dots');

  const [minLines, maxLines] = d3.extent(filteredCommits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([7, 30]);

  // Trier les commits pour afficher d'abord les plus gros
  const sortedCommits = d3.sort(filteredCommits, (d) => -d.totalLines);

  dots
      .selectAll('circle')
      .data(sortedCommits)
      .join('circle')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.hourFrac))
      .attr('r', d => rScale(d.totalLines))
      .style('fill-opacity', 0.7)
      .attr('fill', d => (d.date.getHours() >= 6 && d.date.getHours() < 18) ? 'orange' : 'steelblue')
      .on('mouseenter', (event, commit) => {
          updateTooltipContent(commit);
          updateTooltipVisibility(true);
          updateTooltipPosition(event);
          d3.select(event.currentTarget).style('fill-opacity', 1);
          d3.select(event.currentTarget).classed('selected', true);
      })
      .on('mouseleave', (event) => {
          updateTooltipContent({});
          updateTooltipVisibility(false);
          d3.select(event.currentTarget).style('fill-opacity', 0.7);
          d3.select(event.currentTarget).classed('selected', false);
      });

  // Ajouter les lignes de grille
  svg.append('g')
      .attr('class', 'gridlines')
      .attr('transform', `translate(${usableArea.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
}


function updateFilteredData() {
  filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
  filteredLines = data.filter(d => d.datetime <= commitMaxTime);
  xScale.domain(d3.extent(filteredCommits, d => d.date)).nice(); // Met à jour le domaine et ajuste légèrement les bornes

  // Sélectionne et met à jour l'axe X
  d3.select('#chart svg')
    .select('g')
    .transition()
    .duration(750) // Animation fluide
    .call(d3.axisBottom(xScale));

  // Met à jour la position des cercles (points du scatterplot)
  d3.selectAll('.dots circle')
    .transition()
    .duration(750)
    .attr('cx', d => xScale(d.date));
  updateStats()
}


function updateFileList(filteredCommits) {
  // Récupérer les lignes des commits filtrés
  let lines = filteredCommits.flatMap(d => d.lines);
  
  // Regrouper les lignes par fichier et trier par nombre de lignes (étape 2.3)
  let files = d3.groups(lines, d => d.file)
                .map(([name, lines]) => ({ name, lines }))
                .sort((a, b) => b.lines.length - a.lines.length);

  // Sélectionner et nettoyer la liste des fichiers
  let fileContainer = d3.select('.files');
  fileContainer.selectAll('div').remove(); // Nettoyer avant de réafficher

  // Ajouter chaque fichier à la liste
  let filesDiv = fileContainer.selectAll('div')
      .data(files)
      .enter()
      .append('div');

  // Ajouter le nom du fichier et le nombre de lignes
  filesDiv.append('dt')
      .html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);

  // Échelle de couleur pour le type de fichier (étape 2.4)
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);

  // Ajouter les points pour chaque ligne de code
  filesDiv.append('dd')
      .selectAll('div')
      .data(d => d.lines)
      .enter()
      .append('div')
      .attr('class', 'line')
      .style('background', d => fileTypeColors(d.type)); // Appliquer la couleur selon le type de ligne
}


function filterCommitsByTime() {
  filteredCommits = commits.filter(d => d.date <= commitMaxTime);
}

function updateTimeDisplay() {
  filterCommitsByTime();  // Filtrer les commits selon commitMaxTime
  updateScatterplot(filteredCommits);  // Mettre à jour le scatterplot avec les commits filtrés
  updateFileList(filteredCommits);
}



// Fonction pour rendre les éléments visibles à l'écran
function renderItems(startIndex) {
  // Efface les éléments existants
  itemsContainer.selectAll('div').remove();

  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  let newCommitSlice = commits.slice(startIndex, endIndex); // On prend une tranche des commits

  // TODO: Mise à jour du nuage de points (scatterplot) en fonction des commits visibles
  // Vous pouvez mettre à jour la fonction de nuage de points ici
  updateScatterplot(newCommitSlice);
  // Ré-affectation des données aux éléments visibles et leur représentation avec <div>
  itemsContainer.selectAll('div')
    .data(newCommitSlice)
    .enter()
    .append('div')
    .attr('class', 'item')
    .html(d => {
      return `<p id=texte>
        On ${d.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}, I made
        <a href="${d.url}" target="_blank">${d.index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}</a>.
        I edited ${d.totalLines} lines across ${d3.rollups(d.lines, D => D.length, d => d.file).length} files.
        Then I looked over all I had made, and I saw that it was very good.
      </p>`;
    })
    .style('position', 'absolute')
    .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`);


    displayCommitFiles();
}


function displayCommitFiles() {
  const lines = filteredCommits.flatMap((d) => d.lines);
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  let files = d3.groups(lines, (d) => d.file).map(([name, lines]) => {
    return { name, lines };
  });
  files = d3.sort(files, (d) => -d.lines.length);

  d3.select('.files').selectAll('div').remove();

  let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
  filesContainer.append('dt').html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
  filesContainer.append('dd')
    .selectAll('div')
    .data(d => d.lines)
    .enter()
    .append('div')
    .attr('class', 'line')
    .style('background', d => fileTypeColors(d.type));
}


function renderItemsFileSizes(startIndex) {
  // Effacer les éléments précédents
  itemsContainerFileSizes.selectAll('div').remove();

  const endIndex = Math.min(startIndex + VISIBLE_COUNT_FILES, commits.length);
  let newCommitSlice = commits.slice(startIndex, endIndex);

  // Mettre à jour le graphique des tailles de fichiers (ajoute ta fonction de mise à jour ici)
  // ...
  updateFileList(newCommitSlice);
  // Re-lier les données des commits et les afficher sous forme de div
  itemsContainerFileSizes.selectAll('div')
    .data(newCommitSlice)
    .enter()
    .append('div')
    .attr('class', 'item')
    .html(d => {
      return `
        <p>
          On ${d.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}, I made
          <a href="${d.url}" target="_blank">${d.index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}</a>.
          I edited ${d.totalLines} lines across ${d3.rollups(d.lines, D => D.length, d => d.file).length} files.
          Then I looked over all I had made, and I saw that it was very good.
        </p>
      `;
    })
    .style('position', 'absolute')
    .style('top', (_, idx) => `${idx * ITEM_HEIGHT_FILES}px`);
}


function displayCommitFilesSizes() {
  const lines = filteredCommits.flatMap((d) => d.lines);
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  let files = d3.groups(lines, (d) => d.file).map(([name, lines]) => {
    return { name, lines };
  });
  files = d3.sort(files, (d) => -d.lines.length);

  d3.select('.files').selectAll('div').remove();

  let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
  filesContainer.append('dt').html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
  filesContainer.append('dd')
    .selectAll('div')
    .data(d => d.lines)
    .enter()
    .append('div')
    .attr('class', 'line')
    .style('background', d => fileTypeColors(d.type));
}


function displayFileSizes() {
  const lines = filteredCommits.flatMap((d) => d.lines);
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  let files = d3.groups(lines, (d) => d.file).map(([name, lines]) => {
    return { name, lines };
  });
  files = d3.sort(files, (d) => -d.lines.length);

  d3.select('.files').selectAll('div').remove();
  let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
  filesContainer.append('dt').html(d => `<code>${d.name}</code><small>${d.lines.length} lignes</small>`);
  filesContainer.append('dd')
                .selectAll('div')
                .data(d => d.lines)
                .enter()
                .append('div')
                .attr('class', 'line')
                .style('background', d => fileTypeColors(d.type));
}




  await loadData();
  filteredCommits = commits;
  filteredLines= data;
  updateScatterplot(filteredCommits);
  // Appeler cette fonction après le filtrage des commits pour mettre à jour l'affichage
  updateFileList();
  brushSelector();

  



  let commitProgress = 100;
  let timeScale = d3.scaleTime([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)], [0, 100]);
  let commitMaxTime = timeScale.invert(commitProgress);
  const selectedTime = d3.select('#selectedTime');
  selectedTime.text(timeScale.invert(commitProgress).toLocaleString());

  d3.select("#commitSlider").on("input", function () {
      commitProgress = +this.value;
      commitMaxTime = timeScale.invert(commitProgress);
      selectedTime.text(commitMaxTime.toLocaleString({ dateStyle: "long", timeStyle: "short" }));
      updateTimeDisplay();
  });



