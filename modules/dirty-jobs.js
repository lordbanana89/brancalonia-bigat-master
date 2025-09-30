/**
 * Sistema Lavori Sporchi per Brancalonia
 * Completamente compatibile con dnd5e system per Foundry VTT v13
 */

class DirtyJobsSystem {
  constructor() {
    // Tipi di lavori con parametri conformi a dnd5e
    this.jobTypes = {
      robbery: {
        name: 'Rapina',
        icon: 'icons/containers/bags/sack-leather-gold.webp',
        difficulty: {
          easy: { dc: 12, reward: '2d6 * 10', infamy: 3 },
          medium: { dc: 15, reward: '4d6 * 10', infamy: 5 },
          hard: { dc: 18, reward: '8d6 * 10', infamy: 8 }
        },
        skills: ['dex', 'ste', 'slt'], // Destrezza, Furtività, Rapidità di Mano
        complications: [
          'Le guardie sono state allertate',
          'Il bottino è maledetto',
          'Un testimone vi ha riconosciuti',
          'La refurtiva è marchiata'
        ]
      },
      extortion: {
        name: 'Estorsione',
        icon: 'icons/skills/social/intimidation-threat-knife.webp',
        difficulty: {
          easy: { dc: 10, reward: '1d6 * 10', infamy: 2 },
          medium: { dc: 13, reward: '2d6 * 10', infamy: 3 },
          hard: { dc: 16, reward: '4d6 * 10', infamy: 5 }
        },
        skills: ['cha', 'itm', 'per'], // Carisma, Intimidire, Persuasione
        complications: [
          'La vittima ha amici potenti',
          'Qualcuno vuole vendetta',
          'La vittima è al verde',
          'Siete stati denunciati'
        ]
      },
      smuggling: {
        name: 'Contrabbando',
        icon: 'icons/containers/barrels/barrel-wooden-brown.webp',
        difficulty: {
          easy: { dc: 11, reward: '3d6 * 10', infamy: 1 },
          medium: { dc: 14, reward: '6d6 * 10', infamy: 2 },
          hard: { dc: 17, reward: '10d6 * 10', infamy: 4 }
        },
        skills: ['wis', 'dec', 'sur'], // Saggezza, Inganno, Sopravvivenza
        complications: [
          'La merce è difettosa',
          'I doganieri sono sospettosi',
          'Un rivale vi sabota',
          'La rotta è bloccata'
        ]
      },
      escort: {
        name: 'Scorta',
        icon: 'icons/environment/people/group.webp',
        difficulty: {
          easy: { dc: 10, reward: '2d6 * 10', infamy: 0 },
          medium: { dc: 13, reward: '4d6 * 10', infamy: 1 },
          hard: { dc: 16, reward: '6d6 * 10', infamy: 2 }
        },
        skills: ['str', 'prc', 'itm'], // Forza, Percezione, Intimidire
        complications: [
          'Imboscata di banditi',
          'Il cliente è inseguito',
          'Tempo atmosferico terribile',
          'Il cliente è insopportabile'
        ]
      },
      assassination: {
        name: 'Assassinio',
        icon: 'icons/weapons/daggers/dagger-curved-red.webp',
        difficulty: {
          easy: { dc: 14, reward: '5d6 * 10', infamy: 10 },
          medium: { dc: 17, reward: '10d6 * 10', infamy: 15 },
          hard: { dc: 20, reward: '20d6 * 10', infamy: 20 }
        },
        skills: ['dex', 'ste', 'inv'], // Destrezza, Furtività, Investigare
        complications: [
          'Il bersaglio è protetto',
          'Doppio gioco del committente',
          'Testimoni inaspettati',
          'Il bersaglio è innocente'
        ]
      },
      spying: {
        name: 'Spionaggio',
        icon: 'icons/tools/scribal/magnifying-glass.webp',
        difficulty: {
          easy: { dc: 11, reward: '1d6 * 10', infamy: 1 },
          medium: { dc: 14, reward: '3d6 * 10', infamy: 2 },
          hard: { dc: 17, reward: '5d6 * 10', infamy: 3 }
        },
        skills: ['int', 'inv', 'ste'], // Intelligenza, Investigare, Furtività
        complications: [
          'Controspionaggio attivo',
          'Informazioni false',
          'Siete stati scoperti',
          'Doppio agente'
        ]
      },
      heist: {
        name: 'Colpo Grosso',
        icon: 'icons/containers/chest/chest-gold-box.webp',
        difficulty: {
          easy: { dc: 13, reward: '10d6 * 10', infamy: 6 },
          medium: { dc: 16, reward: '20d6 * 10', infamy: 10 },
          hard: { dc: 19, reward: '40d6 * 10', infamy: 15 }
        },
        skills: ['dex', 'int', 'cha'], // Richiede pianificazione
        complications: [
          'Tradimento interno',
          'Sistemi di sicurezza imprevisti',
          'Tempistica sbagliata',
          'Refurtiva troppo ingombrante'
        ]
      },
      sabotage: {
        name: 'Sabotaggio',
        icon: 'icons/tools/hand/hammer-and-nail.webp',
        difficulty: {
          easy: { dc: 12, reward: '2d6 * 10', infamy: 3 },
          medium: { dc: 15, reward: '4d6 * 10', infamy: 5 },
          hard: { dc: 18, reward: '8d6 * 10', infamy: 8 }
        },
        skills: ['int', 'slt', 'ste'], // Intelligenza, Attrezzi, Furtività
        complications: [
          'Esplosione prematura',
          'Guardie extra',
          'Piano scoperto',
          'Danni collaterali'
        ]
      }
    };

    // Committenti tipici
    this.clients = [
      { name: 'Nobile Corrotto', trustworthy: 0.6, payModifier: 1.2 },
      { name: 'Mercante Avido', trustworthy: 0.7, payModifier: 1.0 },
      { name: 'Criminale Locale', trustworthy: 0.5, payModifier: 0.9 },
      { name: 'Spia Straniera', trustworthy: 0.4, payModifier: 1.5 },
      { name: 'Chierico Corrotto', trustworthy: 0.6, payModifier: 1.1 },
      { name: 'Capitano delle Guardie', trustworthy: 0.3, payModifier: 1.3 },
      { name: 'Mago Rinnegato', trustworthy: 0.5, payModifier: 1.4 },
      { name: 'Vecchio Amico', trustworthy: 0.8, payModifier: 0.8 }
    ];
  }

