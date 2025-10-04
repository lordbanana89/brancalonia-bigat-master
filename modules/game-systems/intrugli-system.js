/**
 * BRANCALONIA - SISTEMA INTRUGLI
 * Preparazione intrugli artigianali.
 */

const MODULE_ID = 'brancalonia-bigat';

class IntrugliSystem {
  static INGREDIENTS = {
    erbe_comuni: { label: 'Erbe Comuni', match: 'Erbe Comuni' },
    radici_rare: { label: 'Radici Rare', match: 'Radici Rare' },
    funghi_magici: { label: 'Funghi Magici', match: 'Funghi Magici' },
    sangue_bestia: { label: 'Sangue di Bestia', match: 'Sangue di Bestia' },
    polvere_ossa: { label: 'Polvere d\'Ossa', match: 'Polvere' }
  };

  static RECIPES = {
    curativo: {
      id: 'curativo',
      label: 'Intruglio Curativo',
      dc: 12,
      skills: ['med', 'nat', 'arc'],
      table: 'Intrugli - Effetti Curativi',
      category: 'healing',
      icon: 'icons/consumables/potions/potion-bottle-corked-red.webp',
      description: 'Miscela dal sapore pessimo ma dalle proprietà curative.',
      ingredients: {
        required: ['erbe_comuni'],
        optional: ['radici_rare']
      }
    },
    veleno: {
      id: 'veleno',
      label: 'Veleno Artigianale',
      dc: 15,
      skills: ['med', 'nat', 'sur'],
      table: 'Intrugli - Effetti Veleno',
      category: 'poison',
      icon: 'icons/consumables/potions/bottle-bulb-poison.webp',
      description: 'Utilizzato per ungere armi o avvelenare coppe.',
      dangerous: true,
      ingredients: {
        required: ['funghi_magici', 'sangue_bestia'],
        optional: ['polvere_ossa']
      }
    },
    potenziamento: {
      id: 'potenziamento',
      label: 'Tonico Potenziante',
      dc: 18,
      skills: ['arc', 'med', 'nat'],
      table: 'Intrugli - Effetti Potenziamento',
      category: 'buff',
      icon: 'icons/consumables/potions/potion-bottle-corked-blue.webp',
      description: 'Rende più forti, più rapidi, oppure tutti e due.',
      ingredients: {
        required: ['radici_rare', 'funghi_magici'],
        optional: ['erbe_comuni']
      }
    },
    strano: {
      id: 'strano',
      label: 'Intruglio Stravagante',
      dc: 10,
      skills: ['arc', 'nat', 'inv'],
      table: 'Intrugli - Effetti Strani',
      category: 'wild',
      icon: 'icons/consumables/potions/potion-bottle-corked-purple.webp',
      description: 'Gli effetti sono imprevedibili. A volte divertenti.',
      chaotic: true,
      ingredients: {
        required: ['erbe_comuni'],
        optional: []
      }
    }
  };

  static initialize() {
    this._registerSettings();
    this._registerHooks();
    // NOTA: _registerMacro() spostato nel hook 'ready' - game.user è null durante 'init'

    game.brancalonia = game.brancalonia || {};
    game.brancalonia.intrugli = this;
    window.IntrugliSystem = this;
  }

