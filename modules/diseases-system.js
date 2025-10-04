/**
 * @fileoverview Sistema Malattie per Brancalonia
 *
 * Implementazione completa delle malattie secondo il manuale di Brancalonia.
 * Sistema multi-stadio con progressione automatica, contagio, e cure.
 *
 * Features:
 * - 8 malattie con database completo
 * - Sistema multi-stadio (1-3 per malattia)
 * - Active Effects per ogni stadio
 * - Sistema contagio (alcune malattie)
 * - 3 metodi cura (natural, medical, magical)
 * - Auto-progression su long rest
 * - Chat commands (/malattia-*)
 * - Dialog UI per infezione/cura
 * - Macro automatica
 * - Settings (4 impostazioni)
 * - Integration con Active Effects
 *
 * @version 3.0.0
 * @author Brancalonia Module Team
 * @requires brancalonia-logger.js
 * @requires dnd5e
 */

import { logger } from './brancalonia-logger.js';

/**
 * @typedef {Object} DiseaseStatistics
 * @property {number} initTime - Tempo inizializzazione (ms)
 * @property {number} infectionsTotal - Infezioni totali
 * @property {Object<string, number>} infectionsByDisease - Infezioni per malattia
 * @property {number} curesTotal - Cure totali
 * @property {Object<string, number>} curesByMethod - Cure per metodo
 * @property {Object<string, number>} deathsByDisease - Morti per malattia
 * @property {number} activeInfections - Infezioni attive correnti
 * @property {number} contagionsTriggered - Contagi attivati
 * @property {number} stageProgressions - Progressioni stadio
 * @property {number} naturalRecoveries - Guarigioni naturali
 * @property {number} epidemicsGenerated - Epidemie generate
 * @property {number} dialogsOpened - Dialog aperti
 * @property {number} chatCommandsExecuted - Comandi chat eseguiti
 * @property {string[]} errors - Errori registrati
 */

/**
 * Sistema Malattie per Brancalonia
 * Gestisce infezioni, progressione, cure e contagio
 *
 * @class DiseasesSystem
 */
class DiseasesSystem {
  static VERSION = '3.0.0';
  static MODULE_NAME = 'DiseasesSystem';
  static ID = 'diseases-system';

  /**
   * Statistiche del modulo
   * @type {DiseaseStatistics}
   * @private
   * @static
   */
  static _statistics = {
    initTime: 0,
    infectionsTotal: 0,
    infectionsByDisease: {},
    curesTotal: 0,
    curesByMethod: {},
    deathsByDisease: {},
    activeInfections: 0,
    contagionsTriggered: 0,
    stageProgressions: 0,
    naturalRecoveries: 0,
    epidemicsGenerated: 0,
    dialogsOpened: 0,
    chatCommandsExecuted: 0,
    errors: []
  };

  /**
   * Stato del modulo
   * @type {Object}
   * @private
   * @static
   */
  static _state = {
    initialized: false,
    instance: null
  };

