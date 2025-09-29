/* ================================================ */
/* BRANCALONIA RENAISSANCE THEME ACTIVATOR         */
/* ================================================ */

/**
 * Attiva il tema Renaissance per Brancalonia
 */
class BrancaloniaRenaissanceTheme {
  static ID = 'brancalonia-bigat';
  static SETTINGS = {
    ENABLE_RENAISSANCE: 'enableRenaissanceTheme',
    AUTO_APPLY: 'autoApplyTheme'
  };

  /**
   * Inizializza il sistema tema Renaissance
   */
  static initialize() {
    console.log("Brancalonia | 🎨 Inizializzazione Tema Renaissance");

    // Registra settings
    this.registerSettings();

    // Hook per applicare il tema
    Hooks.once('ready', () => {
      if (game.settings.get(this.ID, this.SETTINGS.ENABLE_RENAISSANCE)) {
        this.applyTheme();
      }
    });

    // Hook per le finestre
    Hooks.on('renderApplication', (app, html, data) => {
      if (game.settings.get(this.ID, this.SETTINGS.ENABLE_RENAISSANCE)) {
        this.enhanceWindow(html);
      }
    });

    // Hook per i journal
    Hooks.on('renderJournalSheet', (app, html, data) => {
      if (game.settings.get(this.ID, this.SETTINGS.ENABLE_RENAISSANCE)) {
        this.enhanceJournal(html);
      }
    });

    // Hook per le chat messages
    Hooks.on('renderChatMessageHTML', (message, html, data) => {
      if (game.settings.get(this.ID, this.SETTINGS.ENABLE_RENAISSANCE)) {
        this.enhanceChatMessage(html);
      }
    });

    // Aggiungi comando console per toggle rapido
    window.toggleRenaissanceTheme = () => this.toggleTheme();
  }

  /**
   * Registra le impostazioni del modulo
   */
  static registerSettings() {
    game.settings.register(this.ID, this.SETTINGS.ENABLE_RENAISSANCE, {
      name: "Tema Renaissance Italiano",
      hint: "Attiva il tema visivo ispirato al Rinascimento italiano con colori autentici e font d'epoca",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: enabled => {
        if (enabled) {
          this.applyTheme();
        } else {
          this.removeTheme();
        }
        // Reload per applicare completamente i cambiamenti
        setTimeout(() => window.location.reload(), 500);
      }
    });

    game.settings.register(this.ID, this.SETTINGS.AUTO_APPLY, {
      name: "Applica Automaticamente",
      hint: "Applica automaticamente il tema Renaissance all'avvio di Foundry",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: true
    });
  }

  /**
   * Applica il tema Renaissance
   */
  static applyTheme() {
    console.log("Brancalonia | 🎨 Applicazione Tema Renaissance");

    // Aggiungi classe al body
    document.body.classList.add('brancalonia-theme');

    // Aggiungi effetti speciali
    this.addSpecialEffects();

    // Notifica
    ui.notifications.info("Tema Renaissance di Brancalonia attivato", {permanent: false});
  }

  /**
   * Rimuove il tema Renaissance
   */
  static removeTheme() {
    console.log("Brancalonia | 🎨 Rimozione Tema Renaissance");

    document.body.classList.remove('brancalonia-theme');

    // Rimuovi effetti speciali
    const effects = document.querySelectorAll('.renaissance-effect');
    effects.forEach(el => el.remove());

    ui.notifications.info("Tema Renaissance disattivato", {permanent: false});
  }

  /**
   * Toggle del tema
   */
  static toggleTheme() {
    const current = game.settings.get(this.ID, this.SETTINGS.ENABLE_RENAISSANCE);
    game.settings.set(this.ID, this.SETTINGS.ENABLE_RENAISSANCE, !current);
  }

  /**
   * Migliora una finestra
   */
  static enhanceWindow(html) {
    const $html = html instanceof jQuery ? html : $(html);

    // Aggiungi decorazioni agli angoli
    if (!$html.find('.corner-decoration').length) {
      const cornerDecoration = `
        <div class="corner-decoration top-left">✦</div>
        <div class="corner-decoration top-right">✦</div>
        <div class="corner-decoration bottom-left">✦</div>
        <div class="corner-decoration bottom-right">✦</div>
      `;
      $html.append(cornerDecoration);
    }
  }

  /**
   * Migliora un journal
   */
  static enhanceJournal(html) {
    const $html = html instanceof jQuery ? html : $(html);

    // Aggiungi intestazione decorativa
    const pages = $html.find('.journal-page-content');
    pages.each(function() {
      const $page = $(this);
      if (!$page.find('.renaissance-header').length) {
        $page.prepend('<div class="renaissance-header">⁂</div>');
      }
    });
  }

