/**
 * Sistema Eroi di Bassa Lega - Level Cap & Emeriticenze
 * Implementazione fedele al manuale Brancalonia (pag. 40, 42)
 * Compatibile con dnd5e system v3.3.x
 */

class LevelCapSystem {
  static instance = null;

  constructor() {
    this.MAX_LEVEL = 6;
    this.BASE_EMERITICENZA_XP = 14000; // XP per raggiungere livello 7
    this.EMERITICENZA_STEP = 9000; // Ogni 9000 XP dopo il 6° = 1 emeriticenza

    // Lista emeriticenze dal manuale (pag. 40)
    this.emeriticenze = {
      affinamento: {
        name: 'Affinamento',
        description: 'Aumenta di 2 un punteggio caratteristica o di 1 due punteggi (max 20)',
        maxTimes: 2,
        icon: 'icons/skills/trades/smithing-anvil-silver-red.webp',
        apply: (actor) => this._applyASI(actor)
      },
      armaPreferita: {
        name: 'Arma Preferita',
        description: 'Aggiungi competenza ai danni con un tipo di arma specifica',
        requirements: ['Barbarian', 'Fighter', 'Paladin', 'Ranger'],
        maxTimes: 1,
        icon: 'icons/skills/melee/sword-katana-red.webp',
        apply: (actor) => this._applyPreferredWeapon(actor)
      },
      emeriticenzaAssoluta: {
        name: 'Emeriticenza Assoluta',
        description: 'Il bonus di competenza diventa +4',
        requirements: '2 altre emeriticenze',
        maxTimes: 1,
        icon: 'icons/magic/control/buff-flight-wings-blue.webp',
        apply: (actor) => this._applyAbsoluteMastery(actor)
      },
      energumeno: {
        name: 'Energumeno',
        description: 'PF massimi aumentano di 6 + modificatore Costituzione',
        maxTimes: 1,
        icon: 'icons/magic/life/heart-area-circle-red-green.webp',
        apply: (actor) => this._applyToughness(actor)
      },
      fandoniaMigliorata: {
        name: 'Fandonia Migliorata',
        description: 'Ottieni uno slot incantesimo aggiuntivo',
        requirements: 'Incantatore',
        maxTimes: 1,
        icon: 'icons/magic/symbols/rune-sigil-blue.webp',
        apply: (actor) => this._applyExtraSpellSlot(actor)
      },
      fandoniaPotenziata: {
        name: 'Fandonia Potenziata',
        description: 'Lancia un incantesimo come se fosse di 1 livello superiore (1/riposo breve)',
        requirements: 'Incantatore',
        maxTimes: 1,
        icon: 'icons/magic/fire/projectile-fireball-orange.webp',
        apply: (actor) => this._applyEmpoweredSpell(actor)
      },
      giocoSquadra: {
        name: 'Gioco di Squadra',
        description: "Puoi effettuare l'azione di aiuto come azione bonus",
        maxTimes: 1,
        icon: 'icons/skills/social/diplomacy-handshake-yellow.webp',
        apply: (actor) => this._applyTeamwork(actor)
      },
      donoTalento: {
        name: 'Il Dono del Talento',
        description: 'Ottieni un talento',
        maxTimes: 2,
        icon: 'icons/sundries/scrolls/scroll-runed-brown.webp',
        apply: (actor) => this._applyFeat(actor)
      },
      indomito: {
        name: 'Indomito',
        description: 'Immune alla condizione spaventato',
        maxTimes: 1,
        icon: 'icons/magic/control/debuff-fear-terror-purple.webp',
        apply: (actor) => this._applyFearless(actor)
      },
      recuperoMigliorato: {
        name: 'Recupero Migliorato',
        description: 'Un privilegio recuperabile con riposo lungo ora si recupera con riposo breve',
        maxTimes: 2,
        icon: 'icons/magic/time/clock-stopwatch-white.webp',
        apply: (actor) => this._applyImprovedRecovery(actor)
      },
      rissaioloProfessionista: {
        name: 'Rissaiolo Professionista',
        description: 'Ottieni uno slot mossa aggiuntivo e apprendi una nuova mossa base',
        maxTimes: 2,
        icon: 'icons/skills/melee/unarmed-punch-fist.webp',
        apply: (actor) => this._applyBrawlerPro(actor)
      },
      santaFortuna: {
        name: 'Santa Fortuna',
        description: 'Aggiungi 1d8 a una prova, tiro per colpire o TS (1/riposo breve)',
        maxTimes: 1,
        icon: 'icons/magic/holy/prayer-hands-glowing-yellow.webp',
        apply: (actor) => this._applyLuck(actor)
      }
    };

    // Statistiche per dashboard
    this.stats = {
      emeriticenzeGranted: 0,
      levelCapsBlocked: 0,
      mostPopularEmeriticenza: null,
      lastEmeriticenzaTime: null
    };

    // Macro templates per ogni emeriticenza
    this.macroTemplates = {
      santaFortuna: {
        name: 'Santa Fortuna',
        command: `
const actor = game.user.character;
if (!actor) return ui.notifications.warn("Seleziona un personaggio!");

const feature = actor.items.find(i => i.name === "Santa Fortuna");
if (!feature || !feature.system.uses.value) {
  return ui.notifications.warn("Santa Fortuna non disponibile!");
}

const roll = new Roll("1d8").roll({async: false});
roll.toMessage({
  speaker: ChatMessage.getSpeaker({actor}),
  flavor: "Santa Fortuna - Bonus di fortuna!"
});

feature.update({"system.uses.value": feature.system.uses.value - 1});
        `,
        type: 'script',
        img: 'icons/magic/holy/prayer-hands-glowing-yellow.webp'
      },
      recuperoRapido: {
        name: 'Recupero Rapido',
        command: `
const actor = game.user.character;
if (!actor) return ui.notifications.warn("Seleziona un personaggio!");

// Recupera le capacità migliorate
const improvedFeatures = actor.items.filter(i =>
  i.flags.brancalonia?.improvedRecovery &&
  i.system.uses?.value < i.system.uses?.max
);

if (!improvedFeatures.length) {
  return ui.notifications.info("Nessuna capacità da recuperare!");
}

for (const feature of improvedFeatures) {
  feature.update({"system.uses.value": feature.system.uses.max});
}

ui.notifications.info(\`Recuperate \${improvedFeatures.length} capacità!\`);
        `,
        type: 'script',
        img: 'icons/magic/time/clock-stopwatch-white.webp'
      }
    };
  }

  static async initialize() {
    if (this.instance) return this.instance;

    console.log('🎭 Inizializzazione Level Cap System...');

    // Crea istanza globale
    this.instance = new LevelCapSystem();

    // Registra nel namespace globale
    if (!game.brancalonia) game.brancalonia = {};
    game.brancalonia.levelCap = this.instance;

    // Registra nelle impostazioni
    this._registerSettings();

    // Registra hooks
    this._registerHooks();

    // Registra comandi chat
    this._registerChatCommands();

    // Estendi Actor se necessario
    this._extendActor();

    console.log('✅ Level Cap System inizializzato con successo!');
    return this.instance;
  }

