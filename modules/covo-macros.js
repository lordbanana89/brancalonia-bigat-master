/**
 * BRANCALONIA COVO MACROS
 * Macro predefinite per gestione rapida del sistema Covo
 */

class CovoMacros {
  /**
   * Registra tutte le macro del sistema
   */
  static async registerAll() {
    console.log('Brancalonia | Registrazione macro sistema Covo...');

    const macros = [
      {
        name: '🏠 Crea Nuovo Covo',
        type: 'script',
        img: 'icons/environment/settlement/house-cottage.webp',
        scope: 'global',
        command: this.createCovoCommand()
      },
      {
        name: '📊 Status del Mio Covo',
        type: 'script',
        img: 'icons/environment/settlement/house-manor.webp',
        scope: 'global',
        command: this.showCovoStatusCommand()
      },
      {
        name: '💰 Gestisci Tesoro Covo',
        type: 'script',
        img: 'icons/commodities/currency/coins-assorted-mix-copper.webp',
        scope: 'global',
        command: this.manageTreasuryCommand()
      },
      {
        name: '🔨 Costruisci Granlusso',
        type: 'script',
        img: 'icons/tools/smithing/hammer-sledge-steel-grey.webp',
        scope: 'global',
        command: this.buildGranlussoCommand()
      },
      {
        name: '🧪 Raccogli Intruglio',
        type: 'script',
        img: 'icons/consumables/potions/bottle-bulb-corked-green.webp',
        scope: 'global',
        command: this.collectPotionCommand()
      },
      {
        name: '🐎 Noleggia Cavalcatura',
        type: 'script',
        img: 'icons/commodities/leather/saddle-brown.webp',
        scope: 'global',
        command: this.rentMountCommand()
      },
      {
        name: '🛠️ Ripara Equipaggiamento',
        type: 'script',
        img: 'icons/tools/smithing/anvil-steel-silver.webp',
        scope: 'global',
        command: this.repairItemsCommand()
      },
      {
        name: '🛍️ Visita Borsa Nera',
        type: 'script',
        img: 'icons/containers/bags/sack-simple-leather-brown.webp',
        scope: 'global',
        command: this.visitBorsaNeraCommand()
      },
      {
        name: '👥 Gestisci Membri Covo',
        type: 'script',
        img: 'icons/skills/social/diplomacy-handshake-yellow.webp',
        scope: 'global',
        command: this.manageMembersCommand()
      },
      {
        name: '🔄 Migra Vecchi Covi',
        type: 'script',
        img: 'icons/tools/scribal/magnifying-glass.webp',
        scope: 'global',
        command: this.migrateOldCovosCommand()
      }
    ];

    // Crea o aggiorna ogni macro
    for (const macroData of macros) {
      let macro = game.macros.find(m => m.name === macroData.name);

      if (macro) {
        await macro.update(macroData);
        console.log(`Brancalonia | Macro aggiornata: ${macroData.name}`);
      } else {
        macro = await game.macros.documentClass.create(macroData);
        console.log(`Brancalonia | Macro creata: ${macroData.name}`);
      }
    }

    ui.notifications.info('Macro del sistema Covo registrate!');
  }

  /**
   * Comando: Crea Nuovo Covo
   */
  static createCovoCommand() {
    return `
// Crea un nuovo Covo per la compagnia
(async () => {
  if (!game.brancalonia?.covo) {
    ui.notifications.error("Sistema Covo non disponibile!");
    return;
  }

  // Trova tutti i PG
  const playerCharacters = game.actors.filter(a =>
    a.type === "character" && a.hasPlayerOwner
  );

  if (playerCharacters.length === 0) {
    ui.notifications.warn("Nessun personaggio giocante trovato!");
    return;
  }

  // Dialog per selezione membri
  const content = \`
    <div style="padding: 15px;">
      <h3>Crea Nuovo Covo</h3>
      <div class="form-group">
        <label>Nome del Covo:</label>
        <input type="text" name="covo-name" value="Covo della Compagnia" style="width: 100%;">
      </div>
      <div class="form-group">
        <label>Membri della Compagnia:</label>
        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; border-radius: 5px;">
          \${playerCharacters.map(pc => \`
            <label style="display: block; margin: 5px 0;">
              <input type="checkbox" name="member" value="\${pc.id}" checked>
              \${pc.name}
            </label>
          \`).join('')}
        </div>
      </div>
      <p style="margin-top: 15px; color: #666; font-style: italic;">
        Il covo inizierà con 0 mo di tesoro e tutti i granlussi a livello 0.
      </p>
    </div>
  \`;

  new Dialog({
    title: "🏠 Crea Nuovo Covo",
    content,
    buttons: {
      create: {
        icon: '<i class="fas fa-check"></i>',
        label: "Crea Covo",
        callback: async (html) => {
          const name = html.find('[name="covo-name"]').val();
          const memberIds = html.find('[name="member"]:checked').map((i, el) => el.value).get();
          const members = memberIds.map(id => game.actors.get(id)).filter(a => a);

          if (members.length === 0) {
            ui.notifications.error("Seleziona almeno un membro!");
            return;
          }

          const covo = await game.brancalonia.covo.createCovo(name, members);
          covo.sheet.render(true);
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annulla"
      }
    },
    default: "create"
  }, {
    width: 400
  }).render(true);
})();
`;
  }

