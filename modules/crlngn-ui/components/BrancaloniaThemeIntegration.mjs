/**
 * BRANCALONIA THEME INTEGRATION
 * Sistema di integrazione temi tra Carolingian UI e Brancalonia
 */

export class BrancaloniaThemeIntegration {
  static initialized = false;
  
  /**
   * Inizializza l'integrazione temi
   */
  static init() {
    if (this.initialized) return;
    
    this.setupThemeClasses();
    this.injectBrancaloniaTokens();
    this.setupThemeSwitching();
    
    this.initialized = true;
    console.log("🎨 Brancalonia Theme Integration | Initialized");
  }
  
  /**
   * Configura le classi CSS per l'integrazione
   */
  static setupThemeClasses() {
    const body = document.querySelector("body");
    if (!body) return;
    
    // Aggiungi classi per compatibilità
    body.classList.add("brancalonia-carolingian-integration");
    
    // Mantieni compatibilità con sistema esistente
    if (!body.classList.contains("theme-brancalonia")) {
      body.classList.add("theme-brancalonia");
    }
  }
  
  /**
   * Inietta design tokens Brancalonia nel sistema Carolingian UI
   */
  static injectBrancaloniaTokens() {
    const brancaloniaTokens = `
      :root {
        /* Brancalonia Renaissance Colors */
        --bcl-color-gold: #D4AF37;
        --bcl-color-wine: #C80815;
        --bcl-color-parchment: #F4E8D0;
        --bcl-color-sienna: #8B4513;
        --bcl-color-terracotta: #CB6843;
        
        /* Brancalonia Typography */
        --bcl-font-renaissance: "Quattrocento", "Garamond", serif;
        --bcl-font-display: "Cinzel", "Trajan Pro", serif;
        
        /* Integration with Carolingian UI */
        --crlngn-color-accent: var(--bcl-color-gold);
        --crlngn-color-primary: var(--bcl-color-wine);
        --crlngn-font-special: var(--bcl-font-renaissance);
        
        /* Computed Values */
        --color-accent: var(--bcl-color-gold);
        --color-primary: var(--bcl-color-wine);
        --font-special: var(--bcl-font-renaissance);
      }
      
      /* Brancalonia Theme Integration */
      .brancalonia-carolingian-integration {
        /* Override Carolingian UI colors with Brancalonia theme */
        --crlngn-color-highlights: var(--bcl-color-gold);
        --crlngn-color-highlights-15: rgba(212, 175, 55, 0.15);
        --crlngn-color-highlights-25: rgba(212, 175, 55, 0.25);
        --crlngn-color-highlights-50: rgba(212, 175, 55, 0.5);
        --crlngn-color-highlights-75: rgba(212, 175, 55, 0.75);
        --crlngn-color-highlights-90: rgba(212, 175, 55, 0.9);
        
        /* Renaissance Background */
        --crlngn-color-background: var(--bcl-color-parchment);
        --crlngn-color-surface: rgba(244, 232, 208, 0.95);
        
        /* Text Colors */
        --crlngn-color-text-primary: var(--bcl-color-sienna);
        --crlngn-color-text-secondary: rgba(139, 69, 19, 0.7);
      }
      
      /* Dark Theme Integration */
      .brancalonia-carolingian-integration.theme-dark {
        --crlngn-color-background: rgba(43, 31, 20, 0.95);
        --crlngn-color-surface: rgba(43, 31, 20, 0.9);
        --crlngn-color-text-primary: rgba(231, 214, 174, 0.95);
        --crlngn-color-text-secondary: rgba(231, 214, 174, 0.7);
      }
    `;
    
    this.injectCSS('brancalonia-theme-integration', brancaloniaTokens);
  }
  
  /**
   * Configura il sistema di cambio temi
   */
  static setupThemeSwitching() {
    // Listener per cambio tema Carolingian UI
    Hooks.on('carolingian-ui.themeChanged', (themeId) => {
      this.onCarolingianThemeChange(themeId);
    });
    
    // Listener per cambio tema Brancalonia
    Hooks.on('brancalonia.themeChanged', (themeId) => {
      this.onBrancaloniaThemeChange(themeId);
    });
  }
  
  /**
   * Gestisce il cambio tema Carolingian UI
   */
  static onCarolingianThemeChange(themeId) {
    const body = document.querySelector("body");
    if (!body) return;
    
    // Rimuovi classi tema precedenti
    body.classList.remove('crlngn-theme-default', 'crlngn-theme-dark', 'crlngn-theme-light');
    
    // Aggiungi nuova classe tema
    body.classList.add(`crlngn-theme-${themeId}`);
    
    // Applica override Brancalonia
    this.applyBrancaloniaOverrides(themeId);
  }
  
  /**
   * Gestisce il cambio tema Brancalonia
   */
  static onBrancaloniaThemeChange(themeId) {
    const body = document.querySelector("body");
    if (!body) return;
    
    // Rimuovi classi tema precedenti
    body.classList.remove('theme-brancalonia-classic', 'theme-brancalonia-dark', 'theme-brancalonia-parchment', 'theme-brancalonia-gold');
    
    // Aggiungi nuova classe tema
    body.classList.add(`theme-${themeId}`);
  }
  
  /**
   * Applica override Brancalonia per tema specifico
   */
  static applyBrancaloniaOverrides(themeId) {
    const overrides = {
      'default': {
        '--crlngn-color-accent': 'var(--bcl-color-gold)',
        '--crlngn-color-primary': 'var(--bcl-color-wine)'
      },
      'dark': {
        '--crlngn-color-accent': 'var(--bcl-color-gold)',
        '--crlngn-color-primary': 'var(--bcl-color-terracotta)',
        '--crlngn-color-background': 'rgba(43, 31, 20, 0.95)'
      },
      'light': {
        '--crlngn-color-accent': 'var(--bcl-color-gold)',
        '--crlngn-color-primary': 'var(--bcl-color-sienna)',
        '--crlngn-color-background': 'var(--bcl-color-parchment)'
      }
    };
    
    const themeOverrides = overrides[themeId] || overrides['default'];
    
    // Applica override come CSS custom properties
    const css = `:root { ${Object.entries(themeOverrides).map(([key, value]) => `${key}: ${value};`).join(' ')} }`;
    this.injectCSS('brancalonia-theme-overrides', css);
  }
  
  /**
   * Inietta CSS nel documento
   */
  static injectCSS(id, css) {
    // Rimuovi CSS precedente con lo stesso ID
    const existingStyle = document.getElementById(id);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Crea nuovo elemento style
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    
    // Aggiungi al documento
    document.head.appendChild(style);
  }
  
  /**
   * Ottiene il tema attivo combinato
   */
  static getActiveTheme() {
    const body = document.querySelector("body");
    if (!body) return null;
    
    const carolingianTheme = Array.from(body.classList).find(cls => cls.startsWith('crlngn-theme-'));
    const brancaloniaTheme = Array.from(body.classList).find(cls => cls.startsWith('theme-brancalonia-'));
    
    return {
      carolingian: carolingianTheme?.replace('crlngn-theme-', '') || 'default',
      brancalonia: brancaloniaTheme?.replace('theme-', '') || 'classic',
      combined: `${carolingianTheme || 'crlngn-theme-default'} ${brancaloniaTheme || 'theme-brancalonia-classic'}`
    };
  }
}