  static _registerSettings() {
    // Livello massimo personalizzabile
    game.settings.register('brancalonia-bigat', 'maxLevel', {
      name: 'Livello Massimo',
      hint: 'Il livello massimo raggiungibile dai personaggi (default: 6)',
      scope: 'world',
      config: true,
      type: Number,
      default: 6,
      range: { min: 3, max: 10, step: 1 },
      onChange: value => {
        if (game.brancalonia?.levelCap) {
          game.brancalonia.levelCap.MAX_LEVEL = value;
        }
      }
    });

    // XP base per prima emeriticenza
    game.settings.register('brancalonia-bigat', 'baseEmeriticenzaXP', {
      name: 'XP Base Emeriticenza',
      hint: 'XP necessari per la prima emeriticenza (default: 14000)',
      scope: 'world',
      config: true,
      type: Number,
      default: 14000,
      onChange: value => {
        if (game.brancalonia?.levelCap) {
          game.brancalonia.levelCap.BASE_EMERITICENZA_XP = value;
        }
      }
    });

    // Incremento XP per emeriticenze successive
    game.settings.register('brancalonia-bigat', 'emeriticenzaXPStep', {
      name: 'Incremento XP Emeriticenze',
      hint: 'XP aggiuntivi per ogni emeriticenza successiva (default: 9000)',
      scope: 'world',
      config: true,
      type: Number,
      default: 9000,
      onChange: value => {
        if (game.brancalonia?.levelCap) {
          game.brancalonia.levelCap.EMERITICENZA_STEP = value;
        }
      }
    });

    // Notifiche automatiche
    game.settings.register('brancalonia-bigat', 'autoEmeriticenzaNotifications', {
      name: 'Notifiche Automatiche Emeriticenze',
      hint: 'Mostra automaticamente il dialog per scegliere emeriticenze',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Dashboard statistiche
    game.settings.register('brancalonia-bigat', 'enableLevelCapStats', {
      name: 'Statistiche Level Cap',
      hint: 'Traccia statistiche su emeriticenze e blocchi di livello',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  static _registerHooks() {
    // Hook per impedire di superare il livello massimo
    Hooks.on('preUpdateItem', (item, update) => {
      if (!game.brancalonia?.levelCap) return;
      const system = game.brancalonia.levelCap;

      if (item.type !== 'class') return;
      const actor = item.parent;
      if (!actor || actor.type !== 'character') return;

      const newLevels = foundry.utils.getProperty(update, 'system.levels');
      if (newLevels === undefined) return;

      const otherLevels = actor.items
        .filter(i => i.type === 'class' && i.id !== item.id)
        .reduce((sum, cls) => sum + (cls.system.levels ?? 0), 0);

      const total = otherLevels + newLevels;
      const maxLevel = game.settings.get('brancalonia-bigat', 'maxLevel');

      if (total > maxLevel) {
        ui.notifications.error(`Livello massimo raggiunto! (${maxLevel})`);
        system._updateStats('levelCapsBlocked');
        return false;
      }
    });

    // Hook per creazione nuove classi
    Hooks.on('preCreateItem', (item, data, opts, userId) => {
      if (!game.brancalonia?.levelCap) return;
      const system = game.brancalonia.levelCap;

      if (item.type !== 'class') return;
      const actor = item.parent;
      if (!actor || actor.type !== 'character') return;

      const classLevels = actor.items
        .filter(i => i.type === 'class')
        .reduce((sum, cls) => sum + (cls.system.levels ?? 0), 0);

      const maxLevel = game.settings.get('brancalonia-bigat', 'maxLevel');
      if (classLevels >= maxLevel) {
        ui.notifications.error(`Livello massimo raggiunto! (${maxLevel})`);
        system._updateStats('levelCapsBlocked');
        return false;
      }
    });

    // Hook per controllo XP e emeriticenze
    Hooks.on('updateActor', (actor, updateData) => {
      if (!game.brancalonia?.levelCap) return;
      const system = game.brancalonia.levelCap;

      if (actor.type !== 'character') return;

      const xpChange = foundry.utils.getProperty(updateData, 'system.details.xp.value');
      if (xpChange === undefined) return;

      const xp = actor.system.details.xp.value;
      system._checkForEmeriticenza(actor, xp);
    });

    // Hook per aggiornare configurazione
    Hooks.on('ready', () => {
      if (!game.brancalonia?.levelCap) return;
      const system = game.brancalonia.levelCap;

      // Aggiorna valori dalle impostazioni
      system.MAX_LEVEL = game.settings.get('brancalonia-bigat', 'maxLevel');
      system.BASE_EMERITICENZA_XP = game.settings.get('brancalonia-bigat', 'baseEmeriticenzaXP');
      system.EMERITICENZA_STEP = game.settings.get('brancalonia-bigat', 'emeriticenzaXPStep');
    });

    // Hook per render character sheet - Version-aware
    const systemVersion = parseFloat(game.system?.version || '0');
    const isV5Plus = systemVersion >= 5.0;

    if (isV5Plus) {
      // dnd5e v5.x+ usa renderActorSheetV2
      Hooks.on('renderActorSheetV2', (sheet, html) => {
        if (!game.brancalonia?.levelCap) return;
        if (sheet.actor?.type !== 'character') return;
        const system = game.brancalonia.levelCap;
        system._addEmeriticenzeTab(sheet, html);
      });
    } else {
      // dnd5e v3.x/v4.x usa renderActorSheet5eCharacter
      Hooks.on('renderActorSheet5eCharacter', (sheet, html) => {
        if (!game.brancalonia?.levelCap) return;
        const system = game.brancalonia.levelCap;
        system._addEmeriticenzeTab(sheet, html);
      });
    }
  }

  static _registerChatCommands() {
    // Comando per visualizzare emeriticenze disponibili
    game.chatCommands?.register({
      name: '/emeriticenze',
      description: 'Mostra le emeriticenze disponibili per il personaggio',
      callback: (chatlog, messageText, chatdata) => {
        const actor = game.user.character;
        if (!actor) {
          return ui.notifications.warn('Seleziona un personaggio!');
        }
        game.brancalonia.levelCap.showEmeriticenzeStatus(actor);
      }
    });

    // Comando per aggiungere emeriticenza manualmente (GM)
    game.chatCommands?.register({
      name: '/grant-emeriticenza',
      description: "[GM] Concede un'emeriticenza a un personaggio",
      callback: (chatlog, messageText, chatdata) => {
        if (!game.user.isGM) {
          return ui.notifications.warn('Solo il GM può usare questo comando!');
        }

        const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
        if (!actor) {
          return ui.notifications.warn('Seleziona un personaggio o token!');
        }

        game.brancalonia.levelCap._showEmeriticenzaDialog(actor, 0);
      }
    });

    // Comando per reset emeriticenze (GM)
    game.chatCommands?.register({
      name: '/reset-emeriticenze',
      description: '[GM] Resetta tutte le emeriticenze di un personaggio',
      callback: (chatlog, messageText, chatdata) => {
        if (!game.user.isGM) {
          return ui.notifications.warn('Solo il GM può usare questo comando!');
        }

        const actor = game.user.character || canvas.tokens.controlled[0]?.actor;
        if (!actor) {
          return ui.notifications.warn('Seleziona un personaggio o token!');
        }

        game.brancalonia.levelCap.resetEmeriticenze(actor);
      }
    });

    // Comando per statistiche level cap
    game.chatCommands?.register({
      name: '/levelcap-stats',
      description: '[GM] Mostra statistiche del sistema level cap',
      callback: (chatlog, messageText, chatdata) => {
        if (!game.user.isGM) {
          return ui.notifications.warn('Solo il GM può usare questo comando!');
        }

        game.brancalonia.levelCap.showStats();
      }
    });
  }

  static _extendActor() {
    // Estendi Actor con metodi specifici per emeriticenze
    Actor.prototype.getEmeriticenzeCount = function () {
      return this.getFlag('brancalonia-bigat', 'emeriticenze') ?? 0;
    };

    Actor.prototype.getTakenEmeriticenze = function () {
      return this.getFlag('brancalonia-bigat', 'emeriticenzeTaken') || {};
    };

    Actor.prototype.getAvailableEmeriticenzeCount = function () {
      const total = this.getEmeriticenzeCount();
      const taken = Object.values(this.getTakenEmeriticenze()).reduce((a, b) => a + b, 0);
      return total - taken;
    };

    Actor.prototype.canTakeEmeriticenza = function (emeriticenzaKey) {
      if (!game.brancalonia?.levelCap) return false;
      const system = game.brancalonia.levelCap;

      const em = system.emeriticenze[emeriticenzaKey];
      if (!em) return false;

      const taken = this.getTakenEmeriticenze();
      const timesTaken = taken[emeriticenzaKey] || 0;

      // Controlla limite massimo
      if (em.maxTimes && timesTaken >= em.maxTimes) return false;

      // Controlla requisiti
      if (em.requirements) {
        if (Array.isArray(em.requirements)) {
          // Requisiti di classe
          const hasClass = this.items.some(i =>
            i.type === 'class' && em.requirements.includes(i.name)
          );
          if (!hasClass) return false;
        } else if (em.requirements === 'Incantatore') {
          // Requisito incantatore
          const isSpellcaster = this.items.some(i =>
            i.type === 'class' && i.system.spellcasting?.progression !== 'none'
          );
          if (!isSpellcaster) return false;
        } else if (em.requirements === '2 altre emeriticenze') {
          // Requisito numero emeriticenze
          const totalTaken = Object.values(taken).reduce((a, b) => a + b, 0);
          if (totalTaken < 2) return false;
        }
      }

      return true;
    };

    Actor.prototype.getNextEmeriticenzaXP = function () {
      if (!game.brancalonia?.levelCap) return null;
      const system = game.brancalonia.levelCap;

      const count = this.getEmeriticenzeCount();
      return system.BASE_EMERITICENZA_XP + (count + 1) * system.EMERITICENZA_STEP;
    };

    console.log('🎭 Actor esteso con metodi per emeriticenze');
  }

  static async _createMacros() {
    try {
      // Crea cartella per le macro se non esiste
      let folder = game.folders.find(f => f.name === '🎭 Brancalonia Level Cap' && f.type === 'Macro');
      if (!folder) {
        folder = await Folder.create({
          name: '🎭 Brancalonia Level Cap',
          type: 'Macro',
          parent: null
        });
      }

      // Crea macro per ogni template
      for (const [key, template] of Object.entries(game.brancalonia.levelCap.macroTemplates)) {
        const existingMacro = game.macros.find(m => m.name === template.name && m.folder?.id === folder.id);
        if (existingMacro) continue;

        await Macro.create({
          name: template.name,
          type: template.type,
          img: template.img,
          command: template.command.trim(),
          folder: folder.id,
          flags: {
            'brancalonia-bigat': {
              systemMacro: true,
              system: 'levelCap'
            }
          }
        });
      }

      // Macro principale per gestione emeriticenze
      const mainMacro = game.macros.find(m => m.name === '🎭 Gestione Emeriticenze');
      if (!mainMacro) {
        await Macro.create({
          name: '🎭 Gestione Emeriticenze',
          type: 'script',
          img: 'icons/skills/trades/smithing-anvil-silver-red.webp',
          command: `
const actor = game.user.character;
if (!actor) return ui.notifications.warn("Seleziona un personaggio!");

game.brancalonia.levelCap.showEmeriticenzeManagement(actor);
          `.trim(),
          folder: folder.id,
          flags: {
            'brancalonia-bigat': {
              systemMacro: true,
              system: 'levelCap'
            }
          }
        });
      }

      console.log('🎭 Macro Level Cap create con successo');
    } catch (error) {
      console.warn('⚠️ Errore nella creazione delle macro Level Cap:', error);
    }
  }

  // Metodi esistenti mantenuti e migliorati
  _checkForEmeriticenza(actor, xp) {
    const taken = actor.getFlag('brancalonia-bigat', 'emeriticenze') ?? 0;
    const nextThreshold = this.BASE_EMERITICENZA_XP + (taken + 1) * this.EMERITICENZA_STEP;

    if (xp >= nextThreshold) {
      actor.setFlag('brancalonia-bigat', 'emeriticenze', taken + 1);

      if (game.settings.get('brancalonia-bigat', 'autoEmeriticenzaNotifications')) {
        this._notifyEmeriticenza(actor, taken + 1);
      }

      this._updateStats('emeriticenzeGranted');
    }
  }

  _notifyEmeriticenza(actor, count) {
    // Notifica in chat
    ChatMessage.create({
      content: `
        <div class="brancalonia-notification">
          <h3>🎭 Nuova Emeriticenza Disponibile!</h3>
          <p><strong>${actor.name}</strong> ha raggiunto ${this.BASE_EMERITICENZA_XP + (count * this.EMERITICENZA_STEP)} PE!</p>
          <p>Può ora scegliere una nuova Emeriticenza.</p>
          <button onclick="game.brancalonia.levelCap._showEmeriticenzaDialog(game.actors.get('${actor.id}'), ${count})">
            Scegli Emeriticenza
          </button>
        </div>
      `,
      speaker: ChatMessage.getSpeaker(),
      whisper: [game.user.id]
    });

    // Audio notification
    AudioHelper.play({ src: 'sounds/notify.wav', volume: 0.8, autoplay: true, loop: false }, true);
  }

  /**
   * Dialog migliorato per scegliere un'emeriticenza
   */
  _showEmeriticenzaDialog(actor, totalEmeriticenze) {
    const takenEmeriticenze = actor.getFlag('brancalonia-bigat', 'emeriticenzeTaken') || {};
    const availableEmeriticenze = this._getAvailableEmeriticenze(actor, takenEmeriticenze);

    if (availableEmeriticenze.length === 0) {
      ui.notifications.warn('Nessuna emeriticenza disponibile!');
      return;
    }

    const content = `
      <div class="brancalonia-emeriticenza-dialog">
        <h3>🎭 Scegli un'Emeriticenza</h3>
        <p>Hai raggiunto <strong>${this.BASE_EMERITICENZA_XP + (totalEmeriticenze * this.EMERITICENZA_STEP)} PE</strong>!</p>
        <p>Puoi scegliere una delle seguenti Emeriticenze:</p>

        <div class="emeriticenze-list" style="max-height: 400px; overflow-y: auto;">
          ${availableEmeriticenze.map(em => `
            <label class="emeriticenza-option" style="display: flex; align-items: center; margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px; cursor: pointer;">
              <input type="radio" name="emeriticenza" value="${em.key}" style="margin-right: 10px;">
              <img src="${em.icon}" style="width: 32px; height: 32px; margin-right: 10px;">
              <div class="emeriticenza-info" style="flex: 1;">
                <div style="font-weight: bold; color: #8B4513;">${em.name}</div>
                <div style="font-size: 0.9em; margin: 5px 0;">${em.description}</div>
                ${em.requirements ? `<div style="font-size: 0.8em; color: #666; font-style: italic;">Requisiti: ${Array.isArray(em.requirements) ? em.requirements.join(', ') : em.requirements}</div>` : ''}
                ${em.timesTaken > 0 ? `<div style="font-size: 0.8em; color: #888;">Già presa ${em.timesTaken} volta/e (max ${em.maxTimes || '∞'})</div>` : ''}
              </div>
            </label>
          `).join('')}
        </div>
      </div>
    `;

    const dialog = new Dialog({
      title: `🎭 Emeriticenza - ${actor.name}`,
      content,
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Conferma',
          callback: async (html) => {
            const chosen = html.find('input[name="emeriticenza"]:checked').val();
            if (chosen) {
              await this._applyEmeriticenza(actor, chosen);
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      default: 'confirm',
      render: (html) => {
        // Evidenzia opzione selezionata
        html.find('input[name="emeriticenza"]').change(function () {
          html.find('.emeriticenza-option').removeClass('selected');
          $(this).closest('.emeriticenza-option').addClass('selected');
        });

        // Stile per opzione selezionata
        html.find('.emeriticenza-option.selected').css({
          'background-color': '#f0f8ff',
          'border-color': '#4169e1'
        });
      }
    }, {
      width: 600,
      height: 500,
      resizable: true
    });

    dialog.render(true);
  }

  /**
   * Ottieni emeriticenze disponibili per un attore
   */
  _getAvailableEmeriticenze(actor, takenEmeriticenze) {
    const available = [];

    for (const [key, em] of Object.entries(this.emeriticenze)) {
      const timesTaken = takenEmeriticenze[key] || 0;

      // Controlla se può essere presa ancora
      if (em.maxTimes && timesTaken >= em.maxTimes) continue;

      // Controlla requisiti
      if (em.requirements) {
        if (Array.isArray(em.requirements)) {
          // Requisiti di classe
          const hasClass = actor.items.some(i =>
            i.type === 'class' && em.requirements.includes(i.name)
          );
          if (!hasClass) continue;
        } else if (em.requirements === 'Incantatore') {
          // Requisito incantatore
          const isSpellcaster = actor.items.some(i =>
            i.type === 'class' && i.system.spellcasting?.progression !== 'none'
          );
          if (!isSpellcaster) continue;
        } else if (em.requirements === '2 altre emeriticenze') {
          // Requisito numero emeriticenze
          const totalTaken = Object.values(takenEmeriticenze).reduce((a, b) => a + b, 0);
          if (totalTaken < 2) continue;
        }
      }

      available.push({
        key,
        ...em,
        timesTaken
      });
    }

    return available;
  }

  /**
   * Applica un'emeriticenza scelta
   */
  async _applyEmeriticenza(actor, emeriticenzaKey) {
    const em = this.emeriticenze[emeriticenzaKey];
    if (!em) return;

    try {
      // Registra la scelta
      const taken = actor.getFlag('brancalonia-bigat', 'emeriticenzeTaken') || {};
      taken[emeriticenzaKey] = (taken[emeriticenzaKey] || 0) + 1;
      await actor.setFlag('brancalonia-bigat', 'emeriticenzeTaken', taken);

      // Applica l'effetto
      await em.apply(actor);

      // Aggiorna statistiche
      this._updateEmeriticenzaStats(emeriticenzaKey);

      // Notifica migliorata
      ChatMessage.create({
        content: `
          <div class="brancalonia-emeriticenza" style="border: 2px solid #8B4513; border-radius: 10px; padding: 15px; background: linear-gradient(45deg, #f5f5dc, #fff8dc);">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <img src="${em.icon}" style="width: 48px; height: 48px; margin-right: 15px;">
              <div>
                <h3 style="margin: 0; color: #8B4513;">🎭 ${actor.name} ottiene: ${em.name}</h3>
                <p style="margin: 5px 0 0 0; font-style: italic;">"${em.description}"</p>
              </div>
            </div>
            <div style="text-align: center; font-size: 0.9em; color: #666;">
              Emeriticenza applicata con successo!
            </div>
          </div>
        `,
        speaker: ChatMessage.getSpeaker({ actor })
      });

      ui.notifications.info(`Emeriticenza "${em.name}" applicata con successo!`);
    } catch (error) {
      console.error("Errore nell'applicazione dell'emeriticenza:", error);
      ui.notifications.error("Errore nell'applicazione dell'emeriticenza!");
    }
  }

  // Metodi di applicazione per ogni emeriticenza (mantenuti e migliorati)

  async _applyASI(actor) {
    const abilities = CONFIG.DND5E.abilities;
    const content = `
      <div style="padding: 10px;">
        <p><strong>Scegli come distribuire i punti caratteristica:</strong></p>
        <div style="margin: 15px 0;">
          <label style="display: block; margin: 10px 0;">
            <input type="radio" name="asi-type" value="single" checked style="margin-right: 8px;">
            <strong>+2 a una caratteristica</strong>
          </label>
          <label style="display: block; margin: 10px 0;">
            <input type="radio" name="asi-type" value="double" style="margin-right: 8px;">
            <strong>+1 a due caratteristiche</strong>
          </label>
        </div>
        <hr>
        <div class="asi-single">
          <label><strong>Caratteristica:</strong>
            <select name="single-ability" style="width: 100%; margin-top: 5px;">
              ${Object.entries(abilities).map(([key, label]) => {
    const current = actor.system.abilities[key].value;
    const disabled = current >= 20 ? 'disabled' : '';
    return `<option value="${key}" ${disabled}>${label} (attuale: ${current})</option>`;
  }).join('')}
            </select>
          </label>
        </div>
        <div class="asi-double" style="display:none;">
          <label><strong>Prima caratteristica:</strong>
            <select name="first-ability" style="width: 100%; margin-top: 5px;">
              ${Object.entries(abilities).map(([key, label]) => {
    const current = actor.system.abilities[key].value;
    const disabled = current >= 20 ? 'disabled' : '';
    return `<option value="${key}" ${disabled}>${label} (attuale: ${current})</option>`;
  }).join('')}
            </select>
          </label>
          <label style="margin-top: 10px; display: block;"><strong>Seconda caratteristica:</strong>
            <select name="second-ability" style="width: 100%; margin-top: 5px;">
              ${Object.entries(abilities).map(([key, label]) => {
    const current = actor.system.abilities[key].value;
    const disabled = current >= 20 ? 'disabled' : '';
    return `<option value="${key}" ${disabled}>${label} (attuale: ${current})</option>`;
  }).join('')}
            </select>
          </label>
        </div>
      </div>
    `;

    new Dialog({
      title: '🎭 Affinamento - Aumento Caratteristiche',
      content,
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Conferma',
          callback: async (html) => {
            const type = html.find('input[name="asi-type"]:checked').val();
            const updates = {};

            if (type === 'single') {
              const ability = html.find('select[name="single-ability"]').val();
              const current = actor.system.abilities[ability].value;
              updates[`system.abilities.${ability}.value`] = Math.min(20, current + 2);

              ui.notifications.info(`${CONFIG.DND5E.abilities[ability]} aumentata a ${updates[`system.abilities.${ability}.value`]}!`);
            } else {
              const first = html.find('select[name="first-ability"]').val();
              const second = html.find('select[name="second-ability"]').val();

              if (first === second) {
                ui.notifications.warn('Devi scegliere due caratteristiche diverse!');
                return;
              }

              const currentFirst = actor.system.abilities[first].value;
              const currentSecond = actor.system.abilities[second].value;

              updates[`system.abilities.${first}.value`] = Math.min(20, currentFirst + 1);
              updates[`system.abilities.${second}.value`] = Math.min(20, currentSecond + 1);

              ui.notifications.info(`${CONFIG.DND5E.abilities[first]} e ${CONFIG.DND5E.abilities[second]} aumentate di 1!`);
            }

            await actor.update(updates);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      render: (html) => {
        html.find('input[name="asi-type"]').change((e) => {
          const isSingle = e.target.value === 'single';
          html.find('.asi-single').toggle(isSingle);
          html.find('.asi-double').toggle(!isSingle);
        });
      }
    }, { width: 400 }).render(true);
  }

  async _applyPreferredWeapon(actor) {
    // Lista armi disponibili
    const weaponTypes = {
      'martial-melee': 'Armi da Mischia Marziali',
      'martial-ranged': 'Armi a Distanza Marziali',
      'simple-melee': 'Armi da Mischia Semplici',
      'simple-ranged': 'Armi a Distanza Semplici'
    };

    const content = `
      <div style="padding: 10px;">
        <p><strong>Scegli il tipo di arma preferita:</strong></p>
        <select name="weapon-type" style="width: 100%; margin: 10px 0;">
          ${Object.entries(weaponTypes).map(([key, label]) =>
    `<option value="${key}">${label}</option>`
  ).join('')}
        </select>
        <p style="font-size: 0.9em; color: #666;">
          Aggiungerai il bonus di competenza ai danni con questo tipo di arma.
        </p>
      </div>
    `;

    new Dialog({
      title: '🎭 Arma Preferita',
      content,
      buttons: {
        confirm: {
          label: 'Conferma',
          callback: async (html) => {
            const weaponType = html.find('select[name="weapon-type"]').val();
            const typeName = weaponTypes[weaponType];

            const effect = {
              name: `Arma Preferita (${typeName})`,
              img: 'icons/skills/melee/sword-katana-red.webp',
              origin: actor.uuid,
              duration: {},
              changes: [],
              flags: {
                'brancalonia-bigat': {
                  emeriticenza: 'armaPreferita',
                  weaponType
                },
                dae: {
                  specialDuration: ['longRest'],
                  transfer: true
                }
              }
            };

            await actor.createEmbeddedDocuments('ActiveEffect', [effect]);
            ui.notifications.info(`Arma preferita impostata: ${typeName}`);
          }
        }
      }
    }, { width: 400 }).render(true);
  }

  async _applyAbsoluteMastery(actor) {
    const effect = {
      name: 'Emeriticenza Assoluta',
      img: 'icons/magic/control/buff-flight-wings-blue.webp',
      origin: actor.uuid,
      duration: {},
      changes: [{
        key: 'system.attributes.prof',
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: '4'
      }],
      flags: {
        'brancalonia-bigat': {
          emeriticenza: 'emeriticenzaAssoluta'
        }
      }
    };

    await actor.createEmbeddedDocuments('ActiveEffect', [effect]);
    ui.notifications.info('Bonus di competenza impostato a +4!');
  }

  async _applyToughness(actor) {
    const conMod = actor.system.abilities.con.mod;
    const hpIncrease = 6 + conMod;
    const currentMax = actor.system.attributes.hp.max;
    const currentValue = actor.system.attributes.hp.value;

    await actor.update({
      'system.attributes.hp.max': currentMax + hpIncrease,
      'system.attributes.hp.value': currentValue + hpIncrease
    });

    ui.notifications.info(`Punti Ferita aumentati di ${hpIncrease}!`);
  }

  async _applyExtraSpellSlot(actor) {
    const spellcaster = actor.items.find(i =>
      i.type === 'class' &&
      i.system.spellcasting?.progression !== 'none'
    );

    if (!spellcaster) {
      ui.notifications.warn('Personaggio non incantatore!');
      return;
    }

    const classLevels = spellcaster.system.levels || 1;
    const maxLevel = Math.min(Math.ceil(classLevels / 2), 3);

    const content = `
      <div style="padding: 10px;">
        <p><strong>Scegli il livello dello slot incantesimo aggiuntivo:</strong></p>
        <select name="slot-level" style="width: 100%; margin: 10px 0;">
          ${Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => {
    const current = actor.system.spells[`spell${level}`]?.max || 0;
    return `<option value="${level}">Livello ${level} (attuale: ${current})</option>`;
  }).join('')}
        </select>
      </div>
    `;

    new Dialog({
      title: '🎭 Fandonia Migliorata - Slot Aggiuntivo',
      content,
      buttons: {
        confirm: {
          label: 'Conferma',
          callback: async (html) => {
            const level = html.find('select[name="slot-level"]').val();
            const key = `system.spells.spell${level}.max`;
            const current = actor.system.spells[`spell${level}`]?.max || 0;

            await actor.update({
              [key]: current + 1
            });

            ui.notifications.info(`Slot di livello ${level} aumentato!`);
          }
        }
      }
    }, { width: 400 }).render(true);
  }

  async _applyEmpoweredSpell(actor) {
    const feature = {
      name: 'Fandonia Potenziata',
      type: 'feat',
      img: 'icons/magic/fire/projectile-fireball-orange.webp',
      system: {
        description: {
          value: '<p>Una volta per riposo breve, puoi lanciare un incantesimo come se utilizzassi uno slot di un livello superiore.</p>',
          chat: '',
          unidentified: ''
        },
        activation: {
          type: 'special',
          cost: 1,
          condition: ''
        },
        duration: {
          value: null,
          units: ''
        },
        target: {
          value: null,
          width: null,
          units: '',
          type: 'self'
        },
        range: {
          value: null,
          long: null,
          units: ''
        },
        uses: {
          value: 1,
          max: '1',
          per: 'sr',
          recovery: ''
        },
        consume: {
          type: '',
          target: '',
          amount: null
        },
        ability: null,
        actionType: 'util',
        attackBonus: 0,
        chatFlavor: '',
        critical: {
          threshold: null,
          damage: ''
        },
        damage: {
          parts: [],
          versatile: ''
        },
        formula: '',
        save: {
          ability: '',
          dc: null,
          scaling: 'spell'
        },
        requirements: '',
        recharge: {
          value: null,
          charged: true
        }
      },
      flags: {
        'brancalonia-bigat': {
          emeriticenza: 'fandoniaPotenziata'
        }
      }
    };

    await actor.createEmbeddedDocuments('Item', [feature]);
    ui.notifications.info('Fandonia Potenziata aggiunta!');
  }

  async _applyTeamwork(actor) {
    const feature = {
      name: 'Gioco di Squadra',
      type: 'feat',
      img: 'icons/skills/social/diplomacy-handshake-yellow.webp',
      system: {
        description: {
          value: "<p>Puoi usare l'azione Aiuto come azione bonus.</p>",
          chat: '',
          unidentified: ''
        },
        activation: {
          type: 'bonus',
          cost: 1,
          condition: ''
        },
        duration: {
          value: null,
          units: ''
        },
        target: {
          value: 1,
          width: null,
          units: '',
          type: 'ally'
        },
        range: {
          value: 5,
          long: null,
          units: 'ft'
        },
        uses: {
          value: null,
          max: '',
          per: '',
          recovery: ''
        },
        consume: {
          type: '',
          target: '',
          amount: null
        },
        ability: null,
        actionType: 'util',
        attackBonus: 0,
        chatFlavor: '',
        critical: {
          threshold: null,
          damage: ''
        },
        damage: {
          parts: [],
          versatile: ''
        },
        formula: '',
        save: {
          ability: '',
          dc: null,
          scaling: 'spell'
        },
        requirements: '',
        recharge: {
          value: null,
          charged: true
        }
      },
      flags: {
        'brancalonia-bigat': {
          emeriticenza: 'giocoSquadra'
        }
      }
    };

    await actor.createEmbeddedDocuments('Item', [feature]);
    ui.notifications.info('Gioco di Squadra aggiunto!');
  }

  async _applyFeat(actor) {
    // Cerca compendio talenti
    let pack = game.packs.get('brancalonia-bigat.talenti');
    if (!pack) {
      pack = game.packs.find(p => p.metadata.label.toLowerCase().includes('feat'));
    }

    if (pack) {
      ui.notifications.info('Scegli un talento dal compendio che si aprirà');
      pack.render(true);
    } else {
      // Crea un talento placeholder
      const feat = {
        name: 'Talento Personalizzato',
        type: 'feat',
        img: 'icons/sundries/scrolls/scroll-runed-brown.webp',
        system: {
          description: {
            value: '<p>Talento ottenuto tramite Emeriticenza. Modifica questo oggetto per aggiungere i dettagli del talento scelto.</p>'
          },
          requirements: 'Emeriticenza: Il Dono del Talento'
        },
        flags: {
          'brancalonia-bigat': {
            emeriticenza: 'donoTalento'
          }
        }
      };

      await actor.createEmbeddedDocuments('Item', [feat]);
      ui.notifications.info('Talento placeholder aggiunto - modificalo per aggiungere i dettagli!');
    }
  }

  async _applyFearless(actor) {
    const effect = {
      name: 'Indomito',
      img: 'icons/magic/control/debuff-fear-terror-purple.webp',
      origin: actor.uuid,
      duration: {},
      changes: [{
        key: 'system.traits.ci.value',
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: 'frightened'
      }],
      flags: {
        'brancalonia-bigat': {
          emeriticenza: 'indomito'
        }
      }
    };

    await actor.createEmbeddedDocuments('ActiveEffect', [effect]);
    ui.notifications.info('Immunità a spaventato attivata!');
  }

  async _applyImprovedRecovery(actor) {
    const features = actor.items.filter(i =>
      i.type === 'feat' &&
      i.system.uses?.per === 'lr' &&
      !i.flags['brancalonia-bigat']?.improvedRecovery
    );

    if (features.length === 0) {
      ui.notifications.warn('Nessuna capacità con riposo lungo trovata!');
      return;
    }

    const content = `
      <div style="padding: 10px;">
        <p><strong>Scegli quale capacità potrà essere recuperata con un riposo breve:</strong></p>
        <select name="feature" style="width: 100%; margin: 10px 0;">
          ${features.map(f => {
    const uses = f.system.uses;
    return `<option value="${f.id}">${f.name} (${uses.value}/${uses.max} usi)</option>`;
  }).join('')}
        </select>
      </div>
    `;

    new Dialog({
      title: '🎭 Recupero Migliorato',
      content,
      buttons: {
        confirm: {
          label: 'Conferma',
          callback: async (html) => {
            const featureId = html.find('select[name="feature"]').val();
            const feature = actor.items.get(featureId);

            await feature.update({
              'system.uses.per': 'sr',
              'flags.brancalonia-bigat.improvedRecovery': true
            });

            ui.notifications.info(`${feature.name} ora si recupera con riposo breve!`);
          }
        }
      }
    }, { width: 400 }).render(true);
  }

  async _applyBrawlerPro(actor) {
    // Aggiungi slot mossa
    const currentSlots = actor.getFlag('brancalonia-bigat', 'brawlMoveSlots') || 2;
    await actor.setFlag('brancalonia-bigat', 'brawlMoveSlots', currentSlots + 1);

    // Notifica per scegliere nuova mossa
    ui.notifications.info('Slot mossa aggiunto! Scegli una nuova mossa base dal sistema Risse');

    // Se il sistema risse è attivo, apri il dialog
    if (game.brancalonia?.tavernBrawl) {
      game.brancalonia.tavernBrawl.showMoveSelectionDialog(actor);
    } else {
      // Crea feature placeholder
      const feature = {
        name: 'Mossa Rissa Aggiuntiva',
        type: 'feat',
        img: 'icons/skills/melee/unarmed-punch-fist.webp',
        system: {
          description: {
            value: '<p>Slot mossa aggiuntivo ottenuto tramite Rissaiolo Professionista. Scegli una mossa base dal sistema Risse.</p>'
          }
        },
        flags: {
          'brancalonia-bigat': {
            emeriticenza: 'rissaioloProfessionista'
          }
        }
      };

      await actor.createEmbeddedDocuments('Item', [feature]);
    }
  }

  async _applyLuck(actor) {
    const feature = {
      name: 'Santa Fortuna',
      type: 'feat',
      img: 'icons/magic/holy/prayer-hands-glowing-yellow.webp',
      system: {
        description: {
          value: '<p>Una volta per riposo breve, puoi aggiungere 1d8 a una prova di caratteristica, tiro per colpire o tiro salvezza.</p>',
          chat: '',
          unidentified: ''
        },
        activation: {
          type: 'special',
          cost: 0,
          condition: ''
        },
        duration: {
          value: null,
          units: ''
        },
        target: {
          value: null,
          width: null,
          units: '',
          type: 'self'
        },
        range: {
          value: null,
          long: null,
          units: ''
        },
        uses: {
          value: 1,
          max: '1',
          per: 'sr',
          recovery: ''
        },
        consume: {
          type: '',
          target: '',
          amount: null
        },
        ability: null,
        actionType: 'util',
        attackBonus: 0,
        chatFlavor: '',
        critical: {
          threshold: null,
          damage: ''
        },
        damage: {
          parts: [['1d8', '']],
          versatile: ''
        },
        formula: '',
        save: {
          ability: '',
          dc: null,
          scaling: 'spell'
        },
        requirements: '',
        recharge: {
          value: null,
          charged: true
        }
      },
      flags: {
        'brancalonia-bigat': {
          emeriticenza: 'santaFortuna'
        }
      }
    };

    await actor.createEmbeddedDocuments('Item', [feature]);
    ui.notifications.info('Santa Fortuna aggiunta!');
  }

  // Metodi aggiuntivi per gestione avanzata

  showEmeriticenzeStatus(actor) {
    const taken = actor.getTakenEmeriticenze();
    const available = actor.getAvailableEmeriticenzeCount();
    const nextXP = actor.getNextEmeriticenzaXP();

    let content = `
      <div class="brancalonia-emeriticenze-status">
        <h3>🎭 Stato Emeriticenze - ${actor.name}</h3>
        <div style="margin: 15px 0;">
          <p><strong>XP Attuali:</strong> ${actor.system.details.xp.value}</p>
          <p><strong>Prossima Emeriticenza:</strong> ${nextXP} XP</p>
          <p><strong>Emeriticenze Disponibili:</strong> ${available}</p>
        </div>

        <h4>Emeriticenze Ottenute:</h4>
    `;

    if (Object.keys(taken).length === 0) {
      content += `<p style="font-style: italic; color: #666;">Nessuna emeriticenza ottenuta ancora.</p>`;
    } else {
      content += `<ul>`;
      for (const [key, count] of Object.entries(taken)) {
        const em = this.emeriticenze[key];
        if (em) {
          content += `<li><strong>${em.name}</strong> ${count > 1 ? `(x${count})` : ''}</li>`;
        }
      }
      content += `</ul>`;
    }

    content += `
        <h4>Emeriticenze Disponibili:</h4>
        <div style="max-height: 200px; overflow-y: auto;">
    `;

    const availableEmeriticenze = this._getAvailableEmeriticenze(actor, taken);
    if (availableEmeriticenze.length === 0) {
      content += `<p style="font-style: italic; color: #666;">Nessuna emeriticenza attualmente disponibile.</p>`;
    } else {
      content += `<ul>`;
      for (const em of availableEmeriticenze) {
        content += `
          <li>
            <strong>${em.name}</strong> - ${em.description}
            ${em.requirements ? `<br><small>Requisiti: ${Array.isArray(em.requirements) ? em.requirements.join(', ') : em.requirements}</small>` : ''}
          </li>
        `;
      }
      content += `</ul>`;
    }

    content += `
        </div>
      </div>
    `;

    new Dialog({
      title: `🎭 Emeriticenze - ${actor.name}`,
      content,
      buttons: {
        choose: {
          icon: '<i class="fas fa-star"></i>',
          label: 'Scegli Emeriticenza',
          condition: () => available > 0,
          callback: () => {
            this._showEmeriticenzaDialog(actor, actor.getEmeriticenzeCount());
          }
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Chiudi'
        }
      },
      default: 'close'
    }, { width: 500, height: 600 }).render(true);
  }

  showEmeriticenzeManagement(actor) {
    if (!game.user.isGM) {
      return this.showEmeriticenzeStatus(actor);
    }

    const taken = actor.getTakenEmeriticenze();
    const total = actor.getEmeriticenzeCount();

    let content = `
      <div class="brancalonia-emeriticenze-management">
        <h3>🎭 Gestione Emeriticenze - ${actor.name}</h3>
        <div style="margin: 15px 0;">
          <label><strong>Emeriticenze Totali:</strong>
            <input type="number" name="total-emeriticenze" value="${total}" min="0" style="width: 80px; margin-left: 10px;">
          </label>
        </div>

        <h4>Emeriticenze Prese:</h4>
        <div style="max-height: 300px; overflow-y: auto;">
    `;

    for (const [key, em] of Object.entries(this.emeriticenze)) {
      const count = taken[key] || 0;
      content += `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc;">
          <label style="font-weight: bold;">${em.name}:
            <input type="number" name="em-${key}" value="${count}" min="0" max="${em.maxTimes || 99}" style="width: 60px; margin-left: 10px;">
          </label>
          <div style="font-size: 0.9em; color: #666; margin-top: 5px;">${em.description}</div>
        </div>
      `;
    }

    content += `
        </div>
      </div>
    `;

    new Dialog({
      title: `🎭 [GM] Gestione Emeriticenze - ${actor.name}`,
      content,
      buttons: {
        save: {
          icon: '<i class="fas fa-save"></i>',
          label: 'Salva',
          callback: async (html) => {
            const newTotal = parseInt(html.find('input[name="total-emeriticenze"]').val()) || 0;
            const newTaken = {};

            for (const key of Object.keys(this.emeriticenze)) {
              const value = parseInt(html.find(`input[name="em-${key}"]`).val()) || 0;
              if (value > 0) {
                newTaken[key] = value;
              }
            }

            await actor.setFlag('brancalonia-bigat', 'emeriticenze', newTotal);
            await actor.setFlag('brancalonia-bigat', 'emeriticenzeTaken', newTaken);

            ui.notifications.info('Emeriticenze aggiornate!');
          }
        },
        grant: {
          icon: '<i class="fas fa-gift"></i>',
          label: 'Concedi Emeriticenza',
          callback: () => {
            this._showEmeriticenzaDialog(actor, total);
          }
        },
        reset: {
          icon: '<i class="fas fa-trash"></i>',
          label: 'Reset',
          callback: () => {
            Dialog.confirm({
              title: 'Conferma Reset',
              content: 'Sei sicuro di voler azzerare tutte le emeriticenze?',
              yes: async () => {
                await this.resetEmeriticenze(actor);
              }
            });
          }
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Chiudi'
        }
      },
      default: 'save'
    }, { width: 600, height: 500 }).render(true);
  }

  async resetEmeriticenze(actor) {
    // Rimuovi tutti gli effetti delle emeriticenze
    const emeriticenzeEffects = actor.effects.filter(e =>
      e.flags['brancalonia-bigat']?.emeriticenza
    );

    if (emeriticenzeEffects.length > 0) {
      await actor.deleteEmbeddedDocuments('ActiveEffect', emeriticenzeEffects.map(e => e.id));
    }

    // Rimuovi tutti i feat delle emeriticenze
    const emeriticenzeFeats = actor.items.filter(i =>
      i.flags['brancalonia-bigat']?.emeriticenza
    );

    if (emeriticenzeFeats.length > 0) {
      await actor.deleteEmbeddedDocuments('Item', emeriticenzeFeats.map(i => i.id));
    }

    // Reset flags
    await actor.unsetFlag('brancalonia-bigat', 'emeriticenze');
    await actor.unsetFlag('brancalonia-bigat', 'emeriticenzeTaken');

    ui.notifications.info('Tutte le emeriticenze sono state resettate!');
  }

  showStats() {
    if (!game.user.isGM) return;

    const actors = game.actors.filter(a => a.type === 'character');
    let totalEmeriticenze = 0;
    const emeriticenzeCount = {};
    let levelCaps = 0;

    actors.forEach(actor => {
      const taken = actor.getTakenEmeriticenze();
      const count = Object.values(taken).reduce((a, b) => a + b, 0);
      totalEmeriticenze += count;

      for (const [key, times] of Object.entries(taken)) {
        emeriticenzeCount[key] = (emeriticenzeCount[key] || 0) + times;
      }

      // Controlla se ha raggiunto il level cap
      const totalLevels = actor.items
        .filter(i => i.type === 'class')
        .reduce((sum, cls) => sum + (cls.system.levels || 0), 0);

      if (totalLevels >= this.MAX_LEVEL) {
        levelCaps++;
      }
    });

    const mostPopular = Object.entries(emeriticenzeCount)
      .sort(([, a], [, b]) => b - a)[0];

    let content = `
      <div class="brancalonia-levelcap-stats">
        <h3>📊 Statistiche Level Cap System</h3>

        <div style="margin: 20px 0;">
          <h4>Statistiche Generali:</h4>
          <ul>
            <li><strong>Personaggi Totali:</strong> ${actors.length}</li>
            <li><strong>Personaggi al Level Cap:</strong> ${levelCaps}</li>
            <li><strong>Emeriticenze Totali Concesse:</strong> ${totalEmeriticenze}</li>
            <li><strong>Emeriticenza Più Popolare:</strong> ${mostPopular ? `${this.emeriticenze[mostPopular[0]]?.name} (${mostPopular[1]} volte)` : 'Nessuna'}</li>
          </ul>
        </div>

        <div style="margin: 20px 0;">
          <h4>Distribuzione Emeriticenze:</h4>
          <div style="max-height: 200px; overflow-y: auto;">
    `;

    if (Object.keys(emeriticenzeCount).length === 0) {
      content += `<p style="font-style: italic; color: #666;">Nessuna emeriticenza concessa ancora.</p>`;
    } else {
      const sorted = Object.entries(emeriticenzeCount)
        .sort(([, a], [, b]) => b - a);

      content += `<ul>`;
      for (const [key, count] of sorted) {
        const em = this.emeriticenze[key];
        if (em) {
          content += `<li><strong>${em.name}:</strong> ${count} volte</li>`;
        }
      }
      content += `</ul>`;
    }

    content += `
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h4>Personaggi per Livello:</h4>
    `;

    const levelDistribution = {};
    actors.forEach(actor => {
      const totalLevels = actor.items
        .filter(i => i.type === 'class')
        .reduce((sum, cls) => sum + (cls.system.levels || 0), 0);

      levelDistribution[totalLevels] = (levelDistribution[totalLevels] || 0) + 1;
    });

    content += `<ul>`;
    for (let level = 1; level <= this.MAX_LEVEL; level++) {
      const count = levelDistribution[level] || 0;
      content += `<li><strong>Livello ${level}:</strong> ${count} personaggi</li>`;
    }
    content += `</ul>`;

    content += `
        </div>
      </div>
    `;

    new Dialog({
      title: '📊 Statistiche Level Cap System',
      content,
      buttons: {
        export: {
          icon: '<i class="fas fa-download"></i>',
          label: 'Esporta',
          callback: () => {
            const data = {
              timestamp: new Date().toISOString(),
              totalCharacters: actors.length,
              levelCapCharacters: levelCaps,
              totalEmeriticenze,
              emeriticenzeDistribution: emeriticenzeCount,
              levelDistribution,
              mostPopular: mostPopular ? {
                key: mostPopular[0],
                name: this.emeriticenze[mostPopular[0]]?.name,
                count: mostPopular[1]
              } : null
            };

            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `brancalonia-levelcap-stats-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
          }
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Chiudi'
        }
      },
      default: 'close'
    }, { width: 500, height: 600 }).render(true);
  }

  _addEmeriticenzeTab(sheet, html) {
    if (!sheet.actor || sheet.actor.type !== 'character') return;

    // Aggiungi tab Emeriticenze
    const tabs = html.find('.sheet-tabs[data-group="primary"]');
    tabs.append(`<a class="item" data-tab="emeriticenze">🎭 Emeriticenze</a>`);

    // Aggiungi contenuto tab
    const sheetBody = html.find('.sheet-body');
    const actor = sheet.actor;
    const taken = actor.getTakenEmeriticenze();
    const available = actor.getAvailableEmeriticenzeCount();
    const nextXP = actor.getNextEmeriticenzaXP();

    let tabContent = `
      <div class="tab emeriticenze" data-group="primary" data-tab="emeriticenze">
        <div class="emeriticenze-summary" style="margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
          <h3>🎭 Riepilogo Emeriticenze</h3>
          <div style="display: flex; justify-content: space-between;">
            <div><strong>XP Attuali:</strong> ${actor.system.details.xp.value}</div>
            <div><strong>Prossima:</strong> ${nextXP} XP</div>
            <div><strong>Disponibili:</strong> ${available}</div>
          </div>
          ${available > 0 ? `
            <button type="button" class="choose-emeriticenza" style="margin-top: 10px; width: 100%;">
              Scegli Emeriticenza
            </button>
          ` : ''}
        </div>

        <div class="emeriticenze-list">
          <h4>Emeriticenze Ottenute:</h4>
    `;

    if (Object.keys(taken).length === 0) {
      tabContent += `<p style="font-style: italic; color: #666;">Nessuna emeriticenza ottenuta ancora.</p>`;
    } else {
      tabContent += `<div class="taken-emeriticenze">`;
      for (const [key, count] of Object.entries(taken)) {
        const em = this.emeriticenze[key];
        if (em) {
          tabContent += `
            <div class="emeriticenza-item" style="display: flex; align-items: center; margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
              <img src="${em.icon}" style="width: 32px; height: 32px; margin-right: 10px;">
              <div style="flex: 1;">
                <div style="font-weight: bold;">${em.name} ${count > 1 ? `(x${count})` : ''}</div>
                <div style="font-size: 0.9em; color: #666;">${em.description}</div>
              </div>
            </div>
          `;
        }
      }
      tabContent += `</div>`;
    }

    tabContent += `
        </div>
      </div>
    `;

    sheetBody.append(tabContent);

    // Aggiungi listener per il pulsante
    html.find('.choose-emeriticenza').click(() => {
      this._showEmeriticenzaDialog(actor, actor.getEmeriticenzeCount());
    });
  }

  _updateStats(type) {
    if (!game.settings.get('brancalonia-bigat', 'enableLevelCapStats')) return;

    this.stats[type]++;
    this.stats.lastEmeriticenzaTime = new Date().toISOString();
  }

  _updateEmeriticenzaStats(emeriticenzaKey) {
    if (!game.settings.get('brancalonia-bigat', 'enableLevelCapStats')) return;

    // Aggiorna statistica emeriticenza più popolare
    const current = game.settings.get('brancalonia-bigat', 'emeriticenzeStats') || {};
    current[emeriticenzaKey] = (current[emeriticenzaKey] || 0) + 1;

    // Trova la più popolare
    const mostPopular = Object.entries(current)
      .sort(([, a], [, b]) => b - a)[0];

    if (mostPopular) {
      this.stats.mostPopularEmeriticenza = {
        key: mostPopular[0],
        name: this.emeriticenze[mostPopular[0]]?.name,
        count: mostPopular[1]
      };
    }

    game.settings.set('brancalonia-bigat', 'emeriticenzeStats', current);
  }
}

// Registra la classe globalmente
window.LevelCapSystem = LevelCapSystem;

// Auto-inizializzazione
Hooks.once('init', async () => {
  await LevelCapSystem.initialize();
});

// Hook per creazione macro (dopo che game.user è disponibile)
Hooks.once('ready', async () => {
  await LevelCapSystem._createMacros();
});