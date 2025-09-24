/**
 * Sistema di Riferimenti e Condivisione Regole in Chat
 * Permette di richiamare e condividere facilmente le regole del compendio
 */

// Mappa delle regole con ID e icone
const REGOLE_BRANCALONIA = {
  "armi-fuoco": {
    id: "armiDaFuocoPrimitive001",
    nome: "Armi da Fuoco Primitive",
    icona: "systems/dnd5e/icons/items/weapons/musket.webp",
    tag: "@Regola[Armi da Fuoco]"
  },
  "combattimento-sporco": {
    id: "combattimentoSporco001",
    nome: "Combattimento Sporco",
    icona: "systems/dnd5e/icons/skills/weapon_26.jpg",
    tag: "@Regola[Combattimento Sporco]"
  },
  "corruzione": {
    id: "corruzioneTangenti001",
    nome: "Corruzione e Tangenti",
    icona: "systems/dnd5e/icons/commodities/currency/coin-embossed-octopus-gold.webp",
    tag: "@Regola[Corruzione]"
  },
  "duelli": {
    id: "duelliCodiceOnore001",
    nome: "Duelli e Codice d'Onore",
    icona: "systems/dnd5e/icons/skills/weapon_07.jpg",
    tag: "@Regola[Duelli]"
  },
  "equipaggiamento-scadente": {
    id: "equipaggiamentoScadente001",
    nome: "Equipaggiamento Scadente",
    icona: "systems/dnd5e/icons/items/armor/leather-rusted.webp",
    tag: "@Regola[Equipaggiamento Scadente]"
  },
  "fortuna": {
    id: "fortunaSfortuna001",
    nome: "Fortuna e Sfortuna",
    icona: "systems/dnd5e/icons/skills/green_10.jpg",
    tag: "@Regola[Fortuna/Sfortuna]"
  },
  "gioco-azzardo": {
    id: "giocoAzzardo001",
    nome: "Gioco d'Azzardo",
    icona: "systems/dnd5e/icons/items/trinkets/playing-cards.webp",
    tag: "@Regola[Gioco d'Azzardo]"
  },
  "lavori-sporchi": {
    id: "lavoriSporchi001",
    nome: "Lavori Sporchi",
    icona: "systems/dnd5e/icons/skills/shadow_11.jpg",
    tag: "@Regola[Lavori Sporchi]"
  },
  "menagramo": {
    id: "menagramo",
    nome: "Menagramo",
    icona: "systems/dnd5e/icons/skills/affliction_03.jpg",
    tag: "@Regola[Menagramo]"
  },
  "regole-strada": {
    id: "regoleStrada001",
    nome: "Regole della Strada",
    icona: "systems/dnd5e/icons/environment/wilderness/camp-improvised.webp",
    tag: "@Regola[Regole Strada]"
  },
  "riposo": {
    id: "riposoCanaglia001",
    nome: "Il Riposo della Canaglia",
    icona: "systems/dnd5e/icons/environment/settlement/tent.webp",
    tag: "@Regola[Riposo Canaglia]"
  },
  "risse": {
    id: "risseTaverna001",
    nome: "Risse da Taverna",
    icona: "systems/dnd5e/icons/skills/blood_07.jpg",
    tag: "@Regola[Risse]"
  },
  "taglie": {
    id: "sistemaTaglie001",
    nome: "Sistema delle Taglie",
    icona: "systems/dnd5e/icons/items/documents/wanted-poster.webp",
    tag: "@Regola[Taglie]"
  },
  "superstizioni": {
    id: "superstizioniTradizioni001",
    nome: "Superstizioni e Tradizioni",
    icona: "systems/dnd5e/icons/skills/violet_09.jpg",
    tag: "@Regola[Superstizioni]"
  },
  "ubriachezza": {
    id: "ubriachezza",
    nome: "Ubriachezza",
    icona: "systems/dnd5e/icons/items/consumables/tankard-simple.webp",
    tag: "@Regola[Ubriachezza]"
  },
  "veleni": {
    id: "veleniAntidoti001",
    nome: "Veleni e Antidoti",
    icona: "systems/dnd5e/icons/items/consumables/poison-vial-blue.webp",
    tag: "@Regola[Veleni]"
  },
  "viaggi": {
    id: "viaggiIncontri001",
    nome: "Viaggi e Incontri",
    icona: "systems/dnd5e/icons/environment/wilderness/road.webp",
    tag: "@Regola[Viaggi]"
  },
  "vagabondo": {
    id: "vitaDaVagabondo001",
    nome: "Vita da Vagabondo",
    icona: "systems/dnd5e/icons/environment/settlement/hovel.webp",
    tag: "@Regola[Vagabondo]"
  }
};

/**
 * Inizializza il sistema di riferimenti regole
 */
Hooks.once("ready", () => {
  console.log("Brancalonia | Sistema Riferimenti Regole attivo");

  // Registra il comando chat per richiamare le regole
  game.brancalonia = game.brancalonia || {};
  game.brancalonia.regole = REGOLE_BRANCALONIA;
  game.brancalonia.mostraRegola = mostraRegolaInChat;
  game.brancalonia.creaLinkRegola = creaLinkRegola;
});

/**
 * Processa i messaggi chat per convertire i tag @Regola in link
 */
