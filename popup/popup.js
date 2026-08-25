const filterContainer = document.getElementById('filters');
const masterToggle = document.getElementById('toggle-all');
const protectionTitle = document.getElementById('protection-title');
const summary = document.getElementById('protection-summary');
const feedback = document.getElementById('feedback');
const settingsDisclaimer = document.getElementById('settings-disclaimer');

let filters = { ...DEFAULT_FILTERS };
let saving = false;

function enabledCount() {
  return FILTER_CATEGORIES.filter(({ key }) => filters[key]).length;
}

function renderSummary() {
  const enabled = enabledCount();
  protectionTitle.textContent = enabled === 0 ? 'Protection paused' : 'Protection active';
  summary.textContent = enabled === FILTER_CATEGORIES.length
    ? 'All filters are enabled.'
    : `${enabled} of ${FILTER_CATEGORIES.length} filters enabled.`;
  masterToggle.checked = enabled === FILTER_CATEGORIES.length;
  masterToggle.indeterminate = enabled > 0 && enabled < FILTER_CATEGORIES.length;
  masterToggle.disabled = saving;
}

function renderFilters() {
  const rawHtml = FILTER_CATEGORIES.map(category => `
    <article class="filter-card${category.featured ? ' featured' : ''}">
      <span class="icon icon-${category.icon}" aria-hidden="true">${iconFor(category.icon)}</span>
      <div class="filter-copy">
        <h2>${category.label}</h2>
        <p>${category.description}</p>
      </div>
      <label class="switch">
        <span class="sr-only">Enable ${category.label}</span>
        <input type="checkbox" data-filter="${category.key}" ${filters[category.key] ? 'checked' : ''} ${saving ? 'disabled' : ''}>
        <span class="slider"></span>
      </label>
    </article>
  `).join('');

  // Parsea el HTML en un documento temporal de forma segura
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // Limpia el contenedor e inyecta los elementos DOM reales
  filterContainer.replaceChildren(...doc.body.childNodes);

  filterContainer.querySelectorAll('[data-filter]').forEach(toggle => {
    toggle.addEventListener('change', async event => {
      await saveFilters({ ...filters, [event.target.dataset.filter]: event.target.checked });
    });
  });
}

function iconFor(icon) {
  return { shield: '⌾', adult: '◐', game: '◇', news: '▤', social: '◌' }[icon];
}

function render() {
  renderSummary();
  renderFilters();
}

async function saveFilters(nextFilters) {
  if (saving) return;
  const previousFilters = filters;
  filters = nextFilters;
  saving = true;
  feedback.textContent = '';
  render();

  try {
    await chrome.storage.local.set({ filters });
  } catch (error) {
    console.error('Could not save filters:', error);
    filters = previousFilters;
    feedback.textContent = 'Could not save your changes. Please try again.';
    render();
  } finally {
    saving = false;
    render();
  }
}

masterToggle.addEventListener('change', async event => {
  const enabled = event.target.checked;
  await saveFilters(Object.fromEntries(FILTER_CATEGORIES.map(({ key }) => [key, enabled])));
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const result = await chrome.storage.local.get(['filters']);
    filters = Object.fromEntries(FILTER_CATEGORIES.map(({ key, defaultEnabled }) => [
      key,
      typeof result.filters?.[key] === 'boolean' ? result.filters[key] : defaultEnabled
    ]));
  } catch (error) {
    console.error('Could not load filters:', error);
    feedback.textContent = 'Could not load your saved settings.';
  }
  settingsDisclaimer.textContent = DISCLAIMERS.settings;
  render();
});