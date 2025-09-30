/**
 * BRANCALONIA WILDERNESS ENCOUNTERS
 * Sistema di incontri selvaggi per Brancalonia
 * Integra il privilegio Brado che permette di evitare bestie ostili
 */

class WildernessEncounters {
  static ID = 'brancalonia-bigat';
  static VERSION = '1.0.0';

  /**
   * Tabelle degli incontri per tipo di terreno
   */
  static encounterTables = {
    forest: {
      name: 'Foresta',
      encounters: [
        { roll: [1, 2], type: 'beast', creature: 'Lupi (1d4+1)', hostile: true, cr: 1/4 },
        { roll: [3, 4], type: 'beast', creature: 'Orso Bruno', hostile: true, cr: 1 },
        { roll: [5, 6], type: 'beast', creature: 'Cinghiale Selvatico', hostile: true, cr: 1/4 },
        { roll: [7, 8], type: 'humanoid', creature: 'Briganti (1d6)', hostile: true, cr: 1/8 },
        { roll: [9, 10], type: 'beast', creature: 'Cervo', hostile: false, cr: 0 },
        { roll: [11, 12], type: 'humanoid', creature: 'Cacciatore Solitario', hostile: false, cr: 1/2 },
        { roll: [13, 14], type: 'fey', creature: 'Folletto Dispettoso', hostile: false, cr: 1/4 },
        { roll: [15, 16], type: 'beast', creature: 'Serpente Velenoso', hostile: true, cr: 1/8 },
        { roll: [17, 18], type: 'humanoid', creature: 'Pellegrini Smarriti', hostile: false, cr: 0 },
        { roll: [19, 20], type: 'special', creature: 'Nessun Incontro', hostile: false, cr: 0 }
      ]
    },
    mountain: {
      name: 'Montagna',
      encounters: [
        { roll: [1, 2], type: 'beast', creature: 'Aquila Gigante', hostile: true, cr: 1 },
        { roll: [3, 4], type: 'beast', creature: 'Capre di Montagna (1d6)', hostile: false, cr: 0 },
        { roll: [5, 6], type: 'humanoid', creature: 'Contrabbandieri (1d4+1)', hostile: true, cr: 1/8 },
        { roll: [7, 8], type: 'giant', creature: 'Orco Solitario', hostile: true, cr: 2 },
        { roll: [9, 10], type: 'beast', creature: 'Puma', hostile: true, cr: 1/4 },
        { roll: [11, 12], type: 'elemental', creature: 'Rocce Cadenti (Hazard)', hostile: true, cr: 1 },
        { roll: [13, 14], type: 'humanoid', creature: 'Eremita', hostile: false, cr: 0 },
        { roll: [15, 16], type: 'beast', creature: 'Pipistrelli (Swarm)', hostile: false, cr: 1/4 },
        { roll: [17, 18], type: 'humanoid', creature: 'Minatori', hostile: false, cr: 1/8 },
        { roll: [19, 20], type: 'special', creature: 'Nessun Incontro', hostile: false, cr: 0 }
      ]
    },
    swamp: {
      name: 'Palude',
      encounters: [
        { roll: [1, 2], type: 'beast', creature: 'Coccodrillo', hostile: true, cr: 1/2 },
        { roll: [3, 4], type: 'undead', creature: 'Zombi del Pantano (1d4)', hostile: true, cr: 1/4 },
        { roll: [5, 6], type: 'beast', creature: 'Serpenti Velenosi (1d6)', hostile: true, cr: 1/8 },
        { roll: [7, 8], type: 'plant', creature: 'Liana Assassina', hostile: true, cr: 1/2 },
        { roll: [9, 10], type: 'beast', creature: 'Rane Giganti', hostile: false, cr: 1/4 },
        { roll: [11, 12], type: 'humanoid', creature: 'Strega della Palude', hostile: false, cr: 2 },
        { roll: [13, 14], type: 'aberration', creature: 'Fuoco Fatuo', hostile: true, cr: 2 },
        { roll: [15, 16], type: 'beast', creature: 'Insetti (Swarm)', hostile: false, cr: 1/2 },
        { roll: [17, 18], type: 'humanoid', creature: 'Pescatore Solitario', hostile: false, cr: 0 },
        { roll: [19, 20], type: 'special', creature: 'Nessun Incontro', hostile: false, cr: 0 }
      ]
    },
    plains: {
      name: 'Pianura',
      encounters: [
        { roll: [1, 2], type: 'beast', creature: 'Lupi (1d6)', hostile: true, cr: 1/4 },
        { roll: [3, 4], type: 'humanoid', creature: 'Banditi a Cavallo (1d4)', hostile: true, cr: 1/8 },
        { roll: [5, 6], type: 'beast', creature: 'Cavalli Selvaggi', hostile: false, cr: 1/4 },
        { roll: [7, 8], type: 'humanoid', creature: 'Mercanti in Viaggio', hostile: false, cr: 0 },
        { roll: [9, 10], type: 'beast', creature: 'Bisonti (1d4)', hostile: false, cr: 1/4 },
        { roll: [11, 12], type: 'humanoid', creature: 'Pattuglia di Guardie', hostile: false, cr: 1/8 },
        { roll: [13, 14], type: 'beast', creature: 'Falco', hostile: false, cr: 0 },
        { roll: [15, 16], type: 'humanoid', creature: 'Nomadi', hostile: false, cr: 0 },
        { roll: [17, 18], type: 'beast', creature: 'Cani Selvaggi (1d6)', hostile: true, cr: 1/8 },
        { roll: [19, 20], type: 'special', creature: 'Nessun Incontro', hostile: false, cr: 0 }
      ]
    }
  };

