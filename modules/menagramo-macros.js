/**
 * Macro per MenagramoSystem
 * Interfacce user-friendly per applicare menagramo/sfortuna
 * 
 * @module MenagramoMacros
 * @version 2.0.0
 * @author Brancalonia BIGAT Team
 */

import { getLogger } from './brancalonia-logger.js';

const logger = getLogger();

class MenagramoMacros {
  static VERSION = '2.0.0';
  static MODULE_NAME = 'Menagramo Macros';
  static ID = 'menagramo-macros';
  
  /**
   * Crea le macro automatiche per MenagramoSystem
   * @static
   * @async
   * 
   * @example
   * await MenagramoMacros.createMacros();
   */
  static async createMacros() {
    try {
      logger.info(this.MODULE_NAME, '🖤 Creazione macro Menagramo...');
      
      if (!game.macros) {
        logger.warn(this.MODULE_NAME, 'game.macros non disponibile, macro creation skipped');
        return;
      }

    const macros = [
      {
        name: "🖤 Applica Menagramo",
        type: "script",
        command: this._getMacroApplicaMenagramo(),
        img: "icons/magic/death/skull-humanoid-crown-red.webp",
        folder: null
      },
      {
        name: "🍀 Rimuovi Menagramo",
        type: "script",
        command: this._getMacroRimuoviMenagramo(),
        img: "icons/magic/light/beam-rays-blue-large.webp",
        folder: null
      },
      {
        name: "🎲 Evento Sfortunato",
        type: "script",
        command: this._getMacroEventoSfortunato(),
        img: "icons/magic/death/skull-horned-worn.webp",
        folder: null
      }
    ];

      for (const macroData of macros) {
        // Verifica se esiste già
        const existing = game.macros.find(m => m.name === macroData.name);
        if (existing) {
          logger.info(this.MODULE_NAME, `Macro "${macroData.name}" già esistente, aggiornamento...`);
          await existing.update({ command: macroData.command });
        } else {
          await Macro.create(macroData);
          logger.info(this.MODULE_NAME, `✅ Macro "${macroData.name}" creata`);
        }
      }

      logger.info(this.MODULE_NAME, '✅ 3 macro Menagramo create con successo!');
    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore creazione macro Menagramo', error);
    }
  }

  /**
   * Macro: Applica Menagramo
   */
  static _getMacroApplicaMenagramo() {
    return `
// Macro: Applica Menagramo
// Applica un livello di menagramo (sfortuna) al token selezionato

if (!game.brancalonia?.menagramo) {
  ui.notifications.error("MenagramoSystem non disponibile!");
  return;
}

const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token per applicare il menagramo!");
  return;
}

const actor = tokens[0].actor;
if (!actor) {
  ui.notifications.error("Token non valido!");
  return;
}

// Dialog per scegliere il livello
new Dialog({
  title: "🖤 Applica Menagramo",
  content: \`
    <div style="padding: 10px;">
      <p><strong>Seleziona il livello di Menagramo per \${actor.name}:</strong></p>
      <select id="menagramo-level" style="width: 100%; padding: 5px; margin: 10px 0;">
        <option value="minor">🟢 Minore (svantaggio su 1 prova)</option>
        <option value="moderate">🟡 Moderato (svantaggio attacchi/salvezze)</option>
        <option value="major" selected>🟠 Maggiore (svantaggio tutto + -2 CA)</option>
        <option value="catastrophic">🔴 Catastrofico (disastro totale!)</option>
      </select>
      
      <div style="background: #f5f5f5; padding: 10px; margin-top: 10px; border-radius: 5px; font-size: 0.9em;">
        <p style="margin: 0;"><strong>Livelli di Menagramo:</strong></p>
        <ul style="margin: 5px 0; padding-left: 20px;">
          <li><strong>Minore</strong>: Svantaggio su una prova, durata 1d4 round</li>
          <li><strong>Moderato</strong>: Svantaggio attacchi e salvezze, durata 2d4 round</li>
          <li><strong>Maggiore</strong>: Svantaggio su tutto + -2 CA, durata 3d4 round</li>
          <li><strong>Catastrofico</strong>: Svantaggio tutto + -4 CA + velocità dimezzata, durata 1d6+1 round</li>
        </ul>
      </div>
    </div>
  \`,
  buttons: {
    apply: {
      icon: '<i class="fas fa-skull"></i>',
      label: "Applica Menagramo",
      callback: async (html) => {
        const level = html.find('#menagramo-level').val();
        
        try {
          await game.brancalonia.menagramo.apply(actor, level);
          ui.notifications.info(\`Menagramo \${level} applicato a \${actor.name}!\`);
        } catch (error) {
          console.error("Errore nell'applicazione del menagramo:", error);
          ui.notifications.error("Errore nell'applicazione del menagramo!");
        }
      }
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: "Annulla"
    }
  },
  default: "apply"
}).render(true);
`;
  }

