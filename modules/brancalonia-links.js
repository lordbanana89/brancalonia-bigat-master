/**
 * Sistema di collegamenti tra compendi e regole di Brancalonia
 */

Hooks.once('ready', () => {
  console.log('🔗 Brancalonia - Sistema Collegamenti Attivato');

  // Registra il sistema di drag & drop per i tag delle regole
  registerRuleDragDrop();

  // Aggiungi handler per i click sui tag delle regole
  registerRuleClickHandlers();
});

/**
 * Registra gli handler per il drag & drop dei tag delle regole
 */
function registerRuleDragDrop() {
  // Handler per tutti i tag delle regole draggabili
  document.addEventListener('dragstart', (event) => {
    if (event.target.classList.contains('regola-tag')) {
      const ruleName = event.target.dataset.regola;
      const ruleDisplayName = event.target.textContent.replace('📜 ', '');

      // Crea il link Foundry per la regola
      const dragData = {
        type: 'JournalEntry',
        pack: 'brancalonia-bigat.regole',
        id: ruleName.replace(/-/g, '') + '001'
      };

      event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      event.dataTransfer.effectAllowed = 'copy';
    }
  });
}

/**
 * Registra gli handler per i click sui tag delle regole
 */
function registerRuleClickHandlers() {
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('regola-tag')) {
      event.preventDefault();
      event.stopPropagation();

      const ruleName = event.target.dataset.regola;
      const ruleId = ruleName.replace(/-/g, '') + '001';

      // Cerca la regola nel compendio
      const pack = game.packs.get('brancalonia-bigat.regole');
      if (pack) {
        const doc = await pack.getDocument(ruleId);
        if (doc) {
          doc.sheet.render(true);
        } else {
          ui.notifications.warn(`Regola non trovata: ${ruleName}`);
        }
      }
    }
  });
}

/**
 * Hook per migliorare la visualizzazione degli item con riferimenti alle regole
 */
Hooks.on('renderItemSheet', (app, html, data) => {
  // Aggiungi stile CSS per i tag delle regole
  if (!document.querySelector('#brancalonia-rule-tags-style')) {
    const style = document.createElement('style');
    style.id = 'brancalonia-rule-tags-style';
    style.textContent = `
      .regole-correlate {
        margin-top: 10px;
        padding: 10px;
        background: #f4e8d0;
        border: 1px solid #8b4513;
        border-radius: 5px;
      }

      .regola-tag {
        display: inline-block;
        margin: 2px;
        padding: 2px 8px;
        background: #8b4513;
        color: white;
        border-radius: 3px;
        cursor: pointer;
        font-size: 0.9em;
        transition: all 0.3s;
      }

      .regola-tag:hover {
        background: #a0522d;
        transform: scale(1.05);
      }

      .regola-tag[draggable="true"] {
        cursor: grab;
      }

      .regola-tag[draggable="true"]:active {
        cursor: grabbing;
      }
    `;
    document.head.appendChild(style);
  }

  // Rendi i tag interattivi nell'HTML renderizzato
  html.find('.regola-tag').each((i, element) => {
    element.draggable = true;
    element.title = 'Clicca per aprire la regola o trascina in chat';
  });
});

/**
 * Funzione helper per creare un messaggio chat con link a una regola
 */
window.BrancaloniaLinks = {
  /**
   * Invia un riferimento a una regola in chat
   * @param {string} ruleName - Nome della regola (es. "combattimento-sporco")
   */
  async sendRuleToChat(ruleName) {
    const ruleId = ruleName.replace(/-/g, '') + '001';
    const pack = game.packs.get('brancalonia-bigat.regole');

    if (pack) {
      const doc = await pack.getDocument(ruleId);
      if (doc) {
        // Crea il messaggio chat con il link alla regola
        const content = `
          <div class="brancalonia-rule-reference">
            <h3>📜 Riferimento Regola</h3>
            <p><strong>@UUID[Compendium.brancalonia-bigat.regole.${ruleId}]{${doc.name}}</strong></p>
            <p style="font-style: italic;">Clicca sul nome per aprire la regola completa.</p>
          </div>
        `;

        ChatMessage.create({
          content: content,
          speaker: ChatMessage.getSpeaker()
        });
      }
    }
  },

  /**
   * Ottieni tutte le regole correlate a un oggetto
   * @param {string} itemName - Nome dell'oggetto
   * @returns {Array} Array di nomi delle regole correlate
   */
  getRelatedRules(itemName) {
    const rules = [];
    const searchText = itemName.toLowerCase();

    // Mappa semplificata per la ricerca
    const keywordMap = {
      'archibugio': ['armi-da-fuoco-primitive', 'equipaggiamento-scadente'],
      'pistola': ['armi-da-fuoco-primitive'],
      'scadente': ['equipaggiamento-scadente'],
      'malfunzionant': ['equipaggiamento-scadente'],
      'attaccabrighe': ['combattimento-sporco', 'risse-taverna'],
      'rissa': ['risse-taverna'],
      'fortuna': ['fortuna-sfortuna'],
      'menagramo': ['menagramo'],
      'veleno': ['veleni-antidoti'],
      'ubriaco': ['ubriachezza'],
      'dadi': ['gioco-azzardo'],
      'duello': ['duelli-codice-onore'],
      'viaggio': ['viaggi-incontri'],
      'taglia': ['sistema-taglie']
    };

    for (const [keyword, relatedRules] of Object.entries(keywordMap)) {
      if (searchText.includes(keyword)) {
        rules.push(...relatedRules);
      }
    }

    return [...new Set(rules)]; // Rimuovi duplicati
  }
};