  /**
   * Inizializzazione
   */
  static initialize() {
    console.log('🌲 Brancalonia | Inizializzazione sistema incontri selvaggi');

    this._registerSettings();
    this._registerHooks();
    this._registerChatCommands();
    this._createMacros();

    // Registra globalmente
    game.brancalonia = game.brancalonia || {};
    game.brancalonia.wilderness = this;

    console.log('✅ Sistema incontri selvaggi inizializzato');
  }

  /**
   * Registra impostazioni
   */
  static _registerSettings() {
    game.settings.register(this.ID, 'enableWildernessEncounters', {
      name: 'Abilita Incontri Selvaggi',
      hint: 'Attiva il sistema di incontri casuali nelle terre selvagge',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(this.ID, 'encounterFrequency', {
      name: 'Frequenza Incontri',
      hint: 'Probabilità di incontro per ora di viaggio',
      scope: 'world',
      config: true,
      type: Number,
      range: {
        min: 0,
        max: 100,
        step: 5
      },
      default: 15
    });

    game.settings.register(this.ID, 'bradoProtection', {
      name: 'Protezione Brado',
      hint: 'I personaggi con background Brado evitano automaticamente bestie ostili',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  /**
   * Registra hooks
   */
  static _registerHooks() {
    // Hook per quando inizia un viaggio
    Hooks.on('brancalonia.travelStart', (party, destination, terrain) => {
      this.checkForEncounter(party, terrain);
    });

    // Hook per controllo orario durante viaggi
    Hooks.on('updateWorldTime', (worldTime, dt) => {
      // Ogni ora di gioco, controlla per incontri
      if (dt >= 3600) { // 1 ora in secondi
        this.hourlyEncounterCheck();
      }
    });

    // Hook per modificare sheet con pulsante incontri
    Hooks.on('renderSidebarTab', (app, html) => {
      if (app.options.id === 'scenes') {
        this._addEncounterButton(html);
      }
    });
  }

  /**
   * Registra comandi chat
   */
  static _registerChatCommands() {
    Hooks.on('chatMessage', (html, content, msg) => {
      if (content.startsWith('/incontro')) {
        const parts = content.split(' ');
        const terrain = parts[1] || 'forest';

        this.rollEncounter(terrain);
        return false;
      }

      if (content === '/incontri-help') {
        this.showHelp();
        return false;
      }

      return true;
    });
  }

  /**
   * Crea macro per incontri
   */
  static _createMacros() {
    Hooks.once('init', () => {
      const macroData = {
        name: 'Incontro Casuale',
        type: 'script',
        scope: 'global',
        command: `
// Macro per generare incontro casuale
const terrain = await Dialog.prompt({
  title: "Tipo di Terreno",
  content: \`
    <select id="terrain">
      <option value="forest">Foresta</option>
      <option value="mountain">Montagna</option>
      <option value="swamp">Palude</option>
      <option value="plains">Pianura</option>
    </select>
  \`,
  callback: (html) => html.find('#terrain').val()
});

if (terrain) {
  game.brancalonia.wilderness.rollEncounter(terrain);
}
        `,
        img: 'icons/environment/wilderness/tree-oak.webp'
      };

      // Crea macro se non esiste
      game.macros.find(m => m.name === macroData.name) ||
        game.macros.documentClass.create(macroData);
    });
  }

  /**
   * Tira per un incontro
   */
  static async rollEncounter(terrain = 'forest') {
    const table = this.encounterTables[terrain];
    if (!table) {
      ui.notifications.error(`Terreno "${terrain}" non valido!`);
      return;
    }

    // Tira 1d20
    const roll = await new Roll('1d20').evaluate();
    await roll.toMessage({ flavor: `Incontro in ${table.name}` });

    // Trova l'incontro
    const result = roll.total;
    const encounter = table.encounters.find(e =>
      result >= e.roll[0] && result <= e.roll[1]
    );

    if (!encounter) {
      ui.notifications.error('Errore nel trovare incontro!');
      return;
    }

    // Controlla privilegi Brado PRIMA di annunciare l'incontro
    let modifiedEncounter = await this._checkBradoPrivilege(encounter);

    // Crea messaggio
    await this._createEncounterMessage(modifiedEncounter, table.name);

    return modifiedEncounter;
  }

  /**
   * Controlla se un personaggio Brado può evitare l'incontro
   */
  static async _checkBradoPrivilege(encounter) {
    // Se non è una bestia ostile, non serve controllo
    if (encounter.type !== 'beast' || !encounter.hostile) {
      return encounter;
    }

    // Cerca personaggi con background Brado nel party
    const tokens = canvas.tokens.controlled;
    const bradoActors = [];

    for (const token of tokens) {
      const actor = token.actor;
      if (!actor) continue;

      // Controlla se ha il background Brado
      const background = actor.items.find(i =>
        i.type === 'background' &&
        i.name.toLowerCase().includes('brado')
      );

      if (background || actor.getFlag(this.ID, 'dimestichezzaSelvatica')) {
        bradoActors.push(actor);
      }
    }

    // Se c'è almeno un Brado, le bestie diventano neutrali
    if (bradoActors.length > 0) {
      // Chiama hook per altri moduli
      const modifiedEncounter = { ...encounter };

      // Il Brado calma le bestie
      for (const actor of bradoActors) {
        Hooks.callAll('brancalonia.wildEncounter', actor, modifiedEncounter);
      }

      // Roll per vedere se funziona (Addestrare Animali CD 10 + CR)
      const brado = bradoActors[0];
      const dc = 10 + (encounter.cr || 0);
      const roll = await brado.rollSkill('ani', {
        flavor: `Dimestichezza Selvatica - ${encounter.creature}`,
        targetValue: dc
      });

      if (roll.total >= dc) {
        modifiedEncounter.hostile = false;
        modifiedEncounter.bradoCalmed = true;
        modifiedEncounter.originalHostile = true;

        ChatMessage.create({
          content: `
            <div class="brancalonia-encounter-calm">
              <h3>🐾 Dimestichezza Selvatica!</h3>
              <p><strong>${brado.name}</strong> usa il suo legame con la natura.</p>
              <p>Le bestie riconoscono ${brado.name} come amico della selva.</p>
              <p><em>${encounter.creature} non sono più ostili!</em></p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor: brado })
        });

        return modifiedEncounter;
      } else {
        ChatMessage.create({
          content: `
            <div class="brancalonia-encounter-fail">
              <p><strong>${brado.name}</strong> tenta di calmare le bestie...</p>
              <p><em>Ma ${encounter.creature} sono troppo agitati!</em></p>
            </div>
          `,
          speaker: ChatMessage.getSpeaker({ actor: brado })
        });
      }
    }

    return encounter;
  }

  /**
   * Crea messaggio per incontro
   */
  static async _createEncounterMessage(encounter, terrainName) {
    const hostileClass = encounter.hostile ? 'hostile' : 'neutral';
    const hostileText = encounter.hostile ? '⚔️ OSTILE' : '☮️ NEUTRALE';

    // Se era ostile ma calmato da Brado
    const bradoNote = encounter.bradoCalmed ?
      '<p class="brado-note">🐾 <em>Calmato da Dimestichezza Selvatica</em></p>' : '';

    const content = `
      <div class="brancalonia-encounter ${hostileClass}">
        <h2>Incontro in ${terrainName}!</h2>
        <div class="encounter-details">
          <h3>${encounter.creature}</h3>
          <div class="encounter-info">
            <span class="encounter-type">Tipo: ${encounter.type}</span>
            <span class="encounter-cr">CR: ${encounter.cr}</span>
            <span class="encounter-hostile ${hostileClass}">${hostileText}</span>
          </div>
          ${bradoNote}
        </div>
        <div class="encounter-actions">
          ${encounter.hostile ? `
            <button onclick="game.combat?.startCombat()">⚔️ Inizia Combattimento</button>
            <button onclick="game.brancalonia.wilderness.attemptEscape()">🏃 Tenta Fuga</button>
          ` : `
            <button onclick="game.brancalonia.wilderness.peacefulInteraction()">💬 Interagisci</button>
            <button onclick="game.brancalonia.wilderness.avoidEncounter()">🚶 Evita</button>
          `}
        </div>
      </div>
    `;

    await ChatMessage.create({
      content,
      speaker: { alias: 'Incontro Selvaggio' }
    });
  }

  /**
   * Tenta fuga da incontro
   */
  static async attemptEscape() {
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
      ui.notifications.warn('Seleziona almeno un token!');
      return;
    }

    // Roll gruppo Furtività vs Percezione passiva creature
    const actor = tokens[0].actor;
    const roll = await actor.rollSkill('ste', {
      flavor: 'Tentativo di Fuga'
    });

    const dc = 12; // DC base per fuggire

    if (roll.total >= dc) {
      ChatMessage.create({
        content: `
          <div class="escape-success">
            <h3>✅ Fuga Riuscita!</h3>
            <p>Il gruppo riesce a dileguarsi senza essere inseguito.</p>
          </div>
        `
      });
    } else {
      ChatMessage.create({
        content: `
          <div class="escape-fail">
            <h3>❌ Fuga Fallita!</h3>
            <p>Le creature vi inseguono! Inizia il combattimento!</p>
          </div>
        `
      });
      game.combat?.startCombat();
    }
  }

  /**
   * Interazione pacifica
   */
  static async peacefulInteraction() {
    const tokens = canvas.tokens.controlled;
    if (tokens.length === 0) {
      ui.notifications.warn('Seleziona almeno un token!');
      return;
    }

    const actor = tokens[0].actor;

    // Dialog per tipo di interazione
    const interaction = await Dialog.prompt({
      title: 'Tipo di Interazione',
      content: `
        <select id="type">
          <option value="per">Persuasione - Negoziare</option>
          <option value="dec">Inganno - Mentire</option>
          <option value="itm">Intimidazione - Minacciare</option>
          <option value="prf">Intrattenere - Performance</option>
          <option value="ani">Addestrare Animali (solo bestie)</option>
        </select>
      `,
      callback: (html) => html.find('#type').val()
    });

    if (interaction) {
      const roll = await actor.rollSkill(interaction, {
        flavor: 'Interazione Pacifica'
      });

      const dc = 10;
      if (roll.total >= dc) {
        ChatMessage.create({
          content: `
            <div class="interaction-success">
              <h3>✅ Interazione Positiva!</h3>
              <p>Le creature rispondono favorevolmente.</p>
            </div>
          `
        });
      } else {
        ChatMessage.create({
          content: `
            <div class="interaction-fail">
              <h3>⚠️ Interazione Neutra</h3>
              <p>Le creature rimangono indifferenti.</p>
            </div>
          `
        });
      }
    }
  }

  /**
   * Evita incontro
   */
  static async avoidEncounter() {
    ChatMessage.create({
      content: `
        <div class="encounter-avoided">
          <p>Il gruppo evita l'incontro e prosegue il viaggio.</p>
        </div>
      `
    });
  }

  /**
   * Controllo orario per incontri
   */
  static hourlyEncounterCheck() {
    if (!game.settings.get(this.ID, 'enableWildernessEncounters')) return;
    if (!game.user.isGM) return;

    const frequency = game.settings.get(this.ID, 'encounterFrequency');
    const roll = Math.random() * 100;

    if (roll <= frequency) {
      // Determina terreno dalla scena corrente
      const scene = game.scenes.viewed;
      let terrain = 'forest'; // default

      // Cerca di determinare terreno dal nome scena
      if (scene?.name.toLowerCase().includes('montagna')) terrain = 'mountain';
      else if (scene?.name.toLowerCase().includes('palude')) terrain = 'swamp';
      else if (scene?.name.toLowerCase().includes('pianura')) terrain = 'plains';

      this.rollEncounter(terrain);
    }
  }

  /**
   * Aggiungi pulsante incontri alla sidebar
   */
  static _addEncounterButton(html) {
    if (!game.user.isGM) return;

    const button = $(`
      <button class="wilderness-encounter-btn">
        <i class="fas fa-paw"></i> Incontro Casuale
      </button>
    `);

    button.click(() => {
      new Dialog({
        title: 'Genera Incontro Selvaggio',
        content: `
          <div class="form-group">
            <label>Tipo di Terreno:</label>
            <select id="terrain">
              <option value="forest">🌲 Foresta</option>
              <option value="mountain">⛰️ Montagna</option>
              <option value="swamp">🌿 Palude</option>
              <option value="plains">🌾 Pianura</option>
            </select>
          </div>
        `,
        buttons: {
          roll: {
            label: 'Genera',
            callback: (html) => {
              const terrain = html.find('#terrain').val();
              this.rollEncounter(terrain);
            }
          },
          cancel: {
            label: 'Annulla'
          }
        }
      }).render(true);
    });

    html.find('.directory-header').append(button);
  }

  /**
   * Mostra aiuto
   */
  static showHelp() {
    const content = `
      <div class="brancalonia-help">
        <h2>🌲 Sistema Incontri Selvaggi</h2>
        <h3>Comandi:</h3>
        <ul>
          <li><strong>/incontro [terreno]</strong> - Genera incontro (forest/mountain/swamp/plains)</li>
          <li><strong>/incontri-help</strong> - Mostra questo aiuto</li>
        </ul>
        <h3>Privilegi Background:</h3>
        <p><strong>Brado - Dimestichezza Selvatica:</strong></p>
        <p>I personaggi con background Brado possono calmare bestie ostili con un tiro di Addestrare Animali.</p>
        <p>Se riescono, le bestie diventano neutrali e non attaccano.</p>
      </div>
    `;

    ChatMessage.create({ content });
  }
}

// Inizializza quando pronto
Hooks.once('init', () => {
  WildernessEncounters.initialize();
});

// Export
window.WildernessEncounters = WildernessEncounters;
export { WildernessEncounters };