  /**
   * Macro: Rimuovi Menagramo
   */
  static _getMacroRimuoviMenagramo() {
    return `
// Macro: Rimuovi Menagramo
// Rimuove il menagramo dal token selezionato

if (!game.brancalonia?.menagramo) {
  ui.notifications.error("MenagramoSystem non disponibile!");
  return;
}

const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token per rimuovere il menagramo!");
  return;
}

const actor = tokens[0].actor;
if (!actor) {
  ui.notifications.error("Token non valido!");
  return;
}

// Dialog per scegliere il metodo di rimozione
new Dialog({
  title: "🍀 Rimuovi Menagramo",
  content: \`
    <div style="padding: 10px;">
      <p><strong>Come vuoi rimuovere il menagramo da \${actor.name}?</strong></p>
      <select id="removal-method" style="width: 100%; padding: 5px; margin: 10px 0;">
        <option value="instant">✨ Rimozione Istantanea (DM)</option>
        <option value="blessing">🙏 Benedizione Religiosa (50 mo, TS Religione CD 15)</option>
        <option value="ritual">🔮 Rituale di Purificazione (100 mo, 1 ora)</option>
        <option value="goodDeed">💝 Atto di Bontà (TS Carisma CD 13, -5 Infamia)</option>
        <option value="offering">💰 Offerta agli Spiriti (2d6 × 10 mo)</option>
        <option value="quest">⚔️ Missione di Redenzione (narrativo)</option>
      </select>
      
      <div style="background: #f5f5f5; padding: 10px; margin-top: 10px; border-radius: 5px; font-size: 0.9em;">
        <p style="margin: 0;"><strong>Metodi dal Manuale Brancalonia:</strong></p>
        <ul style="margin: 5px 0; padding-left: 20px;">
          <li><strong>Benedizione</strong>: Un chierico benedice per rimuovere la sfortuna</li>
          <li><strong>Rituale</strong>: Complesso rituale di purificazione</li>
          <li><strong>Atto di Bontà</strong>: Un gesto altruistico spezza la maledizione</li>
          <li><strong>Offerta</strong>: Dono agli spiriti per placare la sfortuna</li>
          <li><strong>Quest</strong>: Una missione per redimersi</li>
        </ul>
      </div>
    </div>
  \`,
  buttons: {
    remove: {
      icon: '<i class="fas fa-hands-helping"></i>',
      label: "Rimuovi",
      callback: async (html) => {
        const method = html.find('#removal-method').val();
        
        try {
          await game.brancalonia.menagramo.remove(actor, method);
          ui.notifications.success(\`Menagramo rimosso da \${actor.name}!\`);
        } catch (error) {
          console.error("Errore nella rimozione del menagramo:", error);
          ui.notifications.error("Errore nella rimozione del menagramo!");
        }
      }
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: "Annulla"
    }
  },
  default: "remove"
}).render(true);
`;
  }

  /**
   * Macro: Evento Sfortunato
   */
  static _getMacroEventoSfortunato() {
    return `
// Macro: Evento Sfortunato
// Tira sulla tabella degli eventi sfortunati per chi ha il menagramo

if (!game.brancalonia?.menagramo) {
  ui.notifications.error("MenagramoSystem non disponibile!");
  return;
}

const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token per tirare un evento sfortunato!");
  return;
}

const actor = tokens[0].actor;
if (!actor) {
  ui.notifications.error("Token non valido!");
  return;
}

// Verifica se ha il menagramo attivo
const hasMenagramo = actor.effects.some(e => 
  e.name?.toLowerCase().includes('menagramo')
);

if (!hasMenagramo) {
  new Dialog({
    title: "⚠️ Nessun Menagramo Attivo",
    content: \`
      <p>\${actor.name} non ha il menagramo attivo.</p>
      <p>Vuoi tirare un evento sfortunato comunque?</p>
    \`,
    buttons: {
      yes: {
        label: "Sì, tira comunque",
        callback: async () => {
          await game.brancalonia.menagramo.triggerMisfortune(actor);
        }
      },
      no: {
        label: "No, annulla"
      }
    }
  }).render(true);
} else {
  // Tira direttamente se ha il menagramo
  game.brancalonia.menagramo.triggerMisfortune(actor);
}
`;
  }
}

// Crea le macro quando il gioco è pronto
Hooks.once('ready', async () => {
  // Aspetta che MenagramoSystem sia disponibile
  if (game.brancalonia?.menagramo) {
    await MenagramoMacros.createMacros();
  } else {
    logger.warn(MenagramoMacros.MODULE_NAME, 'MenagramoSystem non disponibile, macro non create');
  }
});

// Export per uso esterno
window.MenagramoMacros = MenagramoMacros;

export default MenagramoMacros;
