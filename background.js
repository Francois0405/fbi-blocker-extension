let blockedDomains = new Set();
// ¡AQUÍ ESTÁ EL CAMBIO! Forzamos a true para que arranque todo por defecto
let activeFilters = { porn: true, gambling: true, fakenews: true };

// Cargar las listas en el Hash Set O(1)
async function loadLists() {
  blockedDomains.clear();
  
  if (activeFilters.porn) {
    const res = await fetch(chrome.runtime.getURL('rules/list_porn.json'));
    const domains = await res.json();
    domains.forEach(d => blockedDomains.add(d));
  }
  
  if (activeFilters.gambling) {
    const res = await fetch(chrome.runtime.getURL('rules/list_gambling.json'));
    const domains = await res.json();
    domains.forEach(d => blockedDomains.add(d));
  }

  if (activeFilters.fakenews) {
    const res = await fetch(chrome.runtime.getURL('rules/list_fakenews.json'));
    const domains = await res.json();
    domains.forEach(d => blockedDomains.add(d));
  }
  
  console.log(`Motor de bloqueo listo. Dominios cargados en RAM: ${blockedDomains.size}`);
}

// Escuchar cambios desde el panel de la extensión (para cuando lo construyas)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.filters) {
    activeFilters = changes.filters.newValue;
    loadLists();
  }
});

// Inicializar el estado desde la memoria local
chrome.storage.local.get(['filters'], (result) => {
  if (result.filters) {
    activeFilters = result.filters;
  } else {
    // Si no hay configuración previa guardada, inicializamos con todo activado
    chrome.storage.local.set({ filters: activeFilters });
  }
  loadLists();
});

// El Interceptor
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Solo interceptamos la ventana principal (frameId 0), ignoramos recursos secundarios
  if (details.frameId !== 0) return;

  try {
    const url = new URL(details.url);
    const hostname = url.hostname.replace(/^www\./, '');
    const parts = hostname.split('.');

    // Algoritmo de comprobación de subdominios
    for (let i = 0; i < parts.length - 1; i++) {
      const domainToCheck = parts.slice(i).join('.');
      
      if (blockedDomains.has(domainToCheck)) {
        // ¡Cazado! Secuestramos la pestaña y redirigimos al aviso local
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL("fbi/fbi.html")
        });
        break;
      }
    }
  } catch (e) {
    // URL inválida, seguimos navegando
  }
});