  static initialize() {
    console.log('Inizializzazione DirtyJobsSystem...');

    // Registrazione settings
    game.settings.register('brancalonia-bigat', 'dirtyJobsEnabled', {
      name: 'Sistema Lavori Sporchi Attivo',
      hint: 'Abilita il sistema di generazione lavori sporchi',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'dirtyJobsAutoReward', {
      name: 'Ricompense Automatiche',
      hint: 'Calcola automaticamente ricompense e infamia al completamento',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'dirtyJobsNotifications', {
      name: 'Notifiche Lavori',
      hint: 'Mostra notifiche per nuovi lavori e completamenti',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Creazione istanza globale
    window.DirtyJobsSystem = new DirtyJobsSystem();

    // Registrazione hooks
    DirtyJobsSystem._registerHooks();

    // Registrazione comandi chat
    DirtyJobsSystem._registerChatCommands();

    // Creazione macro automatica
    DirtyJobsSystem._createMacro();

    console.log('DirtyJobsSystem inizializzato correttamente!');
  }

  static _registerHooks() {
    // Hook per aggiungere lavori al journal
    Hooks.on('renderJournalDirectory', (app, html) => {
      if (game.user.isGM && game.settings.get('brancalonia-bigat', 'dirtyJobsEnabled')) {
        const button = $(`<button class="generate-job">
          <i class="fas fa-coins"></i> Genera Lavoro
        </button>`);
        html.find('.directory-header .action-buttons').append(button);
        button.click(() => window.DirtyJobsSystem.showJobGeneratorDialog());
      }
    });

    // Hook per tracciare completamento lavori
    Hooks.on('updateJournalEntry', (journal, update, options, userId) => {
      if (journal.flags.brancalonia?.isJob && update.flags?.brancalonia?.jobCompleted) {
        window.DirtyJobsSystem._handleJobCompletion(journal);
      }
    });

    // Hook per aggiungere pulsanti ai journal entries di lavori
    Hooks.on('renderJournalSheet', (app, html, data) => {
      if (app.object.flags.brancalonia?.isJob && game.user.isGM) {
        const button = $(`<button class="job-complete-btn" title="Completa Lavoro">
          <i class="fas fa-check"></i> Completa
        </button>`);
        html.find('.window-header .window-title').after(button);
        button.click(() => {
          app.object.setFlag('brancalonia-bigat', 'jobCompleted', true);
        });
      }
    });

    console.log('DirtyJobsSystem hooks registrati!');
  }

  static _registerChatCommands() {
    // Registra il handler per i comandi chat
    Hooks.on('chatMessage', async (html, content, msg) => {
      // Verifica se è un comando lavoro
      if (!content.startsWith('/lavoro-')) return true;

      // Estrai comando e parametri
      const parts = content.split(' ');
      const command = parts[0];
      const parameters = parts.slice(1).join(' ');

      // Comando per generare lavoro
      if (command === '/lavoro-genera') {
        if (!game.user.isGM) {
          ui.notifications.error('Solo il GM può generare lavori!');
          return false;
        }

        const params = parameters.split(' ');
        const type = params[0] || null;
        const difficulty = params[1] || 'medium';

        const jobsSystem = game.brancalonia?.dirtyJobs || window.DirtyJobsSystem;
        if (jobsSystem) {
          const job = await jobsSystem.generateJob(type, difficulty);
          if (job) {
            ChatMessage.create({
              content: `Lavoro generato: ${job.name}`,
              speaker: { alias: 'Sistema Lavori' }
            });
          }
        }
        return false;
      }

      // Comando per mostrare dialog generazione
      if (command === '/lavoro-dialog') {
        if (!game.user.isGM) {
          ui.notifications.error('Solo il GM può generare lavori!');
          return false;
        }

        const jobsSystem = game.brancalonia?.dirtyJobs || window.DirtyJobsSystem;
        if (jobsSystem) {
          jobsSystem.showJobGeneratorDialog();
        }
        return false;
      }

      // Comando per lavoro casuale
      if (command === '/lavoro-random') {
        if (!game.user.isGM) {
          ui.notifications.error('Solo il GM può generare lavori!');
          return false;
        }

        const jobsSystem = game.brancalonia?.dirtyJobs || window.DirtyJobsSystem;
        if (jobsSystem && jobsSystem.jobTypes) {
          const types = Object.keys(jobsSystem.jobTypes);
          const randomType = types[Math.floor(Math.random() * types.length)];
          const difficulties = ['easy', 'medium', 'hard'];
          const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

          await jobsSystem.generateJob(randomType, randomDifficulty);
        }
        return false;
      }

      // Comando per listare tipi di lavoro
      if (command === '/lavoro-tipi') {
        const jobsSystem = game.brancalonia?.dirtyJobs || window.DirtyJobsSystem;
        if (jobsSystem && jobsSystem.jobTypes) {
          const types = Object.entries(jobsSystem.jobTypes);
          const content = `
            <div class="brancalonia-help">
              <h3>Tipi di Lavoro Disponibili</h3>
              <ul>
                ${types.map(([key, data]) => `<li><strong>${key}</strong>: ${data.name}</li>`).join('')}
              </ul>
              <p><em>Usa /lavoro-genera [tipo] [difficoltà] per generare un lavoro specifico</em></p>
            </div>
          `;

          ChatMessage.create({
            content,
            speaker: { alias: 'Sistema Lavori' },
            whisper: [game.user.id]
          });
        }
        return false;
      }

      // Comando help
      if (command === '/lavoro-help') {
        const helpText = `
          <div class="brancalonia-help">
            <h3>Comandi Lavori Sporchi</h3>
            <ul>
              <li><strong>/lavoro-genera [tipo] [difficoltà]</strong> - Genera lavoro specifico</li>
              <li><strong>/lavoro-dialog</strong> - Dialog generazione avanzata</li>
              <li><strong>/lavoro-random</strong> - Lavoro completamente casuale</li>
              <li><strong>/lavoro-tipi</strong> - Lista tipi disponibili</li>
              <li><strong>/lavoro-help</strong> - Mostra questo aiuto</li>
            </ul>
            <h4>Tipi:</h4>
            <p>robbery, extortion, smuggling, escort, assassination, spying, heist, sabotage</p>
            <h4>Difficoltà:</h4>
            <p>easy, medium, hard</p>
          </div>
        `;

        ChatMessage.create({
          content: helpText,
          speaker: { alias: 'Sistema Lavori' },
          whisper: [game.user.id]
        });
        return false;
      }

      // Se è un comando lavoro ma non riconosciuto
      if (content.startsWith('/lavoro-')) {
        ui.notifications.warn('Comando lavoro non riconosciuto. Usa /lavoro-help per aiuto.');
        return false;
      }

      return true;
    });

    console.log('DirtyJobsSystem comandi chat registrati!');
  }

  static _createMacro() {
    const macroData = {
      name: 'Generatore Lavori Sporchi',
      type: 'script',
      scope: 'global',
      command: `
// Macro per Generazione Lavori Sporchi
if (!game.user.isGM) {
  ui.notifications.error("Solo il GM può utilizzare questa macro!");
} else {
  const choice = await Dialog.confirm({
    title: "Generatore Lavori",
    content: "<p>Vuoi aprire il dialog di generazione avanzata o generare un lavoro casuale?</p>",
    yes: () => "dialog",
    no: () => "random"
  });

  if (choice === "dialog") {
    window.DirtyJobsSystem.showJobGeneratorDialog();
  } else if (choice === "random") {
    const types = Object.keys(window.DirtyJobsSystem.jobTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const difficulties = ["easy", "medium", "hard"];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    await window.DirtyJobsSystem.generateJob(randomType, randomDifficulty);
  }
}
      `,
      img: 'icons/containers/bags/sack-leather-gold.webp',
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
        console.log('Macro Generatore Lavori Sporchi creata!');
      });
    }
  }

  /**
   * Genera un nuovo lavoro sporco
   */
  async generateJob(type = null, difficulty = 'medium', options = {}) {
    // Seleziona tipo casuale se non specificato
    if (!type) {
      const types = Object.keys(this.jobTypes);
      type = types[Math.floor(Math.random() * types.length)];
    }

    const jobData = this.jobTypes[type];
    if (!jobData) {
      ui.notifications.error('Tipo di lavoro non valido!');
      return null;
    }

    const difficultyData = jobData.difficulty[difficulty];
    if (!difficultyData) {
      ui.notifications.error('Difficoltà non valida!');
      return null;
    }

    // Genera committente
    const client = this._generateClient();

    // Calcola ricompensa
    const rewardRoll = await new Roll(difficultyData.reward).evaluate();
    const finalReward = Math.floor(rewardRoll.total * client.payModifier);

    // Genera complicazione (25% di probabilità)
    let complication = null;
    if (Math.random() < 0.25) {
      complication = jobData.complications[
        Math.floor(Math.random() * jobData.complications.length)
      ];
    }

    // Genera scadenza
    const deadline = this._generateDeadline(difficulty);

    // Crea dati del lavoro
    const job = {
      id: foundry.utils.randomID(),
      type,
      name: `${jobData.name} - ${client.name}`,
      difficulty,
      dc: difficultyData.dc,
      client,
      reward: finalReward,
      infamyGain: difficultyData.infamy,
      complication,
      deadline,
      requiredSkills: jobData.skills,
      status: 'available',
      createdAt: new Date().toISOString()
    };

    // Crea pagine del journal conforme a V13
    const pages = [
      {
        name: 'Dettagli Lavoro',
        type: 'text',
        text: {
          content: this._generateJobDescription(job),
          format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
        }
      },
      {
        name: 'Note Private',
        type: 'text',
        text: {
          content: `<h3>Note del GM</h3>
            <p><strong>DC Base:</strong> ${job.dc}</p>
            <p><strong>Affidabilità Cliente:</strong> ${Math.floor(client.trustworthy * 100)}%</p>
            ${complication ? `<p><strong>Complicazione:</strong> ${complication}</p>` : ''}
            <p><em>Modificare secondo necessità</em></p>`,
          format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
        },
        ownership: {
          default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE
        }
      }
    ];

    // Crea il journal entry
    const journalData = {
      name: job.name,
      pages,
      img: jobData.icon,
      flags: {
        brancalonia: {
          isJob: true,
          jobData: job
        }
      }
    };

    const journal = await JournalEntry.create(journalData);

    // Notifica creazione
    ChatMessage.create({
      content: `
        <div class="brancalonia-job-available">
          <h3>🎯 Nuovo Lavoro Disponibile!</h3>
          <p><strong>${job.name}</strong></p>
          <p>Difficoltà: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
          <p>Ricompensa: ${finalReward} ducati</p>
          <p>Scadenza: ${deadline}</p>
          ${complication ? `<p class="warning">⚠️ Possibili complicazioni</p>` : ''}
        </div>
      `,
      speaker: { alias: 'Bacheca Lavori' }
    });

    return journal;
  }

  /**
   * Mostra dialog per generare lavoro
   */
  showJobGeneratorDialog() {
    const content = `
      <form>
        <div class="form-group">
          <label>Tipo di Lavoro:</label>
          <select id="job-type">
            <option value="">Casuale</option>
            ${Object.entries(this.jobTypes).map(([key, data]) =>
    `<option value="${key}">${data.name}</option>`
  ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Difficoltà:</label>
          <select id="job-difficulty">
            <option value="easy">Facile</option>
            <option value="medium" selected>Media</option>
            <option value="hard">Difficile</option>
          </select>
        </div>
        <div class="form-group">
          <label>Opzioni:</label>
          <div>
            <label>
              <input type="checkbox" id="guaranteed-complication" />
              Complicazione Garantita
            </label>
          </div>
          <div>
            <label>
              <input type="checkbox" id="urgent-job" />
              Lavoro Urgente (scadenza breve)
            </label>
          </div>
        </div>
      </form>
    `;

    new Dialog({
      title: 'Genera Lavoro Sporco',
      content,
      buttons: {
        generate: {
          label: 'Genera',
          callback: html => {
            const type = html.find('#job-type').val() || null;
            const difficulty = html.find('#job-difficulty').val();
            const options = {
              guaranteedComplication: html.find('#guaranteed-complication')[0].checked,
              urgent: html.find('#urgent-job')[0].checked
            };
            this.generateJob(type, difficulty, options);
          }
        },
        cancel: {
          label: 'Annulla'
        }
      },
      default: 'generate'
    }).render(true);
  }

  /**
   * Gestisce il completamento di un lavoro
   */
  async _handleJobCompletion(journal) {
    const job = journal.flags.brancalonia.jobData;
    if (!job) return;

    // Dialog per risultato
    const content = `
      <h3>Completamento: ${job.name}</h3>
      <form>
        <div class="form-group">
          <label>Risultato:</label>
          <select id="job-result">
            <option value="success">Successo Completo</option>
            <option value="partial">Successo Parziale</option>
            <option value="failure">Fallimento</option>
            <option value="disaster">Disastro</option>
          </select>
        </div>
        <div class="form-group">
          <label>Partecipanti:</label>
          <div id="participants">
            ${game.actors.filter(a => a.hasPlayerOwner).map(a => `
              <label>
                <input type="checkbox" value="${a.id}" checked />
                ${a.name}
              </label>
            `).join('')}
          </div>
        </div>
      </form>
    `;

    new Dialog({
      title: 'Risultati del Lavoro',
      content,
      buttons: {
        complete: {
          label: 'Completa',
          callback: async html => {
            const result = html.find('#job-result').val();
            const participants = html.find('#participants input:checked')
              .map((i, el) => game.actors.get(el.value))
              .get();

            await this._processJobResults(job, result, participants);
          }
        }
      },
      default: 'complete'
    }).render(true);
  }

  /**
   * Processa i risultati di un lavoro
   */
  async _processJobResults(job, result, participants) {
    let rewardMultiplier = 1;
    let infamyMultiplier = 1;
    const consequences = [];

    switch (result) {
      case 'success':
        rewardMultiplier = 1;
        infamyMultiplier = 1;
        consequences.push('Lavoro completato perfettamente!');
        break;
      case 'partial':
        rewardMultiplier = 0.5;
        infamyMultiplier = 0.5;
        consequences.push('Lavoro completato con alcune difficoltà');
        break;
      case 'failure':
        rewardMultiplier = 0;
        infamyMultiplier = 0.25;
        consequences.push('Lavoro fallito!');
        if (job.client.trustworthy < 0.5) {
          consequences.push('Il cliente non è contento...');
        }
        break;
      case 'disaster':
        rewardMultiplier = 0;
        infamyMultiplier = 2;
        consequences.push('Disastro totale!');
        consequences.push('La vostra reputazione ne risente pesantemente');
        break;
    }

    // Calcola ricompense finali
    const finalReward = Math.floor(job.reward * rewardMultiplier);
    const finalInfamy = Math.floor(job.infamyGain * infamyMultiplier);

    // Distribuisci ricompense
    if (finalReward > 0 && participants.length > 0) {
      const rewardPerPerson = Math.floor(finalReward / participants.length);

      for (const actor of participants) {
        // Aggiungi ducati
        const currentMoney = actor.system.currency?.du || 0;
        await actor.update({
          'system.currency.du': currentMoney + rewardPerPerson
        });

        // Aggiungi infamia
        if (finalInfamy > 0 && actor.flags.brancalonia?.infamia !== undefined) {
          await actor.update({
            'flags.brancalonia.infamia': (actor.flags.brancalonia.infamia || 0) + finalInfamy
          });
        }
      }
    }

    // Controlla affidabilità del cliente
    if (Math.random() > job.client.trustworthy) {
      consequences.push(`${job.client.name} cerca di fregarvi!`);
      if (result === 'success') {
        consequences.push('Dovrete convincerlo a pagare...');
      }
    }

    // Messaggio finale
    ChatMessage.create({
      content: `
        <div class="brancalonia-job-complete">
          <h3>📋 Lavoro Completato: ${job.name}</h3>
          <p><strong>Risultato:</strong> ${result.charAt(0).toUpperCase() + result.slice(1)}</p>
          ${finalReward > 0 ? `<p><strong>Ricompensa:</strong> ${finalReward} ducati (${rewardPerPerson} a testa)</p>` : ''}
          ${finalInfamy > 0 ? `<p><strong>Infamia Guadagnata:</strong> +${finalInfamy}</p>` : ''}
          <hr>
          <p>${consequences.join('<br>')}</p>
        </div>
      `,
      speaker: { alias: 'Sistema Lavori' }
    });

    // Aggiungi al registro della compagnia se esiste
    const compagnia = participants[0]?.flags.brancalonia?.compagniaId;
    if (compagnia) {
      const comp = game.actors.get(compagnia);
      if (comp) {
        const jobs = comp.flags.brancalonia.jobs || [];
        jobs.push({
          ...job,
          result,
          completedDate: new Date().toISOString(),
          finalReward,
          finalInfamy
        });
        await comp.setFlag('brancalonia-bigat', 'jobs', jobs);
      }
    }
  }

  /**
   * Genera un committente
   */
  _generateClient() {
    const client = this.clients[Math.floor(Math.random() * this.clients.length)];

    // Aggiungi variazioni
    const variations = [
      { prefix: 'Ex-', modifier: 0.9 },
      { prefix: '', modifier: 1 },
      { prefix: 'Falso ', modifier: 0.7 },
      { prefix: 'Ricco ', modifier: 1.3 }
    ];

    const variation = variations[Math.floor(Math.random() * variations.length)];

    return {
      name: variation.prefix + client.name,
      trustworthy: client.trustworthy * variation.modifier,
      payModifier: client.payModifier * variation.modifier
    };
  }

  /**
   * Genera scadenza per il lavoro
   */
  _generateDeadline(difficulty) {
    const days = {
      easy: `${1 + Math.floor(Math.random() * 3)} giorni`,
      medium: `${2 + Math.floor(Math.random() * 5)} giorni`,
      hard: `${3 + Math.floor(Math.random() * 7)} giorni`
    };
    return days[difficulty];
  }

  /**
   * Genera descrizione HTML del lavoro
   */
  _generateJobDescription(job) {
    const jobType = this.jobTypes[job.type];

    return `
      <div class="brancalonia-job">
        <h2>${job.name}</h2>

        <div class="job-details">
          <p><strong>Tipo:</strong> ${jobType.name}</p>
          <p><strong>Cliente:</strong> ${job.client.name}</p>
          <p><strong>Difficoltà:</strong> ${job.difficulty.charAt(0).toUpperCase() + job.difficulty.slice(1)}</p>
          <p><strong>Ricompensa:</strong> ${job.reward} ducati</p>
          <p><strong>Scadenza:</strong> ${job.deadline}</p>
          <p><strong>Infamia:</strong> +${job.infamyGain}</p>
        </div>

        <h3>Descrizione</h3>
        <p>${this._generateJobNarrative(job)}</p>

        <h3>Requisiti</h3>
        <ul>
          <li>CD ${job.dc} per completare con successo</li>
          <li>Abilità consigliate: ${job.requiredSkills.map(s =>
    CONFIG.DND5E.abilities[s]?.label || s
  ).join(', ')}</li>
        </ul>

        ${job.complication ? `
          <div class="warning-box">
            <h3>⚠️ Attenzione</h3>
            <p>Ci sono voci di possibili complicazioni...</p>
          </div>
        ` : ''}

        <hr>
        <p class="job-status">
          <strong>Stato:</strong> <span class="status-${job.status}">${
  job.status === 'available' ? 'Disponibile' :
    job.status === 'accepted' ? 'Accettato' :
      job.status === 'completed' ? 'Completato' :
        'Fallito'
}</span>
        </p>
      </div>
    `;
  }

  /**
   * Genera narrativa per il lavoro
   */
  _generateJobNarrative(job) {
    const narratives = {
      robbery: [
        `${job.client.name} vuole che derubiate un ricco mercante che transita in città.`,
        `C'è una cassaforte piena d'oro che aspetta solo di essere svuotata.`,
        `Un nobile tiene i suoi risparmi in casa. Tempo di una visita notturna.`
      ],
      extortion: [
        `${job.client.name} ha bisogno che convinciate un debitore a pagare.`,
        `Un mercante si rifiuta di pagare la "protezione". Dategli una lezione.`,
        `C'è chi non rispetta gli accordi. Fateli cambiare idea.`
      ],
      smuggling: [
        `Trasportate questa merce oltre i confini senza farvi beccare.`,
        `${job.client.name} ha della merce "speciale" che deve arrivare a destinazione.`,
        `Evitate i dazi e consegnate il carico entro ${job.deadline}.`
      ],
      escort: [
        `Scortate ${job.client.name} attraverso territori pericolosi.`,
        `Un mercante ha bisogno di protezione per il suo viaggio.`,
        `Assicuratevi che il carico arrivi integro a destinazione.`
      ],
      assassination: [
        `${job.client.name} vuole che qualcuno... sparisca. Permanentemente.`,
        `C'è un problema che richiede una soluzione definitiva.`,
        `Eliminate il bersaglio senza lasciare tracce.`
      ],
      spying: [
        `Scoprite cosa sta tramando il rivale di ${job.client.name}.`,
        `Infiltratevi e raccogliete informazioni compromettenti.`,
        `${job.client.name} vuole sapere tutto sui movimenti del suo nemico.`
      ],
      heist: [
        `Il colpo del secolo! ${job.client.name} ha individuato un bersaglio succoso.`,
        `Pianificate ed eseguite il furto perfetto.`,
        `Un tesoro vi aspetta, se siete abbastanza abili da prenderlo.`
      ],
      sabotage: [
        `Distruggete le operazioni del rivale di ${job.client.name}.`,
        `Fate in modo che un certo progetto non veda mai la luce.`,
        `Sabotate senza farvi scoprire. La discrezione è fondamentale.`
      ]
    };

    const typeNarratives = narratives[job.type] || ['Un lavoro sporco vi attende.'];
    return typeNarratives[Math.floor(Math.random() * typeNarratives.length)];
  }
}