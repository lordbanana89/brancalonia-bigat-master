/**
 * BRANCALONIA DEBUG SCRIPT
 * Esegui questo nella console di Foundry (F12) per diagnosticare problemi
 */

console.log("🔍 BRANCALONIA DEBUG STARTING...");

// 1. Check modulo caricato
const checkModule = () => {
  const module = game.modules.get('brancalonia-bigat');
  if (!module) {
    console.error("❌ Modulo Brancalonia non trovato!");
    return false;
  }
  console.log("✅ Modulo trovato:", {
    id: module.id,
    title: module.title,
    version: module.version,
    active: module.active
  });
  return module.active;
};

// 2. Analizza actor sheet
const analyzeActorSheet = () => {
  const sheet = document.querySelector('.dnd5e.sheet.actor');
  if (!sheet) {
    console.error("❌ Nessuna actor sheet aperta!");
    return null;
  }

  const info = {
    mainClasses: sheet.className,
    hasThemeClass: sheet.classList.contains('brancalonia-sheet'),
    header: {
      exists: !!sheet.querySelector('.sheet-header'),
      classes: sheet.querySelector('.sheet-header')?.className,
      portrait: !!sheet.querySelector('.sheet-header .profile'),
      portraitClasses: sheet.querySelector('.sheet-header .profile')?.className
    },
    abilities: {
      container: !!sheet.querySelector('.abilities'),
      count: sheet.querySelectorAll('.ability').length,
      firstAbilityClasses: sheet.querySelector('.ability')?.className
    },
    tabs: {
      navigation: !!sheet.querySelector('.sheet-navigation'),
      tabCount: sheet.querySelectorAll('.sheet-navigation .item').length
    },
    customElements: {
      infamia: !!sheet.querySelector('.infamia-tracker'),
      baraonda: !!sheet.querySelector('.baraonda-tracker')
    }
  };

  console.log("📋 Actor Sheet Analysis:", info);
  return info;
};

// 3. Check CSS caricati
const checkCSS = () => {
  const styles = Array.from(document.styleSheets);
  const brancaloniaStyles = styles.filter(s =>
    s.href && s.href.includes('brancalonia')
  );

  console.log(`📚 CSS Brancalonia caricati: ${brancaloniaStyles.length}`);
  brancaloniaStyles.forEach(s => {
    console.log("  - " + s.href.split('/').pop());
  });

  return brancaloniaStyles.length;
};

// 4. Check errori console
const checkErrors = () => {
  // Questo cattura errori futuri
  const originalError = console.error;
  const errors = [];

  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };

  // Simula apertura sheet per catturare errori
  if (game.actors.size > 0) {
    const actor = game.actors.contents[0];
    console.log(`🎭 Tentativo apertura sheet per: ${actor.name}`);
    actor.sheet.render(true);
  }

  setTimeout(() => {
    console.error = originalError;
    if (errors.length > 0) {
      console.error("❌ Errori catturati:", errors);
    } else {
      console.log("✅ Nessun errore durante apertura sheet");
    }
  }, 2000);
};

// 5. Estrai struttura DOM per fix CSS
const extractDOMStructure = () => {
  const sheet = document.querySelector('.dnd5e.sheet.actor');
  if (!sheet) return null;

  // Estrai solo struttura, non contenuto
  const cleanHTML = sheet.innerHTML
    .replace(/>[^<]+</g, '>...<')  // Rimuovi testo
    .replace(/<!--[\s\S]*?-->/g, '') // Rimuovi commenti
    .substring(0, 5000); // Primi 5000 caratteri

  console.log("🏗️ Struttura DOM (semplificata):");
  console.log(cleanHTML);

  // Copia negli appunti per facile condivisione
  if (navigator.clipboard) {
    navigator.clipboard.writeText(cleanHTML).then(() => {
      console.log("📋 Struttura copiata negli appunti!");
    });
  }

  return cleanHTML;
};

// 6. Test variabili CSS
const testCSSVariables = () => {
  const testVars = [
    '--bcl-gold',
    '--bcl-surface',
    '--bcl-ink',
    '--bcl-paper'
  ];

  const root = document.documentElement;
  const computed = getComputedStyle(root);

  console.log("🎨 Test Variabili CSS:");
  testVars.forEach(v => {
    const value = computed.getPropertyValue(v);
    if (value) {
      console.log(`  ✅ ${v}: ${value}`);
    } else {
      console.error(`  ❌ ${v}: NON DEFINITA!`);
    }
  });
};

// ESEGUI TUTTI I TEST
console.log("=====================================");
const moduleActive = checkModule();

if (moduleActive) {
  checkCSS();
  testCSSVariables();

  const sheetInfo = analyzeActorSheet();
  if (sheetInfo) {
    extractDOMStructure();
  } else {
    console.warn("⚠️ Apri una actor sheet per analisi completa!");
  }

  checkErrors();
} else {
  console.error("❌ Attiva il modulo Brancalonia prima di continuare!");
}

console.log("=====================================");
console.log("📝 REPORT COMPLETO SOPRA");
console.log("Copia tutto e condividi per ricevere fix mirati!");

// Ritorna oggetto riassuntivo
({
  module: checkModule(),
  css: checkCSS(),
  sheet: analyzeActorSheet(),
  timestamp: new Date().toISOString()
});