  /**
   * Comando: Status del Mio Covo
   */
  static showCovoStatusCommand() {
    return `
// Mostra lo status del covo del personaggio
(async () => {
  if (!game.brancalonia?.covo) {
    ui.notifications.error("Sistema Covo non disponibile!");
    return;
  }

  // Ottieni il personaggio
  const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

  if (!actor) {
    ui.notifications.warn("Seleziona un personaggio o assegnane uno al tuo utente!");
    return;
  }

  // Trova il covo associato
  const covoId = actor.getFlag('brancalonia-bigat', 'covoId');

  if (!covoId) {
    ui.notifications.info("Questo personaggio non appartiene a nessun covo.");
    return;
  }

  const covo = game.actors.get(covoId);

  if (!covo) {
    ui.notifications.error("Covo non trovato!");
    return;
  }

  // Apri la sheet del covo
  covo.sheet.render(true);
})();
`;
  }

  /**
   * Comando: Gestisci Tesoro
   */
  static manageTreasuryCommand() {
    return `
// Gestisci il tesoro del covo
(async () => {
  if (!game.brancalonia?.covo) {
    ui.notifications.error("Sistema Covo non disponibile!");
    return;
  }

  const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

  if (!actor) {
    ui.notifications.warn("Seleziona un personaggio!");
    return;
  }

  const covoId = actor.getFlag('brancalonia-bigat', 'covoId');
  if (!covoId) {
    ui.notifications.info("Non appartieni a nessun covo!");
    return;
  }

  const covo = game.actors.get(covoId);
  if (!covo) {
    ui.notifications.error("Covo non trovato!");
    return;
  }

  game.brancalonia.covo.openTreasuryDialog(covo);
})();
`;
  }

  /**
   * Comando: Costruisci Granlusso
   */
  static buildGranlussoCommand() {
    return `
// Costruisci o migliora un granlusso
(async () => {
  if (!game.brancalonia?.covo) {
    ui.notifications.error("Sistema Covo non disponibile!");
    return;
  }

  const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

  if (!actor) {
    ui.notifications.warn("Seleziona un personaggio!");
    return;
  }

  const covoId = actor.getFlag('brancalonia-bigat', 'covoId');
  if (!covoId) {
    ui.notifications.info("Non appartieni a nessun covo!");
    return;
  }

  const covo = game.actors.get(covoId);
  if (!covo) {
    ui.notifications.error("Covo non trovato!");
    return;
  }

  // Ottieni lista granlussi
  const granlussi = covo.items.filter(i => i.getFlag('brancalonia-bigat', 'granlusso'));

  // Filtra solo quelli non al massimo
  const upgradeable = granlussi.filter(g => (g.system.level?.value || 0) < 3);

  if (upgradeable.length === 0) {
    ui.notifications.info("Tutti i granlussi sono al livello massimo!");
    return;
  }

  const treasury = covo.system.currency?.gp || 0;

  const content = \`
    <div style="padding: 15px;">
      <h3>Costruisci/Migliora Granlusso</h3>
      <p><strong>Tesoro disponibile:</strong> \${treasury} mo</p>
      <div class="form-group">
        <label>Seleziona Granlusso:</label>
        <select name="granlusso" style="width: 100%;">
          \${upgradeable.map(g => {
            const level = g.system.level?.value || 0;
            const nextLevel = level + 1;
            const benefits = g.getFlag('brancalonia-bigat', 'benefits');
            const cost = benefits[nextLevel].cost;
            const affordable = treasury >= cost;
            return \`
              <option value="\${g.id}" \${!affordable ? 'disabled' : ''}>
                \${g.name} (Lv.\${level} → Lv.\${nextLevel}) - \${cost} mo \${!affordable ? '(Fondi insufficienti)' : ''}
              </option>
            \`;
          }).join('')}
        </select>
      </div>
    </div>
  \`;

  new Dialog({
    title: "🔨 Costruisci Granlusso",
    content,
    buttons: {
      build: {
        icon: '<i class="fas fa-hammer"></i>',
        label: "Costruisci",
        callback: async (html) => {
          const granlussoId = html.find('[name="granlusso"]').val();
          const granlusso = covo.items.get(granlussoId);

          if (!granlusso) {
            ui.notifications.error("Granlusso non trovato!");
            return;
          }

          await game.brancalonia.covo.upgradeGranlusso(covo, granlusso);
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annulla"
      }
    },
    default: "build"
  }, {
    width: 400
  }).render(true);
})();
`;
  }

