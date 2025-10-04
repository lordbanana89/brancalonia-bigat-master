/**
 * BRANCALONIA CSS OPTIMIZER
 * Ottimizza le regole CSS per migliori performance e manutenibilità
 */

export class BrancaloniaCSSOptimizer {
  static optimized = false;
  
  /**
   * Ottimizza le regole CSS esistenti
   */
  static optimize() {
    if (this.optimized) return;
    
    this.optimizeDarkModeRules();
    this.optimizeImportantDeclarations();
    this.consolidateCSSVariables();
    
    this.optimized = true;
    console.log("⚡ Brancalonia CSS Optimizer | Optimized");
  }
  
  /**
   * Ottimizza le regole dark mode rimuovendo !important eccessivi
   */
  static optimizeDarkModeRules() {
    const optimizedDarkModeRules = `
      /* Optimized Dark Mode Rules - Reduced !important usage */
      .carolingian-ui.theme-dark {
        --background: var(--color-dark-bg-95);
        --filigree-background-color: var(--color-dark-bg-10);
        --dnd5e-border-dotted: 1px dotted var(--color-cool-4);
        --dnd5e-color-gold: rgba(159, 146, 117, 0.6);
        --input-background-color: var(--color-cool-4);
        --chat-dark-blue: rgba(24, 32, 38, 1);
        --input-background-alt: var(--color-dark-bg-50);
        --color-text-secondary: var(--color-light-1);
        --color-text-primary: var(--color-light-1);
        --button-text-color: var(--color-light-1);
        --color-border-light-1: var(--dnd5e-color-gold);
        --color-text-dark-input: var(--color-light-3);
        --color-border-trait: var(--color-cool-4);
        
        /* Button and Control Styles */
        --crlngn-button-bg: rgba(15, 15, 15, 0.15);
        --color-bg-button: rgba(32, 37, 43, 1);
        --dnd5e-border-groove: 1px solid rgba(36, 36, 36, 0.5);
        --dnd5e-color-groove: var(--dnd5e-color-gold);
        --dnd5e-sheet-bg: rgb(37, 40, 48);
        --sidebar-background: var(--control-bg-color, var(--color-cool-5-90));
        --dnd5e-color-parchment: rgb(32, 37, 43);
        --dnd5e-background-card: rgb(32, 37, 43);
        --dnd5e-background-parchment: var(--color-cool-4);
        
        /* Content and Text Styles */
        --content-link-background: var(--color-secondary-50);
        --color-pf-alternate: rgba(82, 107, 120, 0.44);
        --color-text-gray-blue: rgb(168, 180, 188, 1);
        --color-text-gray-blue-b: rgb(138, 155, 168, 1);
        --chat-button-bg: rgba(32, 37, 43, 1);
        --chat-button-bg-15: rgba(32, 37, 43, 0.15);
        --chat-button-bg-25: rgba(32, 37, 43, 0.25);
        --chat-button-bg-50: rgba(32, 37, 43, 0.5);
        --chat-button-bg-75: rgba(32, 37, 43, 0.75);
        --chat-dark-blue: rgba(24, 32, 38, 1);
        --chat-dark-blue-b: rgb(29, 36, 48, 1);
        --chat-dark-bg: rgba(32, 37, 43, 1);
        --chat-dark-bg-15: rgba(32, 37, 43, 0.15);
        --chat-dark-bg-25: rgba(32, 37, 43, 0.25);
        --chat-dark-bg-50: rgba(32, 37, 43, 0.50);
        --chat-dark-bg-75: rgba(32, 37, 43, 0.75);
        --chat-dark-bg-90: rgba(32, 37, 43, 0.90);
        
        /* Input and Form Styles */
        --color-input-bg: var(--color-dark-bg-50);
        --color-button-bg: rgba(90,120,150,0.5);
        --color-input-border: rgba(90,120,150, 0.5);
        --color-border-dark-5: rgba(80, 80, 80, 1);
        --color-sidebar-font: rgba(213, 221, 230, 0.8);
        
        /* Text Colors */
        --color-text-dark: rgba(235,235,235,1);
        --color-text-dark-op: rgba(235,235,235,0.6);
        --color-text-light: rgba(235,235,235,1);
        --input-background-alt: var(--color-cool-5);
        --color-text-secondary: var(--color-light-3);
        --color-text-primary: var(--color-light-1);
        --color-text-dark-primary: var(--color-light-1);
        --button-border-color: transparent;
        
        /* Base Styles */
        background: var(--color-dark-bg-90);
        color: var(--color-light-1);
      }
      
      /* Optimized Element Styles */
      .carolingian-ui.theme-dark .window-header,
      .carolingian-ui.theme-dark header,
      .carolingian-ui.theme-dark footer {
        background-color: var(--color-dark-bg-75);
        color: var(--color-light-1);
        box-shadow: none;
      }
      
      .carolingian-ui.theme-dark .window-content {
        background: var(--color-dark-bg-25);
        color: var(--color-light-1);
      }
      
      .carolingian-ui.theme-dark .window-header {
        border-bottom: 1px solid var(--color-cool-4);
      }
      
      .carolingian-ui.theme-dark section.window-content form.crb-style header.char-header .char-level .level,
      .carolingian-ui.theme-dark section.window-content form.crb-style {
        background: transparent;
      }
      
      .carolingian-ui.theme-dark form.crb-style aside .sidebar * {
        background: transparent;
      }
      
      .carolingian-ui.theme-dark div:not(.degree, .degree-of-success),
      .carolingian-ui.theme-dark p,
      .carolingian-ui.theme-dark span,
      .carolingian-ui.theme-dark aside,
      .carolingian-ui.theme-dark section,
      .carolingian-ui.theme-dark nav,
      .carolingian-ui.theme-dark label,
      .carolingian-ui.theme-dark form,
      .carolingian-ui.theme-dark button,
      .carolingian-ui.theme-dark table,
      .carolingian-ui.theme-dark td,
      .carolingian-ui.theme-dark tr,
      .carolingian-ui.theme-dark th,
      .carolingian-ui.theme-dark h1,
      .carolingian-ui.theme-dark h2,
      .carolingian-ui.theme-dark h3,
      .carolingian-ui.theme-dark h4,
      .carolingian-ui.theme-dark h5,
      .carolingian-ui.theme-dark h6,
      .carolingian-ui.theme-dark ul,
      .carolingian-ui.theme-dark ol,
      .carolingian-ui.theme-dark li,
      .carolingian-ui.theme-dark b,
      .carolingian-ui.theme-dark strong,
      .carolingian-ui.theme-dark u {
        background-color: transparent;
        border-color: var(--color-cool-4);
        color: var(--color-light-1);
      }
      
      .carolingian-ui.theme-dark *:not(.degree, .degree-of-success) {
        color: var(--color-light-1);
      }
      
      .carolingian-ui.theme-dark a.content-link,
      .carolingian-ui.theme-dark a.inline-roll {
        background-color: transparent;
        color: var(--color-light-1);
      }
      
      .carolingian-ui.theme-dark p {
        line-height: 1.75;
      }
      
      .carolingian-ui.theme-dark input:not([type="range"]),
      .carolingian-ui.theme-dark select {
        background-color: var(--color-cool-4);
        color: var(--color-light-1);
        border-color: var(--color-cool-4);
      }
      
      .carolingian-ui.theme-dark select option {
        background: transparent;
      }
      
      .carolingian-ui.theme-dark fieldset {
        border-color: var(--color-cool-4);
      }
      
      .carolingian-ui.theme-dark button,
      .carolingian-ui.theme-dark .window-resizable-handle {
        color: var(--color-light-1);
        border-color: transparent;
        background-color: var(--color-bg-button);
      }
      
      .carolingian-ui.theme-dark button:hover {
        background-color: var(--color-warm-2);
      }
    `;
    
    this.injectCSS('brancalonia-optimized-dark-mode', optimizedDarkModeRules);
  }
  