  /**
   * Migliora un messaggio chat
   */
  static enhanceChatMessage(html) {
    const $html = html instanceof jQuery ? html : $(html);

    // Aggiungi effetti per critici e fumble
    if ($html.find('.dice-roll').length) {
      const total = $html.find('.dice-total').text();
      const formula = $html.find('.dice-formula').text();

      if (formula && formula.includes('d20')) {
        const roll = parseInt(total);
        if (roll === 20) {
          $html.addClass('critical-success');
          $html.prepend('<div class="critical-banner">⚜ MAGNIFICO! ⚜</div>');
        } else if (roll === 1) {
          $html.addClass('critical-fail');
          $html.prepend('<div class="fumble-banner">☠ MALEDIZIONE! ☠</div>');
        }
      }
    }
  }

  /**
   * Aggiungi effetti speciali
   */
  static addSpecialEffects() {
    // Aggiungi overlay pergamena
    if (!document.querySelector('.parchment-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'parchment-overlay renaissance-effect';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 9998;
        background-image:
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 69, 19, 0.03) 2px,
            rgba(139, 69, 19, 0.03) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(212, 175, 55, 0.02) 2px,
            rgba(212, 175, 55, 0.02) 4px
          );
        mix-blend-mode: multiply;
      `;
      document.body.appendChild(overlay);
    }

    // Aggiungi bordi decorativi al canvas
    if (!document.querySelector('.canvas-border')) {
      const border = document.createElement('div');
      border.className = 'canvas-border renaissance-effect';
      border.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 9997;
        border: 20px solid transparent;
        border-image: linear-gradient(
          45deg,
          #D4AF37 0%,
          #8B4513 25%,
          #D4AF37 50%,
          #8B4513 75%,
          #D4AF37 100%
        ) 1;
        box-shadow:
          inset 0 0 50px rgba(139, 69, 19, 0.2),
          inset 0 0 100px rgba(212, 175, 55, 0.1);
      `;
      document.body.appendChild(border);
    }
  }
}

// Aggiungi stili per gli effetti speciali
const specialStyles = `
<style>
/* Corner Decorations */
.corner-decoration {
  position: absolute;
  font-size: 24px;
  color: var(--branca-gold-leaf, #D4AF37);
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
  pointer-events: none;
  z-index: 100;
}

.corner-decoration.top-left { top: 5px; left: 5px; }
.corner-decoration.top-right { top: 5px; right: 5px; }
.corner-decoration.bottom-left { bottom: 5px; left: 5px; }
.corner-decoration.bottom-right { bottom: 5px; right: 5px; }

/* Renaissance Header */
.renaissance-header {
  text-align: center;
  font-size: 2em;
  color: var(--branca-gold-leaf, #D4AF37);
  margin: 20px 0;
  text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.3);
}

/* Critical Banners */
.critical-banner, .fumble-banner {
  text-align: center;
  padding: 5px;
  margin-bottom: 5px;
  font-family: 'Cinzel', serif;
  font-weight: 600;
  letter-spacing: 0.1em;
  animation: banner-glow 2s ease-in-out infinite;
}

.critical-banner {
  background: linear-gradient(135deg, #D4AF37 0%, #CC9A2E 100%);
  color: #1C1814;
  border: 2px solid #D4AF37;
  text-shadow: 1px 1px 2px rgba(248, 246, 240, 0.5);
}

.fumble-banner {
  background: linear-gradient(135deg, #C80815 0%, #722F37 100%);
  color: #F8F6F0;
  border: 2px solid #8B4513;
  text-shadow: 1px 1px 2px rgba(28, 24, 20, 0.5);
}

@keyframes banner-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

/* Chat Message Enhancements */
.brancalonia-theme .critical-success {
  border-left: 4px solid #D4AF37 !important;
  background: linear-gradient(to right, rgba(212, 175, 55, 0.1), transparent) !important;
}

.brancalonia-theme .critical-fail {
  border-left: 4px solid #C80815 !important;
  background: linear-gradient(to right, rgba(200, 8, 21, 0.1), transparent) !important;
}
</style>
`;

// Inietta gli stili speciali
Hooks.once('init', () => {
  const styleElement = document.createElement('div');
  styleElement.innerHTML = specialStyles;
  document.head.appendChild(styleElement.firstElementChild);
});

// Inizializza il tema
Hooks.once('init', () => {
  BrancaloniaRenaissanceTheme.initialize();
});

// Esporta per debugging
window.BrancaloniaRenaissanceTheme = BrancaloniaRenaissanceTheme;