  static _registerSettings() {
    game.settings.register(MODULE_ID, 'intrugliEnabled', {
      name: 'Abilita Sistema Intrugli',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
    game.settings.register(MODULE_ID, 'intrugliRequireLaboratorio', {
      name: 'Richiedi distilleria nel covo',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
    game.settings.register(MODULE_ID, 'intrugliAutoconsume', {
      name: 'Consuma automaticamente gli ingredienti',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
  }

  static _registerHooks() {
    Hooks.on('renderActorSheet', (app, html) => {
      if (!game.settings.get(MODULE_ID, 'intrugliEnabled')) return;
      if (app.actor?.type !== 'character') return;

      const button = document.createElement('button');
      button.classList.add('brancalonia-intrugli-btn');
      button.innerHTML = '<i class="fas fa-flask"></i> Intrugli';
      button.addEventListener('click', () => this.openBrewDialog(app.actor));

      const header = html[0]?.querySelector('.window-header .window-title');
      if (header && !header.parentElement.querySelector('.brancalonia-intrugli-btn')) {
        header.parentElement.appendChild(button);
      }
    });
  }

  static async _registerMacro() {
    if (!game.user.isGM) return;
    const macroName = '🧪 Prepara Intruglio';
    const existing = game.macros.find((m) => m.name === macroName);
    const command = `const actor = canvas.tokens.controlled[0]?.actor || game.user.character;\nif (!actor) { ui.notifications.warn('Seleziona un personaggio.'); return; }\nawait game.brancalonia.intrugli.openBrewDialog(actor);`;

    if (existing) {
      await existing.update({ command });
    } else {
      await Macro.create({ name: macroName, type: 'script', img: 'icons/consumables/potions/potion-bottle-corked-blue.webp', command });
    }
  }

  static async openBrewDialog(actor) {
    if (!this._validateActor(actor)) return;

    const cards = Object.values(this.RECIPES).map((recipe) => this._recipeCard(recipe)).join('');
    const content = `
      <div class="intrugli-dialog">
        <p>Seleziona il tipo di intruglio da preparare. Gli ingredienti devono trovarsi nello zaino del personaggio.</p>
        <div class="recipe-grid">${cards}</div>
      </div>
    `;

    new Dialog({
      title: '🧪 Preparazione Intrugli',
      content,
      buttons: { close: { label: 'Chiudi', icon: '<i class="fas fa-times"></i>' } },
      render: (html) => {
        html[0].querySelectorAll('.recipe-card button').forEach((btn) => {
          btn.addEventListener('click', async (event) => {
            const id = event.currentTarget.dataset.recipe;
            await this.brewIntruglio(actor, id);
            html.closest('.dialog')?.querySelector('.dialog-buttons button')?.click?.();
          });
        });
      }
    }, { width: 700, height: 600 }).render(true);
  }

  static _recipeCard(recipe) {
    const required = recipe.ingredients.required.map((key) => this.INGREDIENTS[key].label).join(', ');
    const optional = recipe.ingredients.optional.length
      ? `<p><strong>Opzionali:</strong> ${recipe.ingredients.optional.map((key) => this.INGREDIENTS[key].label).join(', ')}</p>`
      : '';

    return `
      <div class="recipe-card" data-recipe="${recipe.id}">
        <img src="${recipe.icon}" width="48" height="48" alt="${recipe.label}" />
        <div class="info">
          <h3>${recipe.label}</h3>
          <p>${recipe.description}</p>
          <p><strong>DC:</strong> ${recipe.dc}</p>
          <p><strong>Abilità:</strong> ${recipe.skills.map((s) => CONFIG.DND5E.skills[s]?.label || s).join(' / ')}</p>
          <p><strong>Ingredienti:</strong> ${required}</p>
          ${optional}
        </div>
        <button type="button" data-recipe="${recipe.id}">Prepara</button>
      </div>
    `;
  }

  static async brewIntruglio(actor, recipeId) {
    if (!this._validateActor(actor)) return null;

    const recipe = this._resolveRecipe(recipeId);
    if (!recipe) {
      ui.notifications.error('Ricetta sconosciuta.');
      return null;
    }

    const check = this._checkIngredients(actor, recipe);
    if (!check.success) {
      ui.notifications.warn(`Ingredienti mancanti: ${check.missing.join(', ')}`);
      return null;
    }

    const optionalBonus = check.optionalUsed ? 2 : 0;
    const covoBonus = await this._laboratoryBonus(actor);

    const skill = await this._promptSkill(actor, recipe.skills);
    if (!skill) return null;

    const rollData = await this._rollSkill(actor, skill, recipe, optionalBonus);
    if (!rollData) return null;

    const success = rollData.total >= (recipe.dc - covoBonus);

    if (game.settings.get(MODULE_ID, 'intrugliAutoconsume')) {
      await this._consumeIngredients(actor, recipe, success);
    }

    await this._announceRoll(actor, recipe, rollData, optionalBonus, covoBonus, success);

    if (success) {
      return await this._handleSuccess(actor, recipe, rollData);
    }

    return await this._handleFailure(actor, recipe);
  }

  static _validateActor(actor) {
    if (!actor) {
      ui.notifications.warn('Nessun personaggio selezionato.');
      return false;
    }
    if (actor.type !== 'character') {
      ui.notifications.warn('Solo i personaggi possono preparare intrugli.');
      return false;
    }
    return true;
  }

  static _resolveRecipe(recipeId) {
    const lower = recipeId?.toLowerCase?.();
    return Object.values(this.RECIPES).find((r) => r.id === lower || r.label.toLowerCase().includes(lower)) ?? null;
  }

  static _checkIngredients(actor, recipe) {
    const missing = [];
    let optionalUsed = false;

    for (const key of recipe.ingredients.required) {
      const ingredient = this.INGREDIENTS[key];
      const item = this._findIngredient(actor, ingredient.match);
      if (!item || (item.system?.quantity ?? 0) < 1) {
        missing.push(ingredient.label);
      }
    }

    if (missing.length === 0) {
      optionalUsed = recipe.ingredients.optional.some((key) => {
        const ingredient = this.INGREDIENTS[key];
        const item = this._findIngredient(actor, ingredient.match);
        return item && (item.system?.quantity ?? 0) >= 1;
      });
    }

    return { success: missing.length === 0, missing, optionalUsed };
  }

  static _findIngredient(actor, labelMatch) {
    return actor.items.find((item) => item.name.toLowerCase().includes(labelMatch.toLowerCase()));
  }

  static async _laboratoryBonus(actor) {
    if (!game.settings.get(MODULE_ID, 'intrugliRequireLaboratorio')) return 0;

    const covoId = actor.getFlag(MODULE_ID, 'covoId');
    if (!covoId) return 0;

    const covo = game.actors.get(covoId);
    const distilleria = covo?.items?.find?.((item) =>
      item.getFlag?.(MODULE_ID, 'granlusso') &&
      item.getFlag?.(MODULE_ID, 'type') === 'distilleria' &&
      (item.system?.level?.value ?? 0) > 0
    );

    return distilleria ? 2 : 0;
  }

  static async _promptSkill(actor, skills) {
    return new Promise((resolve) => {
      const options = skills.map((skill) => {
        const label = CONFIG.DND5E.skills[skill]?.label ?? skill.toUpperCase();
        const mod = actor.system?.skills?.[skill]?.total ?? 0;
        const modStr = mod >= 0 ? `+${mod}` : mod;
        return `<option value="${skill}">${label} (${modStr})</option>`;
      }).join('');

      new Dialog({
        title: 'Scegli abilità',
        content: `<div class="intrugli-skill"><select id="intrugli-skill">${options}</select></div>`,
        buttons: {
          ok: {
            label: 'Conferma',
            icon: '<i class="fas fa-check"></i>',
            callback: (html) => resolve(html.find('#intrugli-skill').val())
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Annulla',
            callback: () => resolve(null)
          }
        }
      }).render(true);
    });
  }

  static async _rollSkill(actor, skill, recipe, optionalBonus) {
    const flavor = `Preparazione di ${recipe.label}`;
    const roll = await actor.rollSkill(skill, { flavor, chatMessage: false, fastForward: false });
    if (!roll) return null;

    return {
      roll,
      d20: roll.dice?.[0]?.results?.[0]?.result ?? 0,
      total: roll.total + optionalBonus,
      dc: recipe.dc,
      optionalBonus
    };
  }

  static async _consumeIngredients(actor, recipe, success) {
    const multiplier = success ? 1 : 0.5;

    for (const key of recipe.ingredients.required) {
      await this._consumeSingle(actor, key, multiplier);
    }
    for (const key of recipe.ingredients.optional) {
      if (this._findIngredient(actor, this.INGREDIENTS[key].match)) {
        await this._consumeSingle(actor, key, multiplier);
      }
    }
  }

  static async _consumeSingle(actor, key, multiplier) {
    const ingredient = this.INGREDIENTS[key];
    const item = this._findIngredient(actor, ingredient.match);
    if (!item) return;

    const current = item.system?.quantity ?? 0;
    const toConsume = Math.max(1, Math.round(multiplier));
    const remaining = Math.max(0, current - toConsume);

    if (remaining <= 0) {
      await item.delete();
    } else {
      await item.update({ 'system.quantity': remaining });
    }
  }

  static async _announceRoll(actor, recipe, rollData, optionalBonus, covoBonus, success) {
    const icon = success ? '✅' : '❌';
    const html = `
      <div class="intrugli-roll ${success ? 'success' : 'failure'}">
        <h3>${icon} ${recipe.label}</h3>
        <p><strong>Artefice:</strong> ${actor.name}</p>
        <p><strong>Tiro:</strong> ${rollData.roll.total}${optionalBonus ? ` (+${optionalBonus} ingredienti)` : ''}</p>
        ${covoBonus ? `<p><strong>Bonus distilleria:</strong> -${covoBonus} DC</p>` : ''}
        <p><strong>DC Effettiva:</strong> ${recipe.dc - covoBonus}</p>
      </div>
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: html,
      roll: rollData.roll,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER
    });
  }

  static async _handleSuccess(actor, recipe, rollData) {
    const effect = await this._drawEffect(recipe) ?? this._fallbackEffect(recipe.category);

    const itemData = {
      name: `${recipe.label} (${this._qualityLabel(rollData.total, recipe.dc)})`,
      type: 'consumable',
      img: recipe.icon,
      system: {
        description: { value: `<p>${effect}</p><p><em>Preparato da ${actor.name}.</em></p>` },
        consumableType: 'potion',
        uses: { value: 1, max: 1, per: 'charges', autoDestroy: true },
        rarity: this._rarityFor(rollData.total, recipe.dc)
      },
      flags: {
        [MODULE_ID]: {
          intruglio: true,
          recipe: recipe.id,
          crafter: actor.id,
          roll: rollData.total
        }
      }
    };

    const [created] = await actor.createEmbeddedDocuments('Item', [itemData]);
    ui.notifications.info(`${recipe.label} creato con successo!`);
    return created;
  }

  static async _handleFailure(actor, recipe) {
    if (recipe.dangerous) {
      const damage = await (new Roll('1d6')).roll({ async: true });
      await actor.applyDamage?.(damage.total, { type: 'poison' });
      ui.notifications.error(`L'intruglio esplode! ${actor.name} subisce ${damage.total} danni da veleno.`);
    } else if (recipe.chaotic) {
      const effect = this._randomSideEffect();
      ui.notifications.warn(effect);
    } else {
      ui.notifications.warn('Intruglio fallito. Ingredienti sprecati.');
    }
    return null;
  }

  static async _drawEffect(recipe) {
    const table = game.tables.find((t) => t.name === recipe.table);
    if (!table) return null;

    const result = await table.draw({ displayChat: false });
    return result.results?.[0]?.text ?? null;
  }

  static _fallbackEffect(category) {
    switch (category) {
      case 'healing': return 'Cura 2d4 + 2 punti ferita.';
      case 'poison': return 'Infligge 3d6 danni da veleno (TS COS 13 per dimezzare).';
      case 'buff': return 'Conferisce vantaggio ai tiri per colpire per 1 minuto.';
      default: return this._randomSideEffect();
    }
  }

  static _randomSideEffect() {
    const options = [
      'Ti spuntano baffi verdognoli per 24 ore.',
      'Parli al contrario per 1 ora.',
      'Emetti scintille dalle dita ogni volta che ridacchi.',
      'Diventi trasparente al 50% per 1 minuto.',
      'Un odore pungente ti segue per tutta la giornata.'
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  static _qualityLabel(total, dc) {
    if (total >= dc + 8) return 'Superiore';
    if (total >= dc + 4) return 'Buono';
    return 'Standard';
  }

  static _rarityFor(total, dc) {
    if (total >= dc + 8) return 'uncommon';
    if (total >= dc + 4) return 'common';
    return 'common';
  }
}

Hooks.once('init', () => IntrugliSystem.initialize());

Hooks.once('ready', () => {
  // Registra macro (richiede game.user disponibile)
  IntrugliSystem._registerMacro();
  
  if (game.settings.get(MODULE_ID, 'intrugliEnabled')) {
    console.log('Brancalonia | Sistema Intrugli attivo');
  }
});

export { IntrugliSystem };
