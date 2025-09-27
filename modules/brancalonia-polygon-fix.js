/**
 * Brancalonia - Fix per polygon lighting warnings
 * Previene warning quando le luci sono fuori dai limiti della scena
 */

(() => {
  console.log("Brancalonia | Polygon lighting fix attivo");

  // Intercetta i warning PRIMA che vengano mostrati
  const originalWarn = console.warn;
  let warningsSuppressed = 0;

  console.warn = function(...args) {
    const message = args.join(' ');

    // Sopprimi specificamente questo warning
    if (message.includes("The polygon cannot be computed because its origin is out of the scene bounds")) {
      warningsSuppressed++;
      // Log solo ogni 10 warning soppressi per evitare spam
      if (warningsSuppressed % 10 === 1) {
        console.log(`Brancalonia | Soppressi ${warningsSuppressed} warning polygon out of bounds`);
      }
      return; // Non mostrare il warning
    }

    // Mostra tutti gli altri warning normalmente
    return originalWarn.apply(console, args);
  };

  // Hook per intercettare la creazione dei poligoni PRIMA del calcolo
  Hooks.once("init", () => {
    console.log("Brancalonia | Inizializzazione polygon fix...");

    // Wrap del metodo compute per gestire origini fuori bounds
    const originalCompute = CONFIG.Canvas?.polygonBackends?.pixi?.prototype?.compute;

    if (originalCompute) {
      CONFIG.Canvas.polygonBackends.pixi.prototype.compute = function(origin, config) {
        // Se non c'è canvas o dimensioni, usa il metodo originale
        if (!canvas?.ready || !canvas?.dimensions) {
          return originalCompute.call(this, origin, config);
        }

        const bounds = canvas.dimensions.rect;

        // Validazione dell'origine
        if (!origin || typeof origin.x !== "number" || typeof origin.y !== "number") {
          // Usa il centro della scena come fallback
          origin = {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2
          };
        }

        // Controlla se l'origine è fuori dai limiti
        const isOutOfBounds =
          origin.x < bounds.x ||
          origin.x > bounds.x + bounds.width ||
          origin.y < bounds.y ||
          origin.y > bounds.y + bounds.height;

        if (isOutOfBounds) {
          // Clamp l'origine ai limiti della scena
          const clampedOrigin = {
            x: Math.max(bounds.x + 1, Math.min(bounds.x + bounds.width - 1, origin.x)),
            y: Math.max(bounds.y + 1, Math.min(bounds.y + bounds.height - 1, origin.y))
          };

          // Usa l'origine clampata
          return originalCompute.call(this, clampedOrigin, config);
        }

        // Origine valida, usa il metodo originale
        return originalCompute.call(this, origin, config);
      };

      console.log("Brancalonia | Polygon compute method patched");
    }
  });

  // Hook aggiuntivo per gestire le luci durante il canvas ready
  Hooks.on("canvasReady", (canvas) => {
    console.log("Brancalonia | Canvas ready, verifico luci...");

    // Verifica tutte le luci ambient nella scena
    canvas.scene?.lights?.forEach(light => {
      const x = light.x;
      const y = light.y;
      const bounds = canvas.dimensions.rect;

      if (x < bounds.x || x > bounds.x + bounds.width ||
          y < bounds.y || y > bounds.y + bounds.height) {
        console.log(`Brancalonia | Luce ${light.id} trovata fuori dai limiti: (${x}, ${y})`);

        // Aggiorna la posizione della luce ai limiti della scena
        const newX = Math.max(bounds.x + 100, Math.min(bounds.x + bounds.width - 100, x));
        const newY = Math.max(bounds.y + 100, Math.min(bounds.y + bounds.height - 100, y));

        light.update({
          x: newX,
          y: newY
        }, {diff: false, render: false}).then(() => {
          console.log(`Brancalonia | Luce ${light.id} riposizionata a (${newX}, ${newY})`);
        }).catch(err => {
          console.log(`Brancalonia | Impossibile riposizionare luce ${light.id}:`, err);
        });
      }
    });
  });

  // Hook per prevenire la creazione di luci fuori bounds
  Hooks.on("preCreateAmbientLight", (document, data, options, userId) => {
    if (!canvas?.ready) return;

    const bounds = canvas.dimensions.rect;
    let modified = false;

    if (data.x < bounds.x || data.x > bounds.x + bounds.width) {
      data.x = Math.max(bounds.x + 100, Math.min(bounds.x + bounds.width - 100, data.x));
      modified = true;
    }

    if (data.y < bounds.y || data.y > bounds.y + bounds.height) {
      data.y = Math.max(bounds.y + 100, Math.min(bounds.y + bounds.height - 100, data.y));
      modified = true;
    }

    if (modified) {
      console.log(`Brancalonia | Posizione luce corretta alla creazione: (${data.x}, ${data.y})`);
    }
  });

  // Ripristina console.warn dopo l'inizializzazione completa (opzionale)
  Hooks.once("ready", () => {
    setTimeout(() => {
      // Mantieni il wrapper per continuare a sopprimere i warning polygon
      console.log(`Brancalonia | Sistema polygon fix completamente attivo. Warning soppressi: ${warningsSuppressed}`);
    }, 5000);
  });

})();