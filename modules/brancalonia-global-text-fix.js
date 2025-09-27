/**
 * BRANCALONIA GLOBAL TEXT FIX
 * Fix globale e definitivo per TUTTI i label fa-solid in tutto Foundry
 * DEVE essere caricato PER PRIMO
 */

console.log("🚨 BRANCALONIA GLOBAL TEXT FIX - LOADING");

// ============================================
// MAPPA GLOBALE DI TUTTI I FIX
// ============================================

const GLOBAL_TEXT_FIXES = {
  // Menu Settings
  "fa-solid fa-users-cog": "Configure Settings",
  "fa-solid fa-sliders-h": "Configure Controls",
  "fa-solid fa-list": "Manage Modules",
  "fa-solid fa-globe": "Edit World",
  "fa-solid fa-user": "User Management",
  "fa-solid fa-users": "Tour Management",
  "fa-solid fa-life-ring": "Support & Issues",
  "fa-solid fa-book": "View Documentation",
  "fa-solid fa-wikipedia-w": "Community Wiki Pages",
  "fa-solid fa-envelope": "Invitation Links",
  "fa-solid fa-sign-out-alt": "Log Out",
  "fa-solid fa-undo": "Return to Setup",

  // Altri comuni
  "fa-solid fa-cog": "Settings",
  "fa-solid fa-cogs": "Configuration",
  "fa-solid fa-wrench": "Tools",
  "fa-solid fa-tools": "Admin Tools",
  "fa-solid fa-gear": "Settings",
  "fa-solid fa-gears": "Advanced Settings",
  "fa-solid fa-sync": "Sync",
  "fa fa-sync": "Sync",
  "fa-solid fa-dice-d20": "Dice Configuration",
  "fa-solid fa-dice": "Dice Settings",
  "fa-solid fa-eye": "View",
  "fa-solid fa-eye-slash": "Hidden",
  "fa-solid fa-lock": "Permissions",
  "fa-solid fa-unlock": "Open",
  "fa-solid fa-shield": "Security",
  "fa-solid fa-shield-alt": "Security Settings",
  "fa-solid fa-download": "Download",
  "fa-solid fa-upload": "Upload",
  "fa-solid fa-file": "File",
  "fa-solid fa-folder": "Folder",
  "fa-solid fa-save": "Save",
  "fa-solid fa-trash": "Delete",
  "fa-solid fa-plus": "Add",
  "fa-solid fa-minus": "Remove",
  "fa-solid fa-edit": "Edit",
  "fa-solid fa-pencil": "Edit",
  "fa-solid fa-times": "Close",
  "fa-solid fa-check": "Confirm",
  "fa-solid fa-search": "Search",
  "fa-solid fa-filter": "Filter",
  "fa-solid fa-sort": "Sort",
  "fa-solid fa-home": "Home",
  "fa-solid fa-arrow-left": "Back",
  "fa-solid fa-arrow-right": "Forward",
  "fa-solid fa-refresh": "Refresh",
  "fa-solid fa-question": "Help",
  "fa-solid fa-info": "Info",
  "fa-solid fa-exclamation": "Warning",
  "fa-solid fa-ban": "Disabled"
};

// ============================================
// FUNZIONE GLOBALE DI FIX
// ============================================

function fixFaSolidText(text) {
  if (!text || typeof text !== 'string') return text;

  // Se contiene fa-solid o fa fa-, correggilo
  if (text.includes('fa-solid') || text.includes('fa fa-')) {
    // Prima prova con la mappa
    for (const [bad, good] of Object.entries(GLOBAL_TEXT_FIXES)) {
      if (text.includes(bad)) {
        text = text.replace(bad, good);
      }
    }

    // Se ancora contiene fa-, puliscilo
    if (text.includes('fa-solid') || text.includes('fa fa-')) {
      text = text.replace(/fa-solid\s+fa-[\w-]+/g, (match) => {
        const cleaned = match.replace(/fa-solid\s+fa-/g, '')
                            .replace(/-/g, ' ')
                            .trim()
                            .replace(/\b\w/g, l => l.toUpperCase());
        return cleaned;
      });

      text = text.replace(/fa\s+fa-[\w-]+/g, (match) => {
        const cleaned = match.replace(/fa\s+fa-/g, '')
                            .replace(/-/g, ' ')
                            .trim()
                            .replace(/\b\w/g, l => l.toUpperCase());
        return cleaned;
      });
    }
  }

  return text;
}

