/**
 * Macro User-Friendly per TavernBrawlSystem
 * Semplifica la gestione delle risse con Dialog visuali
 * 
 * @module TavernBrawlMacros
 * @version 2.0.0
 * @author Brancalonia BIGAT Team
 */

import { logger } from './brancalonia-logger.js';

class TavernBrawlMacros {
  static VERSION = '2.0.0';
  static MODULE_NAME = 'Tavern Brawl Macros';
  static ID = 'brancalonia-bigat';

  // Statistics tracking (enterprise-grade)
  static statistics = {
    dialogsShown: 0,
    macrosCreated: 0,
    actionsExecuted: 0,
    errors: []
  };

  // Internal state management
  static _state = {
    initialized: false,
    macrosRegistered: false
  };
  /**
   * Macro principale - Gestione Rissa con Dialog
   * @static
   * @returns {Promise<void>}
   */
  static async macroGestioneRissa() {
    try {
      const system = window.TavernBrawlSystem;
      if (!system) {
        logger.warn(this.MODULE_NAME, 'Sistema Risse non disponibile');
        ui.notifications.error('Sistema Risse non disponibile!');
        return;
      }

      this.statistics.actionsExecuted++;

      // Se c'è una rissa attiva, mostra opzioni rissa
      if (system.activeBrawl) {
        return this.dialogRissaAttiva();
      }

      // Altrimenti mostra dialog per iniziare
      return this.dialogIniziaRissa();
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'macroGestioneRissa', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore macro gestione rissa', error);
      ui.notifications.error('Errore nella gestione della rissa');
    }
  }

