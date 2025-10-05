/**
 * Brancalonia Sheets - Macro System
 * Fornisce macro user-friendly per gestire il sistema sheets
 */

import logger from './brancalonia-logger.js';

export default class BrancaloniaSheetsMacros {
  static MODULE_NAME = 'Sheets Macros';

  /**
   * Inizializza il sistema macro
   */
  static initialize() {
    try {
      logger.info(this.MODULE_NAME, 'Inizializzazione macro sheets...');
      
      this._createMacros();
      
      logger.info(this.MODULE_NAME, 'Macro sheets create con successo');
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore inizializzazione macro', error);
    }
  }

  /**
   * Crea tutte le macro del sistema
   * @private
   */
  static async _createMacros() {
    const macros = [
      {
        name: '📊 Sheets: Report Sistema',
        type: 'script',
        scope: 'global',
        command: `// Mostra report completo sistema Brancalonia Sheets
BrancaloniaSheets.showReport();`,
        img: 'icons/svg/book.svg',
        folder: null
      },
      {
        name: '🔄 Sheets: Re-Render Tutte',
        type: 'script',
        scope: 'global',
        command: `// Forza il re-rendering di tutte le sheet aperte
await BrancaloniaSheets.forceRenderAll();
ui.notifications.info('Tutte le sheet sono state aggiornate!');`,
        img: 'icons/svg/upgrade.svg',
        folder: null
      },
      {
        name: '🔄 Sheets: Re-Render Selezionati',
        type: 'script',
        scope: 'global',
        command: `// Forza il re-rendering della sheet del token selezionato
const tokens = canvas.tokens.controlled;

if (tokens.length === 0) {
  ui.notifications.warn('Seleziona un token!');
} else {
  for (const token of tokens) {
    await BrancaloniaSheets.forceRender(token.actor);
  }
  ui.notifications.info(\`\${tokens.length} sheet aggiornate!\`);
}`,
        img: 'icons/svg/target.svg',
        folder: null
      },
      {
        name: '📈 Sheets: Statistiche',
        type: 'script',
        scope: 'global',
        command: `// Mostra statistiche sheets
const stats = BrancaloniaSheets.getStatistics();

console.log('=== Brancalonia Sheets Statistics ===');
console.log('Total Renders:', stats.totalRenders);
console.log('Avg Render Time:', stats.avgRenderTime.toFixed(2) + 'ms');
console.log('Lavori Completed:', stats.lavoriCompleted);
console.log('Errors:', stats.errors.length);

ui.notifications.info(\`Sheets: \${stats.totalRenders} renders | Avg: \${stats.avgRenderTime.toFixed(2)}ms\`);`,
        img: 'icons/svg/chart.svg',
        folder: null
      },
      {
        name: '🔧 Sheets: Configurazione',
        type: 'script',
        scope: 'global',
        command: `// Mostra configurazione corrente
const config = BrancaloniaSheets.getConfiguration();

console.log('=== Brancalonia Sheets Configuration ===');
console.log('Sistema abilitato:', config.enabled);
console.log('Sezioni:', config.sections);
console.log('Carolingian Delay:', config.carolingianDelay + 'ms');
console.log('Debug Mode:', config.debug);

const enabledSections = Object.values(config.sections).filter(Boolean).length;
ui.notifications.info(\`Sheets: \${config.enabled ? 'Abilitato' : 'Disabilitato'} | Sezioni: \${enabledSections}/5\`);`,
        img: 'icons/svg/cog.svg',
        folder: null
      },
      {
        name: '🗑️ Sheets: Reset Statistiche',
        type: 'script',
        scope: 'global',
        command: `// Reset statistiche sheets
const confirm = await Dialog.confirm({
  title: 'Reset Statistiche Sheets',
  content: '<p>Sei sicuro di voler resettare tutte le statistiche?</p>',
  yes: () => true,
  no: () => false
});

if (confirm) {
  BrancaloniaSheets.resetStatistics();
  ui.notifications.info('Statistiche sheets resettate!');
} else {
  ui.notifications.info('Reset annullato');
}`,
        img: 'icons/svg/trash.svg',
        folder: null
      },
      {
        name: '💾 Sheets: Esporta Statistiche',
        type: 'script',
        scope: 'global',
        command: `// Esporta statistiche in file JSON
BrancaloniaSheets.exportStatistics();
ui.notifications.info('Statistiche esportate!');`,
        img: 'icons/svg/download.svg',
        folder: null
      },
      {
        name: '✅ Sheets: Abilita Sistema',
        type: 'script',
        scope: 'global',
        command: `// Abilita sistema Brancalonia Sheets
await BrancaloniaSheets.setEnabled(true);
ui.notifications.info('Sistema Brancalonia Sheets abilitato!');`,
        img: 'icons/svg/on.svg',
        folder: null
      },
      {
        name: '❌ Sheets: Disabilita Sistema',
        type: 'script',
        scope: 'global',
        command: `// Disabilita sistema Brancalonia Sheets
await BrancaloniaSheets.setEnabled(false);
ui.notifications.info('Sistema Brancalonia Sheets disabilitato!');`,
        img: 'icons/svg/off.svg',
        folder: null
      },
      {
        name: '🎛️ Sheets: Toggle Sezione',
        type: 'script',
        scope: 'global',
        command: `// Dialog per abilitare/disabilitare sezioni
const config = BrancaloniaSheets.getConfiguration();

const content = \`
  <form>
    <div class="form-group">
      <label>Seleziona Sezione:</label>
      <select name="section" style="width: 100%;">
        <option value="infamia">Infamia</option>
        <option value="compagnia">Compagnia</option>
        <option value="lavori">Lavori Sporchi</option>
        <option value="rifugio">Rifugio</option>
        <option value="malefatte">Malefatte</option>
      </select>
    </div>
    <div class="form-group">
      <label>Azione:</label>
      <select name="action" style="width: 100%;">
        <option value="enable">Abilita</option>
        <option value="disable">Disabilita</option>
      </select>
    </div>
  </form>
\`;

// Fixed: Migrated to DialogV2
new foundry.applications.api.DialogV2({
  window: {
    title: 'Toggle Sezione Sheets'
  },
  content,
  buttons: [{
    action: 'apply',
    label: 'Applica',
    default: true,
    callback: async (event, button, dialog) => {
      const html = dialog.element;
      const section = html.querySelector('[name="section"]').value;
      const action = html.querySelector('[name="action"]').value;
      const enabled = action === 'enable';
      
      await BrancaloniaSheets.setSectionEnabled(section, enabled);
      ui.notifications.info(\`Sezione \${section} \${enabled ? 'abilitata' : 'disabilitata'}!\`);
    }
  }, {
    action: 'cancel',
    label: 'Annulla'
  }]
}, {
  classes: ['sheets-toggle-dialog']
}).render(true);`,
        img: 'icons/svg/explosion.svg',
        folder: null
      }
    ];

    // Crea o aggiorna macro
    for (const macroData of macros) {
      const existing = game.macros.find(m => m.name === macroData.name);
      
      if (existing) {
        logger.debug(this.MODULE_NAME, `Macro "${macroData.name}" già esistente, aggiornamento...`);
        await existing.update(macroData);
      } else {
        logger.debug(this.MODULE_NAME, `Creazione macro "${macroData.name}"...`);
        await Macro.create(macroData);
      }
    }

    logger.info(this.MODULE_NAME, `${macros.length} macro create/aggiornate`);
  }

