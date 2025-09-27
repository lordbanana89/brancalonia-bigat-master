/**
 * BRANCALONIA THEME CORE
 * Sistema di theming dinamico per Brancalonia
 * Basato sull'architettura di Project FU Theme
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
  // PALETTE RINASCIMENTO ITALIANO
  // ========================================

  /* Colori Base - Taverna Italiana */
  'color-primary-ochre' = '#B8860Bff';        // Ocra dorata
  'color-primary-sienna' = '#A0522Dff';       // Terra di Siena
  'color-primary-umber' = '#8B4513ff';        // Terra d'ombra
  'color-primary-wine' = '#722F37ff';         // Rosso vino
  'color-primary-gold' = '#FFD700ff';         // Oro
  'color-primary-bronze' = '#CD7F32ff';       // Bronzo

  /* Controlli - Stile Pergamena */
  'color-control-content' = '#3D2914ff';      // Inchiostro scuro
  'color-control-border' = '#8B7355ff';       // Bordo pergamena
  'color-control-focus' = '#FFD700ff';        // Oro focus
  'color-control-fill-1' = '#F5E6D3ff';       // Pergamena chiara
  'color-control-fill-2' = '#E8D7C3ff';       // Pergamena scura

  /* Controlli - Evidenziazione */
  'color-control-highlight-content' = '#722F37ff';
  'color-control-highlight-border' = '#A0522Dff';
  'color-control-highlight-fill-1' = '#FFE4B5ff';
  'color-control-highlight-fill-2' = '#FFDAB9ff';

  /* Controlli - Attivi */
  'color-control-active-content' = '#FFD700ff';
  'color-control-active-border' = '#CD7F32ff';
  'color-control-active-fill-1' = '#8B4513cc';
  'color-control-active-fill-2' = '#A0522Dcc';

  /* Applicazioni - Finestre */
  'color-app-border' = '#8B4513ff';           // Bordo legno scuro
  'color-app-shadow' = '#000000aa';           // Ombra profonda

  /* Applicazioni - Header */
  'color-app-header-content' = '#F5E6D3ff';   // Testo chiaro
  'color-app-header-fill-1' = '#722F37ee';    // Rosso vino
  'color-app-header-fill-2' = '#4A1F23ee';    // Rosso scuro

  /* Applicazioni - Body */
  'color-app-body-content' = '#3D2914ff';     // Testo principale
  'color-app-body-secondary' = '#5D4E37ff';   // Testo secondario
  'color-app-body-fill-1' = '#F5E6D3f5';      // Sfondo pergamena
  'color-app-body-fill-2' = '#E8D7C3f5';      // Sfondo pergamena scura

  /* Sezioni Speciali */
  'color-section-border' = '#8B7355ff';
  'color-section-divider' = '#A0522Dff';
  'color-section-fill-1' = '#FFF8DCff';       // Crema
  'color-section-fill-2' = '#F5E6D3ff';       // Pergamena

  /* Tracker Brancalonia */
  'color-infamia-bar' = '#8B0000ff';          // Rosso scuro criminale
  'color-infamia-fill' = '#DC143Cff';         // Cremisi
  'color-baraonda-empty' = '#D3D3D3ff';       // Grigio
  'color-baraonda-filled' = '#FFD700ff';      // Oro
  'color-lavori-bg' = '#2F4F4Fff';            // Grigio ardesia
  'color-lavori-text' = '#F0E68Cff';          // Khaki
  'color-rifugio-active' = '#228B22ff';       // Verde foresta
  'color-rifugio-inactive' = '#696969ff';     // Grigio scuro

  /* Immagini e Texture */
  'ui-accent-image' = 'modules/brancalonia/assets/ui/ornaments/corner-flourish.png';
  'app-bg-image' = 'modules/brancalonia/assets/ui/backgrounds/parchment-texture.jpg';
  'app-header-image' = 'modules/brancalonia/assets/ui/backgrounds/wood-dark.jpg';
  'sidebar-bg-image' = 'modules/brancalonia/assets/ui/backgrounds/tavern-wood.jpg';
  'section-bg-image' = 'modules/brancalonia/assets/ui/backgrounds/parchment-aged.jpg';

  /* Stili Avanzati */
  'advanced' = `
/* ========================================
   BRANCALONIA ITALIAN RENAISSANCE THEME
   ======================================== */

/* Font Rinascimentali */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

/* Variabili Aggiuntive */
:root {
  --branca-font-primary: 'EB Garamond', serif;
  --branca-font-display: 'Cinzel', serif;
  --branca-font-size-base: 14px;
  --branca-border-ornate: 2px solid var(--branca-color-primary-gold);
  --branca-shadow-renaissance: 0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,215,0,0.3);
  --branca-gradient-tavern: linear-gradient(135deg, var(--branca-color-primary-sienna), var(--branca-color-primary-umber));
  --branca-texture-opacity: 0.15;
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