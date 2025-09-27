/**
 * BRANCALONIA MENU FIX
 * Fix aggressivo per i label del menu Settings
 */

console.log("🔧 Brancalonia Menu Fix - Loading");

// ============================================
// FIX MENU SETTINGS PRINCIPALE
// ============================================

// Mappa completa dei label corretti
const MENU_LABELS = {
  // Game Settings
  "fa-solid fa-users-cog Configure Settings": "Configure Settings",
  "fa-solid fa-sliders-h Configure Controls": "Configure Controls",
  "fa-solid fa-list Manage Modules": "Manage Modules",
  "fa-solid fa-globe Edit World": "Edit World",
  "fa-solid fa-user User Management": "User Management",
  "fa-solid fa-users Tour Management": "Tour Management",

  // Help and Documentation
  "fa-solid fa-life-ring Support & Issues": "Support & Issues",
  "fa-solid fa-book View Documentation": "View Documentation",
  "fa-solid fa-wikipedia-w Community Wiki Pages": "Community Wiki Pages",

  // Game Access
  "fa-solid fa-envelope Invitation Links": "Invitation Links",
  "fa-solid fa-sign-out-alt Log Out": "Log Out",
  "fa-solid fa-undo Return to Setup": "Return to Setup",

  // Varianti senza testo
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
  "fa-solid fa-undo": "Return to Setup"
};

// Override del rendering del menu Settings
Hooks.on("renderSettings", (app, html, data) => {
  console.log("🎯 Fixing Settings menu labels");

  const $html = html.jquery ? html : $(html);

  // Fix tutti i bottoni
  $html.find('button').each(function() {
    const button = $(this);
    const text = button.text().trim();

    // Cerca una corrispondenza nella mappa
    for (const [bad, good] of Object.entries(MENU_LABELS)) {
      if (text === bad || text.includes(bad)) {
        console.log(`✅ Fixed: "${text}" -> "${good}"`);

        // Preserva l'icona se esiste
        const icon = button.find('i').detach();
        button.text(good);
        if (icon.length) button.prepend(icon);

        break;
      }
    }

    // Se non trova match esatto, prova a pulire
    if (text.includes('fa-solid') || text.includes('fa-')) {
      const cleaned = text
        .replace(/fa-solid\s+fa-/g, '')
        .replace(/fa-/g, '')
        .replace(/-/g, ' ')
        .trim()
        .replace(/\b\w/g, l => l.toUpperCase());

      if (cleaned && cleaned !== text) {
        console.log(`🔧 Cleaned: "${text}" -> "${cleaned}"`);
        const icon = button.find('i').detach();
        button.text(cleaned);
        if (icon.length) button.prepend(icon);
      }
    }
  });

  // Fix anche i link che potrebbero avere lo stesso problema
  $html.find('a').each(function() {
    const link = $(this);
    const text = link.text().trim();

    for (const [bad, good] of Object.entries(MENU_LABELS)) {
      if (text === bad || text.includes(bad)) {
        console.log(`✅ Fixed link: "${text}" -> "${good}"`);
        const icon = link.find('i').detach();
        link.text(good);
        if (icon.length) link.prepend(icon);
        break;
      }
    }
  });
});

// MutationObserver per catturare modifiche dinamiche
Hooks.once("ready", () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            // Se è il menu settings
            if (node.classList?.contains('app') && node.classList?.contains('settings')) {
              console.log("🎯 Settings menu detected via MutationObserver");
              fixSettingsMenu(node);
            }
          }
        });
      }
    });
  });

  // Osserva il body per nuovi elementi
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

/**
 * Fix diretto del menu settings
 */
function fixSettingsMenu(element) {
  const $element = $(element);

  $element.find('button, a').each(function() {
    const el = $(this);
    const text = el.text().trim();

    for (const [bad, good] of Object.entries(MENU_LABELS)) {
      if (text === bad || text.includes(bad)) {
        const icon = el.find('i').detach();
        el.text(good);
        if (icon.length) el.prepend(icon);
        break;
      }
    }
  });
}

console.log("✅ Brancalonia Menu Fix loaded");