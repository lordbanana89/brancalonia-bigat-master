/**
 * BRANCALONIA BACKGROUND PRIVILEGES
 * Implementa i privilegi speciali dei background di Brancalonia
 */

import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_ID = 'brancalonia-bigat';
const FLAG_SCOPE = 'brancalonia-bigat';
const MODULE_NAME = 'BackgroundPrivileges';
const moduleLogger = createModuleLogger(MODULE_NAME);

class BackgroundPrivileges {
  static SETTINGS = {
    enable: 'enableBackgroundPrivileges',
    autoApply: 'autoApplyBackgroundEffects',
    notifications: 'showPrivilegeNotifications',
    debug: 'debugBackgroundPrivileges'
  };

  static async initialize() {
    try {
      moduleLogger.info('Inizializzazione privilegi background');
      this._registerSettings();
      this._registerHooks();
      this._registerChatCommands();
      this._registerActiveEffects();

      game.brancalonia = game.brancalonia || {};
      game.brancalonia.backgroundPrivileges = this;

      Hooks.callAll('brancalonia.backgroundPrivilegesReady', this);
      moduleLogger.info('Sistema Privilegi Background pronto');
    } catch (error) {
      moduleLogger.error('Errore durante l\'inizializzazione', error);
      ui?.notifications?.error('Errore nel caricamento del sistema privilegi background!');
    }
  }

