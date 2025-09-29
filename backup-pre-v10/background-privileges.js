/**
 * BRANCALONIA BACKGROUND PRIVILEGES
 * Implementa i privilegi speciali dei background di Brancalonia
 */

class BackgroundPrivileges {

  static initialize() {
    console.log("🎭 Brancalonia | Inizializzazione privilegi background");

    // Registra gli hook per i vari privilegi
    this._registerHooks();

    // Registra gli Active Effects per i background
    this._registerActiveEffects();
  }

  static _registerHooks() {
    // Hook per inizializzare i privilegi quando un personaggio viene creato/caricato
    Hooks.on("createActor", (actor, data, options, userId) => {
      if (actor.type === "character") {
        this._initializeBackgroundPrivileges(actor);
      }
    });

    // Hook per gestire i privilegi durante il gioco
    Hooks.on("preRoll", (entity, rollData) => {
      this._applyBackgroundBonuses(entity, rollData);
    });

    // Hook specifico per le Strade che non vanno da nessuna parte
    Hooks.on("brancalonia.stradeCheck", (actor, rollData) => {
      this._applyAmbulanteBonus(actor, rollData);
    });

    // Hook per le interazioni sociali (Duro)
    Hooks.on("brancalonia.socialInteraction", (actor, target, type) => {
      this._applyDuroBonus(actor, type);
    });

    // Hook per le Risse (Attaccabrighe)
    Hooks.on("brancalonia.brawlStart", (actor) => {
      this._applyAttaccabrigheBonus(actor);
    });

    // Hook per gestione Malefatte (Azzeccagarbugli)
    Hooks.on("brancalonia.malefattaAdded", (actor, malefatta) => {
      this._checkAzzeccagarbugliPrivilege(actor, malefatta);
    });
  }

