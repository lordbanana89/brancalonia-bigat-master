/**
 * BRANCALONIA CHAT HOOKS FIX
 * Risolve problemi con hook deprecati e parametri cambiati in v13
 *
 * PROBLEMI:
 * 1. renderChatMessage è deprecato, ora è renderChatMessageHTML
 * 2. renderChatMessageHTML passa HTMLElement invece di jQuery
 * 3. Altri hook potrebbero avere problemi simili
 */

// Fix immediato per hook deprecati
(function() {
  console.log("🔧 Brancalonia Chat Hooks Fix - Patching deprecated hooks");

  // Intercetta la registrazione degli hook per fixare al volo
  const originalOn = Hooks.on;
  const originalOnce = Hooks.once;

  // Lista di hook deprecati e loro sostituzioni
  const deprecatedHooks = {
    'renderChatMessage': 'renderChatMessageHTML'
  };

  // Override Hooks.on temporaneo
  Hooks.on = function(hook, fn) {
    // Se è un hook deprecato, usa quello nuovo
    if (deprecatedHooks[hook]) {
      console.log(`  📝 Redirecting deprecated hook ${hook} → ${deprecatedHooks[hook]}`);
      hook = deprecatedHooks[hook];
    }

    // Se è renderChatMessageHTML, wrappa per compatibilità jQuery
    if (hook === 'renderChatMessageHTML') {
      const originalFn = fn;
      fn = function(message, html, data) {
        // html è ora un HTMLElement, non jQuery
        // Se il codice si aspetta jQuery, crea un wrapper
        if (typeof $ !== 'undefined' && html instanceof HTMLElement) {
          try {
            // Chiama con jQuery wrapper per retrocompatibilità
            const $html = $(html);
            const result = originalFn.call(this, message, $html, data);

            // Se la funzione ha modificato il jQuery object,
            // sincronizza le modifiche con l'HTMLElement originale
            if ($html[0] !== html && $html[0]) {
              // Sostituisci il contenuto
              html.innerHTML = $html[0].innerHTML;

              // Copia attributi
              for (const attr of $html[0].attributes) {
                html.setAttribute(attr.name, attr.value);
              }

              // Copia classi
              html.className = $html[0].className;
            }

            return result;
          } catch (error) {
            console.error("Error in renderChatMessageHTML compatibility wrapper:", error);
            // Fallback: chiama con HTMLElement originale
            return originalFn.call(this, message, html, data);
          }
        }

        // Se non serve compatibilità, chiama normalmente
        return originalFn.call(this, message, html, data);
      };
    }

    return originalOn.call(this, hook, fn);
  };

  // Override Hooks.once temporaneo
  Hooks.once = function(hook, fn) {
    if (deprecatedHooks[hook]) {
      console.log(`  📝 Redirecting deprecated hook ${hook} → ${deprecatedHooks[hook]}`);
      hook = deprecatedHooks[hook];
    }
    return originalOnce.call(this, hook, fn);
  };

  // Ripristina dopo che tutti i moduli sono caricati
  Hooks.once("ready", () => {
    setTimeout(() => {
      Hooks.on = originalOn;
      Hooks.once = originalOnce;
      console.log("✅ Chat hooks fix - Original hooks restored");
    }, 1000);
  });

})();

/**
 * Fix specifico per renderChatMessageHTML deprecation warning
 */
Hooks.once("init", () => {
  // Sopprimi il warning specifico
  const originalLogCompat = foundry.helpers?.utils?.logCompatibilityWarning ||
                           foundry.utils?.logCompatibilityWarning ||
                           console.warn;

  if (typeof foundry !== 'undefined') {
    // Override del metodo di warning
    const logCompatWrapper = function(...args) {
      const message = args.join(' ');

      // Sopprimi warning per renderChatMessage deprecato
      if (message.includes("renderChatMessage hook is deprecated") ||
          message.includes("renderChatMessageHTML instead")) {
        // Silenzioso - già gestito dal nostro fix
        return;
      }

      // Per tutti gli altri, chiama l'originale
      return originalLogCompat.apply(this, args);
    };

    // Applica l'override dove serve
    if (foundry.helpers?.utils) {
      foundry.helpers.utils.logCompatibilityWarning = logCompatWrapper;
    }
    if (foundry.utils) {
      foundry.utils.logCompatibilityWarning = logCompatWrapper;
    }
  }
});

/**
 * Fix per renderChatLog error
 * Alcuni moduli potrebbero chiamare renderChatLog con parametri errati
 */
Hooks.on("renderChatLog", (app, html, data) => {
  try {
    // Assicurati che html sia utilizzabile
    if (!html) {
      console.warn("⚠️ renderChatLog called with null html");
      return;
    }

    // Se html è jQuery, ok
    // Se html è HTMLElement, ok per v13
    // Se html è qualcos'altro, problema
    if (typeof html === 'object' &&
        !(html instanceof HTMLElement) &&
        !(html.jquery)) {
      console.error("❌ renderChatLog received invalid html parameter:", html);
      return;
    }
  } catch (error) {
    console.error("Error in renderChatLog compatibility check:", error);
    // Non rilanciare per non bloccare altri hook
  }
});

/**
 * Monkey-patch per ChatMessage.renderHTML per evitare il warning
 */
Hooks.once("setup", () => {
  if (CONFIG.ChatMessage?.documentClass?.prototype?.renderHTML) {
    const originalRenderHTML = CONFIG.ChatMessage.documentClass.prototype.renderHTML;

    CONFIG.ChatMessage.documentClass.prototype.renderHTML = async function(...args) {
      try {
        // Chiama l'originale
        const result = await originalRenderHTML.apply(this, args);

        // Chiama il nuovo hook invece del vecchio
        if (result instanceof HTMLElement) {
          Hooks.callAll("renderChatMessageHTML", this, result);
        }

        return result;
      } catch (error) {
        console.error("Error in ChatMessage.renderHTML patch:", error);
        // Fallback all'originale
        return originalRenderHTML.apply(this, args);
      }
    };
  }
});

console.log("📦 Brancalonia Chat Hooks Fix loaded");