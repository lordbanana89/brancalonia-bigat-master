/**
 * WCAG Contrast Checker for Brancalonia Theme
 * Verifica matematica dei contrasti secondo WCAG 2.1
 */

/**
 * Calcola la luminanza relativa di un colore RGB
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {number} Luminanza relativa (0-1)
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Converte hex a RGB
 * @param {string} hex - Colore in formato #RRGGBB
 * @returns {[number, number, number]} [R, G, B]
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

/**
 * Calcola il contrast ratio tra due colori
 * @param {string} fg - Colore foreground (#RRGGBB)
 * @param {string} bg - Colore background (#RRGGBB)
 * @returns {number} Contrast ratio
 */
function getContrastRatio(fg, bg) {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);

  if (!fgRgb || !bgRgb) return 0;

  const l1 = getLuminance(...fgRgb);
  const l2 = getLuminance(...bgRgb);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Valuta il livello WCAG del contrasto
 * @param {number} ratio - Contrast ratio
 * @param {string} textSize - 'large' o 'normal'
 * @returns {object} Risultato valutazione
 */
function evaluateWCAG(ratio, textSize = 'normal') {
  const thresholds = {
    normal: { AA: 4.5, AAA: 7 },
    large: { AA: 3, AAA: 4.5 }
  };

  const t = thresholds[textSize];

  return {
    ratio: ratio.toFixed(2),
    AA: ratio >= t.AA,
    AAA: ratio >= t.AAA,
    level: ratio >= t.AAA ? 'AAA' : (ratio >= t.AA ? 'AA' : 'FAIL')
  };
}

// Token colors estratti da tokens.css
const brancaloniaColors = {
  // Light mode
  light: {
    bg: '#15110C',
    surface: '#F3E6CC',
    paper: '#E7D6AE',
    paperWeak: '#EFE0BD',
    paperStrong: '#D9C38F',
    ink: '#2B1F14',
    inkWeak: '#4A3826',
    inkStrong: '#1C140D',
    muted: '#6C5A43',
    gold: '#C9A54A',
    emerald: '#2E7D64',
    accent: '#8C2B27',
    accentStrong: '#5E1715',
    success: '#2F8F5B',
    warning: '#C27C1A',
    danger: '#952C2C',
    focus: '#7A5E1F',
    border: '#B99D6B',
    divider: '#D6C193'
  },
  // Dark mode
  dark: {
    bg: '#0F0C08',
    surface: '#2B2218',
    paper: '#3A2E20',
    paperWeak: '#453626',
    paperStrong: '#302518',
    ink: '#F3E6CC',
    inkWeak: '#D9C38F',
    inkStrong: '#FAF6ED',
    muted: '#C9B691',
    border: '#7A6546',
    divider: '#5E4C35'
  }
};

/**
 * Testa tutte le combinazioni critiche
 */
function testBrancaloniaContrasts() {
  console.group('🎨 BRANCALONIA WCAG CONTRAST TEST');

  // Light Mode Tests
  console.group('☀️ Light Mode');

  const lightTests = [
    { name: 'Primary Text', fg: 'ink', bg: 'paper', size: 'normal' },
    { name: 'Secondary Text', fg: 'inkWeak', bg: 'paper', size: 'normal' },
    { name: 'Strong Text', fg: 'inkStrong', bg: 'paper', size: 'normal' },
    { name: 'Muted Text', fg: 'muted', bg: 'paper', size: 'normal' },
    { name: 'Text on Weak Paper', fg: 'ink', bg: 'paperWeak', size: 'normal' },
    { name: 'Text on Strong Paper', fg: 'ink', bg: 'paperStrong', size: 'normal' },
    { name: 'Gold on Ink', fg: 'gold', bg: 'inkStrong', size: 'normal' },
    { name: 'Paper on Accent', fg: 'paper', bg: 'accent', size: 'normal' },
    { name: 'Paper on Gold', fg: 'inkStrong', bg: 'gold', size: 'normal' },
    { name: 'Success State', fg: 'success', bg: 'paper', size: 'normal' },
    { name: 'Warning State', fg: 'warning', bg: 'paper', size: 'normal' },
    { name: 'Danger State', fg: 'danger', bg: 'paper', size: 'normal' },
    { name: 'Large Headers', fg: 'ink', bg: 'paper', size: 'large' }
  ];

  lightTests.forEach(test => {
    const fg = brancaloniaColors.light[test.fg];
    const bg = brancaloniaColors.light[test.bg];
    const ratio = getContrastRatio(fg, bg);
    const result = evaluateWCAG(ratio, test.size);

    const icon = result.level === 'AAA' ? '🟢' : result.level === 'AA' ? '🟡' : '🔴';
    console.log(`${icon} ${test.name}: ${result.ratio}:1 [${result.level}]`);
  });

  console.groupEnd();

  // Dark Mode Tests
  console.group('🌙 Dark Mode');

  const darkTests = [
    { name: 'Primary Text', fg: 'ink', bg: 'paper', size: 'normal' },
    { name: 'Secondary Text', fg: 'inkWeak', bg: 'paper', size: 'normal' },
    { name: 'Strong Text', fg: 'inkStrong', bg: 'paper', size: 'normal' },
    { name: 'Muted Text', fg: 'muted', bg: 'paper', size: 'normal' },
    { name: 'Text on Weak Paper', fg: 'ink', bg: 'paperWeak', size: 'normal' },
    { name: 'Large Headers', fg: 'ink', bg: 'paper', size: 'large' }
  ];

  darkTests.forEach(test => {
    const fg = brancaloniaColors.dark[test.fg];
    const bg = brancaloniaColors.dark[test.bg];
    const ratio = getContrastRatio(fg, bg);
    const result = evaluateWCAG(ratio, test.size);

    const icon = result.level === 'AAA' ? '🟢' : result.level === 'AA' ? '🟡' : '🔴';
    console.log(`${icon} ${test.name}: ${result.ratio}:1 [${result.level}]`);
  });

  console.groupEnd();

  console.groupEnd();
}

// Export per Node.js o uso in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getLuminance,
    hexToRgb,
    getContrastRatio,
    evaluateWCAG,
    testBrancaloniaContrasts
  };
} else {
  window.BrancaloniaWCAG = {
    getLuminance,
    hexToRgb,
    getContrastRatio,
    evaluateWCAG,
    testBrancaloniaContrasts
  };
}

// Auto-run in console
if (typeof window !== 'undefined') {
  console.log('✅ Brancalonia WCAG Test loaded. Run: testBrancaloniaContrasts()');
}