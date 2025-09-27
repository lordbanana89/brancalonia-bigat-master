/**
 * BRANCALONIA THEME CORE
 * Sistema di theming dinamico per Brancalonia
 * "Spaghetti Fantasy" - Picaresque, dirty, comic-book inspired
 * NOT noble Renaissance - dirty taverns and roguish scoundrels!
 */

export class BrancaloniaTheme {

  constructor(data = {}) {
    // Applica i dati passati o usa i default
    Object.keys(this).forEach(key => {
      if (data.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    });
  }

  /**
   * Factory method per creare un tema dai dati
   */
  static from(themeData) {
    return themeData instanceof BrancaloniaTheme ? themeData : new BrancaloniaTheme(themeData);
  }

  /**
   * Applica il tema al mondo di gioco
   */
  async apply() {
    console.log('🎨 Applicando tema Brancalonia...');

    // Trova o crea il blocco style
    const $head = $('head');
    let $style = $head.find('style#brancalonia-theme');

    if ($style.length <= 0) {
      $style = $('<style id="brancalonia-theme"></style>');
      $head.append($style);
    }

    // Genera il contenuto CSS dalle proprietà del tema
    const styleData = this.generateCSSVariables();

    // Costruisci il CSS completo
    let styleContent = `:root {\n${styleData}\n}`;

    // Aggiungi stili avanzati
    styleContent += `\n\n${this.advanced}`;

    // Applica gli stili
    $style.html(styleContent);

    // Aggiungi elementi decorativi UI
    this.addUIElements();
  }

  /**
   * Genera le variabili CSS dal tema
   */
  generateCSSVariables() {
    const variables = [];

    // Mappa le proprietà del tema in variabili CSS
    Object.keys(this).forEach(key => {
      if (key === 'advanced') return; // Skip advanced content

      let value = this[key];

      // Gestione immagini
      if (key.includes('image') && value) {
        if (!value.startsWith('url(')) {
          value = `url("${value}")`;
        }
      }

      // Aggiungi la variabile CSS
      if (value && typeof value === 'string') {
        variables.push(`  --branca-${key}: ${value};`);
      }
    });

    return variables.join('\n');
  }

  /**
   * Aggiunge elementi UI decorativi
   */
  addUIElements() {
    // Accento ornamentale rinascimentale
    const $sidebar = $('#ui-left');
    if (!$sidebar.find('#brancalonia-ornament').length) {
      $sidebar.prepend(`
        <div id="brancalonia-ornament" class="renaissance-decoration">
          <div class="ornament-top"></div>
          <div class="ornament-bottom"></div>
        </div>
      `);
    }

    // Cornice per le finestre principali
    $('.app.window-app').each(function() {
      const $window = $(this);
      if (!$window.hasClass('brancalonia-window')) {
        $window.addClass('brancalonia-window');
      }
    });
  }

  /**
   * Esporta il tema in JSON
   */
  exportToJson() {
    const data = JSON.stringify(this, null, 2);
    const filename = 'brancalonia-theme-custom.json';
    const blob = new Blob([data], {type: 'text/json'});

    // Crea elemento per il download
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();

    setTimeout(() => window.URL.revokeObjectURL(a.href), 100);
  }

  /**
   * Importa tema da JSON
   */
  static async importFromJSON(json) {
    const data = JSON.parse(json);
    return new BrancaloniaTheme(data);
  }

  // ========================================
  // PALETTE SPAGHETTI FANTASY
  // ========================================

  /* Colori Base - Taverna Malandata */
  'color-primary-ochre' = '#8B7355ff';        // Ocra sporca - non dorata!
  'color-primary-sienna' = '#6B4C3Aff';       // Terra bruciata
  'color-primary-umber' = '#4A3426ff';        // Legno affumicato
  'color-primary-wine' = '#5C2328ff';         // Vino versato
  'color-primary-gold' = '#B8956Aff';         // Ottone ossidato - non oro!
  'color-primary-bronze' = '#8B7355ff';       // Bronzo macchiato

  /* Controlli - Stile Pergamena Macchiata */
  'color-control-content' = '#2B1F15ff';      // Inchiostro sbiadito
  'color-control-border' = '#5A4A3Aff';       // Bordo usurato
  'color-control-focus' = '#B8956Aff';        // Ottone focus
  'color-control-fill-1' = '#D4C4A8ff';       // Pergamena ingiallita
  'color-control-fill-2' = '#C8B69Cff';       // Pergamena macchiata

  /* Controlli - Evidenziazione */
  'color-control-highlight-content' = '#5C2328ff';
  'color-control-highlight-border' = '#6B4C3Aff';
  'color-control-highlight-fill-1' = '#C9A671ff';
  'color-control-highlight-fill-2' = '#B39573ff';

  /* Controlli - Attivi */
  'color-control-active-content' = '#B8956Aff';
  'color-control-active-border' = '#8B7355ff';
  'color-control-active-fill-1' = '#4A3426cc';
  'color-control-active-fill-2' = '#6B4C3Acc';

  /* Applicazioni - Finestre */
  'color-app-border' = '#52392Bff';           // Bordo legno macchiato
  'color-app-shadow' = '#000000dd';           // Ombra taverna

  /* Applicazioni - Header */
  'color-app-header-content' = '#D4C4A8ff';   // Testo sporco
  'color-app-header-fill-1' = '#4A3426ee';    // Legno affumicato
  'color-app-header-fill-2' = '#342821ee';    // Legno unto

  /* Applicazioni - Body */
  'color-app-body-content' = '#2B1F15ff';     // Testo scurito
  'color-app-body-secondary' = '#4A3A2Aff';   // Testo sbiadito
  'color-app-body-fill-1' = '#342821f5';      // Sfondo taverna
  'color-app-body-fill-2' = '#2A231Cf5';      // Sfondo cantina

  /* Sezioni Speciali */
  'color-section-border' = '#5A4A3Aff';
  'color-section-divider' = '#6B4C3Aff';
  'color-section-fill-1' = '#D4C2A6ff';       // Carta macchiata
  'color-section-fill-2' = '#C8B69Cff';       // Carta ingiallita

  /* Tracker Brancalonia - Picaresque Style */
  'color-infamia-bar' = '#5C2020ff';          // Sangue secco
  'color-infamia-fill' = '#7A2E2Eff';         // Rosso criminale
  'color-baraonda-empty' = '#5A4A3Aff';       // Ferro arrugginito
  'color-baraonda-filled' = '#B8956Aff';      // Ottone opaco
  'color-lavori-bg' = '#3A3025ff';            // Fango secco
  'color-lavori-text' = '#C4B5A0ff';          // Carta sporca
  'color-rifugio-active' = '#3B4A2Fff';       // Verde muffa
  'color-rifugio-inactive' = '#4A3A2Aff';     // Marrone polvere

  /* Immagini e Texture */
  'ui-accent-image' = 'modules/brancalonia/assets/ui/ornaments/corner-flourish.png';
  'app-bg-image' = 'modules/brancalonia/assets/ui/backgrounds/parchment-texture.jpg';
  'app-header-image' = 'modules/brancalonia/assets/ui/backgrounds/wood-dark.jpg';
  'sidebar-bg-image' = 'modules/brancalonia/assets/ui/backgrounds/tavern-wood.jpg';
  'section-bg-image' = 'modules/brancalonia/assets/ui/backgrounds/parchment-aged.jpg';

  /* Stili Avanzati */
  'advanced' = `
/* ========================================
   BRANCALONIA SPAGHETTI FANTASY THEME
   Dirty, worn, picaresque - NOT noble Renaissance!
   ======================================== */

/* Font Picareschi - Rough & Hand-Written Style */
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&family=IM+Fell+DW+Pica:ital@0;1&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

/* Variabili Aggiuntive - Spaghetti Fantasy */
:root {
  --branca-font-primary: 'IM Fell DW Pica', serif;
  --branca-font-display: 'IM Fell English SC', serif;
  --branca-font-size-base: 14px;
  --branca-border-ornate: 2px solid var(--branca-color-primary-bronze);
  --branca-shadow-tavern: 0 4px 8px rgba(0,0,0,0.7), inset 0 1px 0 rgba(0,0,0,0.3);
  --branca-gradient-tavern: linear-gradient(135deg, var(--branca-color-primary-umber), var(--branca-color-primary-sienna));
  --branca-texture-opacity: 0.25;
}

/* Applicazione Font Globale */
.brancalonia-window,
.brancalonia-sheet {
  font-family: var(--branca-font-primary);
}

/* Headers Ornamentali */
.brancalonia-window .window-header,
.brancalonia-sheet .sheet-header {
  font-family: var(--branca-font-display);
  background: var(--branca-gradient-tavern);
  border-bottom: var(--branca-border-ornate);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  position: relative;
}

/* Decorazioni Angolari */
.brancalonia-window::before,
.brancalonia-window::after {
  content: '';
  position: absolute;
  width: 60px;
  height: 60px;
  background-image: url('modules/brancalonia/assets/ui/ornaments/corner-gold.svg');
  background-size: contain;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 10;
}

.brancalonia-window::before {
  top: -5px;
  left: -5px;
}

.brancalonia-window::after {
  top: -5px;
  right: -5px;
  transform: scaleX(-1);
}

/* Texture Pergamena */
.brancalonia-sheet .sheet-body {
  position: relative;
  background-color: var(--branca-color-section-fill-1);
}

.brancalonia-sheet .sheet-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('modules/brancalonia/assets/ui/backgrounds/parchment-texture.jpg');
  background-size: cover;
  opacity: var(--branca-texture-opacity);
  pointer-events: none;
}

/* Tracker Brancalonia Stilizzati */
.brancalonia-trackers {
  border: 2px solid var(--branca-color-primary-bronze);
  border-radius: 8px;
  padding: 12px;
  margin: 10px 0;
  background: linear-gradient(135deg,
    var(--branca-color-section-fill-1) 0%,
    var(--branca-color-section-fill-2) 100%);
  box-shadow: var(--branca-shadow-renaissance);
}

.tracker-title {
  font-family: var(--branca-font-display);
  font-size: 1.1em;
  color: var(--branca-color-primary-wine);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tracker-title i {
  color: var(--branca-color-primary-gold);
  text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
}

/* Barra Infamia */
.infamia-tracker .tracker-bar {
  height: 20px;
  background: var(--branca-color-section-fill-2);
  border: 1px solid var(--branca-color-primary-umber);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}

.infamia-tracker .tracker-fill {
  height: 100%;
  background: linear-gradient(90deg,
    var(--branca-color-infamia-bar) 0%,
    var(--branca-color-infamia-fill) 100%);
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(220,20,60,0.5);
}

/* Punti Baraonda */
.baraonda-point {
  display: inline-block;
  font-size: 24px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

.baraonda-point.filled {
  color: var(--branca-color-baraonda-filled);
  filter: drop-shadow(0 0 8px rgba(255,215,0,0.6));
  animation: pulse-gold 2s infinite;
}

.baraonda-point.empty {
  color: var(--branca-color-baraonda-empty);
  opacity: 0.5;
}

@keyframes pulse-gold {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Lavori Sporchi Counter */
.lavori-tracker .tracker-counter {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--branca-color-lavori-bg);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--branca-color-primary-bronze);
}

.lavori-tracker .counter-value {
  font-size: 1.4em;
  font-weight: bold;
  color: var(--branca-color-lavori-text);
  min-width: 30px;
  text-align: center;
}

.lavori-tracker .counter-btn {
  background: var(--branca-color-primary-gold);
  color: var(--branca-color-primary-umber);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lavori-tracker .counter-btn:hover {
  background: var(--branca-color-primary-bronze);
  transform: scale(1.1);
}

/* Rifugio Status */
.rifugio-status {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
}

.rifugio-status.active {
  background: var(--branca-color-rifugio-active);
  color: white;
  box-shadow: 0 0 10px rgba(34,139,34,0.4);
}

.rifugio-status.inactive {
  background: var(--branca-color-rifugio-inactive);
  color: #ccc;
  font-style: italic;
}

/* Chat Messages - Stile Taverna */
#chat-log .message {
  background: var(--branca-color-section-fill-1);
  border: 1px solid var(--branca-color-section-border);
  font-family: var(--branca-font-primary);
}

#chat-log .message .message-header {
  background: var(--branca-gradient-tavern);
  color: var(--branca-color-app-header-content);
  padding: 6px 8px;
  font-family: var(--branca-font-display);
}

/* Dadi - Stile Italiano */
.dice-roll .dice-formula {
  background: var(--branca-color-primary-gold);
  color: var(--branca-color-primary-umber);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.dice-roll .dice-total.critical {
  color: var(--branca-color-primary-gold);
  text-shadow: 0 0 10px rgba(255,215,0,0.8);
  animation: critical-flash 0.5s ease 3;
}

.dice-roll .dice-total.fumble {
  color: var(--branca-color-infamia-fill);
  text-shadow: 0 0 10px rgba(220,20,60,0.8);
  animation: fumble-shake 0.5s ease;
}

@keyframes critical-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes fumble-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Scrollbar Personalizzata */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: var(--branca-color-section-fill-2);
  border: 1px solid var(--branca-color-section-border);
}

::-webkit-scrollbar-thumb {
  background: var(--branca-gradient-tavern);
  border-radius: 6px;
  border: 1px solid var(--branca-color-primary-bronze);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--branca-color-primary-wine);
}

/* Animazione Entrata Finestre */
.brancalonia-window {
  animation: window-enter 0.3s ease-out;
}

@keyframes window-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Media Query per Responsive */
@media (max-width: 768px) {
  .brancalonia-trackers {
    padding: 8px;
  }

  .tracker-title {
    font-size: 1em;
  }

  .baraonda-point {
    font-size: 20px;
  }
}
  `;
}