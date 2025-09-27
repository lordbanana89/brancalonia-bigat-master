/**
 * Brancalonia - Fix per polygon lighting warnings
 * Previene warning quando le luci sono fuori dai limiti della scena
 */

console.log("Brancalonia | Polygon lighting fix attivo");

// Hook per gestire le luci fuori dai limiti
Hooks.on("lightingRefresh", (lighting) => {
  if (!canvas.ready) return;

  const sceneBounds = canvas.dimensions.rect;

  // Controlla ogni sorgente di luce
  canvas.lighting?.sources?.forEach(source => {
    if (!source.object) return;

    const light = source.object;
    const x = light.x;
    const y = light.y;

    // Verifica se la luce è fuori dai limiti della scena
    if (x < sceneBounds.x ||
        x > sceneBounds.x + sceneBounds.width ||
        y < sceneBounds.y ||
        y > sceneBounds.y + sceneBounds.height) {

      // Disabilita temporaneamente la luce se è fuori dai limiti
      if (source.active) {
        console.log(`Brancalonia | Luce ${light.id} fuori dai limiti, temporaneamente disabilitata`);
        source.active = false;
      }
    }
  });
});

// Hook per validare le luci quando vengono create o aggiornate
Hooks.on("preCreateAmbientLight", (document, data, options, userId) => {
  if (!canvas.ready) return;

  const sceneBounds = canvas.dimensions.rect;
  const x = data.x || 0;
  const y = data.y || 0;

  // Correggi la posizione se è fuori dai limiti
  if (x < sceneBounds.x) {
    data.x = sceneBounds.x + 100;
    console.log(`Brancalonia | Correzione posizione luce X: ${x} -> ${data.x}`);
  }
  if (x > sceneBounds.x + sceneBounds.width) {
    data.x = sceneBounds.x + sceneBounds.width - 100;
    console.log(`Brancalonia | Correzione posizione luce X: ${x} -> ${data.x}`);
  }
  if (y < sceneBounds.y) {
    data.y = sceneBounds.y + 100;
    console.log(`Brancalonia | Correzione posizione luce Y: ${y} -> ${data.y}`);
  }
  if (y > sceneBounds.y + sceneBounds.height) {
    data.y = sceneBounds.y + sceneBounds.height - 100;
    console.log(`Brancalonia | Correzione posizione luce Y: ${y} -> ${data.y}`);
  }
});

// Override del metodo compute per gestire errori di poligono
Hooks.once("canvasReady", () => {
  const originalCompute = CONFIG.Canvas.polygonBackends.pixi?.prototype?.compute;

  if (originalCompute) {
    CONFIG.Canvas.polygonBackends.pixi.prototype.compute = function(origin, config) {
      try {
        // Verifica che l'origine sia valida
        if (!origin || typeof origin.x !== "number" || typeof origin.y !== "number") {
          console.log("Brancalonia | Origine invalida per il poligono, usando default");
          origin = {x: canvas.dimensions.width / 2, y: canvas.dimensions.height / 2};
        }

        // Verifica che l'origine sia dentro i limiti
        const bounds = canvas.dimensions.rect;
        if (origin.x < bounds.x ||
            origin.x > bounds.x + bounds.width ||
            origin.y < bounds.y ||
            origin.y > bounds.y + bounds.height) {

          // Clamp l'origine ai limiti della scena
          origin = {
            x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, origin.x)),
            y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, origin.y))
          };
        }

        // Chiama il metodo originale con l'origine corretta
        return originalCompute.call(this, origin, config);
      } catch (error) {
        console.log("Brancalonia | Errore nel calcolo del poligono, usando fallback");
        // Ritorna un poligono vuoto in caso di errore
        return {points: [], bounds: {x: 0, y: 0, width: 0, height: 0}};
      }
    };
  }
});

// Sopprimi il warning specifico del poligono
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');

  // Sopprimi solo il warning del poligono fuori dai limiti
  if (message.includes("polygon cannot be computed") &&
      message.includes("origin is out of the scene bounds")) {
    // Non mostrare questo warning
    return;
  }

  // Mostra tutti gli altri warning
  return originalWarn.apply(console, args);
};

console.log("Brancalonia | Polygon fix inizializzato");