  /**
   * Rimuove tutte le macro del sistema
   */
  static async removeMacros() {
    const macroNames = [
      '📊 Sheets: Report Sistema',
      '🔄 Sheets: Re-Render Tutte',
      '🔄 Sheets: Re-Render Selezionati',
      '📈 Sheets: Statistiche',
      '🔧 Sheets: Configurazione',
      '🗑️ Sheets: Reset Statistiche',
      '💾 Sheets: Esporta Statistiche',
      '✅ Sheets: Abilita Sistema',
      '❌ Sheets: Disabilita Sistema',
      '🎛️ Sheets: Toggle Sezione'
    ];

    for (const name of macroNames) {
      const macro = game.macros.find(m => m.name === name);
      if (macro) {
        await macro.delete();
        logger.debug(this.MODULE_NAME, `Macro "${name}" rimossa`);
      }
    }

    logger.info(this.MODULE_NAME, `${macroNames.length} macro rimosse`);
  }
}

// Auto-inizializza quando Foundry è pronto
Hooks.once('ready', () => {
  try {
    // Crea macro solo se il sistema è abilitato
    const sheetsEnabled = game.settings.settings.get('brancalonia-bigat.enableBrancaloniaSheets') 
      ? game.settings.get('brancalonia-bigat', 'enableBrancaloniaSheets') 
      : true; // Default a true se il setting non è registrato
    
    if (sheetsEnabled) {
      BrancaloniaSheetsMacros.initialize();
    }
  } catch (error) {
    console.warn('Brancalonia Sheets Macros: Setting non disponibile, skip:', error);
  }
});

