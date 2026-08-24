if (typeof importScripts === 'function') {
  importScripts('categories.js');
}

let blockedDomains = new Set();
let activeFilters = { ...DEFAULT_FILTERS };
let loadGeneration = 0;

function normalizeFilters(savedFilters = {}) {
  return Object.fromEntries(
    FILTER_CATEGORIES.map(({ key, defaultEnabled }) => [
      key,
      typeof savedFilters[key] === 'boolean' ? savedFilters[key] : defaultEnabled
    ])
  );
}

async function loadLists() {
  const generation = ++loadGeneration;
  const enabledCategories = FILTER_CATEGORIES.filter(({ key }) => activeFilters[key]);

  try {
    const lists = await Promise.all(enabledCategories.map(async ({ listPath }) => {
      const response = await fetch(chrome.runtime.getURL(listPath));
      if (!response.ok) throw new Error(`No se pudo cargar ${listPath}`);
      return response.json();
    }));

    if (generation !== loadGeneration) return;

    const nextBlockedDomains = new Set();
    lists.forEach(domains => domains.forEach(domain => nextBlockedDomains.add(domain)));
    blockedDomains = nextBlockedDomains;
    console.log(`Motor de bloqueo listo. Dominios cargados en RAM: ${blockedDomains.size}`);
  } catch (error) {
    console.error('No se pudieron cargar las listas de bloqueo:', error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes.filters) return;
  activeFilters = normalizeFilters(changes.filters.newValue);
  loadLists();
});

chrome.storage.local.get(['filters'], (result) => {
  activeFilters = normalizeFilters(result.filters);
  if (JSON.stringify(activeFilters) !== JSON.stringify(result.filters || {})) {
    chrome.storage.local.set({ filters: activeFilters });
  }
  loadLists();
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;

  try {
    const hostname = new URL(details.url).hostname.replace(/^www\./, '');
    const parts = hostname.split('.');

    for (let i = 0; i < parts.length - 1; i += 1) {
      if (blockedDomains.has(parts.slice(i).join('.'))) {
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL('fbi/fbi.html')
        });
        break;
      }
    }
  } catch {
    // Ignoramos URLs que no se pueden analizar.
  }
});