  /**
   * Comando: Raccogli Intruglio
   */
  static collectPotionCommand() {
    return `
// Raccogli intruglio dalla distilleria
(async () => {
  if (!game.brancalonia?.covo) {
    ui.notifications.error("Sistema Covo non disponibile!");
    return;
  }

  const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

  if (!actor) {
    ui.notifications.warn("Seleziona un personaggio!");
    return;
  }

  const covoId = actor.getFlag('brancalonia-bigat', 'covoId');
  if (!covoId) {
    ui.notifications.info("Non appartieni a nessun covo!");
    return;
  }

  const covo = game.actors.get(covoId);
  if (!covo) {
    ui.notifications.error("Covo non trovato!");
    return;
  }

  const distilleria = covo.items.find(i =>
    i.getFlag('brancalonia-bigat', 'granlusso') &&
    i.getFlag('brancalonia-bigat', 'type') === 'distilleria'
  );

  if (!distilleria) {
    ui.notifications.error("Nessuna distilleria nel covo!");
    return;
  }

  const level = distilleria.system.level?.value || 0;

  if (level === 0) {
    ui.notifications.warn("La distilleria non è ancora costruita!");
    return;
  }

  // Intrugli disponibili per livello
  const potions = {
    1: ["Acquamorte", "Richiamino"],
    2: ["Afrore di Servatico", "Infernet Malebranca"],
    3: ["Cordiale Biondino", "Intruglio della Forza"]
  };

  const available = [];
  for (let i = 1; i <= level; i++) {
    available.push(...potions[i]);
  }

  const content = \`
    <div style="padding: 15px;">
      <h3>🧪 Distilleria - Livello \${level}</h3>
      <p>Scegli un intruglio da raccogliere:</p>
      <div class="form-group">
        <select name="potion" style="width: 100%;">
          \${available.map(p => \`<option value="\${p}">\${p}</option>\`).join('')}
        </select>
      </div>
    </div>
  \`;

  new Dialog({
    title: "Raccogli Intruglio",
    content,
    buttons: {
      collect: {
        icon: '<i class="fas fa-flask"></i>',
        label: "Raccogli",
        callback: async (html) => {
          const potionName = html.find('[name="potion"]').val();

          // Crea l'item intruglio
          const itemData = {
            name: potionName,
            type: "consumable",
            img: "icons/consumables/potions/bottle-round-corked-green.webp",
            system: {
              description: {
                value: \`Intruglio creato dalla distilleria del covo.\`
              },
              consumableType: "potion",
              uses: {
                value: 1,
                max: 1,
                per: null
              }
            }
          };

          await actor.createEmbeddedDocuments("Item", [itemData]);

          ChatMessage.create({
            content: \`
              <div class="brancalonia-potion-collected">
                <h3>🧪 Intruglio Raccolto!</h3>
                <p>\${actor.name} ha raccolto <strong>\${potionName}</strong> dalla distilleria del covo.</p>
              </div>
            \`,
            speaker: ChatMessage.getSpeaker({actor})
          });
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annulla"
      }
    },
    default: "collect"
  }).render(true);
})();
`;
  }