  static _registerActiveEffects() {
    // Definisci gli effetti per ogni background
    const backgroundEffects = {
      'ambulante': {
        label: 'Storie della Strada',
        icon: 'icons/skills/social/diplomacy-handshake.webp',
        flags: {
          'brancalonia-bigat.storieStrada': true,
          'brancalonia-bigat.stradeBonus': 1
        },
        changes: [
          // Competenze base
          { key: 'system.skills.prf.value', mode: 5, value: '1', priority: 20 }, // Intrattenere
          { key: 'system.skills.his.value', mode: 5, value: '1', priority: 20 }  // Storia
        ]
      },

      'attaccabrighe': {
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

      'azzeccagarbugli': {
        label: 'Risolvere Guai',
        icon: 'icons/tools/scribal/scroll-plain-tan.webp',
        flags: {
          'brancalonia-bigat.risolvereGuai': true
        },
        changes: [
          { key: 'system.skills.inv.value', mode: 5, value: '1', priority: 20 }, // Indagare
          { key: 'system.skills.per.value', mode: 5, value: '1', priority: 20 }  // Persuasione
        ]
      },

      'brado': {
        label: 'Dimestichezza Selvatica',
        icon: 'icons/creatures/abilities/paw-print-orange.webp',
        flags: {
          'brancalonia-bigat.dimestichezzaSelvatica': true
        },
        changes: [
          { key: 'system.skills.ani.value', mode: 5, value: '1', priority: 20 }, // Addestrare Animali
          { key: 'system.skills.ath.value', mode: 5, value: '1', priority: 20 }  // Atletica
        ]
      },

      'cacciatore_di_reliquie': {
        label: 'Studioso di Reliquie',
        icon: 'icons/sundries/books/book-embossed-cross-silver.webp',
        flags: {
          'brancalonia-bigat.studiosoReliquie': true
        },
        changes: [
          { key: 'system.skills.inv.value', mode: 5, value: '1', priority: 20 }, // Indagare
          { key: 'system.skills.his.value', mode: 5, value: '1', priority: 20 }, // Storia
          { key: 'system.skills.rel.bonuses.check', mode: 2, value: '1', priority: 20 }, // +1 Religione
          { key: 'system.skills.his.bonuses.check', mode: 2, value: '1', priority: 20 }  // +1 Storia (bonus)
        ]
      },

      'duro': {
        label: 'Faccia da Duro',
        icon: 'icons/skills/social/intimidation-impressing.webp',
        flags: {
          'brancalonia-bigat.facciaDaDuro': true
        },
        changes: [
          { key: 'system.skills.ath.value', mode: 5, value: '1', priority: 20 }, // Atletica
          { key: 'system.skills.itm.value', mode: 5, value: '1', priority: 20 }  // Intimidire
        ]
      }
    };

    // Registra gli effetti nel sistema
    if (game.brancalonia) {
      game.brancalonia.backgroundEffects = backgroundEffects;
    }
  }

  /**
   * Inizializza i privilegi del background per un personaggio
   */
  static _initializeBackgroundPrivileges(actor) {
    const background = actor.items.find(i => i.type === "background");
    if (!background) return;

    const bgName = background.name.toLowerCase().replace(/\s+/g, '_');
    const effects = game.brancalonia?.backgroundEffects?.[bgName];

    if (effects) {
      // Applica i flag
      for (const [key, value] of Object.entries(effects.flags || {})) {
        actor.setFlag('brancalonia-bigat', key.split('.').pop(), value);
      }
    }
  }

  /**
   * AMBULANTE - Bonus +1 automatico quando il condottiero usa Strade che non vanno da nessuna parte
   */
  static _applyAmbulanteBonus(actor, rollData) {
    if (!actor.getFlag('brancalonia-bigat', 'storieStrada')) return;

    // Aggiungi +1 automatico al tiro
    rollData.bonus = (rollData.bonus || 0) + 1;

    ChatMessage.create({
      content: `<div class="brancalonia-message">
        <h4>🎪 Storie della Strada</h4>
        <p><strong>${actor.name}</strong> conosce le Strade che non vanno da nessuna parte!</p>
        <p><em>+1 automatico al tiro del condottiero</em></p>
      </div>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * ATTACCABRIGHE - Slot mossa aggiuntivo nelle Risse
   */
  static _applyAttaccabrigheBonus(actor) {
    const slotExtra = actor.getFlag('brancalonia-bigat', 'slotMossaExtra');
    if (!slotExtra) return;

    // Il bonus è già applicato tramite Active Effect
    ChatMessage.create({
      content: `<div class="brancalonia-message">
        <h4>🥊 Rissaiolo</h4>
        <p><strong>${actor.name}</strong> ha ${slotExtra} slot mossa aggiuntivo!</p>
      </div>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }

  /**
   * AZZECCAGARBUGLI - Può annullare una Malefatta pagando
   */
  static async _checkAzzeccagarbugliPrivilege(actor, malefatta) {
    if (!actor.getFlag('brancalonia-bigat', 'risolvereGuai')) return;

    const taglia = malefatta.taglia || 0;

    const choice = await Dialog.confirm({
      title: "Risolvere Guai",
      content: `<p>Vuoi usare il privilegio Risolvere Guai per annullare questa Malefatta?</p>
                <p>Costo: ${taglia} monete</p>`,
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

        ChatMessage.create({
          content: `<div class="brancalonia-message">
            <h4>⚖️ Guai Risolti!</h4>
            <p><strong>${actor.name}</strong> ha usato i suoi cavilli legali per annullare la Malefatta!</p>
            <p><em>Pagati ${taglia} ma per evitare problemi</em></p>
          </div>`,
          speaker: ChatMessage.getSpeaker({ actor })
        });

        return false; // Impedisce l'aggiunta della Malefatta
      } else {
        ui.notifications.warn("Non hai abbastanza monete per risolvere questi guai!");
      }
    }

    return true; // Procedi con l'aggiunta della Malefatta
  }

  /**
   * BRADO - Guida attraverso terre selvagge senza attirare bestie
   */
  static applyBradoGuidance(actor, encounterData) {
    if (!actor.getFlag('brancalonia-bigat', 'dimestichezzaSelvatica')) return encounterData;

    // Se l'incontro è con una bestia, saltalo
    if (encounterData.type === 'beast') {
      ChatMessage.create({
        content: `<div class="brancalonia-message">
          <h4>🌲 Dimestichezza Selvatica</h4>
          <p><strong>${actor.name}</strong> guida il gruppo evitando le bestie ostili.</p>
          <p><em>L'incontro con ${encounterData.name} è stato evitato!</em></p>
        </div>`,
        speaker: ChatMessage.getSpeaker({ actor })
      });

      return null; // Nessun incontro
    }

    return encounterData; // Altri tipi di incontri procedono normalmente
  }

  /**
   * DURO - La Taglia aumenta di 1 livello quando usa la Nomea
   */
  static _applyDuroBonus(actor, interactionType) {
    if (!actor.getFlag('brancalonia-bigat', 'facciaDaDuro')) return;
    if (interactionType !== 'intimidation' && interactionType !== 'nomea') return;

    const currentTaglia = actor.getFlag('brancalonia-bigat', 'taglia') || 0;
    const effectiveTaglia = currentTaglia + 1;

    ChatMessage.create({
      content: `<div class="brancalonia-message">
        <h4>💀 Faccia da Duro</h4>
        <p><strong>${actor.name}</strong> usa la sua reputazione temibile!</p>
        <p><em>Taglia considerata: ${this._getTagliaName(effectiveTaglia)} (${effectiveTaglia})</em></p>
      </div>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    return effectiveTaglia;
  }

  /**
   * Helper per i nomi dei livelli di Taglia
   */
  static _getTagliaName(level) {
    const taglie = [
      "Sconosciuto",      // 0
      "Canaglia",         // 1
      "Famigerato",       // 2
      "Ricercato",        // 3
      "Nemico Pubblico",  // 4
      "Leggenda"          // 5+
    ];
    return taglie[Math.min(level, taglie.length - 1)];
  }

  /**
   * Applica bonus generali ai tiri basati sul background
   */
  static _applyBackgroundBonuses(entity, rollData) {
    if (!entity.actor) return;

    const actor = entity.actor;

    // Cacciatore di Reliquie - +1 a Religione e Storia
    if (actor.getFlag('brancalonia-bigat', 'studiosoReliquie')) {
      if (rollData.skill === 'rel' || rollData.skill === 'his') {
        rollData.bonus = (rollData.bonus || 0) + 1;
        rollData.flavor = (rollData.flavor || '') + ' [Studioso di Reliquie +1]';
      }
    }

    // Altri bonus possono essere aggiunti qui
  }
}

// Registra il modulo quando Foundry è pronto
Hooks.once("ready", () => {
  BackgroundPrivileges.initialize();

  // Rendi disponibile globalmente per debugging
  game.brancalonia = game.brancalonia || {};
  game.brancalonia.backgroundPrivileges = BackgroundPrivileges;
});

// Esporta per l'uso in altri moduli - usando global per non-ESM
window.BackgroundPrivileges = BackgroundPrivileges;