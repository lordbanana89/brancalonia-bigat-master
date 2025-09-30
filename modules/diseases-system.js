/**
 * Sistema Malattie per Brancalonia
 * Implementazione completa delle malattie secondo il manuale
 * Compatibile con dnd5e system per Foundry VTT v13
 */

class DiseasesSystem {
  constructor() {
    // Database completo delle malattie di Brancalonia
    this.diseases = {
      // Malattie Comuni
      febbre_palustre: {
        name: 'Febbre Palustre',
        img: 'icons/magic/unholy/silhouette-evil-horned-red.webp',
        dc: 12,
        incubation: '1d4 giorni',
        symptoms: {
          stage1: {
            duration: '1d4 giorni',
            effects: [
              { key: 'system.attributes.hp.max', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-5' },
              { key: 'flags.midi-qol.disadvantage.ability.save.con', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: '1' }
            ],
            description: 'Febbre alta e brividi. -5 HP massimi, svantaggio ai TS Costituzione'
          },
          stage2: {
            duration: '2d4 giorni',
            effects: [
              { key: 'system.attributes.hp.max', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-10' },
              { key: 'system.abilities.str.value', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-2' },
              { key: 'flags.midi-qol.disadvantage.ability.check.all', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: '1' }
            ],
            description: 'Delirio e debolezza. -10 HP massimi, -2 Forza, svantaggio a tutte le prove'
          },
          stage3: {
            duration: 'permanente',
            effects: [
              { key: 'system.attributes.exhaustion', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '3' }
            ],
            description: 'Collasso. 3 livelli di sfinimento. Richiede magia per guarire'
          }
        },
        transmission: 'Punture di insetti, acqua stagnante',
        cure: {
          natural: { method: 'Riposo lungo + TS Costituzione CD 12 ogni giorno', days: 7 },
          medical: { method: 'Medicina CD 15 + erbe medicinali', cost: 50 },
          magical: { method: 'Ristorare inferiore o superiore', instant: true }
        }
      },

      peste_nera: {
        name: 'Peste Nera di Taglia',
        img: 'icons/magic/death/skull-horned-goat-green.webp',
        dc: 15,
        incubation: '1d3 giorni',
        symptoms: {
          stage1: {
            duration: '1 giorno',
            effects: [
              { key: 'system.attributes.hp.max', mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: '0.9' },
              { key: 'system.attributes.movement.walk', mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: '0.5' }
            ],
            description: 'Bubboni e febbre. -10% HP massimi, velocità dimezzata'
          },
          stage2: {
            duration: '1d3 giorni',
            effects: [
              { key: 'system.attributes.hp.max', mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: '0.5' },
              { key: 'system.abilities.con.value', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-4' },
              { key: 'flags.dnd5e.initiativeDisadv', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: '1' }
            ],
            description: 'Necrosi. HP massimi dimezzati, -4 Costituzione'
          },
          stage3: {
            duration: 'morte',
            effects: [],
            description: 'Morte in 1d6 ore senza cure magiche'
          }
        },
        transmission: 'Contatto con infetti, morsi di ratti',
        contagious: true,
        contagionDC: 13,
        cure: {
          natural: { method: 'Impossibile senza magia', days: null },
          medical: { method: 'Medicina CD 20 + quarantena', cost: 200 },
          magical: { method: 'Cura malattie o ristorare superiore', instant: true }
        }
      },

      mal_di_strada: {
        name: 'Mal di Strada',
        img: 'icons/skills/wounds/injury-pain-body-orange.webp',
        dc: 10,
        incubation: 'immediato',
        symptoms: {
          stage1: {
            duration: '1d4 giorni',
            effects: [
              { key: 'system.attributes.exhaustion', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '1' },
              { key: 'system.attributes.movement.walk', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-10' }
            ],
            description: 'Piaghe ai piedi. 1 livello sfinimento, -10 piedi movimento'
          }
        },
        transmission: 'Lunghi viaggi senza riposo adeguato',
        cure: {
          natural: { method: 'Riposo completo per 1 giorno', days: 1 },
          medical: { method: 'Medicina CD 10', cost: 5 }
        }
      },

      follia_lunare: {
        name: 'Follia Lunare',
        img: 'icons/magic/control/fear-fright-monster-purple.webp',
        dc: 14,
        incubation: 'luna piena',
        symptoms: {
          stage1: {
            duration: '3 notti',
            effects: [
              { key: 'system.abilities.wis.value', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-2' },
              { key: 'system.abilities.int.value', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-2' }
            ],
            description: 'Allucinazioni. -2 Saggezza e Intelligenza'
          },
          stage2: {
            duration: 'permanente',
            effects: [],
            description: 'Follia permanente (tabella follie DMG)'
          }
        },
        transmission: 'Maledizioni, morsi di licantropi',
        cure: {
          natural: { method: 'Impossibile', days: null },
          medical: { method: 'Impossibile', cost: null },
          magical: { method: 'Ristorare superiore o rimuovi maledizione', instant: true }
        }
      },

      morbo_putrescente: {
        name: 'Morbo Putrescente',
        img: 'icons/magic/death/hand-undead-skeleton-fire-green.webp',
        dc: 13,
        incubation: '1 giorno',
        symptoms: {
          stage1: {
            duration: '1d6 giorni',
            effects: [
              { key: 'system.abilities.cha.value', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-4' },
              { key: 'system.traits.dv.value', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: 'vulnerability-necrotic' }
            ],
            description: 'Carne in decomposizione. -4 Carisma, vulnerabilità ai danni necrotici'
          }
        },
        transmission: 'Ferite infette, contatto con non morti',
        cure: {
          natural: { method: 'TS Costituzione CD 13 ogni giorno per 3 giorni', days: 3 },
          medical: { method: 'Medicina CD 15 + unguenti', cost: 25 },
          magical: { method: 'Purificare cibo e bevande sui bendaggi', instant: false }
        }
      },

      scorbuto: {
        name: 'Scorbuto del Marinaio',
        img: 'icons/consumables/food/apple-rotten-brown.webp',
        dc: 11,
        incubation: '2d6 giorni senza frutta',
        symptoms: {
          stage1: {
            duration: 'fino a cura',
            effects: [
              { key: 'system.attributes.hp.max', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-1d6' },
              { key: 'system.attributes.init.bonus', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-2' }
            ],
            description: 'Gengive sanguinanti. -1d6 HP massimi, -2 iniziativa'
          }
        },
        transmission: 'Mancanza di vitamina C',
        cure: {
          natural: { method: 'Mangiare frutta fresca per 3 giorni', days: 3 },
          medical: { method: 'Medicina CD 8 + agrumi', cost: 2 }
        }
      },

      vaiolo_goblin: {
        name: 'Vaiolo dei Malandrini',
        img: 'icons/magic/unholy/orb-beam-pink.webp',
        dc: 12,
        incubation: '1d4 giorni',
        symptoms: {
          stage1: {
            duration: '1 settimana',
            effects: [
              { key: 'system.abilities.cha.value', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-2' },
              { key: 'flags.midi-qol.disadvantage.skill.prc', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: '1' }
            ],
            description: 'Pustole verdi. -2 Carisma, svantaggio Percezione'
          }
        },
        transmission: 'Contatto con goblin o malandrini infetti',
        contagious: true,
        contagionDC: 10,
        cure: {
          natural: { method: 'TS Costituzione CD 12 dopo 7 giorni', days: 7 },
          medical: { method: 'Medicina CD 12', cost: 10 }
        }
      },

      rabbia_selvatica: {
        name: 'Rabbia Selvatica',
        img: 'icons/creatures/abilities/mouth-teeth-sharp-red.webp',
        dc: 14,
        incubation: '2d4 giorni',
        symptoms: {
          stage1: {
            duration: '1d4 giorni',
            effects: [
              { key: 'system.abilities.wis.value', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-1' }
            ],
            description: 'Irritabilità. -1 Saggezza'
          },
          stage2: {
            duration: '2d4 giorni',
            effects: [
              { key: 'system.abilities.wis.value', mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: '-4' },
              { key: 'flags.midi-qol.advantage.attack.mwak', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: '1' }
            ],
            description: 'Furia. -4 Saggezza, vantaggio attacchi in mischia, deve attaccare'
          },
          stage3: {
            duration: 'morte',
            effects: [],
            description: 'Morte in 1d3 giorni'
          }
        },
        transmission: 'Morsi di animali selvatici o licantropi',
        cure: {
          natural: { method: 'Impossibile dopo stage 1', days: null },
          medical: { method: 'Solo prevenzione immediata', cost: 100 },
          magical: { method: 'Ristorare inferiore entro 1 ora dal morso', instant: true }
        }
      }
    };
  }

  static initialize() {
    console.log('Inizializzazione DiseasesSystem...');

    // Registrazione settings
    game.settings.register('brancalonia-bigat', 'enableDiseases', {
      name: 'Sistema Malattie',
      hint: 'Attiva il sistema completo di malattie di Brancalonia',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'diseaseFrequency', {
      name: 'Frequenza Malattie',
      hint: 'Quanto spesso i personaggi sono esposti a malattie',
      scope: 'world',
      config: true,
      type: String,
      choices: {
        low: 'Bassa (5%)',
        medium: 'Media (10%)',
        high: 'Alta (20%)',
        realistic: 'Realistica (30%)'
      },
      default: 'medium'
    });

    game.settings.register('brancalonia-bigat', 'diseaseAutoProgress', {
      name: 'Progressione Automatica',
      hint: 'Le malattie progrediscono automaticamente durante i riposi lunghi',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'diseaseContagion', {
      name: 'Sistema Contagio',
      hint: 'Abilita il contagio automatico tra creature',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Creazione istanza globale
    window.DiseasesSystem = new DiseasesSystem();

    // Registrazione hooks
    DiseasesSystem._registerHooks();

    // Registrazione comandi chat
    DiseasesSystem._registerChatCommands();

    // Creazione macro automatica
    DiseasesSystem._createMacro();

    console.log('DiseasesSystem inizializzato correttamente!');
  }

  static _registerHooks() {
    // Hook per esposizione a malattie
    Hooks.on('updateActor', (actor, update, options, userId) => {
      if (!game.settings.get('brancalonia-bigat', 'enableDiseases')) return;

      if (update.system?.attributes?.hp?.value !== undefined) {
        const hpLoss = (actor.system.attributes.hp.value - update.system.attributes.hp.value);
        if (hpLoss > 10 && Math.random() < 0.1) {
          // 10% possibilità di infezione con ferite gravi
          window.DiseasesSystem._checkDiseaseExposure(actor, 'morbo_putrescente');
        }
      }
    });

    // Hook per riposo lungo e progressione malattia
    Hooks.on('dnd5e.restCompleted', (actor, result) => {
      if (!game.settings.get('brancalonia-bigat', 'enableDiseases')) return;
      if (!game.settings.get('brancalonia-bigat', 'diseaseAutoProgress')) return;

      if (result.longRest) {
        window.DiseasesSystem._progressDiseases(actor);
        window.DiseasesSystem._checkDiseaseRecovery(actor);
      }
    });

    // Hook per contatto con creature infette
    Hooks.on('dnd5e.applyDamage', (actor, damage, options) => {
      if (!game.settings.get('brancalonia-bigat', 'enableDiseases')) return;
      if (!game.settings.get('brancalonia-bigat', 'diseaseContagion')) return;

      if (options.attackerId) {
        const attacker = game.actors.get(options.attackerId);
        if (attacker?.flags?.brancalonia?.diseased) {
          window.DiseasesSystem._checkContagion(actor, attacker);
        }
      }
    });

    // Hook per aggiungere pulsante malattie alle schede personaggio
    Hooks.on('renderActorSheet', (app, html, data) => {
      if (app.actor.type !== 'character' || !game.user.isGM) return;
      if (!game.settings.get('brancalonia-bigat', 'enableDiseases')) return;

      const button = $(`<button class="disease-manager-btn" title="Gestione Malattie">
        <i class="fas fa-virus"></i>
      </button>`);
      html.find('.window-header .window-title').after(button);
      button.click(() => {
        window.DiseasesSystem.renderDiseaseManager(app.actor);
      });
    });

    console.log('DiseasesSystem hooks registrati!');
  }

  static _registerChatCommands() {
    // Registra il handler per i comandi chat
    Hooks.on('chatMessage', async (html, content, msg) => {
      // Verifica se è un comando malattia
      if (!content.startsWith('/malattia-')) return true;

      // Estrai comando e parametri
      const parts = content.split(' ');
      const command = parts[0];
      const parameters = parts.slice(1).join(' ');

      const diseasesSystem = game.brancalonia?.diseases || window.DiseasesSystem;
      if (!diseasesSystem) return true;

      // Comando per infettare attore
      if (command === '/malattia-infetta') {
        if (!game.user.isGM) {
          ui.notifications.error('Solo il GM può infettare i personaggi!');
          return false;
        }

        const tokens = canvas.tokens.controlled;
        if (tokens.length !== 1) {
          ui.notifications.error('Seleziona un solo token!');
          return false;
        }

        const params = parameters.split(' ');
        const diseaseName = params[0];

        if (!diseaseName || !diseasesSystem.diseases[diseaseName]) {
          ui.notifications.error('Malattia non valida! Usa /malattia-lista per vedere le malattie disponibili.');
          return false;
        }

        await diseasesSystem.infectActor(tokens[0].actor, diseaseName);
        return false;
      }

      // Comando per curare malattia
      if (command === '/malattia-cura') {
        if (!game.user.isGM) {
          ui.notifications.error('Solo il GM può curare le malattie!');
          return false;
        }

        const tokens = canvas.tokens.controlled;
        if (tokens.length !== 1) {
          ui.notifications.error('Seleziona un solo token!');
          return false;
        }

        const params = parameters.split(' ');
        const diseaseName = params[0];
        const method = params[1] || 'magical';

        if (!diseaseName) {
          ui.notifications.error('Specifica la malattia da curare!');
          return false;
        }

        await diseasesSystem.cureDisease(tokens[0].actor, diseaseName, method);
        return false;
      }

      // Comando per gestire malattie
      if (command === '/malattia-gestisci') {
        if (!game.user.isGM) {
          ui.notifications.error('Solo il GM può gestire le malattie!');
          return false;
        }

        const tokens = canvas.tokens.controlled;
        if (tokens.length !== 1) {
          ui.notifications.error('Seleziona un solo token!');
          return false;
        }

        diseasesSystem.renderDiseaseManager(tokens[0].actor);
        return false;
      }

      // Comando per epidemia
      if (command === '/malattia-epidemia') {
        if (!game.user.isGM) {
          ui.notifications.error('Solo il GM può generare epidemie!');
          return false;
        }

        const params = parameters.split(' ');
        const diseaseName = params[0] || null;
        const severity = params[1] || 'moderata';

        await diseasesSystem.generateEpidemic({
          diseaseName,
          severity
        });
        return false;
      }

      // Comando per listare malattie
      if (command === '/malattia-lista') {
        const diseases = Object.entries(diseasesSystem.diseases);
        const content = `
          <div class="brancalonia-help">
            <h3>Malattie Disponibili</h3>
            <ul>
              ${diseases.map(([key, disease]) =>
                `<li><strong>${key}</strong>: ${disease.name} (CD ${disease.dc})</li>`
              ).join('')}
            </ul>
            <p><em>Usa /malattia-infetta [nome_malattia] per infettare un personaggio</em></p>
          </div>
        `;

        ChatMessage.create({
          content,
          speaker: { alias: 'Sistema Malattie' },
          whisper: [game.user.id]
        });
        return false;
      }

      // Comando help
      if (command === '/malattia-help') {
        const helpText = `
          <div class="brancalonia-help">
            <h3>Comandi Sistema Malattie</h3>
            <ul>
              <li><strong>/malattia-infetta [malattia]</strong> - Infetta personaggio selezionato</li>
              <li><strong>/malattia-cura [malattia] [metodo]</strong> - Cura malattia (natural/medical/magical)</li>
              <li><strong>/malattia-gestisci</strong> - Apre manager malattie</li>
              <li><strong>/malattia-epidemia [malattia] [severità]</strong> - Genera epidemia</li>
              <li><strong>/malattia-lista</strong> - Lista malattie disponibili</li>
              <li><strong>/malattia-help</strong> - Mostra questo aiuto</li>
            </ul>
            <h4>Metodi di Cura:</h4>
            <p>natural, medical, magical</p>
            <h4>Severità Epidemie:</h4>
            <p>lieve, moderata, grave, devastante</p>
          </div>
        `;

        ChatMessage.create({
          content: helpText,
          speaker: { alias: 'Sistema Malattie' },
          whisper: [game.user.id]
        });
        return false;
      }

      // Se è un comando malattia ma non riconosciuto
      if (content.startsWith('/malattia-')) {
        ui.notifications.warn('Comando malattia non riconosciuto. Usa /malattia-help per aiuto.');
        return false;
      }

      return true;
    });

    console.log('DiseasesSystem comandi chat registrati!');
  }

  static _createMacro() {
    const macroData = {
      name: 'Gestione Malattie',
      type: 'script',
      scope: 'global',
      command: `
// Macro per Gestione Malattie
if (!game.user.isGM) {
  ui.notifications.error("Solo il GM può utilizzare questa macro!");
} else {
  const tokens = canvas.tokens.controlled;

  if (tokens.length === 0) {
    // Nessun token selezionato - mostra opzioni generali
    new Dialog({
      title: "Sistema Malattie",
      content: \`
        <div class="form-group">
          <h3>Opzioni Sistema Malattie</h3>
          <button id="epidemic-btn">Genera Epidemia</button>
          <button id="list-diseases-btn">Lista Malattie</button>
        </div>
      \`,
      buttons: {
        close: { label: "Chiudi" }
      },
      render: html => {
        html.find('#epidemic-btn').click(() => {
          window.DiseasesSystem.generateEpidemic();
        });
        html.find('#list-diseases-btn').click(() => {
          ChatMessage.create({
            content: Object.entries(window.DiseasesSystem.diseases).map(([key, d]) =>
              \`<p><strong>\${key}</strong>: \${d.name}</p>\`
            ).join(''),
            speaker: { alias: "Sistema Malattie" },
            whisper: [game.user.id]
          });
        });
      }
    }).render(true);
  } else if (tokens.length === 1) {
    // Un token selezionato - gestisci malattie
    const actor = tokens[0].actor;
    if (actor.type === "character" || actor.type === "npc") {
      window.DiseasesSystem.renderDiseaseManager(actor);
    } else {
      ui.notifications.error("Seleziona un personaggio o PNG!");
    }
  } else {
    ui.notifications.error("Seleziona un solo token!");
  }
}
      `,
      img: 'icons/magic/unholy/silhouette-evil-horned-red.webp',
      flags: {
        'brancalonia-bigat': {
          isSystemMacro: true,
          version: '1.0'
        }
      }
    };

    // Verifica se la macro esiste già
    const existingMacro = game.macros.find(m => m.name === macroData.name && m.flags['brancalonia-bigat']?.isSystemMacro);

    if (!existingMacro) {
      Macro.create(macroData).then(() => {
        console.log('Macro Gestione Malattie creata!');
      });
    }
  }

  /**
   * Infetta un attore con una malattia
   */
  async infectActor(actor, diseaseName, options = {}) {
    const disease = this.diseases[diseaseName];
    if (!disease) {
      ui.notifications.error(`Malattia ${diseaseName} non trovata!`);
      return;
    }

    // Tiro salvezza per resistere
    if (!options.skipSave) {
      const save = await actor.rollAbilitySave('con', {
        dc: disease.dc,
        flavor: `Resistere a ${disease.name}`
      });

      if (save.total >= disease.dc) {
        ChatMessage.create({
          content: `<div class="brancalonia-disease-save">
            <h3>💪 Resistito alla Malattia!</h3>
            <p><strong>${actor.name}</strong> resiste a ${disease.name}</p>
            <p>Tiro salvezza: ${save.total} vs CD ${disease.dc}</p>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });
        return;
      }
    }

    // Calcola incubazione
    const incubationRoll = disease.incubation === 'immediato' ?
      { total: 0 } :
      await new Roll(disease.incubation).evaluate();

    // Crea flag malattia
    const diseaseData = {
      name: disease.name,
      key: diseaseName,
      stage: 0,
      incubationDays: incubationRoll.total,
      daysProgressed: 0,
      contracted: game.time.worldTime
    };

    // Aggiungi alla lista malattie dell'attore
    const currentDiseases = actor.flags.brancalonia?.diseases || [];
    currentDiseases.push(diseaseData);

    await actor.setFlag('brancalonia-bigat', 'diseases', currentDiseases);

    // Messaggio
    ChatMessage.create({
      content: `<div class="brancalonia-disease-contracted">
        <h3>🦠 Malattia Contratta!</h3>
        <p><strong>${actor.name}</strong> ha contratto ${disease.name}</p>
        <p><em>${disease.transmission}</em></p>
        ${incubationRoll.total > 0 ? `<p>Incubazione: ${incubationRoll.total} giorni</p>` : ''}
      </div>`,
      speaker: ChatMessage.getSpeaker({ actor }),
      whisper: game.user.isGM ? [] : ChatMessage.getWhisperRecipients('GM')
    });

    // Se immediata, applica subito
    if (incubationRoll.total === 0) {
      await this._applyDiseaseStage(actor, diseaseName, 1);
    }
  }

  /**
   * Applica gli effetti di uno stadio della malattia
   */
  async _applyDiseaseStage(actor, diseaseName, stage) {
    const disease = this.diseases[diseaseName];
    const stageKey = `stage${stage}`;
    const stageData = disease.symptoms[stageKey];

    if (!stageData) return;

    // Rimuovi effetti precedenti
    const existingEffect = actor.effects.find(e =>
      e.flags.brancalonia?.diseaseKey === diseaseName
    );
    if (existingEffect) {
      await existingEffect.delete();
    }

    // Se lo stadio è morte
    if (stageData.duration === 'morte') {
      const deathRoll = await new Roll('1d6').evaluate();
      ChatMessage.create({
        content: `<div class="brancalonia-disease-critical">
          <h3>☠️ STADIO TERMINALE!</h3>
          <p><strong>${actor.name}</strong> morirà in ${deathRoll.total} ore senza cure magiche!</p>
          <p>Malattia: ${disease.name} - Stadio ${stage}</p>
        </div>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
      return;
    }

    // Calcola durata
    let duration = {};
    if (stageData.duration !== 'permanente') {
      const durationRoll = await new Roll(stageData.duration).evaluate();
      duration = {
        days: durationRoll.total,
        startTime: game.time.worldTime
      };
    }

    // Crea active effect
    const effectData = {
      name: `${disease.name} - Stadio ${stage}`,
      img: disease.img,
      origin: actor.uuid,
      duration,
      changes: stageData.effects,
      flags: {
        brancalonia: {
          isDisease: true,
          diseaseKey: diseaseName,
          diseaseStage: stage
        }
      },
      description: stageData.description
    };

    await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);

    // Messaggio
    ChatMessage.create({
      content: `<div class="brancalonia-disease-stage">
        <h3>🤒 Progressione Malattia</h3>
        <p><strong>${actor.name}</strong> - ${disease.name}</p>
        <p><strong>Stadio ${stage}:</strong> ${stageData.description}</p>
      </div>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * Progredisce le malattie durante riposo lungo
   */
  async _progressDiseases(actor) {
    const diseases = actor.flags.brancalonia?.diseases || [];

    for (const diseaseData of diseases) {
      diseaseData.daysProgressed++;

      const disease = this.diseases[diseaseData.key];
      if (!disease) continue;

      // Controlla incubazione
      if (diseaseData.stage === 0 && diseaseData.daysProgressed >= diseaseData.incubationDays) {
        diseaseData.stage = 1;
        await this._applyDiseaseStage(actor, diseaseData.key, 1);
      }

      // Progredisci stadio se necessario
      const currentStage = disease.symptoms[`stage${diseaseData.stage}`];
      if (currentStage && currentStage.duration !== 'permanente' && currentStage.duration !== 'morte') {
        const stageDuration = parseInt(currentStage.duration) || 1;
        if (diseaseData.daysProgressed % stageDuration === 0 && diseaseData.stage < 3) {
          diseaseData.stage++;
          await this._applyDiseaseStage(actor, diseaseData.key, diseaseData.stage);
        }
      }
    }

    await actor.setFlag('brancalonia-bigat', 'diseases', diseases);
  }

  /**
   * Controlla recupero naturale da malattie
   */
  async _checkDiseaseRecovery(actor) {
    const diseases = actor.flags.brancalonia?.diseases || [];
    const recovered = [];

    for (let i = diseases.length - 1; i >= 0; i--) {
      const diseaseData = diseases[i];
      const disease = this.diseases[diseaseData.key];

      if (!disease || !disease.cure.natural.method) continue;

      // Tenta recupero naturale
      if (disease.cure.natural.days && diseaseData.daysProgressed >= disease.cure.natural.days) {
        const saveRoll = await actor.rollAbilitySave('con', {
          dc: disease.dc,
          flavor: `Recupero da ${disease.name}`
        });

        if (saveRoll.total >= disease.dc) {
          recovered.push(disease.name);
          diseases.splice(i, 1);

          // Rimuovi effetto
          const effect = actor.effects.find(e =>
            e.flags.brancalonia?.diseaseKey === diseaseData.key
          );
          if (effect) await effect.delete();
        }
      }
    }

    if (recovered.length > 0) {
      await actor.setFlag('brancalonia-bigat', 'diseases', diseases);

      ChatMessage.create({
        content: `<div class="brancalonia-disease-recovery">
          <h3>✨ Guarigione!</h3>
          <p><strong>${actor.name}</strong> si è ripreso da: ${recovered.join(', ')}</p>
        </div>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });
    }
  }

  /**
   * Cura una malattia con metodo specifico
   */
  async cureDisease(actor, diseaseName, method = 'magical') {
    const diseases = actor.flags.brancalonia?.diseases || [];
    const diseaseIndex = diseases.findIndex(d => d.key === diseaseName);

    if (diseaseIndex === -1) {
      ui.notifications.info(`${actor.name} non ha ${diseaseName}`);
      return;
    }

    const disease = this.diseases[diseaseName];
    const cure = disease.cure[method];

    if (!cure) {
      ui.notifications.error(`Metodo di cura ${method} non disponibile`);
      return;
    }

    // Applica costo se necessario
    if (cure.cost) {
      const currentGold = actor.system.currency?.du || 0;
      if (currentGold < cure.cost) {
        ui.notifications.error(`Servono ${cure.cost} ducati per questa cura`);
        return;
      }
      await actor.update({ 'system.currency.du': currentGold - cure.cost });
    }

    // Rimuovi malattia
    diseases.splice(diseaseIndex, 1);
    await actor.setFlag('brancalonia-bigat', 'diseases', diseases);

    // Rimuovi effetto
    const effect = actor.effects.find(e =>
      e.flags.brancalonia?.diseaseKey === diseaseName
    );
    if (effect) await effect.delete();

    ChatMessage.create({
      content: `<div class="brancalonia-disease-cured">
        <h3>💊 Malattia Curata!</h3>
        <p><strong>${actor.name}</strong> è stato curato da ${disease.name}</p>
        <p>Metodo: ${cure.method}</p>
        ${cure.cost ? `<p>Costo: ${cure.cost} ducati</p>` : ''}
      </div>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * Controlla esposizione a malattie ambientali
   */
  async _checkDiseaseExposure(actor, diseaseName = null) {
    if (!game.settings.get('brancalonia-bigat', 'enableDiseases')) return;

    const frequency = game.settings.get('brancalonia-bigat', 'diseaseFrequency');
    const chances = { low: 0.05, medium: 0.1, high: 0.2, realistic: 0.3 };

    if (Math.random() > chances[frequency]) return;

    // Scegli malattia casuale se non specificata
    if (!diseaseName) {
      const diseaseKeys = Object.keys(this.diseases);
      diseaseName = diseaseKeys[Math.floor(Math.random() * diseaseKeys.length)];
    }

    await this.infectActor(actor, diseaseName);
  }

  /**
   * Controlla contagio tra creature
   */
  async _checkContagion(target, source) {
    const sourceDiseases = source.flags.brancalonia?.diseases || [];

    for (const diseaseData of sourceDiseases) {
      const disease = this.diseases[diseaseData.key];
      if (!disease?.contagious) continue;

      const save = await target.rollAbilitySave('con', {
        dc: disease.contagionDC || disease.dc,
        flavor: `Evitare contagio da ${disease.name}`
      });

      if (save.total < (disease.contagionDC || disease.dc)) {
        await this.infectActor(target, diseaseData.key);
      }
    }
  }

  /**
   * Genera epidemia casuale (per GM)
   */
  async generateEpidemic(options = {}) {
    const {
      diseaseName = null,
      radius = 'città',
      severity = 'moderata'
    } = options;

    // Scegli malattia
    const disease = diseaseName ?
      this.diseases[diseaseName] :
      this.diseases[Object.keys(this.diseases)[Math.floor(Math.random() * Object.keys(this.diseases).length)]];

    const severityModifiers = {
      lieve: 0.1,
      moderata: 0.3,
      grave: 0.5,
      devastante: 0.8
    };

    // Infetta PNG casuali
    const npcs = game.actors.filter(a => a.type === 'npc');
    const infectionRate = severityModifiers[severity];

    for (const npc of npcs) {
      if (Math.random() < infectionRate) {
        await npc.setFlag('brancalonia-bigat', 'diseased', true);
        await npc.setFlag('brancalonia-bigat', 'diseases', [{
          key: Object.keys(this.diseases).find(k => this.diseases[k] === disease),
          stage: Math.floor(Math.random() * 3) + 1
        }]);
      }
    }

    ChatMessage.create({
      content: `<div class="brancalonia-epidemic">
        <h2>⚠️ EPIDEMIA!</h2>
        <p>Un'epidemia di <strong>${disease.name}</strong> si sta diffondendo!</p>
        <p>Severità: ${severity}</p>
        <p>Area: ${radius}</p>
        <p>${Math.floor(npcs.length * infectionRate)} PNG infettati</p>
      </div>`,
      whisper: ChatMessage.getWhisperRecipients('GM')
    });
  }

  /**
   * UI per gestione malattie
   */
  renderDiseaseManager(actor) {
    const diseases = actor.flags.brancalonia?.diseases || [];

    const content = `
      <div class="brancalonia-diseases">
        <h2>🦠 Malattie di ${actor.name}</h2>
        ${diseases.length === 0 ? '<p>Nessuna malattia</p>' : ''}
        ${diseases.map(d => {
    const disease = this.diseases[d.key];
    return `
            <div class="disease-entry">
              <h3>${disease.name} - Stadio ${d.stage}</h3>
              <p>Giorni di malattia: ${d.daysProgressed}</p>
              <button class="cure-disease" data-disease="${d.key}">Cura</button>
            </div>
          `;
  }).join('')}
        <hr>
        <h3>Infetta con:</h3>
        <select id="disease-select">
          ${Object.entries(this.diseases).map(([key, disease]) =>
    `<option value="${key}">${disease.name}</option>`
  ).join('')}
        </select>
        <button id="infect-actor">Infetta</button>
      </div>
    `;

    const dialog = new Dialog({
      title: 'Gestione Malattie',
      content,
      buttons: {
        close: { label: 'Chiudi' }
      },
      render: html => {
        html.find('#infect-actor').click(() => {
          const diseaseName = html.find('#disease-select').val();
          this.infectActor(actor, diseaseName);
          dialog.close();
        });

        html.find('.cure-disease').click(ev => {
          const diseaseName = ev.currentTarget.dataset.disease;
          this.showCureDialog(actor, diseaseName);
        });
      }
    });

    dialog.render(true);
  }

  /**
   * Dialog per curare malattia
   */
  showCureDialog(actor, diseaseName) {
    const disease = this.diseases[diseaseName];

    const content = `
      <div class="brancalonia-cure-disease">
        <h3>Cura ${disease.name}</h3>
        <p>Scegli metodo di cura:</p>
        ${Object.entries(disease.cure).map(([key, cure]) => `
          <div class="cure-method">
            <input type="radio" name="cure-method" value="${key}" id="cure-${key}">
            <label for="cure-${key}">
              <strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
              ${cure.method}
              ${cure.cost ? `(${cure.cost} ducati)` : ''}
              ${cure.days ? `(${cure.days} giorni)` : ''}
            </label>
          </div>
        `).join('')}
      </div>
    `;

    new Dialog({
      title: 'Metodo di Cura',
      content,
      buttons: {
        cure: {
          label: 'Cura',
          callback: html => {
            const method = html.find('input[name="cure-method"]:checked').val();
            if (method) {
              this.cureDisease(actor, diseaseName, method);
            }
          }
        },
        cancel: { label: 'Annulla' }
      }
    }).render(true);
  }
}