  /**
   * Ottimizza le dichiarazioni !important
   */
  static optimizeImportantDeclarations() {
    // Rimuovi regole CSS con !important eccessivi
    const existingStyle = document.getElementById('brancalonia-dark-mode-rules');
    if (existingStyle) {
      existingStyle.remove();
    }
  }
  
  /**
   * Consolida le variabili CSS duplicate
   */
  static consolidateCSSVariables() {
    const consolidatedVariables = `
      :root {
        /* Consolidated Brancalonia Variables */
        --bcl-theme-primary: var(--bcl-color-gold);
        --bcl-theme-secondary: var(--bcl-color-wine);
        --bcl-theme-background: var(--bcl-color-parchment);
        --bcl-theme-text: var(--bcl-color-sienna);
        
        /* Performance Optimized Transitions */
        --bcl-transition-fast: 150ms ease-in-out;
        --bcl-transition-normal: 250ms ease-in-out;
        --bcl-transition-slow: 350ms ease-in-out;
        
        /* Optimized Shadows */
        --bcl-shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.1);
        --bcl-shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1);
        --bcl-shadow-strong: 0 10px 15px rgba(0, 0, 0, 0.1);
      }
    `;
    
    this.injectCSS('brancalonia-consolidated-variables', consolidatedVariables);
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
   * Ottimizza le performance CSS
   */
  static optimizePerformance() {
    // Abilita GPU acceleration per animazioni
    const gpuAcceleration = `
      .carolingian-ui * {
        will-change: auto;
      }
      
      .carolingian-ui .window-app,
      .carolingian-ui .sidebar,
      .carolingian-ui .hotbar {
        transform: translateZ(0);
        backface-visibility: hidden;
      }
    `;
    
    this.injectCSS('brancalonia-gpu-acceleration', gpuAcceleration);
  }
}