  /**
   * Dialog per iniziare una nuova rissa
   * @static
   * @returns {Promise<void>}
   */
  static async dialogIniziaRissa() {
    try {
      const tokens = canvas.tokens.controlled;
      if (tokens.length < 2) {
        logger.debug?.(this.MODULE_NAME, `Tentativo inizia rissa con ${tokens.length} token (minimo 2)`);
        ui.notifications.warn('Seleziona almeno 2 token per iniziare una rissa!');
        return;
      }

      this.statistics.dialogsShown++;
      logger.debug?.(this.MODULE_NAME, `Dialog inizia rissa mostrato per ${tokens.length} token`);

    new Dialog({
      title: '🍺 Inizia Rissa da Taverna',
      content: `
        <div style="padding: 10px;">
          <h3 style="border-bottom: 2px solid #8b4513; margin-bottom: 10px;">
            Partecipanti Selezionati
          </h3>
          <ul style="list-style: none; padding-left: 0;">
            ${tokens.map(t => `
              <li style="padding: 5px; background: #f4e4bc; margin: 3px 0; border-radius: 3px;">
                <strong>${t.name}</strong> (Livello ${t.actor.system.details.level || 1})
              </li>
            `).join('')}
          </ul>
          
          <h3 style="border-bottom: 2px solid #8b4513; margin-top: 15px; margin-bottom: 10px;">
            Opzioni Rissa
          </h3>
          <div class="form-group">
            <label style="font-weight: bold;">
              <input type="checkbox" name="pericoliVaganti" checked/>
              Attiva Pericoli Vaganti
            </label>
            <p style="font-size: 0.9em; margin: 5px 0 0 25px; font-style: italic;">
              Eventi meccanici casuali che colpiscono tutti i partecipanti
            </p>
          </div>
          
          <div class="form-group" style="margin-top: 10px;">
            <label style="font-weight: bold;">
              <input type="checkbox" name="eventiAtmosfera" checked/>
              Abilita Eventi Atmosfera
            </label>
            <p style="font-size: 0.9em; margin: 5px 0 0 25px; font-style: italic;">
              Eventi narrativi che creano atmosfera (ogni 2 turni)
            </p>
          </div>
          
          <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 3px;">
            <strong>⚠️ Regole Rissa:</strong>
            <ul style="font-size: 0.9em; margin: 5px 0;">
              <li>Si usano <strong>Batoste</strong>, non punti ferita</li>
              <li>6 Batoste = Incosciente</li>
              <li>Azioni speciali consumano <strong>Slot Mossa</strong></li>
              <li>Oggetti di scena disponibili</li>
            </ul>
          </div>
        </div>
      `,
      buttons: {
        start: {
          icon: '<i class="fas fa-fist-raised"></i>',
          label: 'INIZIA RISSA!',
          callback: async (html) => {
            const usePericoli = html.find('[name="pericoliVaganti"]').is(':checked');
            const useEventi = html.find('[name="eventiAtmosfera"]').is(':checked');
            
            // Imposta setting eventi
            if (!useEventi) {
              await game.settings.set('brancalonia-bigat', 'brawlAutoEventi', 0);
            } else {
              await game.settings.set('brancalonia-bigat', 'brawlAutoEventi', 2);
            }
            
            // Avvia rissa
            await window.TavernBrawlSystem.startBrawl();
            
            ui.notifications.info('🍺 RISSA INIZIATA! Che il caos abbia inizio!');
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      default: 'start',
      render: (html) => {
        html.find('button').css({
          'font-size': '14px',
          'font-weight': 'bold',
          'padding': '8px 16px'
        });
      }
    }, {
      width: 500
    }).render(true);
    } catch (error) {
      this.statistics.errors.push({ 
        type: 'dialogIniziaRissa', 
        message: error.message, 
        timestamp: Date.now() 
      });
      logger.error(this.MODULE_NAME, 'Errore dialog inizia rissa', error);
      ui.notifications.error('Errore nella creazione del dialog');
    }
  }

  /**
   * Dialog per azioni durante rissa attiva
   * @static
   * @returns {Promise<void>}
   */
  static async dialogRissaAttiva() {
    this.statistics.dialogsShown++;
    logger.debug?.(this.MODULE_NAME, 'Dialog rissa attiva mostrato');
    const combat = window.TavernBrawlSystem.brawlCombat;
    const tokens = canvas.tokens.controlled;
    
    if (tokens.length === 1) {
      return this.dialogAzioniPersonaggio(tokens[0]);
    }

    new Dialog({
      title: '🍺 Rissa in Corso',
      content: `
        <div style="padding: 10px;">
          <h3 style="color: #8b4513; text-align: center; margin-bottom: 15px;">
            ⚔️ LA RISSA È IN PIENO SVOLGIMENTO! ⚔️
          </h3>
          
          <div style="background: #f4e4bc; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <p style="margin: 0;"><strong>Round:</strong> ${combat?.round || 'N/A'}</p>
            <p style="margin: 5px 0 0 0;"><strong>Partecipanti:</strong> ${window.TavernBrawlSystem.brawlParticipants.size}</p>
          </div>
          
          <p style="text-align: center; margin-bottom: 15px;">
            Seleziona un'azione per gestire la rissa:
          </p>
        </div>
      `,
      buttons: {
        actions: {
          icon: '<i class="fas fa-hand-rock"></i>',
          label: 'Azioni Personaggio',
          callback: () => {
            const token = canvas.tokens.controlled[0];
            if (!token) {
              ui.notifications.warn('Seleziona un token per vedere le sue azioni!');
              return;
            }
            this.dialogAzioniPersonaggio(token);
          }
        },
        eventi: {
          icon: '<i class="fas fa-exclamation-triangle"></i>',
          label: 'Trigger Evento',
          callback: () => this.dialogEventi()
        },
        status: {
          icon: '<i class="fas fa-info-circle"></i>',
          label: 'Stato Rissa',
          callback: () => this.mostraStatoRissa()
        },
        end: {
          icon: '<i class="fas fa-stop"></i>',
          label: 'Termina Rissa',
          callback: async () => {
            await window.TavernBrawlSystem.endBrawl();
            ui.notifications.info('Rissa terminata!');
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Chiudi'
        }
      },
      default: 'actions'
    }, {
      width: 450
    }).render(true);
  }

  /**
   * Dialog per azioni di un personaggio specifico
   */
  static async dialogAzioniPersonaggio(token) {
    const actor = token.actor;
    const system = window.TavernBrawlSystem;
    const participantData = system.brawlParticipants.get(actor.id);
    
    if (!participantData) {
      ui.notifications.warn(`${actor.name} non sta partecipando alla rissa!`);
      return;
    }

    const slotDisponibili = participantData.slotMossaMax - participantData.slotMossaUsati;
    const batosteLivello = participantData.batoste;
    const statoText = batosteLivello >= 6 ? '💀 INCOSCIENTE' : 
                      batosteLivello >= 4 ? '😵 Molto Malmesso' :
                      batosteLivello >= 2 ? '😣 Contuso' : '😊 In Forma';

    new Dialog({
      title: `⚔️ Azioni Rissa - ${actor.name}`,
      content: `
        <div style="padding: 10px;">
          <div style="background: #f4e4bc; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #8b4513;">Stato Attuale</h3>
            <p style="margin: 5px 0;"><strong>Batoste:</strong> ${batosteLivello}/6 ${statoText}</p>
            <p style="margin: 5px 0;"><strong>Slot Mossa:</strong> ${slotDisponibili}/${participantData.slotMossaMax} disponibili</p>
            ${participantData.oggettoScena ? 
              `<p style="margin: 5px 0;"><strong>In mano:</strong> ${participantData.oggettoScena.nome} (${participantData.oggettoScena.tipo})</p>` : 
              `<p style="margin: 5px 0; font-style: italic;">Nessun oggetto in mano</p>`
            }
          </div>
          
          <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">
            Scegli un'azione:
          </p>
        </div>
      `,
      buttons: {
        saccagnata: {
          icon: '<i class="fas fa-fist-raised"></i>',
          label: 'Saccagnata',
          callback: async () => {
            const targets = game.user.targets;
            if (targets.size !== 1) {
              ui.notifications.warn('Seleziona UN bersaglio per la saccagnata!');
              return;
            }
            await system.executeSaccagnata(actor, Array.from(targets)[0]);
          }
        },
        mosse: {
          icon: '<i class="fas fa-magic"></i>',
          label: `Mosse (${slotDisponibili} slot)`,
          callback: () => this.dialogScegliMossa(actor, participantData),
          disabled: slotDisponibili === 0
        },
        oggetto: {
          icon: '<i class="fas fa-chair"></i>',
          label: participantData.oggettoScena ? 'Usa Oggetto' : 'Raccogli Oggetto',
          callback: () => {
            if (participantData.oggettoScena) {
              this.dialogUsaOggetto(actor, participantData);
            } else {
              this.dialogRaccogliOggetto(actor);
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Chiudi'
        }
      },
      default: 'saccagnata'
    }, {
      width: 450
    }).render(true);
  }

  /**
   * Dialog per scegliere una mossa
   */
  static async dialogScegliMossa(actor, participantData) {
    const system = window.TavernBrawlSystem;
    const mosse = participantData.mosse || [];
    
    const mosseGeneriche = Object.entries(system.mosseGeneriche).slice(0, 6);
    const mosseMagiche = Object.entries(system.mosseMagiche).slice(0, 4);
    
    new Dialog({
      title: `🥊 Scegli Mossa - ${actor.name}`,
      content: `
        <div style="padding: 10px;">
          <div style="margin-bottom: 15px; padding: 8px; background: #fff3cd; border-left: 4px solid #ffc107;">
            <strong>Slot Mossa:</strong> ${participantData.slotMossaMax - participantData.slotMossaUsati}/${participantData.slotMossaMax}
          </div>
          
          <h3 style="border-bottom: 2px solid #8b4513; margin-bottom: 10px;">Mosse Generiche</h3>
          <div style="max-height: 200px; overflow-y: auto;">
            ${mosseGeneriche.map(([key, mossa]) => `
              <button class="mossa-btn" data-mossa="${key}" style="
                width: 100%;
                padding: 8px;
                margin: 3px 0;
                background: #f4e4bc;
                border: 1px solid #8b4513;
                border-radius: 3px;
                cursor: pointer;
                text-align: left;
              ">
                <strong>${mossa.name}</strong> <em>(${mossa.tipo})</em>
                <br>
                <small>${mossa.descrizione}</small>
              </button>
            `).join('')}
          </div>
          
          <h3 style="border-bottom: 2px solid #8b4513; margin: 15px 0 10px 0;">Mosse Magiche</h3>
          <div style="max-height: 150px; overflow-y: auto;">
            ${mosseMagiche.map(([key, mossa]) => `
              <button class="mossa-btn" data-mossa="${key}" style="
                width: 100%;
                padding: 8px;
                margin: 3px 0;
                background: #e6d4ff;
                border: 1px solid #7b1fa2;
                border-radius: 3px;
                cursor: pointer;
                text-align: left;
              ">
                <strong>${mossa.name}</strong> <em>(${mossa.tipo})</em>
                <br>
                <small>${mossa.descrizione}</small>
              </button>
            `).join('')}
          </div>
        </div>
      `,
      buttons: {
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      render: (html) => {
        html.find('.mossa-btn').on('click', async function() {
          const mossaKey = $(this).data('mossa');
          const targets = game.user.targets;
          
          // Verifica se la mossa richiede un bersaglio
          const richiedeBersaglio = ![
            'finta', 'allaPugna', 'sottoIlTavolo', 'sediataSpiriturale'
          ].includes(mossaKey);
          
          if (richiedeBersaglio && targets.size === 0) {
            ui.notifications.warn('Seleziona un bersaglio per questa mossa!');
            return;
          }
          
          const target = richiedeBersaglio ? Array.from(targets)[0] : null;
          await system._executeMossa(actor, target, mossaKey);
          
          // Chiudi il dialog
          html.closest('.app').find('.header-button.close').click();
        });
        
        html.find('.mossa-btn').on('mouseenter', function() {
          $(this).css('background', '#ffd700');
        }).on('mouseleave', function() {
          const isMagica = $(this).data('mossa') in system.mosseMagiche;
          $(this).css('background', isMagica ? '#e6d4ff' : '#f4e4bc');
        });
      }
    }, {
      width: 500,
      height: 600
    }).render(true);
  }

  /**
   * Dialog per raccogliere oggetto di scena
   */
  static async dialogRaccogliOggetto(actor) {
    new Dialog({
      title: '🪑 Raccogli Oggetto di Scena',
      content: `
        <div style="padding: 10px;">
          <p style="text-align: center; margin-bottom: 15px;">
            Che tipo di oggetto vuoi raccogliere?
          </p>
          
          <div style="background: #f4e4bc; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
            <h4 style="margin: 0 0 10px 0;">📦 Comune (Azione Bonus)</h4>
            <p style="margin: 0; font-size: 0.9em;">
              Bottiglia, Sgabello, Candelabro...<br>
              <strong>Effetti:</strong> +1d4 attacco, +2 CA difesa
            </p>
          </div>
          
          <div style="background: #ffd700; padding: 15px; border-radius: 5px;">
            <h4 style="margin: 0 0 10px 0;">⭐ Epico (Azione)</h4>
            <p style="margin: 0; font-size: 0.9em;">
              Tavolo, Botte, Lampadario...<br>
              <strong>Effetti:</strong> +1 batosta, stordimento, area, +5 CA
            </p>
          </div>
        </div>
      `,
      buttons: {
        comune: {
          icon: '<i class="fas fa-box"></i>',
          label: 'Comune',
          callback: async () => {
            await window.TavernBrawlSystem.pickUpProp(actor, 'comune');
          }
        },
        epico: {
          icon: '<i class="fas fa-star"></i>',
          label: 'Epico',
          callback: async () => {
            await window.TavernBrawlSystem.pickUpProp(actor, 'epico');
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      default: 'comune'
    }, {
      width: 400
    }).render(true);
  }

  /**
   * Dialog per usare oggetto di scena
   */
  static async dialogUsaOggetto(actor, participantData) {
    const oggetto = participantData.oggettoScena;
    const isComune = oggetto.tipo === 'comune';
    
    new Dialog({
      title: `Usa ${oggetto.nome}`,
      content: `
        <div style="padding: 10px;">
          <div style="background: ${isComune ? '#f4e4bc' : '#ffd700'}; padding: 15px; border-radius: 5px; margin-bottom: 15px; text-align: center;">
            <h3 style="margin: 0;">${oggetto.nome}</h3>
            <p style="margin: 5px 0 0 0; font-weight: bold;">(${oggetto.tipo.toUpperCase()})</p>
          </div>
          
          <p style="text-align: center; margin-bottom: 15px;">
            Come vuoi usare questo oggetto?
          </p>
        </div>
      `,
      buttons: isComune ? {
        attack: {
          icon: '<i class="fas fa-crosshairs"></i>',
          label: 'Attacco (+1d4)',
          callback: async () => {
            await window.TavernBrawlSystem.useProp(actor, 'attack');
          }
        },
        defense: {
          icon: '<i class="fas fa-shield-alt"></i>',
          label: 'Difesa (+2 CA)',
          callback: async () => {
            await window.TavernBrawlSystem.useProp(actor, 'defense');
          }
        },
        bonus: {
          icon: '<i class="fas fa-bolt"></i>',
          label: 'Azione Bonus',
          callback: async () => {
            await window.TavernBrawlSystem.useProp(actor, 'bonus');
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      } : {
        damage: {
          icon: '<i class="fas fa-fire"></i>',
          label: '+1 Batosta',
          callback: async () => {
            await window.TavernBrawlSystem.useProp(actor, 'damage');
          }
        },
        stun: {
          icon: '<i class="fas fa-dizzy"></i>',
          label: 'Stordimento',
          callback: async () => {
            await window.TavernBrawlSystem.useProp(actor, 'stun');
          }
        },
        area: {
          icon: '<i class="fas fa-expand"></i>',
          label: 'Area (2 bersagli)',
          callback: async () => {
            await window.TavernBrawlSystem.useProp(actor, 'area');
          }
        },
        defense: {
          icon: '<i class="fas fa-shield-alt"></i>',
          label: 'Difesa Epica (+5 CA)',
          callback: async () => {
            await window.TavernBrawlSystem.useProp(actor, 'defense');
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      default: isComune ? 'attack' : 'damage'
    }, {
      width: 400
    }).render(true);
  }

  /**
   * Dialog per eventi e pericoli
   */
  static async dialogEventi() {
    new Dialog({
      title: '⚡ Trigger Eventi Rissa',
      content: `
        <div style="padding: 10px;">
          <p style="text-align: center; margin-bottom: 15px; font-weight: bold;">
            Scatena il caos nella taverna!
          </p>
          
          <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <h4 style="margin: 0 0 5px 0;">🍺 Evento Atmosfera</h4>
            <p style="margin: 0; font-size: 0.9em;">
              Evento narrativo casuale che aggiunge colore alla scena
            </p>
          </div>
          
          <div style="background: #f8d7da; padding: 10px; border-radius: 5px;">
            <h4 style="margin: 0 0 5px 0;">💥 Pericolo Vagante</h4>
            <p style="margin: 0; font-size: 0.9em;">
              Evento meccanico con effetti di gioco (TS richiesti)
            </p>
          </div>
        </div>
      `,
      buttons: {
        atmosfera: {
          icon: '<i class="fas fa-wind"></i>',
          label: 'Evento Atmosfera',
          callback: async () => {
            await window.TavernBrawlSystem.triggerEventoAtmosfera();
          }
        },
        pericolo: {
          icon: '<i class="fas fa-exclamation-triangle"></i>',
          label: 'Pericolo Vagante',
          callback: async () => {
            await window.TavernBrawlSystem.activatePericoloVagante();
          }
        },
        entrambi: {
          icon: '<i class="fas fa-fire"></i>',
          label: 'Entrambi!',
          callback: async () => {
            await window.TavernBrawlSystem.triggerEventoAtmosfera();
            setTimeout(async () => {
              await window.TavernBrawlSystem.activatePericoloVagante();
            }, 1000);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Annulla'
        }
      },
      default: 'atmosfera'
    }, {
      width: 400
    }).render(true);
  }

  /**
   * Mostra stato completo della rissa
   */
  static async mostraStatoRissa() {
    const system = window.TavernBrawlSystem;
    const combat = system.brawlCombat;
    
    let content = '<div style="padding: 10px;">';
    content += '<h3 style="text-align: center; color: #8b4513;">📊 Stato Rissa</h3>';
    content += `<p style="text-align: center;"><strong>Round:</strong> ${combat?.round || 'N/A'}</p>`;
    content += '<hr>';
    
    content += '<h4>Partecipanti:</h4><table style="width: 100%; font-size: 0.9em;">';
    content += '<tr style="background: #8b4513; color: white;"><th>Nome</th><th>Batoste</th><th>Slot</th><th>Oggetto</th></tr>';
    
    for (const [id, data] of system.brawlParticipants) {
      const statoColor = data.batoste >= 6 ? 'red' : data.batoste >= 4 ? 'orange' : 'green';
      content += `<tr style="background: ${data.batoste % 2 === 0 ? '#f4e4bc' : '#fff'};">`;
      content += `<td><strong>${data.actor.name}</strong></td>`;
      content += `<td style="color: ${statoColor}; font-weight: bold;">${data.batoste}/6</td>`;
      content += `<td>${data.slotMossaMax - data.slotMossaUsati}/${data.slotMossaMax}</td>`;
      content += `<td>${data.oggettoScena?.nome || '-'}</td>`;
      content += '</tr>';
    }
    
    content += '</table></div>';
    
    new Dialog({
      title: 'Stato Rissa',
      content,
      buttons: {
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Chiudi'
        }
      }
    }, {
      width: 500
    }).render(true);
  }

  /**
   * Registra le macro nel sistema
   */
  static registerMacros() {
    // Macro principale
    const mainMacroData = {
      name: '🍺 Gestione Risse',
      type: 'script',
      scope: 'global',
      img: 'icons/skills/melee/unarmed-punch-fist.webp',
      command: `
// Macro Gestione Risse - User Friendly
if (!game.user.isGM && !window.TavernBrawlSystem.activeBrawl) {
  ui.notifications.warn("Solo il GM può iniziare una rissa!");
} else {
  window.TavernBrawlMacros.macroGestioneRissa();
}
      `,
      flags: {
        'brancalonia-bigat': {
          isSystemMacro: true,
          type: 'brawl-main',
          version: '2.0'
        }
      }
    };

    Macro.create(mainMacroData).then(() => {
      TavernBrawlMacros.statistics.macrosCreated++;
      logger.info(TavernBrawlMacros.MODULE_NAME, '✅ Macro Gestione Risse creata');
    }).catch((error) => {
      logger.debug?.(TavernBrawlMacros.MODULE_NAME, 'Macro Gestione Risse già esistente');
    });

    // Macro Eventi Rapidi
    const eventiMacroData = {
      name: '⚡ Eventi Rissa Rapidi',
      type: 'script',
      scope: 'global',
      img: 'icons/svg/lightning.svg',
      command: `
// Trigger rapido eventi rissa
if (!game.user.isGM) {
  ui.notifications.warn("Solo il GM può usare questa macro!");
} else if (!window.TavernBrawlSystem.activeBrawl) {
  ui.notifications.warn("Nessuna rissa attiva!");
} else {
  window.TavernBrawlMacros.dialogEventi();
}
      `,
      flags: {
        'brancalonia-bigat': {
          isSystemMacro: true,
          type: 'brawl-eventi',
          version: '2.0'
        }
      }
    };

    Macro.create(eventiMacroData).then(() => {
      TavernBrawlMacros.statistics.macrosCreated++;
      logger.info(TavernBrawlMacros.MODULE_NAME, '✅ Macro Eventi Rissa creata');
    }).catch(() => {
      logger.debug?.(TavernBrawlMacros.MODULE_NAME, 'Macro Eventi Rissa già esistente');
    });

    // Macro Stato Rapido
    const statoMacroData = {
      name: '📊 Stato Rissa',
      type: 'script',
      scope: 'global',
      img: 'icons/svg/upgrade.svg',
      command: `
// Mostra stato rissa corrente
if (!window.TavernBrawlSystem.activeBrawl) {
  ui.notifications.info("Nessuna rissa attiva");
} else {
  window.TavernBrawlMacros.mostraStatoRissa();
}
      `,
      flags: {
        'brancalonia-bigat': {
          isSystemMacro: true,
          type: 'brawl-status',
          version: '2.0'
        }
      }
    };

    Macro.create(statoMacroData).then(() => {
      TavernBrawlMacros.statistics.macrosCreated++;
      logger.info(TavernBrawlMacros.MODULE_NAME, '✅ Macro Stato Rissa creata');
    }).catch(() => {
      logger.debug?.(TavernBrawlMacros.MODULE_NAME, 'Macro Stato Rissa già esistente');
    });

    TavernBrawlMacros._state.macrosRegistered = true;
    logger.info(TavernBrawlMacros.MODULE_NAME, '✅ Tutte le macro registrate con successo');
  }

  /**
   * Ottiene lo stato del modulo
   * @static
   * @returns {Object} Stato corrente del modulo
   */
  static getStatus() {
    return {
      initialized: this._state.initialized,
      macrosRegistered: this._state.macrosRegistered,
      version: this.VERSION,
      moduleName: this.MODULE_NAME
    };
  }

  /**
   * Ottiene le statistiche dettagliate
   * @static
   * @returns {Object} Statistiche complete
   */
  static getStatistics() {
    return {
      ...this.statistics,
      errorsCount: this.statistics.errors.length
    };
  }

  /**
   * Resetta le statistiche
   * @static
   */
  static resetStatistics() {
    this.statistics = {
      dialogsShown: 0,
      macrosCreated: 0,
      actionsExecuted: 0,
      errors: []
    };
    logger.info(this.MODULE_NAME, '📊 Statistiche resettate');
  }
}

// Esporta globalmente
window.TavernBrawlMacros = TavernBrawlMacros;

// Auto-registra le macro al ready
Hooks.once('ready', () => {
  try {
    logger.startPerformance('tavern-brawl-macros-init');
    logger.info(TavernBrawlMacros.MODULE_NAME, '🍺 Inizializzazione Macro Risse...');
    
    if (game.user.isGM) {
      TavernBrawlMacros.registerMacros();
    }
    
    TavernBrawlMacros._state.initialized = true;
    const perfTime = logger.endPerformance('tavern-brawl-macros-init');
    logger.info(TavernBrawlMacros.MODULE_NAME, `✅ Macro Risse inizializzate (${perfTime?.toFixed(2)}ms)`);
    
    // Event emitter
    logger.events.emit('tavern-brawl-macros:initialized', {
      version: TavernBrawlMacros.VERSION,
      timestamp: Date.now()
    });
  } catch (error) {
    TavernBrawlMacros.statistics.errors.push({ 
      type: 'initialization', 
      message: error.message, 
      timestamp: Date.now() 
    });
    logger.error(TavernBrawlMacros.MODULE_NAME, 'Errore inizializzazione Macro Risse', error);
  }
});

export default TavernBrawlMacros;