  constructor() {
    try {
      // Inizializza contatori per tipo malattia
      Object.keys(this.diseases).forEach(disease => {
        DiseasesSystem._statistics.infectionsByDisease[disease] = 0;
        DiseasesSystem._statistics.deathsByDisease[disease] = 0;
      });

      // Inizializza metodi cura
      DiseasesSystem._statistics.curesByMethod = {
        natural: 0,
        medical: 0,
        magical: 0
      };
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`Constructor: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore inizializzazione constructor', error);
    }

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
    const startTime = performance.now();

    try {
      logger.info(this.MODULE_NAME, `Inizializzazione Diseases System v${this.VERSION}`);

      // Creazione istanza
      this._state.instance = new DiseasesSystem();

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

      // Esporta la classe per compatibilità con il sistema di inizializzazione
      window.DiseasesSystemClass = DiseasesSystem;

      // Creazione istanza globale
      window.DiseasesSystem = new DiseasesSystem();
      if (!game.brancalonia) game.brancalonia = {};
      if (!game.brancalonia.modules) game.brancalonia.modules = {};
      game.brancalonia.diseasesSystem = window.DiseasesSystem;
      game.brancalonia.modules['diseases-system'] = window.DiseasesSystem;

      // Registrazione hooks
      DiseasesSystem._registerHooks();

      // Registrazione comandi chat
      DiseasesSystem._registerChatCommands();

      // Creazione macro automatica
      DiseasesSystem._createMacro();

      this._state.initialized = true;
      this._statistics.initTime = performance.now() - startTime;

      logger.info(
        this.MODULE_NAME,
        `✅ Inizializzazione completata in ${this._statistics.initTime.toFixed(2)}ms`
      );

      // Emit event
      Hooks.callAll('diseases:initialized', {
        version: this.VERSION,
        diseasesCount: Object.keys(this._state.instance.diseases).length,
        settings: 4
      });
    } catch (error) {
      this._statistics.errors.push(error.message);
      logger.error(this.MODULE_NAME, 'Errore durante inizializzazione', error);
      throw error;
    }
  }

  static _registerHooks() {
    try {
      // Hook per esposizione a malattie
      Hooks.on('updateActor', (actor, update, options, userId) => {
        try {
          if (!game.settings.get('brancalonia-bigat', 'enableDiseases')) return;

          if (update.system?.attributes?.hp?.value !== undefined) {
            const hpLoss = (actor.system.attributes.hp.value - update.system.attributes.hp.value);
            if (hpLoss > 10 && Math.random() < 0.1) {
              // 10% possibilità di infezione con ferite gravi
              window.DiseasesSystem._checkDiseaseExposure(actor, 'morbo_putrescente');
            }
          }
        } catch (error) {
          this._statistics.errors.push(`updateActor hook: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore in updateActor hook', error);
        }
      });

      // Hook per riposo lungo e progressione malattia
      Hooks.on('dnd5e.restCompleted', (actor, result) => {
        try {
          if (!game.settings.get('brancalonia-bigat', 'enableDiseases')) return;
          if (!game.settings.get('brancalonia-bigat', 'diseaseAutoProgress')) return;

          if (result.longRest) {
            window.DiseasesSystem._progressDiseases(actor);
            window.DiseasesSystem._checkDiseaseRecovery(actor);
          }
        } catch (error) {
          this._statistics.errors.push(`restCompleted hook: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore in restCompleted hook', error);
        }
      });

      // Hook per contatto con creature infette
      Hooks.on('dnd5e.applyDamage', (actor, damage, options) => {
        try {
          if (!game.settings.get('brancalonia-bigat', 'enableDiseases')) return;
          if (!game.settings.get('brancalonia-bigat', 'diseaseContagion')) return;

          if (options.attackerId) {
            const attacker = game.actors.get(options.attackerId);
            if (attacker?.flags?.brancalonia?.diseased) {
              window.DiseasesSystem._checkContagion(actor, attacker);
            }
          }
        } catch (error) {
          this._statistics.errors.push(`applyDamage hook: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore in applyDamage hook', error);
        }
      });

      // Hook per aggiungere pulsante malattie alle schede personaggio
      Hooks.on('renderActorSheet', (app, html, data) => {
        try {
          if (app.actor.type !== 'character' || !game.user.isGM) return;
          if (!game.settings.get('brancalonia-bigat', 'enableDiseases')) return;

          // Vanilla JS fallback per jQuery
          const element = html instanceof jQuery ? html[0] : html;
          const windowTitle = element.querySelector('.window-header .window-title');

          if (windowTitle) {
            const button = document.createElement('button');
            button.className = 'disease-manager-btn';
            button.title = 'Gestione Malattie';
            button.innerHTML = '<i class="fas fa-virus"></i>';
            button.addEventListener('click', () => {
              window.DiseasesSystem.renderDiseaseManager(app.actor);
            });
            windowTitle.insertAdjacentElement('afterend', button);
          }
        } catch (error) {
          this._statistics.errors.push(`renderActorSheet hook: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore in renderActorSheet hook', error);
        }
      });

      logger.debug?.(this.MODULE_NAME, '4 hooks registrati');
    } catch (error) {
      this._statistics.errors.push(`Hook registration: ${error.message}`);
      logger.error(this.MODULE_NAME, 'Errore registrazione hooks', error);
      throw error;
    }
  }

  static _registerChatCommands() {
    try {
      // Registra il handler per i comandi chat
      Hooks.on('chatMessage', async (html, content, msg) => {
        try {
          // Verifica se è un comando malattia
          if (!content.startsWith('/malattia-')) return true;

          this._statistics.chatCommandsExecuted++;

      // Estrai comando e parametri
      const parts = content.split(' ');
      const command = parts[0];
      const parameters = parts.slice(1).join(' ');

      const diseasesSystem = game.brancalonia?.diseases || window.DiseasesSystem;
      if (!diseasesSystem) return true;

          // Comando per infettare attore
          if (command === '/malattia-infetta') {
            try {
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
            } catch (error) {
              this._statistics.errors.push(`Chat command infetta: ${error.message}`);
              logger.error(this.MODULE_NAME, 'Errore comando infetta', error);
              ui.notifications.error('Errore nell\'infettare il personaggio!');
              return false;
            }
          }

          // Comando per curare malattia
          if (command === '/malattia-cura') {
            try {
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
            } catch (error) {
              this._statistics.errors.push(`Chat command cura: ${error.message}`);
              logger.error(this.MODULE_NAME, 'Errore comando cura', error);
              ui.notifications.error('Errore nella cura della malattia!');
              return false;
            }
          }

          // Comando per gestire malattie
          if (command === '/malattia-gestisci') {
            try {
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
            } catch (error) {
              this._statistics.errors.push(`Chat command gestisci: ${error.message}`);
              logger.error(this.MODULE_NAME, 'Errore comando gestisci', error);
              ui.notifications.error('Errore nella gestione delle malattie!');
              return false;
            }
          }

          // Comando per epidemia
          if (command === '/malattia-epidemia') {
            try {
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
            } catch (error) {
              this._statistics.errors.push(`Chat command epidemia: ${error.message}`);
              logger.error(this.MODULE_NAME, 'Errore comando epidemia', error);
              ui.notifications.error('Errore nella generazione dell\'epidemia!');
              return false;
            }
          }

          // Comando per listare malattie
          if (command === '/malattia-lista') {
            try {
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
            } catch (error) {
              this._statistics.errors.push(`Chat command lista: ${error.message}`);
              logger.error(this.MODULE_NAME, 'Errore comando lista', error);
              ui.notifications.error('Errore nella visualizzazione delle malattie!');
              return false;
            }
          }

          // Comando help
          if (command === '/malattia-help') {
            try {
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
            } catch (error) {
              this._statistics.errors.push(`Chat command help: ${error.message}`);
              logger.error(this.MODULE_NAME, 'Errore comando help', error);
              ui.notifications.error('Errore nella visualizzazione dell\'aiuto!');
              return false;
            }
          }

          // Se è un comando malattia ma non riconosciuto
          if (content.startsWith('/malattia-')) {
            ui.notifications.warn('Comando malattia non riconosciuto. Usa /malattia-help per aiuto.');
            return false;
          }

          return true;
        } catch (error) {
          this._statistics.errors.push(`Chat message handler: ${error.message}`);
          logger.error(this.MODULE_NAME, 'Errore handler messaggi chat', error);
          return true;
        }
      });

      logger.debug?.(this.MODULE_NAME, '6 comandi chat registrati');
    } catch (error) {
      this._statistics.errors.push(`Chat commands registration: ${error.message}`);
      logger.error(this.MODULE_NAME, 'Errore registrazione comandi chat', error);
      throw error;
    }
  }

  static _createMacro() {
    try {
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
    new foundry.appv1.sheets.Dialog({
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
      const existingMacro = game?.macros?.find(m => m.name === macroData.name && m.flags['brancalonia-bigat']?.isSystemMacro);

      if (!existingMacro) {
        Macro.create(macroData).then(() => {
          this._statistics.macrosCreated++;
          logger.info(this.MODULE_NAME, 'Macro Gestione Malattie creata');
        }).catch(error => {
          this._statistics.errors.push(`Macro creation: ${error.message}`);
          logger.warn(this.MODULE_NAME, 'Errore creazione macro', error);
        });
      }
    } catch (error) {
      this._statistics.errors.push(`_createMacro: ${error.message}`);
      logger.error(this.MODULE_NAME, 'Errore in _createMacro', error);
    }
  }

  /**
   * Infetta un attore con una malattia
   * @async
   * @param {Actor} actor - Attore da infettare
   * @param {string} diseaseName - Nome malattia
   * @param {Object} options - Opzioni (skipSave, guaranteedInfection)
   * @returns {Promise<void>}
   *
   * @example
   * await diseasesSystem.infectActor(actor, 'febbre_palustre');
   */
  async infectActor(actor, diseaseName, options = {}) {
    const startTime = performance.now();

    try {
      const disease = this.diseases[diseaseName];
      if (!disease) {
        ui.notifications.error(`Malattia ${diseaseName} non trovata!`);
        logger.warn(DiseasesSystem.MODULE_NAME, `Malattia non valida: ${diseaseName}`);
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

      // Aggiorna statistiche
      DiseasesSystem._statistics.infectionsTotal++;
      DiseasesSystem._statistics.infectionsByDisease[diseaseName]++;
      DiseasesSystem._statistics.activeInfections++;

      const infectionTime = performance.now() - startTime;
      logger.info(
        DiseasesSystem.MODULE_NAME,
        `Infezione ${disease.name} applicata a ${actor.name} (${infectionTime.toFixed(2)}ms)`
      );

      // Emit event
      Hooks.callAll('diseases:infection-contracted', {
        actor,
        disease,
        incubationDays: incubationRoll.total,
        infectionsTotal: DiseasesSystem._statistics.infectionsTotal
      });
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`infectActor: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore infezione attore', error);
      ui.notifications.error('Errore nell\'infettare il personaggio!');
    }
  }

  /**
   * Applica gli effetti di uno stadio della malattia
   * @async
   * @param {Actor} actor - Attore da infettare
   * @param {string} diseaseName - Nome malattia
   * @param {number} stage - Stadio da applicare
   * @returns {Promise<void>}
   */
  async _applyDiseaseStage(actor, diseaseName, stage) {
    const stageStart = performance.now();

    try {
      const disease = this.diseases[diseaseName];
      const stageKey = `stage${stage}`;
      const stageData = disease.symptoms[stageKey];

      if (!stageData) {
        logger.warn(DiseasesSystem.MODULE_NAME, `Stadio ${stage} non trovato per ${diseaseName}`);
        return;
      }

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

      // Aggiorna statistiche morti
      DiseasesSystem._statistics.deathsByDisease[diseaseName]++;

      // Emit event morte imminente
      Hooks.callAll('diseases:death-imminent', {
        actor,
        disease,
        hoursRemaining: deathRoll.total,
        deathsByDisease: DiseasesSystem._statistics.deathsByDisease
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

      // Aggiorna statistiche
      DiseasesSystem._statistics.stageProgressions++;

      const applyTime = performance.now() - stageStart;
      logger.debug?.(DiseasesSystem.MODULE_NAME, `Stadio ${stage} ${disease.name} applicato a ${actor.name} (${applyTime.toFixed(2)}ms)`);

      // Emit event
      Hooks.callAll('diseases:stage-progressed', {
        actor,
        disease,
        oldStage: stage - 1,
        newStage: stage
      });
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`_applyDiseaseStage: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore applicazione stadio malattia', error);
      ui.notifications.error('Errore nella progressione della malattia!');
    }
  }

  /**
   * Progredisce le malattie durante riposo lungo
   * @async
   * @param {Actor} actor - Attore da controllare
   * @returns {Promise<void>}
   */
  async _progressDiseases(actor) {
    try {
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
      logger.debug?.(DiseasesSystem.MODULE_NAME, `Progressione completata per ${actor.name}`);
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`_progressDiseases: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore progressione malattie', error);
    }
  }

  /**
   * Controlla recupero naturale da malattie
   * @async
   * @param {Actor} actor - Attore da controllare
   * @returns {Promise<void>}
   */
  async _checkDiseaseRecovery(actor) {
    try {
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

            // Aggiorna statistiche
            DiseasesSystem._statistics.naturalRecoveries++;
            DiseasesSystem._statistics.activeInfections--;
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

        logger.info(
          DiseasesSystem.MODULE_NAME,
          `Guarigione naturale: ${actor.name} da ${recovered.join(', ')}`
        );

        // Emit event
        Hooks.callAll('diseases:natural-recovery', {
          actor,
          recovered,
          naturalRecoveries: DiseasesSystem._statistics.naturalRecoveries
        });
      }
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`_checkDiseaseRecovery: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore controllo guarigione', error);
    }
  }

  /**
   * Cura una malattia con metodo specifico
   * @async
   * @param {Actor} actor - Attore da curare
   * @param {string} diseaseName - Nome malattia
   * @param {string} method - Metodo cura (natural, medical, magical)
   * @returns {Promise<boolean>} True se curata con successo
   */
  async cureDisease(actor, diseaseName, method = 'magical') {
    const cureStart = performance.now();

    try {
      const diseases = actor.flags.brancalonia?.diseases || [];
      const diseaseIndex = diseases.findIndex(d => d.key === diseaseName);

      if (diseaseIndex === -1) {
        ui.notifications.info(`${actor.name} non ha ${diseaseName}`);
        logger.warn(DiseasesSystem.MODULE_NAME, `Tentativo cura malattia non presente: ${diseaseName}`);
        return false;
      }

      const disease = this.diseases[diseaseName];
      const cure = disease.cure[method];

      if (!cure) {
        ui.notifications.error(`Metodo di cura ${method} non disponibile`);
        logger.warn(DiseasesSystem.MODULE_NAME, `Metodo cura non valido: ${method} per ${diseaseName}`);
        return false;
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

      // Aggiorna statistiche
      DiseasesSystem._statistics.curesTotal++;
      DiseasesSystem._statistics.curesByMethod[method]++;
      DiseasesSystem._statistics.activeInfections--;

      const cureTime = performance.now() - cureStart;
      logger.info(
        DiseasesSystem.MODULE_NAME,
        `Malattia ${disease.name} curata da ${actor.name} (${method}) (${cureTime.toFixed(2)}ms)`
      );

      // Emit event
      Hooks.callAll('diseases:infection-cured', {
        actor,
        disease,
        method,
        curesTotal: DiseasesSystem._statistics.curesTotal
      });

      return true;
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`cureDisease: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore cura malattia', error);
      ui.notifications.error('Errore nella cura della malattia!');
      return false;
    }
  }

  /**
   * Controlla esposizione a malattie ambientali
   * @async
   * @param {Actor} actor - Attore da controllare
   * @param {string} diseaseName - Nome malattia (opzionale)
   * @returns {Promise<void>}
   */
  async _checkDiseaseExposure(actor, diseaseName = null) {
    try {
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

      logger.debug?.(DiseasesSystem.MODULE_NAME, `Esposizione malattia: ${diseaseName} per ${actor.name}`);
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`_checkDiseaseExposure: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore controllo esposizione', error);
    }
  }

  /**
   * Controlla contagio tra creature
   * @async
   * @param {Actor} target - Attore bersaglio
   * @param {Actor} source - Attore infetto
   * @returns {Promise<void>}
   */
  async _checkContagion(target, source) {
    try {
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

          // Aggiorna statistiche contagio
          DiseasesSystem._statistics.contagionsTriggered++;

          logger.info(
            DiseasesSystem.MODULE_NAME,
            `Contagio: ${target.name} infettato da ${source.name} con ${disease.name}`
          );

          // Emit event
          Hooks.callAll('diseases:contagion-triggered', {
            target,
            source,
            disease,
            success: true
          });
        } else {
          // Emit event anche per fallimento contagio
          Hooks.callAll('diseases:contagion-triggered', {
            target,
            source,
            disease,
            success: false
          });
        }
      }
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`_checkContagion: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore controllo contagio', error);
    }
  }

  /**
   * Genera epidemia casuale (per GM)
   * @async
   * @param {Object} options - Opzioni epidemia
   * @param {string} options.diseaseName - Nome malattia specifica
   * @param {string} options.radius - Raggio epidemia ('città', 'quartiere', numero)
   * @param {string} options.severity - Severità ('lieve', 'moderata', 'grave', 'devastante')
   * @returns {Promise<void>}
   */
  async generateEpidemic(options = {}) {
    const epidemicStart = performance.now();

    try {
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

      // Aggiorna statistiche
      DiseasesSystem._statistics.epidemicsGenerated++;

      const epidemicTime = performance.now() - epidemicStart;
      logger.info(
        DiseasesSystem.MODULE_NAME,
        `Epidemia generata: ${disease.name} (${severity}, ${epidemicTime.toFixed(2)}ms)`
      );

      // Emit event
      Hooks.callAll('diseases:epidemic-started', {
        disease,
        severity,
        radius,
        affectedActors: Math.floor(npcs.length * infectionRate),
        epidemicsGenerated: DiseasesSystem._statistics.epidemicsGenerated
      });
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`generateEpidemic: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore generazione epidemia', error);
      ui.notifications.error('Errore nella generazione dell\'epidemia!');
    }
  }

  /**
   * UI per gestione malattie
   * @param {Actor} actor - Attore da gestire
   * @returns {void}
   */
  renderDiseaseManager(actor) {
    try {
      DiseasesSystem._statistics.dialogsOpened++;

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

    const dialog = new foundry.appv1.sheets.Dialog({
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

      logger.debug?.(DiseasesSystem.MODULE_NAME, `Dialog gestione aperto per ${actor.name}`);

      // Emit event
      Hooks.callAll('diseases:dialog-opened', {
        actor,
        dialogType: 'disease-manager',
        dialogsOpened: DiseasesSystem._statistics.dialogsOpened
      });
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`renderDiseaseManager: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore apertura dialog gestione', error);
      ui.notifications.error('Errore nell\'apertura del dialog di gestione!');
    }
  }

  /**
   * Dialog per curare malattia
   * @param {Actor} actor - Attore da curare
   * @param {string} diseaseName - Nome malattia
   * @returns {void}
   */
  showCureDialog(actor, diseaseName) {
    try {
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

    new foundry.appv1.sheets.Dialog({
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

      logger.debug?.(DiseasesSystem.MODULE_NAME, `Dialog cura aperto per ${disease.name} di ${actor.name}`);

      // Emit event
      Hooks.callAll('diseases:dialog-opened', {
        actor,
        dialogType: 'cure-dialog',
        disease,
        dialogsOpened: DiseasesSystem._statistics.dialogsOpened
      });
    } catch (error) {
      DiseasesSystem._statistics.errors.push(`showCureDialog: ${error.message}`);
      logger.error(DiseasesSystem.MODULE_NAME, 'Errore apertura dialog cura', error);
      ui.notifications.error('Errore nell\'apertura del dialog di cura!');
    }
  }
}

// ================================================
// PUBLIC API
// ================================================

/**
 * Ottiene lo stato del modulo
 * @static
 * @returns {Object} Stato corrente
 * @example
 * const status = DiseasesSystem.getStatus();
 */
DiseasesSystem.getStatus = function() {
  return {
    version: this.VERSION,
    initialized: this._state.initialized,
    enabled: game.settings.get('brancalonia-bigat', 'enableDiseases'),
    autoProgress: game.settings.get('brancalonia-bigat', 'diseaseAutoProgress'),
    contagion: game.settings.get('brancalonia-bigat', 'diseaseContagion'),
    diseasesCount: Object.keys(this._state.instance?.diseases || {}).length,
    activeInfections: this._statistics.activeInfections
  };
};

/**
 * Ottiene le statistiche del modulo
 * @static
 * @returns {DiseaseStatistics} Statistiche correnti
 * @example
 * const stats = DiseasesSystem.getStatistics();
 */
DiseasesSystem.getStatistics = function() {
  return {
    ...this._statistics,
    infectionsByDisease: { ...this._statistics.infectionsByDisease },
    deathsByDisease: { ...this._statistics.deathsByDisease },
    errors: [...this._statistics.errors]
  };
};

/**
 * Resetta le statistiche
 * @static
 * @example
 * DiseasesSystem.resetStatistics();
 */
DiseasesSystem.resetStatistics = function() {
  logger.info(this.MODULE_NAME, 'Reset statistiche Diseases System');

  const initTime = this._statistics.initTime;
  const macrosCreated = this._statistics.macrosCreated;
  const epidemicsGenerated = this._statistics.epidemicsGenerated;

  this._statistics = {
    initTime,
    infectionsTotal: 0,
    infectionsByDisease: {},
    curesTotal: 0,
    curesByMethod: {},
    deathsByDisease: {},
    activeInfections: 0,
    contagionsTriggered: 0,
    stageProgressions: 0,
    naturalRecoveries: 0,
    epidemicsGenerated,
    macrosCreated,
    dialogsOpened: 0,
    chatCommandsExecuted: 0,
    errors: []
  };

  // Re-inizializza counters per malattia
  if (this._state.instance) {
    Object.keys(this._state.instance.diseases).forEach(disease => {
      this._statistics.infectionsByDisease[disease] = 0;
      this._statistics.deathsByDisease[disease] = 0;
    });
  }
};

/**
 * Ottiene lista malattie disponibili
 * @static
 * @returns {Object} Database malattie
 * @example
 * const diseases = DiseasesSystem.getDiseasesList();
 */
DiseasesSystem.getDiseasesList = function() {
  return this._state.instance?.diseases || {};
};

/**
 * Ottiene infezioni attive di un attore
 * @static
 * @param {Actor} actor - Attore da controllare
 * @returns {Array} Infezioni attive
 * @example
 * const infections = DiseasesSystem.getActiveInfections(actor);
 */
DiseasesSystem.getActiveInfections = function(actor) {
  return actor?.flags?.brancalonia?.diseases || [];
};

/**
 * Infetta attore via API statica
 * @static
 * @async
 * @param {Actor} actor - Attore da infettare
 * @param {string} disease - Nome malattia
 * @param {Object} options - Opzioni
 * @returns {Promise<void>}
 * @example
 * await DiseasesSystem.infectActorViaAPI(actor, 'febbre_palustre');
 */
DiseasesSystem.infectActorViaAPI = async function(actor, disease, options) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return;
  }
  await this._state.instance.infectActor(actor, disease, options);
};

/**
 * Cura attore via API statica
 * @static
 * @async
 * @param {Actor} actor - Attore da curare
 * @param {string} disease - Nome malattia
 * @param {string} method - Metodo cura
 * @returns {Promise<boolean>}
 * @example
 * await DiseasesSystem.cureActorViaAPI(actor, 'febbre_palustre', 'magical');
 */
DiseasesSystem.cureActorViaAPI = async function(actor, disease, method) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return false;
  }
  return await this._state.instance.cureDisease(actor, disease, method);
};

/**
 * Controlla contagio via API statica
 * @static
 * @async
 * @param {Actor} target - Attore bersaglio
 * @param {Actor} source - Attore infetto
 * @returns {Promise<void>}
 * @example
 * await DiseasesSystem.checkContagionViaAPI(targetActor, sourceActor);
 */
DiseasesSystem.checkContagionViaAPI = async function(target, source) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return;
  }
  await this._state.instance._checkContagion(target, source);
};

/**
 * Genera epidemia via API statica
 * @static
 * @async
 * @param {Object} options - Opzioni epidemia
 * @returns {Promise<void>}
 * @example
 * await DiseasesSystem.generateEpidemicViaAPI({disease: 'peste_nera', severity: 'grave'});
 */
DiseasesSystem.generateEpidemicViaAPI = async function(options) {
  if (!this._state.instance) {
    logger.error(this.MODULE_NAME, 'Istanza non inizializzata');
    return;
  }
  await this._state.instance.generateEpidemic(options);
};

/**
 * Mostra report completo
 * @static
 * @example
 * DiseasesSystem.showReport();
 */
DiseasesSystem.showReport = function() {
  const stats = this.getStatistics();
  const status = this.getStatus();

  console.group(`📊 ${this.MODULE_NAME} Report v${this.VERSION}`);
  console.log('Status:', status);
  console.log('Statistiche:', stats);
  console.groupEnd();

  ui.notifications.info(
    `📊 Report Diseases: ${stats.infectionsTotal} infezioni, ${stats.curesTotal} cure`
  );
};

// Export ES6
export default DiseasesSystem;
export { DiseasesSystem };