// ============================================
// OVERRIDE GLOBALI DI TUTTI I METODI DOM
// ============================================

(function() {
  console.log("🔧 Installing global DOM interceptors");

  // 1. OVERRIDE textContent
  const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
  Object.defineProperty(Node.prototype, 'textContent', {
    get: originalTextContent.get,
    set: function(value) {
      value = fixFaSolidText(value);
      originalTextContent.set.call(this, value);
    }
  });

  // 2. OVERRIDE innerText
  const originalInnerText = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText');
  if (originalInnerText) {
    Object.defineProperty(HTMLElement.prototype, 'innerText', {
      get: originalInnerText.get,
      set: function(value) {
        value = fixFaSolidText(value);
        originalInnerText.set.call(this, value);
      }
    });
  }

  // 3. OVERRIDE innerHTML
  const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', {
    get: originalInnerHTML.get,
    set: function(value) {
      if (typeof value === 'string') {
        // Fix testo fuori dai tag
        value = value.replace(/>([^<]+)</g, (match, text) => {
          return '>' + fixFaSolidText(text) + '<';
        });

        // Fix attributi
        value = value.replace(/title="([^"]+)"/g, (match, text) => {
          return 'title="' + fixFaSolidText(text) + '"';
        });

        value = value.replace(/alt="([^"]+)"/g, (match, text) => {
          return 'alt="' + fixFaSolidText(text) + '"';
        });

        value = value.replace(/placeholder="([^"]+)"/g, (match, text) => {
          return 'placeholder="' + fixFaSolidText(text) + '"';
        });
      }
      originalInnerHTML.set.call(this, value);
    }
  });

  // 4. OVERRIDE createTextNode
  const originalCreateTextNode = document.createTextNode;
  document.createTextNode = function(text) {
    text = fixFaSolidText(text);
    return originalCreateTextNode.call(this, text);
  };

  // 5. OVERRIDE appendChild per intercettare nodi di testo
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(child) {
    if (child && child.nodeType === 3) { // Text node
      child.textContent = fixFaSolidText(child.textContent);
    }
    return originalAppendChild.call(this, child);
  };

  // 6. OVERRIDE insertBefore
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (newNode && newNode.nodeType === 3) { // Text node
      newNode.textContent = fixFaSolidText(newNode.textContent);
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };

  console.log("✅ Global DOM interceptors installed");
})();

// ============================================
// OVERRIDE JQUERY SE DISPONIBILE
// ============================================

(function() {
  // Aspetta che jQuery sia disponibile
  const waitForJQuery = setInterval(() => {
    if (typeof $ !== 'undefined' && $.fn) {
      clearInterval(waitForJQuery);

      console.log("🔧 Installing jQuery interceptors");

      // Override jQuery.text()
      const originalText = $.fn.text;
      $.fn.text = function(value) {
        if (value !== undefined) {
          value = fixFaSolidText(value);
        }
        const result = originalText.call(this, value);

        // Se getter, correggi il risultato
        if (value === undefined && typeof result === 'string') {
          return fixFaSolidText(result);
        }

        return result;
      };

      // Override jQuery.html()
      const originalHtml = $.fn.html;
      $.fn.html = function(value) {
        if (value !== undefined && typeof value === 'string') {
          // Fix HTML come sopra
          value = value.replace(/>([^<]+)</g, (match, text) => {
            return '>' + fixFaSolidText(text) + '<';
          });
        }
        return originalHtml.call(this, value);
      };

      // Override jQuery.append()
      const originalAppend = $.fn.append;
      $.fn.append = function(...args) {
        args = args.map(arg => {
          if (typeof arg === 'string') {
            return fixFaSolidText(arg);
          }
          return arg;
        });
        return originalAppend.apply(this, args);
      };

      // Override jQuery.prepend()
      const originalPrepend = $.fn.prepend;
      $.fn.prepend = function(...args) {
        args = args.map(arg => {
          if (typeof arg === 'string') {
            return fixFaSolidText(arg);
          }
          return arg;
        });
        return originalPrepend.apply(this, args);
      };

      console.log("✅ jQuery interceptors installed");
    }
  }, 10);
})();

