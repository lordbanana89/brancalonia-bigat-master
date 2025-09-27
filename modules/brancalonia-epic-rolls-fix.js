/**
 * BRANCALONIA EPIC ROLLS 5E COMPATIBILITY FIX
 * Risolve l'errore di Epic Rolls 5e con renderChatLog
 *
 * PROBLEMA: Epic Rolls 5e cerca di fare .prepend() su un elemento null
 * SOLUZIONE: Intercettare e fixare il problema prima che causi l'errore
 */

(function() {
  console.log("🎲 Brancalonia Epic Rolls Fix - Patching compatibility");

  // Hook molto precoce per intercettare il problema
  Hooks.once("init", () => {
    // Wrap renderChatLog per proteggere da errori
    const originalCallAll = Hooks.callAll;
    let patchActive = true;

    Hooks.callAll = function(hook, ...args) {
      if (patchActive && hook === "renderChatLog") {
        try {
          // Valida gli argomenti prima di passarli
          const [app, html, data] = args;

          // Assicurati che html esista e sia utilizzabile
          if (!html) {
            console.warn("⚠️ renderChatLog called with null html, skipping Epic Rolls hook");
            return;
          }

          // Se html è jQuery, assicurati che abbia elementi
          if (html && html.jquery && html.length === 0) {
            console.warn("⚠️ renderChatLog jQuery object is empty, creating placeholder");
            // Non chiamare gli hook se l'elemento è vuoto
            return;
          }

          // Se html è HTMLElement, assicurati che esista
          if (html instanceof HTMLElement) {
            // Verifica che l'elemento sia nel DOM o almeno valido
            if (!html.parentNode && !html.childNodes.length) {
              console.warn("⚠️ renderChatLog HTMLElement is detached and empty");
              // Aggiungi un contenitore minimo se necessario
              if (!html.querySelector('.chat-message')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'chat-messages';
                html.appendChild(placeholder);
              }
            }
          }

          // Intercetta errori specifici di Epic Rolls
          const originalArgs = [...args];

          // Wrap specifico per Epic Rolls
          if (game.modules.get("epic-rolls-5e")?.active) {
            // Crea un wrapper per html che previene errori
            if (html && typeof html === 'object') {
              const safeHtml = createSafeHtmlWrapper(html);
              args[1] = safeHtml;
            }
          }

          // Chiama gli hook con protezione
          try {
            return originalCallAll.call(this, hook, ...args);
          } catch (error) {
            if (error.message?.includes("Cannot read properties of null")) {
              console.warn("⚠️ Epic Rolls 5e error caught and suppressed:", error.message);
              // Prova a chiamare gli altri hook saltando quello problematico
              return callHooksExcept(hook, args, "epic-rolls-5e");
            }
            throw error;
          }

        } catch (error) {
          console.error("❌ Error in renderChatLog compatibility wrapper:", error);
          // Non rilanciare per non bloccare il rendering
          return;
        }
      }

      // Per tutti gli altri hook, chiama normalmente
      return originalCallAll.call(this, hook, ...args);
    };

    // Ripristina dopo il caricamento
    Hooks.once("ready", () => {
      setTimeout(() => {
        patchActive = false;
        console.log("✅ Epic Rolls fix - Protection disabled after startup");
      }, 3000);
    });
  });

  /**
   * Crea un wrapper sicuro per l'oggetto html
   */
  function createSafeHtmlWrapper(html) {
    // Se è jQuery
    if (html.jquery) {
      const original = html;

      // Override del metodo find per Epic Rolls
      const originalFind = html.find.bind(html);
      html.find = function(selector) {
        const result = originalFind(selector);

        // Se Epic Rolls cerca elementi specifici che non esistono
        if (selector === '.chat-messages' && result.length === 0) {
          console.log("🔧 Creating missing .chat-messages for Epic Rolls");
          // Crea elemento mancante
          const messages = $('<div class="chat-messages"></div>');
          html.append(messages);
          return messages;
        }

        // Aggiungi metodo prepend sicuro
        if (result.length > 0 && !result.prepend._safe) {
          const originalPrepend = result.prepend.bind(result);
          result.prepend = function(...args) {
            try {
              return originalPrepend(...args);
            } catch (e) {
              console.warn("⚠️ Epic Rolls prepend failed, element might be null");
              return result;
            }
          };
          result.prepend._safe = true;
        }

        return result;
      };

      return html;
    }

    // Se è HTMLElement
    if (html instanceof HTMLElement) {
      // Assicurati che querySelector non ritorni null per elementi critici
      const originalQuerySelector = html.querySelector.bind(html);
      html.querySelector = function(selector) {
        const result = originalQuerySelector(selector);

        if (!result && selector === '.chat-messages') {
          console.log("🔧 Creating missing .chat-messages element for Epic Rolls");
          const messages = document.createElement('div');
          messages.className = 'chat-messages';
          html.appendChild(messages);
          return messages;
        }

        return result;
      };

      return html;
    }

    return html;
  }

  /**
   * Chiama hooks escludendo un modulo specifico
   */
  function callHooksExcept(hook, args, excludeModule) {
    console.log(`🔧 Calling ${hook} hooks except ${excludeModule}`);

    // Ottieni tutti gli hook registrati
    const hooks = Hooks._hooks[hook] || [];

    for (const hookFn of hooks) {
      try {
        // Salta se è Epic Rolls (euristico basato sul nome della funzione)
        if (hookFn.toString().includes('epic-rolls') ||
            hookFn.toString().includes('prepend')) {
          console.log("  ⏭️ Skipping suspected Epic Rolls hook");
          continue;
        }

        // Chiama l'hook
        hookFn(...args);
      } catch (e) {
        console.warn(`  ⚠️ Error in hook, skipping:`, e.message);
      }
    }
  }

  /**
   * Fix alternativo: patch diretto di Epic Rolls se caricato
   */
  Hooks.once("setup", () => {
    if (game.modules.get("epic-rolls-5e")?.active) {
      console.log("🎲 Epic Rolls 5e detected, applying specific patches");

      // Trova e patcha le funzioni problematiche di Epic Rolls
      if (window.EpicRolls5e || window.epicRolls) {
        const epicRolls = window.EpicRolls5e || window.epicRolls;

        // Patcha metodi che potrebbero causare problemi
        for (const key in epicRolls) {
          if (typeof epicRolls[key] === 'function') {
            const original = epicRolls[key];
            epicRolls[key] = function(...args) {
              try {
                return original.apply(this, args);
              } catch (error) {
                console.warn(`⚠️ Epic Rolls function ${key} failed:`, error.message);
                return null;
              }
            };
          }
        }
      }
    }
  });

  /**
   * Protezione aggiuntiva per ChatLog render
   */
  Hooks.on("renderChatLog", (app, html, data) => {
    // Assicurati che elementi critici esistano
    if (html && !html.find?.('.chat-messages')?.length) {
      const $html = html.jquery ? html : $(html);

      if ($html.length > 0 && !$html.find('.chat-messages').length) {
        console.log("🔧 Adding missing .chat-messages container");
        $html.append('<div class="chat-messages"></div>');
      }
    }
  });

})();

console.log("📦 Brancalonia Epic Rolls Fix loaded");