Hooks.on("renderChatMessage", (message, html) => {
  // Trova tutti i tag @Regola[nome]
  const content = html.find(".message-content");
  let htmlContent = content.html();

  // Pattern per trovare @Regola[qualsiasi cosa]
  const pattern = /@Regola\[([^\]]+)\]/g;

  htmlContent = htmlContent.replace(pattern, (match, nomeRegola) => {
    // Trova la regola corrispondente
    const regola = Object.values(REGOLE_BRANCALONIA).find(r =>
      r.nome.toLowerCase().includes(nomeRegola.toLowerCase()) ||
      r.tag.toLowerCase().includes(nomeRegola.toLowerCase())
    );

    if (regola) {
      return creaLinkRegola(regola);
    }
    return match; // Se non trova, lascia il testo originale
  });

  content.html(htmlContent);
});

/**
 * Crea un link HTML per una regola
 */
function creaLinkRegola(regola) {
  return `<a class="content-link regola-link"
    data-regola-id="${regola.id}"
    data-pack="brancalonia-bigat.regole"
    data-type="JournalEntry"
    draggable="true"
    style="
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: bold;
      border: 1px solid #654321;
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    ">
    <i class="fas fa-scroll" style="font-size: 0.9em;"></i>
    ${regola.nome}
  </a>`;
}

/**
 * Gestisce il click sui link delle regole
 */
$(document).on("click", ".regola-link", async function(e) {
  e.preventDefault();
  const regolaId = $(this).data("regola-id");
  const pack = game.packs.get("brancalonia-bigat.regole");

  if (pack) {
    const documento = await pack.getDocument(regolaId);
    if (documento) {
      documento.sheet.render(true);
    } else {
      ui.notifications.warn(`Regola ${regolaId} non trovata nel compendio.`);
    }
  } else {
    ui.notifications.error("Compendio Regole di Brancalonia non trovato!");
  }
});

/**
 * Mostra una regola nella chat
 */
async function mostraRegolaInChat(nomeRegola) {
  // Trova la regola
  const regola = Object.values(REGOLE_BRANCALONIA).find(r =>
    r.nome.toLowerCase().includes(nomeRegola.toLowerCase())
  );

  if (!regola) {
    ui.notifications.warn(`Regola "${nomeRegola}" non trovata.`);
    return;
  }

  // Carica il documento dal compendio
  const pack = game.packs.get("brancalonia-bigat.regole");
  if (!pack) {
    ui.notifications.error("Compendio Regole non trovato!");
    return;
  }

  const documento = await pack.getDocument(regola.id);
  if (!documento) {
    ui.notifications.warn(`Documento ${regola.id} non trovato nel compendio.`);
    return;
  }

  // Estrai il contenuto della prima pagina
  const primaPagea = documento.pages.contents[0];
  let contenuto = primaPagea?.text?.content || "Contenuto non disponibile";

  // Limita la lunghezza per la chat (prime 500 caratteri)
  if (contenuto.length > 500) {
    contenuto = contenuto.substring(0, 500) + "...";
  }

  // Crea il messaggio chat
  const chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    content: `
      <div class="brancalonia-regola-chat" style="
        border: 2px solid #8B4513;
        border-radius: 8px;
        padding: 10px;
        background: linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 100%);
      ">
        <h3 style="
          margin: 0 0 10px 0;
          color: #654321;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <i class="fas fa-scroll"></i>
          ${regola.nome}
        </h3>
        <div style="
          padding: 8px;
          background: white;
          border-radius: 4px;
          border: 1px solid #D2691E;
        ">
          ${contenuto}
        </div>
        <div style="
          margin-top: 10px;
          text-align: right;
        ">
          ${creaLinkRegola(regola)}
        </div>
      </div>
    `,
    flags: {
      "brancalonia-bigat": {
        type: "regola",
        regolaId: regola.id
      }
    }
  };

  ChatMessage.create(chatData);
}

/**
 * Aggiunge comandi slash per le regole
 */
Hooks.on("chatCommandsReady", (commands) => {
  commands.register({
    name: "/regola",
    module: "brancalonia-bigat",
    aliases: ["/rule"],
    description: "Mostra una regola di Brancalonia nella chat",
    icon: "<i class='fas fa-scroll'></i>",
    requiredRole: "PLAYER",
    callback: (chat, parameters, messageData) => {
      if (!parameters) {
        // Mostra lista regole disponibili
        let lista = "<h3>Regole Disponibili:</h3><ul>";
        Object.values(REGOLE_BRANCALONIA).forEach(r => {
          lista += `<li><code>/regola ${r.nome}</code></li>`;
        });
        lista += "</ul>";

        ChatMessage.create({
          content: lista,
          whisper: [game.user.id]
        });
        return;
      }

      mostraRegolaInChat(parameters);
    }
  });
});

/**
 * Aggiunge bottone per inserire riferimento regola nell'editor
 */
Hooks.on("renderTinyMCE", (editor, element) => {
  // Aggiungi bottone personalizzato per le regole
  if (editor.targetContent?.includes("system.details.biography")) {
    editor.addButton("brancalonia-rules", {
      title: "Inserisci Riferimento Regola",
      icon: "scroll",
      onclick: () => {
        // Crea dialogo per selezione regola
        let opzioni = "<select id='regola-select' style='width: 100%;'>";
        Object.values(REGOLE_BRANCALONIA).forEach(r => {
          opzioni += `<option value='${r.tag}'>${r.nome}</option>`;
        });
        opzioni += "</select>";

        new Dialog({
          title: "Seleziona Regola",
          content: `
            <div style="margin: 10px 0;">
              <label>Scegli la regola da riferire:</label>
              ${opzioni}
            </div>
          `,
          buttons: {
            insert: {
              label: "Inserisci",
              callback: (html) => {
                const tag = html.find("#regola-select").val();
                editor.insertContent(tag);
              }
            },
            cancel: {
              label: "Annulla"
            }
          }
        }).render(true);
      }
    });
  }
});

console.log("Brancalonia | Sistema Riferimenti Regole caricato");