  /**
   * Comando: Noleggia Cavalcatura
   */
  static rentMountCommand() {
    return `
// Noleggia cavalcatura dalle scuderie
(async () => {
  if (!game.brancalonia?.covo) {
    ui.notifications.error("Sistema Covo non disponibile!");
    return;
  }

  const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

  if (!actor) {
    ui.notifications.warn("Seleziona un personaggio!");
    return;
  }

  const covoId = actor.getFlag('brancalonia-bigat', 'covoId');
  if (!covoId) {
    ui.notifications.info("Non appartieni a nessun covo!");
    return;
  }

  const covo = game.actors.get(covoId);
  if (!covo) {
    ui.notifications.error("Covo non trovato!");
    return;
  }

  const scuderie = covo.items.find(i =>
    i.getFlag('brancalonia-bigat', 'granlusso') &&
    i.getFlag('brancalonia-bigat', 'type') === 'scuderie'
  );

  if (!scuderie) {
    ui.notifications.error("Nessuna scuderia nel covo!");
    return;
  }

  const level = scuderie.system.level?.value || 0;

  if (level === 0) {
    ui.notifications.warn("Le scuderie non sono ancora costruite!");
    return;
  }

  // Cavalcature disponibili per livello
  const mounts = {
    1: ["Pony", "Asino", "Mulo"],
    2: ["Cavallo da Tiro", "Cavallo da Galoppo"],
    3: ["Destriero", "Cavallo da Guerra"]
  };

  const available = [];
  for (let i = 1; i <= level; i++) {
    available.push(...mounts[i]);
  }

  const content = \`
    <div style="padding: 15px;">
      <h3>🐎 Scuderie - Livello \${level}</h3>
      <p>Scegli una cavalcatura da noleggiare:</p>
      <div class="form-group">
        <select name="mount" style="width: 100%;">
          \${available.map(m => \`<option value="\${m}">\${m}</option>\`).join('')}
        </select>
      </div>
      <p style="color: #E65100; margin-top: 10px;">
        <strong>⚠️ Attenzione:</strong> Se perdi la cavalcatura, dovrai risarcire il valore!
      </p>
    </div>
  \`;

  new Dialog({
    title: "Noleggia Cavalcatura",
    content,
    buttons: {
      rent: {
        icon: '<i class="fas fa-horse"></i>',
        label: "Noleggia",
        callback: async (html) => {
          const mountName = html.find('[name="mount"]').val();

          await actor.setFlag('brancalonia-bigat', 'rentedMount', mountName);

          ChatMessage.create({
            content: \`
              <div class="brancalonia-mount-rented">
                <h3>🐎 Cavalcatura Noleggiata!</h3>
                <p>\${actor.name} ha noleggiato un <strong>\${mountName}</strong> dalle scuderie del covo.</p>
              </div>
            \`,
            speaker: ChatMessage.getSpeaker({actor})
          });
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annulla"
      }
    },
    default: "rent"
  }).render(true);
})();
`;
  }

  /**
   * Comando: Ripara Equipaggiamento
   */
  static repairItemsCommand() {
    return `
// Ripara equipaggiamento alla fucina
(async () => {
  if (!game.brancalonia?.covo) {
    ui.notifications.error("Sistema Covo non disponibile!");
    return;
  }

  const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

  if (!actor) {
    ui.notifications.warn("Seleziona un personaggio!");
    return;
  }

  const covoId = actor.getFlag('brancalonia-bigat', 'covoId');
  if (!covoId) {
    ui.notifications.info("Non appartieni a nessun covo!");
    return;
  }

  const covo = game.actors.get(covoId);
  if (!covo) {
    ui.notifications.error("Covo non trovato!");
    return;
  }

  const fucina = covo.items.find(i =>
    i.getFlag('brancalonia-bigat', 'granlusso') &&
    i.getFlag('brancalonia-bigat', 'type') === 'fucina'
  );

  if (!fucina) {
    ui.notifications.error("Nessuna fucina nel covo!");
    return;
  }

  const level = fucina.system.level?.value || 0;

  if (level === 0) {
    ui.notifications.warn("La fucina non è ancora costruita!");
    return;
  }

  // Trova oggetti danneggiati/scadenti
  const damagedItems = actor.items.filter(i =>
    (i.type === "weapon" || i.type === "equipment") &&
    (i.getFlag('brancalonia-bigat', 'damaged') || i.getFlag('brancalonia-bigat', 'shoddy'))
  );

  if (damagedItems.length === 0) {
    ui.notifications.info("Non hai oggetti da riparare!");
    return;
  }

  const content = \`
    <div style="padding: 15px;">
      <h3>🔨 Fucina - Livello \${level}</h3>
      <p>Seleziona oggetti da riparare:</p>
      <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; border-radius: 5px;">
        \${damagedItems.map(item => \`
          <label style="display: block; margin: 5px 0;">
            <input type="checkbox" name="repair" value="\${item.id}">
            \${item.name}
          </label>
        \`).join('')}
      </div>
    </div>
  \`;

  new Dialog({
    title: "Ripara Equipaggiamento",
    content,
    buttons: {
      repair: {
        icon: '<i class="fas fa-hammer"></i>',
        label: "Ripara",
        callback: async (html) => {
          const itemIds = html.find('[name="repair"]:checked').map((i, el) => el.value).get();

          for (const id of itemIds) {
            const item = actor.items.get(id);
            if (item) {
              await item.unsetFlag('brancalonia-bigat', 'damaged');
              await item.unsetFlag('brancalonia-bigat', 'shoddy');
            }
          }

          ChatMessage.create({
            content: \`
              <div class="brancalonia-items-repaired">
                <h3>🔨 Oggetti Riparati!</h3>
                <p>La fucina del covo ha riparato \${itemIds.length} oggetto/i.</p>
              </div>
            \`,
            speaker: ChatMessage.getSpeaker({actor})
          });
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annulla"
      }
    },
    default: "repair"
  }).render(true);
})();
`;
  }

