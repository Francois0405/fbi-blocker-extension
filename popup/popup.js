// Mapeamos los checkboxes con los IDs de las listas en el manifest
const CATEGORIES = {
  'toggle-porn': ['rules_porn_1', 'rules_porn_2', 'rules_porn_3'],
  'toggle-gambling': ['rules_gambling_1'],
  'toggle-fakenews': ['rules_fakenews_1']
};

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Preguntamos al navegador qué reglas están encendidas actualmente
  const enabledRulesets = await chrome.declarativeNetRequest.getEnabledRulesets();

  // 2. Marcamos las casillas correctas al abrir el panel
  for (const [checkboxId, ruleIds] of Object.entries(CATEGORIES)) {
    const checkbox = document.getElementById(checkboxId);
    // Si la primera regla de la categoría está encendida, marcamos la casilla
    checkbox.checked = enabledRulesets.includes(ruleIds[0]);

    // 3. Escuchamos cuando el usuario haga clic
    checkbox.addEventListener('change', async (event) => {
      const isChecked = event.target.checked;
      
      try {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: isChecked ? ruleIds : [],
          disableRulesetIds: isChecked ? [] : ruleIds
        });
      } catch (error) {
        console.error("Error al actualizar reglas (Límite superado):", error);
        // Si el navegador rechaza por falta de memoria global, revertimos el botón
        event.target.checked = !isChecked; 
        alert("Límite de reglas del navegador excedido.");
      }
    });
  }
});