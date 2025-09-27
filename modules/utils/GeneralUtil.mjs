/* ===================================== */
/* GENERAL UTILITY */
/* Utility generali per manipolazione DOM e CSS */
/* ===================================== */

import { MODULE } from '../settings.mjs';
import { LogUtil } from './LogUtil.mjs';

export class GeneralUtil {
  static cssVarsElement = null;
  static customStyleElements = new Map();

  /**
   * Add or update CSS variables
   * @param {string} varName - CSS variable name (including --)
   * @param {string} value - Value to set
   */
  static addCSSVars(varName, value) {
    // Get or create style element for CSS vars
    if (!this.cssVarsElement) {
      this.cssVarsElement = document.querySelector('#brancalonia-theme-vars');
      if (!this.cssVarsElement) {
        this.cssVarsElement = document.createElement('style');
        this.cssVarsElement.id = 'brancalonia-theme-vars';
        document.head.appendChild(this.cssVarsElement);
      }
    }

    // Get existing content
    let content = this.cssVarsElement.textContent || ':root {}';

    // Parse existing variables
    const rootMatch = content.match(/:root\s*{([^}]*)}/);
    let vars = {};

    if (rootMatch) {
      const varLines = rootMatch[1].split(';').filter(line => line.trim());
      varLines.forEach(line => {
        const [name, val] = line.split(':').map(s => s.trim());
        if (name && val) {
          vars[name] = val;
        }
      });
    }

    // Update variable
    vars[varName] = value;

    // Rebuild CSS
    const newContent = `:root {\n${Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')}\n}`;

    this.cssVarsElement.textContent = newContent;

    LogUtil.log(`CSS Variable set: ${varName} = ${value}`);
  }

  /**
   * Add custom CSS to the page
   * @param {string} css - CSS content
   * @param {string} id - Unique ID for the style element
   */
  static addCustomCSS(css, id = 'brancalonia-custom-css') {
    // Remove existing if present
    if (this.customStyleElements.has(id)) {
      this.customStyleElements.get(id).remove();
    }

    if (!css || css.trim() === '') {
      this.customStyleElements.delete(id);
      return;
    }

    // Create new style element
    const styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.textContent = css;
    document.head.appendChild(styleElement);

    // Track it
    this.customStyleElements.set(id, styleElement);

    LogUtil.log(`Custom CSS added: ${id}`);
  }

  /**
   * Process CSS rules with replacements
   * @param {object} rules - Rules to apply
   * @param {string} selectors - CSS selectors
   */
  static processCSSRules(rules, selectors) {
    let processedCSS = '';

    // Split by comma and process each selector
    const selectorList = selectors.split(',').map(s => s.trim()).filter(s => s);

    selectorList.forEach(selector => {
      let selectorRules = '';

      Object.entries(rules).forEach(([property, value]) => {
        selectorRules += `  ${property}: ${value};\n`;
      });

      if (selectorRules) {
        processedCSS += `${selector} {\n${selectorRules}}\n\n`;
      }
    });

    return processedCSS;
  }

  /**
   * Check if a module is active
   * @param {string} moduleId - Module ID to check
   */
  static isModuleOn(moduleId) {
    const module = game.modules.get(moduleId);
    return module?.active || false;
  }

  /**
   * Debounce a function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle a function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Wait for an element to appear in DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Max wait time in ms
   */
  static async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Apply class to body based on setting
   * @param {string} className - Class name to toggle
   * @param {boolean} enabled - Whether to add or remove the class
   */
  static toggleBodyClass(className, enabled) {
    const body = document.querySelector('body');
    if (enabled) {
      body.classList.add(className);
    } else {
      body.classList.remove(className);
    }
  }

  /**
   * Get contrast ratio between two colors
   * @param {string} color1 - First color (RGB or hex)
   * @param {string} color2 - Second color (RGB or hex)
   */
  static getContrastRatio(color1, color2) {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);

    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Parse color string to RGB
   * @private
   */
  static parseColor(color) {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      };
    } else if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      return {
        r: parseInt(match[0]),
        g: parseInt(match[1]),
        b: parseInt(match[2])
      };
    }
    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Get relative luminance of RGB color
   * @private
   */
  static getRelativeLuminance(rgb) {
    const { r, g, b } = rgb;

    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  }
}