  /**
   * Comando: Visita Borsa Nera
   */
  static visitBorsaNeraCommand() {
    return `
// Visita la borsa nera del covo
(async () => {
  if (!game.brancalonia?.covo) {
    ui.notifications.error("Sistema Covo non disponibile!");
    return;
  }

  const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

  if (!actor) {
    ui.notifications.warn("Seleziona un personaggio!");
    return;
  }

  const covoId = actor.getFlag('brancalonia-bigat', 'covoId');
  if (!covoId) {
    ui.notifications.info("Non appartieni a nessun covo!");
    return;
  }

  const covo = game.actors.get(covoId);
  if (!covo) {
    ui.notifications.error("Covo non trovato!");
    return;
  }

  const borsaNera = covo.items.find(i =>
    i.getFlag('brancalonia-bigat', 'granlusso') &&
    i.getFlag('brancalonia-bigat', 'type') === 'borsa-nera'
  );

  if (!borsaNera) {
    ui.notifications.error("Nessuna borsa nera nel covo!");
    return;
  }

  const level = borsaNera.system.level?.value || 0;

  if (level === 0) {
    ui.notifications.warn("La borsa nera non è ancora attiva!");
    return;
  }

  // Oggetti disponibili per livello
  const items = {
    1: [
      {name: "Pozione di Guarigione", price: 50, rarity: "comune"},
      {name: "Pergamena di Incantesimo (1° livello)", price: 50, rarity: "comune"}
    ],
    2: [
      {name: "Arma +1", price: 150, rarity: "non comune"},
      {name: "Anello di Protezione", price: 150, rarity: "non comune"}
    ],
    3: [
      {name: "Mantello del Pipistrello", price: 500, rarity: "raro"},
      {name: "Stivali della Velocità", price: 500, rarity: "raro"}
    ]
  };

  const available = [];
  for (let i = 1; i <= level; i++) {
    available.push(...items[i]);
  }

  const playerGold = actor.system.currency?.gp || 0;

  const content = \`
    <div style="padding: 15px;">
      <h3>🛍️ Borsa Nera - Livello \${level}</h3>
      <p>Il tuo oro: <strong>\${playerGold} mo</strong></p>
      <hr>
      <div style="max-height: 300px; overflow-y: auto;">
        \${available.map(item => \`
          <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
            <strong>\${item.name}</strong> <span style="color: #666;">(\${item.rarity})</span><br>
            Prezzo: <strong>\${item.price} mo</strong>
            <button class="buy-item" data-item='\${JSON.stringify(item)}'
              \${playerGold < item.price ? 'disabled' : ''}
              style="float: right; padding: 5px 10px;">
              \${playerGold < item.price ? 'Fondi insufficienti' : 'Acquista'}
            </button>
          </div>
        \`).join('')}
      </div>
    </div>
  \`;

  new Dialog({
    title: "Borsa Nera",
    content,
    buttons: {
      close: {
        icon: '<i class="fas fa-times"></i>',
        label: "Chiudi"
      }
    },
    render: (html) => {
      html.find('.buy-item').click(async (event) => {
        const item = JSON.parse(event.currentTarget.dataset.item);

        const confirmed = await Dialog.confirm({
          title: "Conferma Acquisto",
          content: \`<p>Vuoi acquistare <strong>\${item.name}</strong> per <strong>\${item.price} mo</strong>?</p>\`
        });

        if (confirmed) {
          // Sottrai oro
          await actor.update({
            "system.currency.gp": playerGold - item.price
          });

          // Crea item
          const itemData = {
            name: item.name,
            type: "equipment",
            img: "icons/magic/defensive/amulet-gem-blue-gold.webp",
            system: {
              description: {
                value: \`Acquistato dalla Borsa Nera del covo.\`
              },
              rarity: item.rarity
            }
          };

          await actor.createEmbeddedDocuments("Item", [itemData]);

          ChatMessage.create({
            content: \`
              <div class="brancalonia-item-purchased">
                <h3>🛍️ Acquisto Completato!</h3>
                <p>\${actor.name} ha acquistato <strong>\${item.name}</strong> per \${item.price} mo.</p>
              </div>
            \`,
            speaker: ChatMessage.getSpeaker({actor})
          });

          html.find('.dialog-button.close').click();
        }
      });
    },
    default: "close"
  }, {
    width: 500,
    height: 500
  }).render(true);
})();
`;
  }

