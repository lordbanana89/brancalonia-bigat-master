/**
 * Sistema di Gestione Compagnia per Brancalonia
 * Compatibile con Foundry VTT v13 e D&D 5e v3.3.1
 */

class CompagniaManager {
  constructor() {
    this.compagniaRoles = {
      capitano: { label: 'Capitano', max: 1, benefits: 'Decisioni finali, +2 Intimidire' },
      tesoriere: { label: 'Tesoriere', max: 1, benefits: 'Gestisce finanze, +2 Inganno' },
      cuoco: { label: 'Cuoco', max: 1, benefits: 'Migliora riposi, +1 dado vita recuperato' },
      guaritore: { label: 'Guaritore', max: 1, benefits: 'Cura gratuita, kit del guaritore infinito' },
      esploratore: { label: 'Esploratore', max: 2, benefits: '+5 Percezione passiva in viaggio' },
      diplomatico: { label: 'Diplomatico', max: 1, benefits: '+2 Persuasione, riduce infamia' },
      sicario: { label: 'Sicario', max: 2, benefits: '+1d6 danni furtivi 1/combattimento' },
      intrattenitore: { label: 'Intrattenitore', max: 1, benefits: 'Guadagni extra nelle taverne' }
    };
  }

  static initialize() {
    console.log('Inizializzazione CompagniaManager...');

    // Registrazione settings
    game.settings.register('brancalonia-bigat', 'compagniaAutoShare', {
      name: 'Condivisione Automatica Bottino',
      hint: 'Condivide automaticamente il bottino tra i membri della compagnia',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register('brancalonia-bigat', 'compagniaNotifications', {
      name: 'Notifiche Compagnia',
      hint: 'Mostra notifiche per eventi della compagnia',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    // Creazione istanza globale
    if (!game.brancalonia) game.brancalonia = {};
    const manager = new CompagniaManager();
    game.brancalonia.compagnia = manager;
    window.CompagniaManager = CompagniaManager; // Mantieni la classe, non l'istanza

    // Registrazione hooks statici
    CompagniaManager._registerHooks();

    // Registrazione comandi chat
    CompagniaManager._registerChatCommands();

    // Creazione macro automatica
    CompagniaManager._createMacro();

    console.log('CompagniaManager inizializzato correttamente!');
  }

  static _registerHooks() {
    // Hook per aggiungere tab Compagnia alle schede personaggio
    Hooks.on('renderActorSheet', (app, html, data) => {
      const manager = game.brancalonia?.compagnia;
      if (!manager) return;

      if (app.actor.type === 'character' && manager._isInCompagnia(app.actor)) {
        manager._addCompagniaTab(app, html);
      }
    });

    // Hook per dividere automaticamente il bottino
    Hooks.on('createItem', (item, options, userId) => {
      const manager = game.brancalonia?.compagnia;
      if (!manager) return;

      if (item.parent?.type === 'character' && item.type === 'loot') {
        manager._checkLootSharing(item);
      }
    });

    // Hook per aggiornare infamia collettiva quando cambia l'infamia di un membro
    Hooks.on('updateActor', async (actor, updateData, options, userId) => {
      const manager = game.brancalonia?.compagnia;
      if (!manager) return;

      if (actor.type === 'character' && updateData.flags?.['brancalonia-bigat']?.infamia !== undefined) {
        const compagniaId = actor.flags['brancalonia-bigat']?.compagniaId;
        if (compagniaId) {
          const compagnia = game.actors.get(compagniaId);
          if (compagnia) {
            await manager.calculateCollectiveInfamia(compagnia);
          }
        }
      }
    });

    // Hook per socket listeners
    game.socket.on('module.brancalonia-bigat', (data) => {
      const manager = game.brancalonia?.compagnia;
      if (!manager) return;

      if (data.type === 'compagnia-update') {
        manager._handleCompagniaUpdate(data);
      }
    });

    console.log('CompagniaManager hooks registrati!');
  }

  static _registerChatCommands() {
    // Hook per processare comandi chat
    Hooks.on('chatMessage', (html, content, msg) => {
      // Parse del comando
      if (!content.startsWith('/compagnia-')) return true;

      const parts = content.split(' ');
      const command = parts[0];
      const parameters = parts.slice(1).join(' ');

      // Previeni il messaggio normale
      if (command.startsWith('/compagnia-')) {
        window.CompagniaManager._handleChatCommand(command, parameters);
        return false; // Blocca il messaggio
      }

      return true;
    });

    console.log('CompagniaManager comandi chat registrati!');
  }

  static async _handleChatCommand(command, parameters) {
    switch (command) {
      case '/compagnia-crea':
        await CompagniaManager._commandCreateCompagnia(parameters);
        break;
      case '/compagnia-aggiungi':
        await CompagniaManager._commandAddMember();
        break;
      case '/compagnia-ruolo':
        await CompagniaManager._commandAssignRole(parameters);
        break;
      case '/compagnia-tesoro':
        await CompagniaManager._commandManageTreasury();
        break;
      case '/compagnia-help':
        CompagniaManager._commandShowHelp();
        break;
      default:
        ui.notifications.warn("Comando compagnia non riconosciuto. Usa /compagnia-help per l'aiuto.");
    }
  }

  static async _commandCreateCompagnia(parameters) {
    const tokens = canvas.tokens.controlled;
    if (tokens.length < 2) {
      ui.notifications.error('Seleziona almeno 2 token per creare una compagnia!');
      return;
    }

    const actors = tokens.map(t => t.actor).filter(a => a.type === 'character');
    if (actors.length < 2) {
      ui.notifications.error('Seleziona almeno 2 personaggi per creare una compagnia!');
      return;
    }

    const name = parameters || 'Compagnia Senza Nome';
    const compagnia = await window.CompagniaManager.createCompagnia(actors, name);

    if (compagnia) {
      ChatMessage.create({
        content: `Compagnia "${compagnia.name}" creata con successo!`,
        speaker: { alias: 'Sistema Compagnia' }
      });
    }
  }

  static async _commandAddMember() {
    const tokens = canvas.tokens.controlled;
    if (tokens.length !== 1) {
      ui.notifications.error('Seleziona un solo token!');
      return;
    }

    const actor = tokens[0].actor;
    if (actor.type !== 'character') {
      ui.notifications.error('Seleziona un personaggio!');
      return;
    }

    // Trova compagnia del speaker
    const speaker = ChatMessage.getSpeaker();
    const speakerActor = game.actors.get(speaker.actor);
    const compagniaId = speakerActor?.flags['brancalonia-bigat']?.compagniaId;

    if (!compagniaId) {
      ui.notifications.error('Non sei membro di nessuna compagnia!');
      return;
    }

    const compagnia = game.actors.get(compagniaId);
    if (compagnia) {
      await window.CompagniaManager.addMember(compagnia, actor);
    }
  }

  static async _commandAssignRole(parameters) {
    const params = parameters.split(' ');
    if (params.length < 2) {
      ui.notifications.error('Uso: /compagnia-ruolo [nome_personaggio] [ruolo]');
      return;
    }

    const actorName = params[0];
    const role = params[1];

    const actor = game.actors.find(a => a.name.toLowerCase() === actorName.toLowerCase());
    if (!actor) {
      ui.notifications.error('Personaggio non trovato!');
      return;
    }

    const compagniaId = actor.flags['brancalonia-bigat']?.compagniaId;
    if (!compagniaId) {
      ui.notifications.error('Il personaggio non è membro di una compagnia!');
      return;
    }

    const compagnia = game.actors.get(compagniaId);
    if (compagnia) {
      await window.CompagniaManager.assignRole(compagnia, actor.id, role);
    }
  }

  static async _commandManageTreasury() {
    const speaker = ChatMessage.getSpeaker();
    const speakerActor = game.actors.get(speaker.actor);
    const compagniaId = speakerActor?.flags['brancalonia-bigat']?.compagniaId;

    if (!compagniaId) {
      ui.notifications.error('Non sei membro di nessuna compagnia!');
      return;
    }

    const compagnia = game.actors.get(compagniaId);
    if (compagnia) {
      window.CompagniaManager._showTreasuryDialog(compagnia);
    }
  }

  static _commandShowHelp() {
    const helpText = `
      <div class="brancalonia-help">
        <h3>Comandi Compagnia</h3>
        <ul>
          <li><strong>/compagnia-crea [nome]</strong> - Crea nuova compagnia</li>
          <li><strong>/compagnia-aggiungi</strong> - Aggiunge personaggio selezionato</li>
          <li><strong>/compagnia-ruolo [nome] [ruolo]</strong> - Assegna ruolo</li>
          <li><strong>/compagnia-tesoro</strong> - Gestisce tesoro comune</li>
          <li><strong>/compagnia-help</strong> - Mostra questo aiuto</li>
        </ul>
        <h4>Ruoli Disponibili:</h4>
        <ul>
          <li>capitano, tesoriere, cuoco, guaritore</li>
          <li>esploratore, diplomatico, sicario, intrattenitore</li>
        </ul>
      </div>
    `;

    ChatMessage.create({
      content: helpText,
      speaker: { alias: 'Sistema Compagnia' },
      whisper: [game.user.id]
    });
  }

  static _createMacro() {
    // Usiamo una normale stringa e escape manuale per evitare conflitti di sintassi
    const macroCommand = [
      '// Macro per Gestione Compagnia',
      'const tokens = canvas.tokens.controlled;',
      'if (tokens.length === 0) {',
      "  ui.notifications.warn('Seleziona almeno un token!');",
      '} else if (tokens.length === 1) {',
      '  const actor = tokens[0].actor;',
      "  if (actor.type === 'character') {",
      "    const compagniaId = actor.flags['brancalonia-bigat']?.compagniaId;",
      '    if (compagniaId) {',
      '      const compagnia = game.actors.get(compagniaId);',
      '      if (compagnia) {',
      '        window.CompagniaManager._showTreasuryDialog(compagnia);',
      '      } else {',
      "        ui.notifications.error('Compagnia non trovata!');",
      '      }',
      '    } else {',
      "      ui.notifications.info('Questo personaggio non è membro di una compagnia. Usa /compagnia-crea per crearne una.');",
      '    }',
      '  } else {',
      "    ui.notifications.error('Seleziona un personaggio!');",
      '  }',
      '} else {',
      '  // Multipli token selezionati - proponi creazione compagnia',
      "  const actors = tokens.map(t => t.actor).filter(a => a.type === 'character');",
      '  if (actors.length >= 2) {',
      "    const memberNames = actors.map(a => a.name).join(', ');",
      '    new Dialog({',
      "      title: 'Crea Compagnia',",
      "      content: '<form>' +",
      "        '<div class=\"form-group\">' +",
      "        '<label>Nome Compagnia:</label>' +",
      "        '<input type=\"text\" id=\"compagnia-name\" value=\"Compagnia Senza Nome\" />' +",
      "        '</div>' +",
      "        '<p>Membri selezionati: ' + memberNames + '</p>' +",
      "        '</form>',",
      '      buttons: {',
      '        create: {',
      "          label: 'Crea',",
      '          callback: async (html) => {',
      "            const name = html.find('#compagnia-name').val();",
      '            await window.CompagniaManager.createCompagnia(actors, name);',
      '          }',
      '        },',
      "        cancel: { label: 'Annulla' }",
      '      },',
      "      default: 'create'",
      '    }).render(true);',
      '  } else {',
      "    ui.notifications.error('Seleziona almeno 2 personaggi per creare una compagnia!');",
      '  }',
      '}'
    ].join('\n');

    const macroData = {
      name: 'Gestione Compagnia',
      type: 'script',
      scope: 'global',
      command: macroCommand,
      img: 'icons/environment/people/group.webp',
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
      game.macros.documentClass.create(macroData).then(() => {
        console.log('Macro Gestione Compagnia creata!');
      });
    }
  }


  /**
   * Crea una nuova compagnia
   */
  async createCompagnia(actors, name = 'Compagnia Senza Nome') {
    // Verifica che ci siano almeno 2 membri
    if (actors.length < 2) {
      ui.notifications.error('Una compagnia richiede almeno 2 membri!');
      return null;
    }

    // Crea l'actor per la compagnia (usa tipo npc con flag personalizzati)
    const compagniaData = {
      name,
      type: 'npc', // Usa tipo standard dnd5e con flag personalizzati
      img: 'icons/environment/people/group.webp',
      system: {
        description: {
          value: `<h2>${name}</h2><p>Una compagnia di ventura del Regno di Taglia.</p>`
        },
        details: {
          type: { value: 'humanoid' },
          cr: 0,
          spellLevel: 0,
          source: 'Brancalonia'
        }
      },
      flags: {
        'brancalonia-bigat': {
          isCompagnia: true,
          isGroupActor: true, // Flag per identificarlo come gruppo
          members: actors.map(a => ({
            actorId: a.id,
            role: null,
            joinDate: new Date().toISOString(),
            share: 1 // Quote del bottino
          })),
          treasury: 0,
          reputation: 0,
          infamiaCollettiva: 0,
          jobs: [],
          haven: null,
          createdDate: new Date().toISOString(),
          charter: {
            rules: [],
            lootDivision: 'equal', // equal, shares, merit
            decisions: 'vote' // vote, captain, consensus
          }
        }
      }
    };

    const compagnia = await Actor.create(compagniaData);

    // Imposta flag su ogni membro
    for (const actor of actors) {
      await actor.setFlag('brancalonia-bigat', 'compagniaId', compagnia.id);
      await actor.setFlag('brancalonia-bigat', 'compagniaRole', null);
    }

    // Notifica creazione
    ChatMessage.create({
      content: `
        <div class="brancalonia-compagnia-created">
          <h2>🏴 Nuova Compagnia Fondata! 🏴</h2>
          <h3>${name}</h3>
          <p><strong>Membri Fondatori:</strong></p>
          <ul>
            ${actors.map(a => `<li>${a.name}</li>`).join('')}
          </ul>
          <p><em>Che la fortuna vi accompagni nelle vostre imprese!</em></p>
        </div>
      `,
      speaker: { alias: 'Sistema Compagnia' }
    });

    return compagnia;
  }

  /**
   * Aggiunge un membro alla compagnia
   */
  async addMember(compagnia, actor, role = null) {
    const members = compagnia.flags['brancalonia-bigat'].members || [];

    // Verifica che non sia già membro
    if (members.find(m => m.actorId === actor.id)) {
      ui.notifications.warn(`${actor.name} è già membro della compagnia!`);
      return;
    }

    // Aggiungi nuovo membro
    members.push({
      actorId: actor.id,
      role,
      joinDate: new Date().toISOString(),
      share: 1
    });

    await compagnia.setFlag('brancalonia-bigat', 'members', members);
    await actor.setFlag('brancalonia-bigat', 'compagniaId', compagnia.id);
    await actor.setFlag('brancalonia-bigat', 'compagniaRole', role);

    // Notifica
    ChatMessage.create({
      content: `${actor.name} si è unito alla compagnia ${compagnia.name}!`,
      speaker: { alias: 'Sistema Compagnia' }
    });
  }

  /**
   * Rimuove un membro dalla compagnia
   */
  async removeMember(compagnia, actorId) {
    let members = compagnia.flags['brancalonia-bigat'].members || [];
    const actor = game.actors.get(actorId);

    members = members.filter(m => m.actorId !== actorId);

    await compagnia.setFlag('brancalonia-bigat', 'members', members);

    if (actor) {
      await actor.unsetFlag('brancalonia-bigat', 'compagniaId');
      await actor.unsetFlag('brancalonia-bigat', 'compagniaRole');
    }

    ChatMessage.create({
      content: `${actor?.name || 'Un membro'} ha lasciato la compagnia ${compagnia.name}.`,
      speaker: { alias: 'Sistema Compagnia' }
    });
  }

  /**
   * Assegna un ruolo a un membro
   */
  async assignRole(compagnia, actorId, role) {
    // Verifica che il ruolo sia valido
    if (!this.compagniaRoles[role]) {
      ui.notifications.error('Ruolo non valido!');
      return;
    }

    // Verifica limiti del ruolo
    const members = compagnia.flags['brancalonia-bigat'].members || [];
    const currentRoleCount = members.filter(m => m.role === role).length;

    if (currentRoleCount >= this.compagniaRoles[role].max) {
      ui.notifications.error(`Limite massimo per ${this.compagniaRoles[role].label} raggiunto!`);
      return;
    }

    // Assegna ruolo
    const memberIndex = members.findIndex(m => m.actorId === actorId);
    if (memberIndex >= 0) {
      members[memberIndex].role = role;
      await compagnia.setFlag('brancalonia-bigat', 'members', members);

      const actor = game.actors.get(actorId);
      if (actor) {
        await actor.setFlag('brancalonia-bigat', 'compagniaRole', role);

        ChatMessage.create({
          content: `${actor.name} è ora ${this.compagniaRoles[role].label} della compagnia!`,
          speaker: { alias: 'Sistema Compagnia' }
        });
      }
    }
  }

  /**
   * Calcola l'infamia collettiva della compagnia
   */
  async calculateCollectiveInfamia(compagnia) {
    const members = compagnia.flags['brancalonia-bigat'].members || [];
    let totalInfamia = 0;
    let count = 0;

    for (const member of members) {
      const actor = game.actors.get(member.actorId);
      if (actor) {
        totalInfamia += actor.flags['brancalonia-bigat']?.infamia || 0;
        count++;
      }
    }

    const collectiveInfamia = count > 0 ? Math.floor(totalInfamia / count) : 0;
    await compagnia.setFlag('brancalonia-bigat', 'infamiaCollettiva', collectiveInfamia);

    return collectiveInfamia;
  }

  /**
   * Gestisce il tesoro della compagnia
   */
  async modifyTreasury(compagnia, amount, description = '') {
    const currentTreasury = compagnia.flags['brancalonia-bigat'].treasury || 0;
    const newTreasury = Math.max(0, currentTreasury + amount);

    await compagnia.setFlag('brancalonia-bigat', 'treasury', newTreasury);

    // Log transazione
    const transaction = {
      date: new Date().toISOString(),
      amount,
      description,
      balance: newTreasury
    };

    const transactions = compagnia.flags['brancalonia-bigat'].transactions || [];
    transactions.push(transaction);
    await compagnia.setFlag('brancalonia-bigat', 'transactions', transactions);

    // Notifica
    ChatMessage.create({
      content: `
        <div class="brancalonia-treasury">
          <h3>💰 Tesoro della Compagnia</h3>
          <p>${amount > 0 ? 'Entrata' : 'Uscita'}: ${Math.abs(amount)} ducati</p>
          ${description ? `<p><em>${description}</em></p>` : ''}
          <p><strong>Bilancio attuale:</strong> ${newTreasury} ducati</p>
        </div>
      `,
      speaker: { alias: compagnia.name }
    });
  }

  /**
   * Divide il bottino tra i membri
   */
  async divideLoot(compagnia, totalAmount) {
    const members = compagnia.flags['brancalonia-bigat'].members || [];
    const divisionType = compagnia.flags['brancalonia-bigat'].charter?.lootDivision || 'equal';

    const distributions = [];

    switch (divisionType) {
      case 'equal':
        // Divisione equa
        const equalShare = Math.floor(totalAmount / members.length);
        const remainder = totalAmount % members.length;

        for (const member of members) {
          distributions.push({
            actorId: member.actorId,
            amount: equalShare
          });
        }

        // Il resto va al tesoro comune
        if (remainder > 0) {
          await this.modifyTreasury(compagnia, remainder, 'Resto della divisione del bottino');
        }
        break;

      case 'shares':
        // Divisione per quote
        const totalShares = members.reduce((sum, m) => sum + (m.share || 1), 0);
        const shareValue = Math.floor(totalAmount / totalShares);

        for (const member of members) {
          distributions.push({
            actorId: member.actorId,
            amount: shareValue * (member.share || 1)
          });
        }
        break;

      case 'merit':
        // Divisione per merito (basata su ruolo)
        const meritShares = {
          capitano: 2,
          tesoriere: 1.5,
          sicario: 1.5,
          default: 1
        };

        const totalMerit = members.reduce((sum, m) =>
          sum + (meritShares[m.role] || meritShares.default), 0
        );
        const meritValue = Math.floor(totalAmount / totalMerit);

        for (const member of members) {
          const merit = meritShares[member.role] || meritShares.default;
          distributions.push({
            actorId: member.actorId,
            amount: Math.floor(meritValue * merit)
          });
        }
        break;
    }

    // Distribuisci ai membri
    let distributionReport = `<h3>Divisione del Bottino</h3><p>Totale: ${totalAmount} ducati</p><ul>`;

    for (const dist of distributions) {
      const actor = game.actors.get(dist.actorId);
      if (actor) {
        // Aggiungi denaro all'attore - compatibile con D&D 5e v3+
        const currentGold = actor.system.currency?.gp || 0; // Usa gp (gold pieces) come base
        await actor.update({
          'system.currency.gp': currentGold + dist.amount
        });

        distributionReport += `<li>${actor.name}: ${dist.amount} ducati</li>`;
      }
    }

    distributionReport += `</ul>`;

    ChatMessage.create({
      content: distributionReport,
      speaker: { alias: compagnia.name }
    });
  }

  /**
   * Aggiunge tab Compagnia alla scheda del personaggio
   */
  _addCompagniaTab(app, html) {
    // Converti html in jQuery object per Foundry v13
    const $html = $(html);

    const compagniaId = app.actor.flags['brancalonia-bigat']?.compagniaId;
    if (!compagniaId) return;

    const compagnia = game.actors.get(compagniaId);
    if (!compagnia) return;

    // Aggiungi tab
    const tabs = $html.find('.tabs[data-group="primary"]');
    tabs.append('<a class="item" data-tab="compagnia">Compagnia</a>');

    // Crea contenuto tab
    const members = compagnia.flags['brancalonia-bigat'].members || [];
    const membersList = members.map(m => {
      const actor = game.actors.get(m.actorId);
      const role = m.role ? this.compagniaRoles[m.role]?.label : 'Nessun ruolo';
      return `
        <li>
          <strong>${actor?.name || 'Sconosciuto'}</strong>
          <span class="role">${role}</span>
          <span class="infamia">Infamia: ${actor?.flags['brancalonia-bigat']?.infamia || 0}</span>
        </li>
      `;
    }).join('');

    const tabContent = `
      <div class="tab compagnia" data-group="primary" data-tab="compagnia">
        <h2>${compagnia.name}</h2>

        <div class="compagnia-stats">
          <div class="stat">
            <label>Tesoro Comune:</label>
            <span>${compagnia.flags['brancalonia-bigat'].treasury || 0} ducati</span>
          </div>
          <div class="stat">
            <label>Reputazione:</label>
            <span>${compagnia.flags['brancalonia-bigat'].reputation || 0}</span>
          </div>
          <div class="stat">
            <label>Infamia Collettiva:</label>
            <span>${compagnia.flags['brancalonia-bigat'].infamiaCollettiva || 0}</span>
          </div>
        </div>

        <h3>Membri</h3>
        <ul class="compagnia-members">
          ${membersList}
        </ul>

        <h3>Il Mio Ruolo</h3>
        <div class="my-role">
          <strong>${app.actor.flags['brancalonia-bigat']?.compagniaRole ?
    this.compagniaRoles[app.actor.flags['brancalonia-bigat'].compagniaRole]?.label :
    'Nessun ruolo assegnato'
}</strong>
          ${app.actor.flags['brancalonia-bigat']?.compagniaRole ?
    `<p>${this.compagniaRoles[app.actor.flags['brancalonia-bigat'].compagniaRole]?.benefits}</p>` :
    ''
}
        </div>

        <div class="compagnia-actions">
          <button class="compagnia-treasury">Gestisci Tesoro</button>
          <button class="compagnia-jobs">Visualizza Lavori</button>
          <button class="compagnia-charter">Statuto</button>
        </div>
      </div>
    `;

    const sheetBody = $html.find('.sheet-body');
    sheetBody.append(tabContent);

    // Event handlers
    $html.find('.compagnia-treasury').click(() => this._showTreasuryDialog(compagnia));
    $html.find('.compagnia-jobs').click(() => this._showJobsDialog(compagnia));
    $html.find('.compagnia-charter').click(() => this._showCharterDialog(compagnia));

    // CSS per il tab
    if (!$('#brancalonia-compagnia-styles').length) {
      $('head').append(`
        <style id="brancalonia-compagnia-styles">
          .tab.compagnia {
            padding: 10px;
          }

          .compagnia-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 10px 0;
            padding: 10px;
            background: rgba(139, 69, 19, 0.1);
            border: 1px solid #8b4513;
            border-radius: 5px;
          }

          .compagnia-stats .stat {
            text-align: center;
          }

          .compagnia-stats label {
            display: block;
            font-weight: bold;
            color: #8b4513;
          }

          .compagnia-members {
            list-style: none;
            padding: 0;
          }

          .compagnia-members li {
            padding: 5px;
            margin: 2px 0;
            background: rgba(0,0,0,0.05);
            border-radius: 3px;
            display: flex;
            justify-content: space-between;
          }

          .my-role {
            padding: 10px;
            background: rgba(139, 69, 19, 0.1);
            border-left: 3px solid #8b4513;
            margin: 10px 0;
          }

          .compagnia-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
          }

          .compagnia-actions button {
            flex: 1;
          }
        </style>
      `);
    }
  }

  /**
   * Mostra dialog per gestione tesoro
   */
  _showTreasuryDialog(compagnia) {
    const content = `
      <form>
        <div class="form-group">
          <label>Operazione:</label>
          <select id="operation">
            <option value="deposit">Deposita</option>
            <option value="withdraw">Preleva</option>
            <option value="divide">Dividi tra membri</option>
          </select>
        </div>
        <div class="form-group">
          <label>Ammontare (ducati):</label>
          <input type="number" id="amount" value="0" min="0" />
        </div>
        <div class="form-group">
          <label>Descrizione:</label>
          <input type="text" id="description" placeholder="Motivo della transazione..." />
        </div>
        <hr>
        <p><strong>Bilancio attuale:</strong> ${compagnia.flags['brancalonia-bigat'].treasury || 0} ducati</p>
      </form>
    `;

    new Dialog({
      title: `Tesoro - ${compagnia.name}`,
      content,
      buttons: {
        execute: {
          label: 'Esegui',
          callback: async (html) => {
            const operation = html.find('#operation').val();
            const amount = parseInt(html.find('#amount').val()) || 0;
            const description = html.find('#description').val();

            switch (operation) {
              case 'deposit':
                await this.modifyTreasury(compagnia, amount, description);
                break;
              case 'withdraw':
                await this.modifyTreasury(compagnia, -amount, description);
                break;
              case 'divide':
                await this.divideLoot(compagnia, amount);
                break;
            }
          }
        },
        cancel: {
          label: 'Annulla'
        }
      },
      default: 'execute'
    }).render(true);
  }

  /**
   * Mostra dialog dei lavori
   */
  _showJobsDialog(compagnia) {
    const jobs = compagnia.flags['brancalonia-bigat'].jobs || [];

    const content = `
      <div class="compagnia-jobs-list">
        <h3>Lavori Attivi</h3>
        ${jobs.filter(j => !j.completed).map(job => `
          <div class="job-card">
            <h4>${job.name}</h4>
            <p>${job.description}</p>
            <p><strong>Ricompensa:</strong> ${job.reward} ducati</p>
            <p><strong>Infamia:</strong> +${job.infamyGain}</p>
          </div>
        `).join('') || '<p>Nessun lavoro attivo</p>'}

        <h3>Lavori Completati</h3>
        ${jobs.filter(j => j.completed).map(job => `
          <div class="job-card completed">
            <h4>${job.name}</h4>
            <p><strong>Ricompensa:</strong> ${job.reward} ducati</p>
            <p><strong>Completato:</strong> ${new Date(job.completedDate).toLocaleDateString()}</p>
          </div>
        `).join('') || '<p>Nessun lavoro completato</p>'}
      </div>
    `;

    new Dialog({
      title: `Lavori - ${compagnia.name}`,
      content,
      buttons: {
        close: {
          label: 'Chiudi'
        }
      },
      default: 'close'
    }).render(true);
  }

  /**
   * Mostra dialog dello statuto
   */
  _showCharterDialog(compagnia) {
    const charter = compagnia.flags['brancalonia-bigat'].charter || {};

    const content = `
      <div class="compagnia-charter">
        <h3>Statuto della Compagnia</h3>

        <div class="charter-section">
          <h4>Divisione del Bottino</h4>
          <p>${charter.lootDivision === 'equal' ? 'Divisione Equa' :
    charter.lootDivision === 'shares' ? 'Divisione per Quote' :
      'Divisione per Merito'}</p>
        </div>

        <div class="charter-section">
          <h4>Processo Decisionale</h4>
          <p>${charter.decisions === 'vote' ? 'Votazione Democratica' :
    charter.decisions === 'captain' ? 'Decisione del Capitano' :
      'Consenso Unanime'}</p>
        </div>

        <div class="charter-section">
          <h4>Regole della Compagnia</h4>
          <ol>
            ${(charter.rules || []).map(rule => `<li>${rule}</li>`).join('') ||
              '<li>Nessuna regola stabilita</li>'}
          </ol>
        </div>
      </div>
    `;

    new Dialog({
      title: `Statuto - ${compagnia.name}`,
      content,
      buttons: {
        edit: {
          label: 'Modifica',
          callback: () => this._editCharterDialog(compagnia)
        },
        close: {
          label: 'Chiudi'
        }
      },
      default: 'close'
    }).render(true);
  }

  /**
   * Dialog per modificare lo statuto
   */
  _editCharterDialog(compagnia) {
    // Solo il capitano o con consenso può modificare
    // Implementazione dettagliata...
  }

  /**
   * Verifica se un attore è in una compagnia
   */
  _isInCompagnia(actor) {
    return !!actor.flags['brancalonia-bigat']?.compagniaId;
  }

  /**
   * Controlla se il bottino deve essere condiviso
   */
  _checkLootSharing(item) {
    const actor = item.parent;
    if (!actor || !this._isInCompagnia(actor)) return;

    // Notifica della condivisione
    const compagniaId = actor.flags['brancalonia-bigat'].compagniaId;
    const compagnia = game.actors.get(compagniaId);

    // Check for item value in D&D 5e v3+ format
    const itemValue = item.system.price?.value || item.system.cost || 0;
    if (compagnia && itemValue > 0) {
      ChatMessage.create({
        content: `${actor.name} ha trovato ${item.name} (valore: ${itemValue} ducati). Condividere con la compagnia?`,
        speaker: { alias: compagnia.name },
        whisper: ChatMessage.getWhisperRecipients('GM')
      });
    }
  }

  /**
   * Gestisce aggiornamenti della compagnia via socket
   */
  _handleCompagniaUpdate(data) {
    // Aggiorna UI per tutti i client
    ui.actors.render();
  }
}

// Esporta la classe per uso come modulo
export { CompagniaManager };