  static _registerSettings() {
    try {
      // Abilita/disabilita sistema privilegi
      game.settings.register('brancalonia-bigat', this.SETTINGS.enable, {
        name: 'Abilita Privilegi Background',
        hint: 'Attiva il sistema completo dei privilegi speciali dei background di Brancalonia',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
          if (value) {
            moduleLogger.info('Privilegi background attivati');
          } else {
            moduleLogger.warn('Privilegi background disattivati');
          }
        }
      });

      // Auto-applicazione effetti
      game.settings.register('brancalonia-bigat', this.SETTINGS.autoApply, {
        name: 'Auto-Applicazione Effetti',
        hint: 'Applica automaticamente gli effetti del background ai nuovi personaggi',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      // Notifiche privilegi
      game.settings.register('brancalonia-bigat', this.SETTINGS.notifications, {
        name: 'Mostra Notifiche Privilegi',
        hint: 'Mostra messaggi in chat quando vengono usati i privilegi dei background',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
      });

      // Debug mode
      game.settings.register('brancalonia-bigat', this.SETTINGS.debug, {
        name: 'Debug Privilegi Background',
        hint: 'Attiva log dettagliati per il debug del sistema privilegi',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
      });
    } catch (error) {
      moduleLogger.error('Errore nella registrazione impostazioni', error);
    }
  }

  static _registerHooks() {
    try {
      // Hook per inizializzare i privilegi quando un personaggio viene creato/caricato
      Hooks.on('createActor', (actor, data, options, userId) => {
        if (actor.type === 'character' && this.getSetting('enable')) {
          this._initializeBackgroundPrivileges(actor);
        }
      });

      // Hook per aggiornare i privilegi quando viene modificato un background
      Hooks.on('updateActor', (actor, data, options, userId) => {
        if (actor.type === 'character' && data.items && this.getSetting('enable')) {
          this._checkBackgroundUpdate(actor);
        }
      });

      // Hook per gestire i privilegi durante il gioco
      Hooks.on('preRoll', (entity, rollData) => {
        if (this.getSetting('enable')) {
          this._applyBackgroundBonuses(entity, rollData);
        }
      });

      // Hook per i roll di viaggio/esplorazione (Ambulante)
      Hooks.on('dnd5e.preRollSkill', (actor, rollData, skillId) => {
        // Per Storia e Intrattenere, l'Ambulante ha sempre bonus
        if ((skillId === 'his' || skillId === 'prf') && this.getSetting('enable')) {
          if (this.getFlag(actor, 'storieStrada')) {
            rollData.bonus = (rollData.bonus || 0) + 1;
            rollData.flavor = `${rollData.flavor || ''} [Storie della Strada +1]`;
          }
        }
      });

      // Hook custom per le Strade che non vanno da nessuna parte (se implementato)
      Hooks.on('brancalonia.stradeCheck', (actor, rollData) => {
        if (this.getSetting('enable')) {
          this._applyAmbulanteBonus(actor, rollData);
        }
      });

      // Hook per le interazioni sociali (Duro) - usa anche il hook standard D&D 5e
      Hooks.on('dnd5e.preRollSkill', (actor, rollData, skillId) => {
        if (skillId === 'itm' && this.getSetting('enable')) {
          // Applica bonus Duro per intimidazione
          if (this.getFlag(actor, 'facciaDaDuro')) {
            this._applyDuroBonus(actor, 'intimidation');
            // Aggiungi anche al roll
            rollData.bonus = (rollData.bonus || 0) + 1;
            rollData.flavor = `${rollData.flavor || ''} [Faccia da Duro: Taglia +1]`;
          }
        }
      });

      // Hook custom per interazioni sociali (se altri moduli lo chiamano)
      Hooks.on('brancalonia.socialInteraction', (actor, target, type) => {
        if (this.getSetting('enable')) {
          this._applyDuroBonus(actor, type);
        }
      });

      // Hook per le Risse (Attaccabrighe)
      Hooks.on('brancalonia.brawlStart', (actor) => {
        if (this.getSetting('enable')) {
          this._applyAttaccabrigheBonus(actor);
        }
      });

      // Hook per gestione Malefatte (Azzeccagarbugli)
      Hooks.on('brancalonia.malefattaAdded', (actor, malefatta) => {
        if (this.getSetting('enable')) {
          this._checkAzzeccagarbugliPrivilege(actor, malefatta);
        }
      });

      // Fixed: Use SheetCoordinator
      const SheetCoordinator = window.SheetCoordinator || game.brancalonia?.SheetCoordinator;
      
      if (SheetCoordinator) {
        SheetCoordinator.registerModule('BackgroundPrivileges', async (sheet, html, data) => {
          if (sheet.actor.type === 'character' && this.getSetting('enable')) {
            this._enhanceCharacterSheet(sheet, html, data);
          }
        }, {
          priority: 80,
          types: ['character']
        });
      } else {
        Hooks.on('renderActorSheet', (sheet, html, data) => {
          if (sheet.actor.type === 'character' && this.getSetting('enable')) {
            this._enhanceCharacterSheet(sheet, html, data);
          }
        });
      }

      // Hook per incontri selvaggi (Brado)
      Hooks.on('brancalonia.wildEncounter', (actor, encounterData) => {
        if (this.getSetting('enable')) {
          return this.applyBradoGuidance(actor, encounterData);
        }
        return encounterData;
      });
    } catch (error) {
      moduleLogger.error('Errore nella registrazione degli hook', error);
    }
  }

  static _registerActiveEffects() {
    // Definisci gli effetti per ogni background
    const backgroundEffects = {
      ambulante: {
        label: 'Storie della Strada',
        icon: 'icons/skills/social/diplomacy-handshake.webp',
        flags: {
          'brancalonia-bigat.storieStrada': true,
          'brancalonia-bigat.stradeBonus': 1
        },
        changes: [
          // Competenze base
          { key: 'system.skills.prf.value', mode: 5, value: '1', priority: 20 }, // Intrattenere
          { key: 'system.skills.his.value', mode: 5, value: '1', priority: 20 } // Storia
        ]
      },

      attaccabrighe: {
        label: 'Rissaiolo',
        icon: 'icons/skills/melee/unarmed-punch-fist-brown.webp',
        flags: {
          'brancalonia-bigat.slotMossaExtra': 1
        },
        changes: [
          { key: 'system.skills.prf.value', mode: 5, value: '1', priority: 20 }, // Intrattenere
          { key: 'system.skills.ins.value', mode: 5, value: '1', priority: 20 }, // Intuizione
          { key: 'flags.brancalonia-bigat.slotMossa', mode: 2, value: '1', priority: 20 } // Slot mossa extra
        ]
      },

      azzeccagarbugli: {
        label: 'Risolvere Guai',
        icon: 'icons/tools/scribal/scroll-plain-tan.webp',
        flags: {
          'brancalonia-bigat.risolvereGuai': true
        },
        changes: [
          { key: 'system.skills.inv.value', mode: 5, value: '1', priority: 20 }, // Indagare
          { key: 'system.skills.per.value', mode: 5, value: '1', priority: 20 } // Persuasione
        ]
      },

      brado: {
        label: 'Dimestichezza Selvatica',
        icon: 'icons/creatures/abilities/paw-print-orange.webp',
        flags: {
          'brancalonia-bigat.dimestichezzaSelvatica': true
        },
        changes: [
          { key: 'system.skills.ani.value', mode: 5, value: '1', priority: 20 }, // Addestrare Animali
          { key: 'system.skills.ath.value', mode: 5, value: '1', priority: 20 } // Atletica
        ]
      },

      cacciatore_di_reliquie: {
        label: 'Studioso di Reliquie',
        icon: 'icons/sundries/books/book-embossed-cross-silver.webp',
        flags: {
          'brancalonia-bigat.studiosoReliquie': true
        },
        changes: [
          { key: 'system.skills.inv.value', mode: 5, value: '1', priority: 20 }, // Indagare
          { key: 'system.skills.his.value', mode: 5, value: '1', priority: 20 }, // Storia
          { key: 'system.skills.rel.bonuses.check', mode: 2, value: '1', priority: 20 }, // +1 Religione
          { key: 'system.skills.his.bonuses.check', mode: 2, value: '1', priority: 20 } // +1 Storia (bonus)
        ]
      },

      duro: {
        label: 'Faccia da Duro',
        icon: 'icons/skills/social/intimidation-impressing.webp',
        flags: {
          'brancalonia-bigat.facciaDaDuro': true
        },
        changes: [
          { key: 'system.skills.ath.value', mode: 5, value: '1', priority: 20 }, // Atletica
          { key: 'system.skills.itm.value', mode: 5, value: '1', priority: 20 } // Intimidire
        ]
      }
    };

    // Registra gli effetti nel sistema
    if (game.brancalonia) {
      game.brancalonia.backgroundEffects = backgroundEffects;
    }
  }

  static _registerChatCommands() {
    try {
      // Registra hook standard per comandi chat
      Hooks.on('chatMessage', (chatLog, message, chatData) => {
        // Verifica se è un comando privilegi
        if (!message.startsWith('/privilegi') && !message.startsWith('/background')) {
          return true;
        }

        const parts = message.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');

        // Comando /privilegi - gestisce privilegi del personaggio
        if (command === '/privilegi') {
          this._handlePrivilegiCommand(args, chatData);
          return false;
        }

        // Comando /background - mostra info background
        if (command === '/background') {
          this._handleBackgroundCommand(args, chatData);
          return false;
        }

        // Comando /privilegi-help - mostra aiuto
        if (command === '/privilegi-help') {
          this._showPrivilegiHelp(chatData);
          return false;
        }

        // Comando /privilegi-lista - lista tutti i privilegi
        if (command === '/privilegi-lista') {
          this._showPrivilegiList(chatData);
          return false;
        }

        return true;
      });

      moduleLogger.info('Comandi chat registrati');
    } catch (error) {
      moduleLogger.error('Errore nella registrazione comandi chat', error);
    }
  }

  static async _createAutomaticMacros() {
    try {
      const macros = [
        {
          name: 'Privilegi Background',
          type: 'script',
          command: [
            'if (!game.brancalonia?.backgroundPrivileges) {',
            "  ui.notifications.error('Sistema privilegi non disponibile!');",
            '  return;',
            '}',
            '',
            'const tokens = canvas.tokens.controlled;',
            'if (tokens.length === 0) {',
            "  ui.notifications.warn('Seleziona un token!');",
            '  return;',
            '}',
            '',
            'const actor = tokens[0].actor;',
            'if (!actor) {',
            "  ui.notifications.error('Token non valido!');",
            '  return;',
            '}',
            '',
            'game.brancalonia.backgroundPrivileges.showBackgroundPrivileges(actor);'
          ].join('\n'),
          img: 'icons/skills/social/diplomacy-handshake.webp'
        },
        {
          name: 'Applica Privilegio Duro',
          type: 'script',
          command: [
            'if (!game.brancalonia?.backgroundPrivileges) {',
            "  ui.notifications.error('Sistema privilegi non disponibile!');",
            '  return;',
            '}',
            '',
            'const tokens = canvas.tokens.controlled;',
            'if (tokens.length === 0) {',
            "  ui.notifications.warn('Seleziona un token!');",
            '  return;',
            '}',
            '',
            'const actor = tokens[0].actor;',
            'if (!actor) {',
            "  ui.notifications.error('Token non valido!');",
            '  return;',
            '}',
            '',
            "if (!actor.getFlag('brancalonia-bigat', 'facciaDaDuro')) {",
            "  ui.notifications.warn('Questo personaggio non ha il privilegio Faccia da Duro!');",
            '  return;',
            '}',
            '',
            "const effectiveTaglia = game.brancalonia.backgroundPrivileges._applyDuroBonus(actor, 'intimidation');",
            "ui.notifications.info('Taglia effettiva: ' + effectiveTaglia);"
          ].join('\n'),
          img: 'icons/skills/social/intimidation-impressing.webp'
        },
        {
          name: 'Risolvi Guai (Azzeccagarbugli)',
          type: 'script',
          command: [
            'if (!game.brancalonia?.backgroundPrivileges) {',
            "  ui.notifications.error('Sistema privilegi non disponibile!');",
            '  return;',
            '}',
            '',
            'const tokens = canvas.tokens.controlled;',
            'if (tokens.length === 0) {',
            "  ui.notifications.warn('Seleziona un token!');",
            '  return;',
            '}',
            '',
            'const actor = tokens[0].actor;',
            'if (!actor) {',
            "  ui.notifications.error('Token non valido!');",
            '  return;',
            '}',
            '',
            "if (!actor.getFlag('brancalonia-bigat', 'risolvereGuai')) {",
            "  ui.notifications.warn('Questo personaggio non può risolvere guai legali!');",
            '  return;',
            '}',
            '',
            'const taglia = await foundry.appv1.sheets.Dialog.prompt({',
            "  title: 'Costo Risoluzione',",
            "  content: '<p>Inserisci il costo per risolvere i guai:</p>' +",
            "           '<input type=\"number\" id=\"costo\" value=\"1\" min=\"1\">',",
            "  callback: (html) => parseInt(html.find('#costo').val())",
            '});',
            '',
            'if (taglia && taglia > 0) {',
            '  const malefatta = { taglia: taglia };',
            '  const success = await game.brancalonia.backgroundPrivileges._checkAzzeccagarbugliPrivilege(actor, malefatta);',
            '  if (!success) {',
            "    ui.notifications.info('Guai risolti con successo!');",
            '  }',
            '}'
          ].join('\n'),
          img: 'icons/tools/scribal/scroll-plain-tan.webp'
        }
      ];

      await Promise.all(macros.map(async macroData => {
        const existingMacro = game?.macros?.find(m => m.name === macroData.name);
        if (!existingMacro) {
          await game.macros.documentClass.create(macroData);
          if (game.settings.get('brancalonia-bigat', this.SETTINGS.debug)) {
            moduleLogger.info(`Macro '${macroData.name}' creata automaticamente`);
          }
        }
      }));
    } catch (error) {
      moduleLogger.error('Errore creazione macro', error);
    }
  }

  /**
   * Inizializza i privilegi del background per un personaggio
   */
  static _initializeBackgroundPrivileges(actor) {
    try {
      const background = actor.items.find(i => i.type === 'background');
      if (!background) return;

      const bgName = background.name.toLowerCase().replace(/\s+/g, '_');

      // Imposta flag specifici per ogni background
      if (bgName.includes('brado')) {
        this.setFlag(actor, 'dimestichezzaSelvatica', true);
      } else if (bgName.includes('ambulante')) {
        this.setFlag(actor, 'storieStrada', true);
      } else if (bgName.includes('attaccabrighe')) {
        this.setFlag(actor, 'slotMossaExtra', 1);
      } else if (bgName.includes('azzeccagarbugli')) {
        this.setFlag(actor, 'risolvereGuai', true);
      } else if (bgName.includes('duro')) {
        this.setFlag(actor, 'facciaDaDuro', true);
      } else if (bgName.includes('cacciatore') && bgName.includes('reliquie')) {
        this.setFlag(actor, 'studiosoReliquie', true);
      }
      const effects = game.brancalonia?.backgroundEffects?.[bgName];

      if (effects && this.getSetting('autoApply')) {
        // Applica i flag
        for (const [key, value] of Object.entries(effects.flags || {})) {
          this.setFlag(actor, key.split('.').pop(), value);
        }

        if (this.getSetting('notifications')) {
          ui.notifications.info(`Privilegi background applicati a ${actor.name}`);
        }
      }
    } catch (error) {
      moduleLogger.error('Errore inizializzazione privilegi attore', error);
    }
  }

  static _checkBackgroundUpdate(actor) {
    try {
      // Verifica se il background è cambiato e riapplica i privilegi
      this._initializeBackgroundPrivileges(actor);
    } catch (error) {
      moduleLogger.error('Errore aggiornamento privilegi', error);
    }
  }

  static _handlePrivilegiCommand(message, chatData) {
    try {
      const args = message.split(' ');
      const subcommand = args[1]?.toLowerCase();

      switch (subcommand) {
        case 'mostra':
        case 'show':
          this._showAllPrivileges();
          break;
        case 'attiva':
        case 'enable':
          game.settings.set('brancalonia-bigat', 'enableBackgroundPrivileges', true);
          ChatMessage.create({ content: '<h3>Privilegi Background attivati!</h3>' });
          break;
        case 'disattiva':
        case 'disable':
          game.settings.set('brancalonia-bigat', 'enableBackgroundPrivileges', false);
          ChatMessage.create({ content: '<h3>Privilegi Background disattivati!</h3>' });
          break;
        default:
          this._showPrivilegiHelp();
      }
    } catch (error) {
      moduleLogger.error('Errore comando privilegi', error);
      ui.notifications.error("Errore nell'esecuzione del comando!");
    }
  }

  static _handleBackgroundCommand(message, chatData) {
    try {
      const tokens = canvas.tokens.controlled;
      if (tokens.length === 0) {
        ui.notifications.warn('Seleziona un token per vedere i suoi privilegi!');
        return;
      }

      const actor = tokens[0].actor;
      if (!actor) {
        ui.notifications.error('Token non valido!');
        return;
      }

      this.showBackgroundPrivileges(actor);
    } catch (error) {
      moduleLogger.error('Errore comando background', error);
      ui.notifications.error("Errore nell'esecuzione del comando!");
    }
  }

  static _showPrivilegiList(chatData) {
    // Metodo per mostrare la lista di tutti i privilegi
    this._showAllPrivileges();
  }

  static _showPrivilegiHelp(chatData) {
    const helpContent = `
      <div class="brancalonia-help">
        <h2>🎭 Comandi Privilegi Background</h2>
        <h3>Comandi disponibili:</h3>
        <ul>
          <li><strong>/privilegi mostra</strong> - Mostra tutti i privilegi disponibili</li>
          <li><strong>/privilegi attiva</strong> - Attiva il sistema privilegi</li>
          <li><strong>/privilegi disattiva</strong> - Disattiva il sistema privilegi</li>
          <li><strong>/background</strong> - Mostra privilegi del personaggio selezionato</li>
          <li><strong>/privilegihelp</strong> - Mostra questo aiuto</li>
        </ul>
        <h3>Background disponibili:</h3>
        <ul>
          <li><strong>Ambulante</strong> - Storie della Strada (+1 alle Strade che non vanno da nessuna parte)</li>
          <li><strong>Attaccabrighe</strong> - Slot mossa extra nelle Risse</li>
          <li><strong>Azzeccagarbugli</strong> - Può annullare Malefatte pagando</li>
          <li><strong>Brado</strong> - Evita incontri con bestie nelle terre selvagge</li>
          <li><strong>Cacciatore di Reliquie</strong> - +1 a Religione e Storia</li>
          <li><strong>Duro</strong> - Taglia +1 livello per intimidire</li>
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: helpContent,
      whisper: [game.user.id]
    });
  }

  static _showAllPrivileges() {
    const privilegesContent = `
      <div class="brancalonia-privileges">
        <h2>🎭 Privilegi Background di Brancalonia</h2>
        <div class="privilege-list">
          ${Object.entries(game.brancalonia?.backgroundEffects || {}).map(([bg, data]) => `
            <div class="privilege-item">
              <h4>${bg.replace(/_/g, ' ').toUpperCase()}</h4>
              <p><strong>${data.label}</strong></p>
              <p><em>Bonus:</em> ${data.changes?.map(c => c.key).join(', ') || 'Vedi descrizione'}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    ChatMessage.create({
      content: privilegesContent
    });
  }

  static showBackgroundPrivileges(actor) {
    try {
      const background = actor.items.find(i => i.type === 'background');
      if (!background) {
        ui.notifications.warn('Questo personaggio non ha un background!');
        return;
      }

      const bgName = background.name.toLowerCase().replace(/\s+/g, '_');
      const effects = game.brancalonia?.backgroundEffects?.[bgName];

      let content = `
        <div class="brancalonia-background">
          <h3>🎭 ${actor.name} - ${background.name}</h3>
      `;

      if (effects) {
        content += `
          <h4>${effects.label}</h4>
          <p><strong>Privilegi attivi:</strong></p>
          <ul>
        `;

        for (const [flagKey, flagValue] of Object.entries(effects.flags || {})) {
          if (this.getFlag(actor, flagKey.split('.').pop())) {
            content += `<li>✅ ${flagKey.split('.').pop()}</li>`;
          }
        }

        content += `</ul>`;
      } else {
        content += `<p><em>Nessun privilegio speciale trovato per questo background.</em></p>`;
      }

      content += `</div>`;

      ChatMessage.create({
        content,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    } catch (error) {
      moduleLogger.error('Errore nel mostrare privilegi background', error);
      ui.notifications.error('Errore nel mostrare i privilegi!');
    }
  }

  static _enhanceCharacterSheet(sheet, html, data) {
    try {
      if (!this.getSetting('enable')) return;

      // Verifica se UI Coordinator ha già processato
      const element = html[0] || html;
      if (element.dataset.privilegesEnhanced === 'true') return;
      element.dataset.privilegesEnhanced = 'true';

      const actor = sheet.actor;
      const background = actor.items.find(i => i.type === 'background');

      if (!background) return;

      // Aggiungi sezione privilegi alla scheda
      const privilegesHtml = `
        <div class="brancalonia-privileges-section">
          <h3>🎭 Privilegi Background</h3>
          <button type="button" class="show-privileges" data-actor-id="${actor.id}">
            Mostra Privilegi
          </button>
        </div>
      `;

      // Inserisci dopo la sezione background
      const backgroundSection = html.find('.background');
      if (backgroundSection.length) {
        backgroundSection.after(privilegesHtml);
      } else {
        html.find('.sheet-body').prepend(privilegesHtml);
      }

      // Aggiungi event listener
      html.find('.show-privileges').click((event) => {
        event.preventDefault();
        const actorId = event.currentTarget.dataset.actorId;
        const actor = game.actors.get(actorId);
        if (actor) {
          this.showBackgroundPrivileges(actor);
        }
      });
    } catch (error) {
      moduleLogger.error('Errore migliorando la scheda', error);
    }
  }

  /**
   * AMBULANTE - Bonus +1 automatico quando il condottiero usa Strade che non vanno da nessuna parte
   */
  static _applyAmbulanteBonus(actor, rollData) {
    try {
      if (!this.getFlag(actor, 'storieStrada')) return;

      // Aggiungi +1 automatico al tiro
      rollData.bonus = (rollData.bonus || 0) + 1;

      if (this.getSetting('notifications')) {
        ChatMessage.create({
          content: `<div class="brancalonia-message">
            <h4>🎪 Storie della Strada</h4>
            <p><strong>${actor.name}</strong> conosce le Strade che non vanno da nessuna parte!</p>
            <p><em>+1 automatico al tiro del condottiero</em></p>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }
    } catch (error) {
      moduleLogger.error('Errore applicando bonus Ambulante', error);
    }
  }

  /**
   * ATTACCABRIGHE - Slot mossa aggiuntivo nelle Risse
   */
  static _applyAttaccabrigheBonus(actor) {
    try {
      const slotExtra = this.getFlag(actor, 'slotMossaExtra');
      if (!slotExtra) return;

      // Il bonus è già applicato tramite Active Effect
      if (this.getSetting('notifications')) {
        ChatMessage.create({
          content: `<div class="brancalonia-message">
            <h4>🥊 Rissaiolo</h4>
            <p><strong>${actor.name}</strong> ha ${slotExtra} slot mossa aggiuntivo!</p>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }
    } catch (error) {
      moduleLogger.error('Errore applicando bonus Attaccabrighe', error);
    }
  }

  /**
   * AZZECCAGARBUGLI - Può annullare una Malefatta pagando
   */
  static async _checkAzzeccagarbugliPrivilege(actor, malefatta) {
    try {
      if (!this.getFlag(actor, 'risolvereGuai')) return true;

      const taglia = malefatta.taglia || 0;

      const choice = await foundry.appv1.sheets.Dialog.confirm({
        title: 'Risolvere Guai',
        content: `<p>Vuoi usare il privilegio Risolvere Guai per annullare questa Malefatta?</p>
                  <p>Costo: ${taglia} monete d'oro</p>`,
        yes: () => true,
        no: () => false
      });

      if (choice) {
        // Verifica che il personaggio abbia abbastanza monete
        const currency = actor.system.currency;
        const totalCoins = (currency.gp || 0) + (currency.sp || 0) / 10 + (currency.cp || 0) / 100;

        if (totalCoins >= taglia) {
          // Sottrai le monete
          await actor.update({
            'system.currency.gp': Math.max(0, currency.gp - taglia)
          });

          if (this.getSetting('notifications')) {
            ChatMessage.create({
              content: `<div class="brancalonia-message">
                <h4>⚖️ Guai Risolti!</h4>
                <p><strong>${actor.name}</strong> ha usato i suoi cavilli legali per annullare la Malefatta!</p>
                <p><em>Pagati ${taglia} ma per evitare problemi</em></p>
              </div>`,
              speaker: ChatMessage.getSpeaker({ actor })
            });
          }

          return false; // Impedisce l'aggiunta della Malefatta
        } else {
          ui.notifications.warn('Non hai abbastanza monete per risolvere questi guai!');
        }
      }

      return true; // Procedi con l'aggiunta della Malefatta
    } catch (error) {
      moduleLogger.error('Errore privilegio Azzeccagarbugli', error);
      return true;
    }
  }

  /**
   * BRADO - Guida attraverso terre selvagge senza attirare bestie
   */
  static applyBradoGuidance(actor, encounterData) {
    try {
      if (!this.getFlag(actor, 'dimestichezzaSelvatica')) return encounterData;

      // Se l'incontro è con una bestia, saltalo
      if (encounterData.type === 'beast') {
        if (this.getSetting('notifications')) {
          ChatMessage.create({
            content: `<div class="brancalonia-message">
              <h4>🌲 Dimestichezza Selvatica</h4>
              <p><strong>${actor.name}</strong> guida il gruppo evitando le bestie ostili.</p>
              <p><em>L'incontro con ${encounterData.name} è stato evitato!</em></p>
            </div>`,
            speaker: ChatMessage.getSpeaker({ actor })
          });
        }

        return null; // Nessun incontro
      }

      return encounterData; // Altri tipi di incontri procedono normalmente
    } catch (error) {
      moduleLogger.error('Errore privilegio Brado', error);
      return encounterData;
    }
  }

  /**
   * DURO - La Taglia aumenta di 1 livello quando usa la Nomea
   */
  static _applyDuroBonus(actor, interactionType) {
    try {
      if (!this.getFlag(actor, 'facciaDaDuro')) return;
      if (interactionType !== 'intimidation' && interactionType !== 'nomea') return;

      const currentTaglia = this.getFlag(actor, 'taglia') || 0;
      const effectiveTaglia = currentTaglia + 1;

      if (this.getSetting('notifications')) {
        ChatMessage.create({
          content: `<div class="brancalonia-message">
            <h4>💀 Faccia da Duro</h4>
            <p><strong>${actor.name}</strong> usa la sua reputazione temibile!</p>
            <p><em>Taglia considerata: ${this._getTagliaName(effectiveTaglia)} (${effectiveTaglia})</em></p>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }

      return effectiveTaglia;
    } catch (error) {
      moduleLogger.error('Errore privilegio Duro', error);
      return this.getFlag(actor, 'taglia') || 0;
    }
  }

  /**
   * Helper per i nomi dei livelli di Taglia
   */
  static _getTagliaName(level) {
    const taglie = [
      'Sconosciuto', // 0
      'Canaglia', // 1
      'Famigerato', // 2
      'Ricercato', // 3
      'Nemico Pubblico', // 4
      'Leggenda' // 5+
    ];
    return taglie[Math.min(level, taglie.length - 1)];
  }

  /**
   * Applica bonus generali ai tiri basati sul background
   */
  static _applyBackgroundBonuses(entity, rollData) {
    try {
      if (!entity.actor) return;

      const actor = entity.actor;

      // Cacciatore di Reliquie - +1 a Religione e Storia
      if (this.getFlag(actor, 'studiosoReliquie')) {
        if (rollData.skill === 'rel' || rollData.skill === 'his') {
          rollData.bonus = (rollData.bonus || 0) + 1;
          rollData.flavor = `${rollData.flavor || ''} [Studioso di Reliquie +1]`;

          if (this.getSetting('debug')) {
            moduleLogger.info(`Applicato bonus Studioso di Reliquie a ${rollData.skill}`);
          }
        }
      }

      // Ambulante - Bonus alle competenze di intrattenimento e storia
      if (this.getFlag(actor, 'storieStrada')) {
        if (rollData.skill === 'prf' || rollData.skill === 'his') {
          rollData.bonus = (rollData.bonus || 0) + 1;
          rollData.flavor = `${rollData.flavor || ''} [Storie della Strada +1]`;
        }
      }

      // Duro - Bonus a intimidire
      if (this.getFlag(actor, 'facciaDaDuro')) {
        if (rollData.skill === 'itm') {
          rollData.bonus = (rollData.bonus || 0) + 1;
          rollData.flavor = `${rollData.flavor || ''} [Faccia da Duro +1]`;
        }
      }
    } catch (error) {
      moduleLogger.error('Errore applicando bonus background', error);
    }
  }

  static getSetting(key) {
    return game.settings.get(MODULE_ID, this.SETTINGS[key]);
  }

  static setSetting(key, value) {
    return game.settings.set(MODULE_ID, this.SETTINGS[key], value);
  }

  static getFlag(actor, key) {
    return actor.getFlag(FLAG_SCOPE, key);
  }

  static setFlag(actor, key, value) {
    return actor.setFlag(FLAG_SCOPE, key, value);
  }
}

// Registra il modulo quando Foundry è pronto
// Migrato a init per garantire disponibilità precoce
Hooks.once('init', () => {
  try {
    BackgroundPrivileges.initialize();
  } catch (error) {
    moduleLogger.error('Errore critico inizializzazione', error);
    ui.notifications.error('Errore nel caricamento del sistema privilegi background!');
  }
});

// Crea macro dopo che il game è pronto
Hooks.once('ready', () => {
  BackgroundPrivileges._createAutomaticMacros();
});

// Rendi disponibile globalmente
window.BackgroundPrivileges = BackgroundPrivileges;

// Esporta la classe per uso come modulo
export { BackgroundPrivileges };