  /**
   * Comando: Gestisci Membri
   */
  static manageMembersCommand() {
    return `
// Gestisci membri del covo
(async () => {
  if (!game.brancalonia?.covo) {
    ui.notifications.error("Sistema Covo non disponibile!");
    return;
  }

  if (!game.user.isGM) {
    ui.notifications.warn("Solo il GM può gestire i membri del covo!");
    return;
  }

  // Trova tutti i covi
  const covos = game.actors.filter(a => a.getFlag('brancalonia-bigat', 'covo'));

  if (covos.length === 0) {
    ui.notifications.info("Nessun covo trovato nel mondo.");
    return;
  }

  const content = \`
    <div style="padding: 15px;">
      <h3>Gestisci Membri Covo</h3>
      <div class="form-group">
        <label>Seleziona Covo:</label>
        <select name="covo" style="width: 100%;">
          \${covos.map(c => \`<option value="\${c.id}">\${c.name}</option>\`).join('')}
        </select>
      </div>
      <button class="view-members" style="width: 100%; padding: 10px; margin-top: 10px;">
        Visualizza Membri
      </button>
    </div>
  \`;

  new Dialog({
    title: "👥 Gestisci Membri",
    content,
    buttons: {
      close: {
        icon: '<i class="fas fa-times"></i>',
        label: "Chiudi"
      }
    },
    render: (html) => {
      html.find('.view-members').click(() => {
        const covoId = html.find('[name="covo"]').val();
        const covo = game.actors.get(covoId);

        if (covo) {
          game.brancalonia.covo.showCompagniaMembers(covo);
        }
      });
    }
  }).render(true);
})();
`;
  }

  /**
   * Comando: Migra Vecchi Covi
   */
  static migrateOldCovosCommand() {
    return `
// Migra covi dal vecchio sistema
(async () => {
  if (!game.user.isGM) {
    ui.notifications.error("Solo il GM può eseguire la migrazione!");
    return;
  }

  if (!game.brancalonia?.migration) {
    ui.notifications.error("Sistema migrazione non disponibile!");
    return;
  }

  const oldCovos = game.actors.filter(a =>
    a.getFlag('brancalonia-bigat', 'covo') &&
    !a.getFlag('brancalonia-bigat', 'covoMigrated')
  );

  if (oldCovos.length === 0) {
    ui.notifications.info("Nessun covo da migrare trovato.");
    return;
  }

  const confirmed = await Dialog.confirm({
    title: "Migrazione Covi",
    content: \`
      <p>Trovati <strong>\${oldCovos.length}</strong> covi dal vecchio sistema.</p>
      <p>Vuoi avviare la migrazione?</p>
    \`
  });

  if (confirmed) {
    await game.brancalonia.migration.migrateAll();
  }
})();
`;
  }
}

// Registra le macro quando il sistema è pronto
Hooks.once('ready', async () => {
  if (game.user.isGM && game.settings.get('brancalonia-bigat', 'covoSystemEnabled')) {
    // Chiedi se creare le macro
    const shouldCreate = await Dialog.confirm({
      title: 'Macro Sistema Covo',
      content: `
        <p>Vuoi creare le macro predefinite per il sistema Covo?</p>
        <p style="font-size: 0.9em; color: #666;">
          Questo creerà 10 macro per gestire facilmente il sistema.
        </p>
      `
    });

    if (shouldCreate) {
      await CovoMacros.registerAll();
    }
  }

  // Registra globalmente per uso manuale
  game.brancalonia = game.brancalonia || {};
  game.brancalonia.macros = CovoMacros;
});

// Esporta la classe
export { CovoMacros };