// ============================================
// MUTATION OBSERVER GLOBALE
// ============================================

(function() {
  // Aspetta che il DOM sia pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installObserver);
  } else {
    installObserver();
  }

  function installObserver() {
    console.log("🔧 Installing global MutationObserver");

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        // Controlla nodi aggiunti
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 3) { // Text node
              if (node.textContent.includes('fa-solid') || node.textContent.includes('fa fa-')) {
                node.textContent = fixFaSolidText(node.textContent);
              }
            } else if (node.nodeType === 1) { // Element node
              // Cerca tutti i nodi di testo nell'elemento
              const walker = document.createTreeWalker(
                node,
                NodeFilter.SHOW_TEXT,
                null,
                false
              );

              let textNode;
              while (textNode = walker.nextNode()) {
                if (textNode.textContent.includes('fa-solid') || textNode.textContent.includes('fa fa-')) {
                  textNode.textContent = fixFaSolidText(textNode.textContent);
                }
              }
            }
          });
        }

        // Controlla modifiche al testo
        if (mutation.type === 'characterData') {
          if (mutation.target.textContent.includes('fa-solid') || mutation.target.textContent.includes('fa fa-')) {
            mutation.target.textContent = fixFaSolidText(mutation.target.textContent);
          }
        }
      });
    });

    // Osserva tutto il document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: false
    });

    console.log("✅ Global MutationObserver installed");

    // Fix iniziale di tutto il DOM esistente
    fixEntireDOM();
  }
})();

// ============================================
// FIX INIZIALE DEL DOM
// ============================================

function fixEntireDOM() {
  console.log("🔧 Fixing entire existing DOM");

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let textNode;
  let fixedCount = 0;

  while (textNode = walker.nextNode()) {
    if (textNode.textContent.includes('fa-solid') || textNode.textContent.includes('fa fa-')) {
      textNode.textContent = fixFaSolidText(textNode.textContent);
      fixedCount++;
    }
  }

  if (fixedCount > 0) {
    console.log(`✅ Fixed ${fixedCount} text nodes in existing DOM`);
  }
}

// ============================================
// HOOK PER FOUNDRY
// ============================================

// Hook su OGNI render
Hooks.on("render", (app, html) => {
  const $html = html.jquery ? html : $(html);

  // Fix tutti i testi nell'HTML renderizzato
  $html.find('*').contents().filter(function() {
    return this.nodeType === 3; // Text nodes
  }).each(function() {
    if (this.textContent.includes('fa-solid') || this.textContent.includes('fa fa-')) {
      this.textContent = fixFaSolidText(this.textContent);
    }
  });
});

// Hook generico su tutti i render
["renderApplication", "renderDialog", "renderPopout", "renderSettings", "renderActorSheet",
 "renderItemSheet", "renderJournalSheet", "renderCompendium", "renderSidebarTab"].forEach(hookName => {
  Hooks.on(hookName, (app, html) => {
    const $html = html.jquery ? html : $(html);

    $html.find('*').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      if (this.textContent.includes('fa-solid') || this.textContent.includes('fa fa-')) {
        this.textContent = fixFaSolidText(this.textContent);
      }
    });
  });
});

// Fix al ready
Hooks.once("ready", () => {
  console.log("🔧 Final DOM fix at ready");
  fixEntireDOM();
});

console.log("✅ BRANCALONIA GLOBAL TEXT FIX - LOADED");
console.log("🚨 All text rendering is now intercepted and fixed globally");