[ROLE]
Sei un Senior UI Engineer per Foundry VTT. Devi rifattorizzare il tema “Brancalonia” mantenendo i colori e il mood già creati dall’agente precedente, ma rendendo TUTTO coerente con il modulo di riferimento “crlngn-ui” e compatibile con il sistema dnd5e release 5.1.9.

[CONTEXT]
- Repo tema Brancalonia: (progetto corrente)
- Modulo di riferimento UI: https://github.com/crlngn/crlngn-ui
- Sistema target: dnd5e v5.1.9 (actor/item sheets, compendi, chat cards, token HUD, sidebar, rolltable UI, ecc.)
- Foundry target: v12/v13 (mantieni compatibilità doppia ove possibile)


[GOAL]
1) Conservare **palette e stile** creati (niente regressioni cromatiche), ma:
   - Allineare gerarchie, spaziature, tipografia, radius, ombre e pattern CSS a crlngn-ui.
   - Rimuovere incoerenze e override globali invasivi.
2) Ripristinare **coerenza funzionale/visiva** su:
   - Actor & Item sheets dnd5e (tutte le sezioni e tabs).
   - Compendi (liste, schede dettaglio, preview immagini).
   - Rolltable (lista e draw dialog) → niente UI “vuote”.
   - Sidebar (scenes, actors, items, journal, compendia, tables).
   - Chat cards (tiri, danni, spell, abilità) e Token/Combat HUD.
3) Nessuna rimozione di contenuti/feature: solo implementazioni corrette o fix mirati.

[UI VISUAL CANON (RICERCA WEB)]
Fonti iconografiche (copertine/impaginati/illustrazioni ufficiali) mostrano un'estetica "rinascimentale picaresca" con pergamena calda, inchiostro bruno, oro/brass, rossi cerati e verdi smeraldo; logotipo con cartiglio dorato, filigrane, nastri e sigilli in ceralacca. La UI deve evocare queste scelte SENZA sacrificare leggibilità e performance, né snaturare l'impostazione minimal/UX di crlngn-ui.

**Cues visivi da rispettare**
- **Fondi**: carta/pergamena con grana fine e vignettatura morbida; niente texture pesanti sotto il testo (usa overlay ≤ 8–12% opacità su superfici di contenuto).
- **Colori**: terra, ottone/oro, rosso ceralacca, verde bandiera/emerald; neri mai assoluti → inchiostri bruni.
- **Tipografia**: titoli serif display con grazie nette e leggera modulazione (stile lapidario), testo in serif leggibile; uso moderato di **capolettera** e **small caps** per box di flavour (no in campi di input).
- **Ornamenti**: cartigli, fregi, rosoni, angolari, ceralacca, rosette e chiodi: **SVG** inline, colore via `currentColor` o CSS vars; non usare PNG enormi. Corner ornaments solo su contenitori di alto livello (finestra/app), non su ogni card.
- **Mappe**: cromie seppia/azzurro carta nautica; bussola come icona di navigazione opzionale. Non introdurre cornici eccessive.
- **Iconografia**: stile "inchiostro/penna" o pittorico; conversione a monocromatico consentita per pulsanti attivi/passivi.
- **UI blending con crlngn-ui**: bordi sottili, radius medio, shadow soft; mai outline invadenti. I componenti restano geometrici/minimali, le texture e gli ornamenti fanno da cornice.

**Pattern applicativi**
- **Header finestre / Sheet**: titolo con display serif + piccola linea o fregio SVG (max 24px) a sinistra; sfondo paper; azioni allineate a destra.
- **Tabs**: pill a rullo con bordo ottone/brass e hover rosso ceralacca; lo stato attivo usa `--bcl-gold` come fondo e `--bcl-ink-strong` come testo.
- **Callout di flavour**: box su `--bcl-paper-weak` con bordo `--bcl-border` e nastro/ribbon opzionale in alto a sinistra (pseudo-elemento).
- **Badge/Chip**: tinta piatta `--bcl-paper-strong` con testo `--bcl-ink` e bordo `--bcl-border`.
- **Sigilli**: cerchio con `--bcl-seal-wax` e emboss (shadow interna leggera); usali solo per stati speciali (es. contenuti ufficiali/locked).

**Prestazioni**
- Orpelli decorativi solo come SVG o texture tile 512px ripetute; niente immagini 4K nei pannelli UI. Evita filtri CSS costosi (blur dinamici sulle liste, drop-shadow pesanti).

[NON-NEGOTIABLE CONSTRAINTS]
- **System dnd5e 5.1.9**: rispetta struttura template/partials ufficiali, classi/data-attr chiave e flussi di avanzamento; nessun override che rompa sheets/chat/roll/compendi.
- **Non hardcodare colori**: mappa la palette attuale in **CSS custom properties** (token di tema).
- **Niente !important** salvo eccezioni documentate.
- **Scope del tema**: applica gli stili sotto un root selector del tema (es. `.theme-brancalonia`) per evitare collisioni globali.
- **Accessibilità**: contrasto minimo WCAG AA per testo primario/su sfondo.
- **Zero layout shift** percettibile su UI base dnd5e; massima compatibilità con crlngn-ui.
- **Carolingian UI**: rispetta le opzioni del modulo (v12 → v1.x, v13 → v2.x). Non disattivare o rompere “Custom Styles” (v13) e “Horizontal Tabs for 5e Actor Sheets” (v12). Assicurati che il tema funzioni sia con gli stili di crlngn-ui attivi sia quando alcune aree sono disabilitate parzialmente.
- **Token Theme Engine**: NON rinominare né rimuovere variabili `--branca-*` usate dal Theme Engine Carolingiano. Se usi token `--bcl-*`, crea alias stabili `--bcl-*` → `--branca-*` (retrocompatibilità).
- **CSS Layers**: inserisci gli stili del tema in `@layer module` e NON superare la specificità di `@layer system` (coerente con il layer model dichiarato).

[PALETTE & TOKENS]
1) Estrai i colori REALI già usati (primario, accenti oro/verde, carta/parchment, inchiostro/testo, bordi, stato, overlay).
2) Congelali in variabili:
   --bcl-bg, --bcl-surface, --bcl-paper, --bcl-ink, --bcl-muted,
   --bcl-accent, --bcl-accent-strong, --bcl-gold, --bcl-emerald,
   --bcl-border, --bcl-focus, --bcl-danger, --bcl-success, --bcl-warning,
   --bcl-seal-wax, --bcl-ribbon, --bcl-shadow-ink, --bcl-paper-overlay, --bcl-nav.
3) Sostituisci nel CSS esistente tutti i valori raw con `var(--token)`.
4) Mantieni tipografia coerente: dimensioni in rem, line-height 1.35–1.5, scala spaziatura 4/8 px (0.25/0.5rem).


Schema consigliato (default sicuro)

> Mantiene lo stile Brancalonia (pergamena/barocco) e garantisce AA su testo primario.

```css
:root,
.theme-brancalonia {
  /* Color tokens */
  --bcl-bg: #15110C;
  --bcl-surface: #F3E6CC;
  --bcl-paper: #E7D6AE;
  --bcl-paper-weak: #EFE0BD;
  --bcl-paper-strong: #D9C38F;

  --bcl-ink: #2B1F14;
  --bcl-ink-weak: #4A3826;
  --bcl-ink-strong: #1C140D;
  --bcl-muted: #6C5A43;

  --bcl-gold: #C9A54A;
  --bcl-emerald: #2E7D64;
  --bcl-accent: #8C2B27;
  --bcl-accent-strong: #5E1715;

  --bcl-success: #2F8F5B;
  --bcl-warning: #C27C1A;
  --bcl-danger:  #952C2C;

  --bcl-focus: #7A5E1F;
  --bcl-border: #B99D6B;
  --bcl-divider: #D6C193;

  /* Brancalonia brand extras */
  --bcl-seal-wax: #8E1D22;      /* ceralacca */
  --bcl-ribbon:   #7E1F1B;      /* nastro/bandierina */
  --bcl-shadow-ink: rgba(28, 20, 13, .35);
  --bcl-paper-overlay: rgba(43, 31, 20, .06); /* grana/legibility layer */
  --bcl-nav: #223F4A;           /* blu-verde carta nautica per mappe/nav */

  /* Typography tokens */
  --bcl-font-display: "Cinzel", serif;
  --bcl-font-serif: "Alegreya", Georgia, serif;
  --bcl-font-sans: "Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  --bcl-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  --bcl-font-size-base: 16px;         /* scala rem */
  --bcl-line: 1.45;

  --bcl-radius-sm: 4px;
  --bcl-radius-md: 8px;
  --bcl-radius-lg: 14px;

  --bcl-shadow-1: 0 1px 0 rgba(0,0,0,.04), 0 1px 8px rgba(0,0,0,.06);
  --bcl-shadow-2: 0 2px 0 rgba(0,0,0,.06), 0 6px 18px rgba(0,0,0,.12);
}

/* Mapping semantico di base */
.theme-brancalonia { color: var(--bcl-ink); background: var(--bcl-bg); }
.theme-brancalonia .window-app .window-content {
  background: var(--bcl-paper);
  color: var(--bcl-ink);
  box-shadow: var(--bcl-shadow-1);
}
.theme-brancalonia .sheet-header h1,
.theme-brancalonia .app h2,
.theme-brancalonia .app .title {
  font-family: var(--bcl-font-display);
  font-weight: 700;
  letter-spacing: .02em;
}
.theme-brancalonia,
.theme-brancalonia input,
.theme-brancalonia button,
.theme-brancalonia .directory-list {
  font-family: var(--bcl-font-serif);
  line-height: var(--bcl-line);
}
.theme-brancalonia .bcl-ui { font-family: var(--bcl-font-sans); } /* micro-UI opzionale */

.theme-brancalonia .btn-primary {
  background: var(--bcl-accent);
  color: var(--bcl-paper);
  border: 1px solid var(--bcl-ink-strong);
}
.theme-brancalonia .btn-primary:hover { background: var(--bcl-accent-strong); }
.theme-brancalonia .btn-secondary {
  background: var(--bcl-gold);
  color: var(--bcl-ink-strong);
}

/* Callout / Ribbon utilities */
.theme-brancalonia .bcl-callout {
  background: var(--bcl-paper-weak);
  border: 1px solid var(--bcl-border);
  box-shadow: inset 0 1px 0 var(--bcl-paper-overlay), var(--bcl-shadow-1);
  padding: 0.75rem 1rem;
  border-radius: var(--bcl-radius-md);
}
.theme-brancalonia .bcl-callout--flavour { font-family: var(--bcl-font-serif); font-variant: small-caps; }
.theme-brancalonia .bcl-ribbon { position: relative; }
.theme-brancalonia .bcl-ribbon::before {
  content: "";
  position: absolute; inset: -10px auto auto -10px; width: 72px; height: 18px;
  background: var(--bcl-ribbon);
  clip-path: polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%);
  box-shadow: 0 1px 0 rgba(0,0,0,.2);
}

/* Focus visibile, dorato */
.theme-brancalonia :focus { outline: 2px solid var(--bcl-focus); outline-offset: 2px; }
```

Coppie contrasto AA consigliate
- Testo principale: `--bcl-ink` su `--bcl-paper`
- Bottoni/link primari: `--bcl-paper` su `--bcl-accent` oppure `--bcl-ink-strong` su `--bcl-gold`
- Chip/Badge: `--bcl-ink` su `--bcl-paper-weak` (bordo `--bcl-border`)

Alias Theme Engine Carolingiano (mappatura consigliata)
```css
:root,
.theme-brancalonia {
  /* Alias --bcl-* → --branca-* per integrarsi con il Theme Engine del modulo */
  --branca-bg: var(--bcl-bg);
  --branca-surface: var(--bcl-surface);
  --branca-paper: var(--bcl-paper);
  --branca-ink: var(--bcl-ink);
  --branca-muted: var(--bcl-muted);
  --branca-gold: var(--bcl-gold);
  --branca-emerald: var(--bcl-emerald);
  --branca-accent: var(--bcl-accent);
  --branca-accent-strong: var(--bcl-accent-strong);
  --branca-success: var(--bcl-success);
  --branca-warning: var(--bcl-warning);
  --branca-danger: var(--bcl-danger);
  --branca-focus: var(--bcl-focus);
  --branca-border: var(--bcl-border);
  --branca-divider: var(--bcl-divider);
}
```

[FONT & LIBRERIE (SELF-HOST)]
- **Font**: Display → *Cinzel* (700/800); Testo → *Alegreya* (400/500/700); Sans UI → *Inter* (400/500/600); Mono → *JetBrains Mono* (400/600).
  - Consiglio: scarica i woff2 e registra con `@font-face` (no `@import`).
- **Icone**: Tabler Icons o Phosphor (SVG inline). Evitare webfont per ridurre CLS.
- **Dev utility**: TinyColor2 (solo build/test) per verifiche di contrasto e scale.
- **Opzionale**: Open Props (cherry-pick) per scale di spaziatura/ombre; NON sovrascrivere i token `--bcl-*`.

- **Alternative coerenti al brand**: Cormorant Garamond (display) + Alegreya (testo) + IM Fell English SC (small caps per didascalie). Usare con moderazione e sempre con fallback locali. Non usare webfont non subsettati; preferire WOFF2 con subset Latin/Latin-Ext.
[ICONOGRAFIA E DECORAZIONI]
- Fornire set di **SVG** per: angolari, rosoni, cartigli, sigilli (stroke=1.25, join=round). Niente webfont di icone.
- Colori via `currentColor`; per rilievo usa `filter: drop-shadow(0 1px 0 var(--bcl-shadow-ink))` solo sugli header.
- Non sovrapporre decorazioni al testo; applicare `pointer-events: none` ai soli SVG ornamentali.

[DARK/LIGHT MODE]
Supporta entrambe le modalità rispettando i token. Non hardcodare colori scuri/chiari; varia i token.

```css
/* Modalità chiara (default) → già coperta dai token */
:root.theme-brancalonia,
.theme-brancalonia[data-theme="light"] { /* no-op: usa i token di default */ }

/* Modalità scura */
.theme-brancalonia[data-theme="dark"],
:root.theme-brancalonia.dark {
  --bcl-bg: #0F0C08;
  --bcl-surface: #2B2218;
  --bcl-paper: #3A2E20;
  --bcl-ink: #F3E6CC;
  --bcl-muted: #C9B691;
  --bcl-border: #7A6546;
  --bcl-divider: #5E4C35;
  /* Accenti invariati per brand consistency */
}
```

Checklist A11y per dark mode:
- Contrasto AA: testo principale ≥ 4.5:1
- Hover/focus/active visibili su bottoni/link/tabs
- Nessun testo su texture senza layer di leggibilità (overlay)

- **Actor Sheet dnd5e**: header (ritratto, nome, classe/livello), tabs (abilities, skills, spells, inventory, features, description), barre risorse, badge, chip, tabelle inventario.
- **Item Sheet**: layout campi, icone, tags, sezioni descrittive.
- **Spells**: livelli, scuole, componenti; griglia/elenchi leggibili.
- **Compendi**: card/list look coerente, hover/focus, filtri.
- **Rolltable**: lista voci + dialog di roll (titolo, pulsanti, risultato).
- **Chat Cards**: titolo, sottotitoli, riquadri dadi/danni, tooltips.
- **Token/Combat HUD**: pulsanti, stati, selezione attiva, tooltip.
- **Sidebar**: gruppi, header, tabs, scrollbar skinnata non invasiva.
- **Modali/Dialog**: titoli, bottoni primari/secondari, input.
- **Compendium Editor Integrato**: finestre, liste, dialog di import/export (coerenza con ApplicationV2).
- **Tracker Brancalonia**: Infamia, Baraonda, Lavori Sporchi, Rifugio, Compagnia (badge, barre, chip).
- **Decorazioni Rinascimentali**: corner ornaments, texture pergamena, senza compromettere leggibilità/performance.
- **Dice So Nice**: tema dadi Brancalonia via API ufficiale; niente import Three.js aggiuntivi; pips/edge leggibili (AA) e performance stabili.

[STRUTTURA & CODICE]
- Crea `/styles/tokens.css` con tutte le variabili di tema.
- Rifattorizza fogli stile in `/styles` per area (actor.css, item.css, chat.css, hud.css, compendium.css, rolltable.css, sidebar.css, dialogs.css).
- Usa BEM o utility coerenti (evita nidificazioni profonde).
- Fornisci fallback dove serve: `color: var(--bcl-ink, #2b2b2b);`

[CSS LAYERS & SCOPE]
- Inserisci tutti gli stili del tema in `@layer module`.
- Non alzare la specificità oltre il necessario; evita `!important` (vedi vincoli).
- Mantieni lo scope sotto `.theme-brancalonia` per prevenire collisioni con altri moduli.

 [INTEROPERABILITÀ CON CAROLINGIAN UI]
 - **Versioning**: v1.x per Foundry v12, v2.x per v13. Mantieni compatibilità con entrambe le linee.
 - **Feature sensibili**: non rompere `Custom Styles` (v13) e l’opzione `Horizontal Tabs for 5e Actor Sheets` (v12). Il tema deve funzionare sia con gli stili di crlngn-ui attivi sia quando disattivati parzialmente.
 - **Conflitti**: evita override aggressivi su navigazione scene rework, floating chat, macro bar e player list. Dove necessario, innesta gli stili sotto `.theme-brancalonia` e preferisci variabili CSS.
 - **Integrazione Theme API**: Non rinominare i token pubblici `--branca-*` né gli hook del Theme Engine; se servono variazioni, esponile tramite mapping/alias senza side-effect.

[INTEGRAZIONE CON DND5E 5.1.9 (SYSTEM)]
Obiettivo: applicare il tema senza alterare markup/handlebars e flussi del **sistema ufficiale dnd5e v5.1.9** (actor/item sheets, spellbook, compendi, chat, rolltable, advancement).

**Scope & Selettori**
- Scope principale: `.theme-brancalonia .dnd5e` e `.theme-brancalonia .app.dnd5e`.
- Evita selettori globali su `.window-app`, `.application` senza prefisso `.theme-brancalonia`.
- Non usare `!important` salvo bug-blocker documentati.

**Template/Partials da NON rompere** (solo skin CSS)
- Actors → `systems/dnd5e/templates/actors/parts/`: `actor-classes.hbs`, `actor-traits.hbs`, `actor-features.hbs`, `actor-inventory.hbs`, `actor-spellbook.hbs`, `actor-warnings.hbs`, `biography-textbox.hbs`.
- Tabs → `systems/dnd5e/templates/actors/tabs/`: `character-details.hbs`, `character-biography.hbs`, `creature-special-traits.hbs`, `npc-biography.hbs`, `group-members.hbs`, `character-bastion.hbs`.
- Items → `systems/dnd5e/templates/items/details/`: `details-*.hbs` (class, subclass, spell, spellcasting, equipment, weapon, consumable, tool, container, facility, feat, loot, background, species, mountable, starting-equipment).
- Shared Fields → `systems/dnd5e/templates/shared/fields/`: `field-activation.hbs`, `field-damage.hbs`, `field-duration.hbs`, `field-range.hbs`, `field-targets.hbs`, `field-uses.hbs`, `fieldlist.hbs`, `formlist.hbs`.
- Chat → `systems/dnd5e/templates/chat/parts/`: `card-activities.hbs`, `card-deltas.hbs`, `spell-block.hbs`, `item-tooltip.hbs`.
- Advancement → `systems/dnd5e/templates/advancement/parts/`: `advancement-ability-score-control.hbs`, `advancement-controls.hbs`, `advancement-spell-config.hbs`.

**Regole di compatibilità**
- **ActorSheetMixin** deprecato → non assumere la sua presenza; skin su `BaseActorSheet`.
- Chat hook: usare solo `renderChatMessageHTML` (non `renderChatMessage`).
- Non alterare attributi `data-group`/`data-tab` e `data-action` usati da dnd5e.
- Non rimuovere/occultare `.rollable`, `.item-controls`, `.result` in rolltable: sono funzionali.
- Mantieni altezza riga in tabelle/list per evitare layout shift sugli edit.

**Linee guida CSS (sicure)**
```css
@layer module {
  /* Contenitore generico app/sheet dnd5e */
  .theme-brancalonia .dnd5e .window-content,
  .theme-brancalonia .app.dnd5e .window-content {
    background: var(--bcl-paper);
    color: var(--bcl-ink);
  }
  /* Tabs stile crlngn-ui, brand Brancalonia */
  .theme-brancalonia .dnd5e .sheet-tabs .item { border: 1px solid var(--bcl-border); }
  .theme-brancalonia .dnd5e .sheet-tabs .item:hover { background: var(--bcl-gold); color: var(--bcl-ink-strong); }
  .theme-brancalonia .dnd5e .sheet-tabs .item.active { background: var(--bcl-accent); color: var(--bcl-paper); }
  /* Tabelle inventario/feature */
  .theme-brancalonia .dnd5e table { background: var(--bcl-paper); border: 1px solid var(--bcl-divider); }
  .theme-brancalonia .dnd5e th, .theme-brancalonia .dnd5e td { border-bottom: 1px solid var(--bcl-divider); }
  /* Callout warning/notes */
  .theme-brancalonia .dnd5e .warning, .theme-brancalonia .dnd5e .note {
    background: var(--bcl-paper-weak); border: 1px solid var(--bcl-border);
  }
  /* Chat cards */
  .theme-brancalonia .dnd5e .chat-card {
    background: var(--bcl-paper); border: 1px solid var(--bcl-border); box-shadow: var(--bcl-shadow-1);
  }
}

[INTEGRAZIONE CON ORCNOG CARD VIEWER]
Obiettivo: far convivere il tema con il modulo `orcnog-card-viewer` senza rompere layout, gesture e performance.

**Vincoli**
- Non modificare il markup del modulo; agire solo via CSS scoped.
- Nessun override delle dimensioni/trasformazioni delle card che interferisca con **zoom/pan/flip** o con i calcoli di misura del viewer.
- Non alterare la **z-index** delle overlay del viewer (modal/fullscreen) al di sopra di Dialog e Sheet, salvo bug fix documentati.
- Rispettare CSP: niente inline script/stile; solo classi e variabili CSS.

**Scope CSS**
- Tutti gli stili sotto: `.theme-brancalonia .orcnog-card-viewer` (e sotto-componenti) in `@layer module`.

**Mappatura token → viewer**
Usare i token esistenti per skinnare il viewer:
- sfondi: `--bcl-paper`, `--bcl-paper-weak` (aree neutre/pannelli)
- testo/icone: `--bcl-ink`, `--bcl-ink-weak`
- bordi/divider: `--bcl-border`, `--bcl-divider`
- accent/state: `--bcl-gold`, `--bcl-accent`, `--bcl-accent-strong`
- shadow: `--bcl-shadow-1`, `--bcl-shadow-2`

**Snippet CSS (base skin sicuro)**
```css
@layer module {
  .theme-brancalonia .orcnog-card-viewer {
    color: var(--bcl-ink);
    background: var(--bcl-paper);
  }
  .theme-brancalonia .orcnog-card-viewer .ocv-toolbar,
  .theme-brancalonia .orcnog-card-viewer .ocv-panel {
    background: var(--bcl-paper-weak);
    border: 1px solid var(--bcl-border);
    box-shadow: var(--bcl-shadow-1);
  }
  .theme-brancalonia .orcnog-card-viewer .ocv-button {
    background: transparent;
    border: 1px solid var(--bcl-border);
    border-radius: var(--bcl-radius-sm);
  }
  .theme-brancalonia .orcnog-card-viewer .ocv-button:hover {
    background: var(--bcl-gold);
    color: var(--bcl-ink-strong);
    border-color: var(--bcl-ink-strong);
  }
  .theme-brancalonia .orcnog-card-viewer .ocv-card {
    background: var(--bcl-paper);
    box-shadow: var(--bcl-shadow-2);
    border: 1px solid var(--bcl-divider);
  }
  .theme-brancalonia .orcnog-card-viewer .ocv-card.is-selected {
    outline: 2px solid var(--bcl-accent);
    outline-offset: 2px;
  }
  /* Evita di rompere trasformazioni per zoom/pan/flip */
  .theme-brancalonia .orcnog-card-viewer .ocv-canvas,
  .theme-brancalonia .orcnog-card-viewer .ocv-card {
    will-change: transform; /* suggerimento, NON forzare transform */
  }
  /* Overlay informativi */
  .theme-brancalonia .orcnog-card-viewer .ocv-overlay {
    background: color-mix(in oklab, var(--bcl-bg), transparent 60%);
    color: var(--bcl-paper);
  }
}
```

**Dark mode**
- Ereditare automaticamente dai token della sezione [DARK/LIGHT MODE]. Non introdurre nuovi colori: il viewer deve cambiare aspetto solo via variazione token.

**Icone**
- Se il modulo usa icone inline, non sostituirle. Se serve, applicare solo `fill: currentColor; opacity` in hover/focus.

**Performance**
- Evitare filtri CSS costosi su `.ocv-card` (es. blur). Usare al massimo `box-shadow` come da token.

**Comportamento UI**
- Toolbar: pulsanti con focus visibile (outline dorato), spacing orizzontale coerente con crlngn-ui.
- Pannelli laterali: usare `--bcl-paper-weak` e divider sottili; nessuna scrollbar custom invasiva.

 [INTEGRAZIONE CON DICE SO NICE]
Obiettivo: allineare l'aspetto dei dadi 3D (colorset, materiali, bordi e pips) al brand Brancalonia, mantenendo performance e piena compatibilità con dnd5e 5.1.9 e Foundry v12/v13.

**Compatibilità**
- Target: Dice So Nice v4.x+ (Foundry v10–v13).
- Nessuna dipendenza diretta da Three.js: usare l'istanza core di Foundry.

**Vincoli**
- Non modificare il core del modulo; usare solo l'hook pubblico `diceSoNiceReady`.
- Niente `inline script`, `data:`/`blob:` texture inline, né import duplicati di Three.js.
- Textures facoltative ≤ 512px tile (ripetibili), preferibilmente compresse e servite da `self`.
- Contrasto pips/body ≥ AA ove possibile.

**Mappatura token → dadi**
- **Body**: `--bcl-gold` (set "Gold & Wax") o `--bcl-paper-strong` (set "Parchment & Ink").
- **Pips/Labels**: `--bcl-ink-strong`.
- **Edge/Outline**: `--bcl-ink-strong` o `--bcl-border` a seconda del set.
- **Material**: `metal` per Gold & Wax, `plastic` per Parchment & Ink.

**Hook di integrazione (CSP-safe)**
```js
Hooks.once('diceSoNiceReady', (dice3d) => {
  const cssVar = (n, fallback) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || fallback;

  // Colorset 1 — Gold & Wax
  const goldWax = {
    name: 'branca-goldwax',
    description: 'Brancalonia — Gold & Wax',
    category: 'Brancalonia',
    foreground: cssVar('--bcl-ink-strong', '#1C140D'),   // pips
    background: cssVar('--bcl-gold', '#C9A54A'),         // body
    edge:        cssVar('--bcl-ink-strong', '#1C140D'),
    outline:     cssVar('--bcl-ink-strong', '#1C140D'),
    material: 'metal',
    font: 'Alegreya'
  };
  dice3d.addColorset(goldWax, 'default');

  // Colorset 2 — Parchment & Ink
  const parchmentInk = {
    name: 'branca-parchment-ink',
    description: 'Brancalonia — Parchment & Ink',
    category: 'Brancalonia',
    foreground: cssVar('--bcl-ink-strong', '#1C140D'),
    background: cssVar('--bcl-paper-strong', '#D9C38F'),
    edge:        cssVar('--bcl-border', '#B99D6B'),
    outline:     cssVar('--bcl-border', '#B99D6B'),
    material: 'plastic',
    font: 'Alegreya'
  };
  dice3d.addColorset(parchmentInk, 'default');

  // Registra preset per i dadi più usati in dnd5e
  ['d20','d12','d10','d8','d6','d4'].forEach((type) => {
    dice3d.addDicePreset({ type, colorset: 'branca-goldwax', system: 'dnd5e' }, 'dnd5e');
  });
});
```

**Dark mode**
- I colorset leggono i token correnti: se cambia il tema (light/dark) i colori usati da DSN si aggiornano al prossimo avvio. Evitare duplicati di colorset con lo stesso nome.

**Performance**
- Non forzare shader avanzati lato tema; lasciare all'utente le opzioni DSN.
- Evitare textures ad alta risoluzione e filtri runtime costosi.

**Test rapidi**
- Lancia d20/d6: i dadi devono usare "Brancalonia — Gold & Wax" con pips leggibili e senza log in console.
- Disattivando DSN, i tiri tornano al renderer standard senza side-effect del tema.

[INTEGRAZIONE CON CUSTOM D&D 5E (Larkinabout)]
Obiettivo: far convivere il tema con il modulo `custom-dnd5e` mantenendo leggibilità e coerenza con crlngn-ui, senza alterare la logica del modulo (Gameplay & Configurations).

**Compatibilità**
- Versione v12: linea 1.5.x del modulo.
- Versione v13: linea 2.x del modulo (target per dnd5e v5+).
- Il tema deve degradare con grazia in entrambi i casi (stili non bloccanti; nessuna assunzione su ApplicationV2 all'interno del modulo).

**Vincoli**
- Non toccare markup/handlebars del modulo; applicare solo CSS scoped.
- Non modificare layout critici (grid/flex) delle liste di configurazione (es. Abilities, Skills, Tools, Damage Types, Consumables, Item Properties, Spell Schools, Actor Sizes, Armor Calculations, Counters ecc.).
- Mantenere **focus state visibile** su input/select/switch e bottoni di azione.
- Evitare qualsiasi `position: fixed` o `transform` su container che possa rompere drag, scroll o dialog modal del modulo.

**Scope CSS**
- Preferire uno scope robusto:
  - `.theme-brancalonia.mod-custom-dnd5e-active .custom-dnd5e`,
  - fallback: `.theme-brancalonia .custom-dnd5e`, `.theme-brancalonia .custom-dnd5e-config` (se presenti nel DOM).
- Inserire gli stili in `@layer module` e non superare la specificità del system.

**Hook leggero (solo classe presence, CSP-safe)**
Aggiungi in `brancalonia-config-fix.js`:
```js
Hooks.once("init", () => {
  if (game.modules.get("custom-dnd5e")?.active) {
    document.body.classList.add("mod-custom-dnd5e-active");
  }
});
```

**Mappatura token → UI modulo**
- superfici: `--bcl-paper`, `--bcl-paper-weak`
- testo/icone: `--bcl-ink`, `--bcl-ink-weak`
- bordi/divider: `--bcl-border`, `--bcl-divider`
- azioni/accenti: `--bcl-gold`, `--bcl-accent`, `--bcl-accent-strong`
- focus: `--bcl-focus`
- shadow: `--bcl-shadow-1`, `--bcl-shadow-2`

**Snippet CSS (base skin sicuro)**
```css
@layer module {
  /* Contenitori principali */
  .theme-brancalonia.mod-custom-dnd5e-active .custom-dnd5e,
  .theme-brancalonia .custom-dnd5e {
    color: var(--bcl-ink);
    background: var(--bcl-paper);
  }
  .theme-brancalonia .custom-dnd5e .header,
  .theme-brancalonia .custom-dnd5e .section,
  .theme-brancalonia .custom-dnd5e .panel {
    background: var(--bcl-paper-weak);
    border: 1px solid var(--bcl-border);
    box-shadow: var(--bcl-shadow-1);
    border-radius: var(--bcl-radius-md);
  }
  /* Liste e tabelle di configurazione */
  .theme-brancalonia .custom-dnd5e .config-list,
  .theme-brancalonia .custom-dnd5e table {
    background: var(--bcl-paper);
    border: 1px solid var(--bcl-divider);
  }
  .theme-brancalonia .custom-dnd5e table th,
  .theme-brancalonia .custom-dnd5e table td {
    padding: .5rem .75rem;
    border-bottom: 1px solid var(--bcl-divider);
  }
  /* Input e controlli */
  .theme-brancalonia .custom-dnd5e input[type="text"],
  .theme-brancalonia .custom-dnd5e select,
  .theme-brancalonia .custom-dnd5e input[type="number"] {
    background: var(--bcl-paper);
    border: 1px solid var(--bcl-border);
    border-radius: var(--bcl-radius-sm);
  }
  .theme-brancalonia .custom-dnd5e .form-footer .button,
  .theme-brancalonia .custom-dnd5e .actions .button {
    background: var(--bcl-gold);
    color: var(--bcl-ink-strong);
    border: 1px solid var(--bcl-ink-strong);
  }
  .theme-brancalonia .custom-dnd5e .form-footer .button:hover,
  .theme-brancalonia .custom-dnd5e .actions .button:hover {
    background: var(--bcl-accent);
    color: var(--bcl-paper);
    border-color: var(--bcl-ink-strong);
  }
  /* Focus e validazione */
  .theme-brancalonia .custom-dnd5e :focus { outline: 2px solid var(--bcl-focus); outline-offset: 2px; }
  .theme-brancalonia .custom-dnd5e .is-invalid { border-color: var(--bcl-danger); }
}
```

**Dark mode**
- Eredita dai token; non creare palette dedicate.

**Comportamento UI**
- Sezioni “Gameplay” e “Configurations”: niente scrollbar custom aggressive; mantenere spaziatura coerente con crlngn-ui; bottoni con focus visibile e hover chiaro.
- Tabelle: righe pari/dispari leggibili; nessun collapse di colonne su zoom 90–125%.
- Dialog di conferma/salvataggio: bottoni primario/secondario skinnati con `--bcl-accent`/`--bcl-gold`.

**Performance**
- Evitare filtri/blur; usare `box-shadow` dei token; nessuna immagine di sfondo nelle liste.

[CSP & SECURITY HARDENING]
Problemi riscontrati: violazioni CSP per `unsafe-eval` e blocco script `blob:`.
Regole vincolanti:
- **Vietato** usare `eval`, `new Function()`, `setTimeout(string)`, compilazioni runtime di template o qualsiasi tecnica che richieda `unsafe-eval`.
- **Niente script da `blob:`/`data:`**: tutti i moduli/worker devono essere file ESM serviti da `self`.
- **Precompila** i template (Handlebars/HTML) in build-time; a runtime usa solo funzioni già importate.
- **Worker ESM**: `new Worker(new URL("./worker.js", import.meta.url), { type: "module" })` (il file deve esistere su disco).
- **Dynamic import** ammesso solo verso URL `self` (no URL creati via `URL.createObjectURL`).
- **JQuery-free nei hook HTML**: dove Foundry passa un `HTMLElement` (es. `renderChatMessageHTML`) non convertire mai in jQuery e non usare API jQuery legacy che creano wrapper dinamici.
- **No `URL.createObjectURL` per loader JS**: vietato creare script blob per dynamic import; utilizzare sempre path ESM relativi al modulo.

Esempi sicuri:
```js
// ❌ NO: genera unsafe-eval
const fn = new Function("a", "b", "return a+b");

// ✅ Sì: funzione definita staticamente
function sum(a,b){ return a+b }

// ❌ NO: compilazione runtime di template
const tpl = Handlebars.compile(source);

// ✅ Sì: template precompilato ed esportato come funzione ESM
import tplCompiled from "./templates/item-tooltip.compiled.js";
const html = tplCompiled(data);
```

[MIGRAZIONE API v13+ / v15 READY]
Sostituzioni obbligatorie per evitare warning/deprecation e future rotture:
- `SceneNavigation` → `foundry.applications.ui.SceneNavigation`
- `Token` → `foundry.canvas.placeables.Token`
- `ClientSettings` → `foundry.helpers.ClientSettings`
- `WallsLayer` → `foundry.canvas.layers.WallsLayer`
- `ControlsLayer` → `foundry.canvas.layers.ControlsLayer`
- `Canvas` → `foundry.canvas.Canvas`
- `CardsConfig` → `foundry.applications.sheets.CardDeckConfig`
- `loadTemplates` → `foundry.applications.handlebars.loadTemplates`
- `renderTemplate` → `foundry.applications.handlebars.renderTemplate`
- **Chat hook**: `renderChatMessage` (deprecato) → `renderChatMessageHTML`
- **Application v1** → **ApplicationV2** (`foundry.applications.api.ApplicationV2`)
- **ActorSheetMixin** (dnd5e) → integrato in `BaseActorSheet` (rimuovere il mixin)
- `JournalPageSheet` → `foundry.appv1.sheets.JournalPageSheet` (deprecazione) → **evita dipendenze dirette** nei patch del tema.
- `Application` (V1) → migrare finestre custom a `ApplicationV2` e rimuovere costrutti V1 (override di `_render`, `_callHooks` ecc.).

Snippet di riferimento:
```js
// Caricamento template
await foundry.applications.handlebars.loadTemplates(["modules/.../my-partial.hbs"]);
const html = await foundry.applications.handlebars.renderTemplate("modules/.../my.hbs", data);

// Hook chat (v13+)
Hooks.on("renderChatMessageHTML", (message, html, data) => {
  // ...
});

// ApplicationV2
import { ApplicationV2 } from "foundry/applications/api.js";
class BrancaDialog extends ApplicationV2 { /* ... */ }
```

- **Dice So Nice integration**: usa solo l'hook \`diceSoNiceReady\`; non importare DSN o \`three\` nel bundle; textures servite da path locali (no \`data:\`/\`blob:\`).
- **Dedupe Three.js**: non bundlare una seconda copia. Segna `three` come `external` e usa solo l’istanza core di Foundry.
- **ESM puro**: niente UMD/IIFE che richiedano eval. Build in output ESM.
- **No inline script** dentro HTML generato; usa listeners JS separati.
- **Sourcemap** solo `sourceMappingURL` file-based (no `data:` URI).

[HOOKS & LIBWRAPPER HARDENING]
- **Guardie sui hook**: alcuni moduli restituiscono valori non iterabili in `getSceneControlButtons`.
  ```js
  Hooks.on("getSceneControlButtons", (controls) => {
    if (!Array.isArray(controls)) return controls; // guardia
    // ...
  });
  ```
- **wrap condizionale** (libWrapper):
  ```js
  const target = foundry?.canvas?.Canvas?.prototype?._onDragLeftCancel;
  if (target) libWrapper.register(MODULE_ID, "Canvas.prototype._onDragLeftCancel", myWrap, "WRAP");
  ```
// Safe wrap per metodi Canvas non presenti su v13
const CanvasProto = foundry?.canvas?.Canvas?.prototype;
if (CanvasProto && CanvasProto._onDragLeftCancel) {
  libWrapper.register(MODULE_ID, 'Canvas.prototype._onDragLeftCancel', myWrap, 'WRAP');
}
- **Compat disabilitata per moduli rotti**: se un modulo terzo provoca errori bloccanti su v13 (es. `power-select-toolkit`), prevedi feature flag per disattivare interazioni non essenziali e loggare una nota nel README.

[CHECK DI INTEGRITÀ STRUTTURALE]
- Le tabs cambiano correttamente con `data-group`/`data-tab`.
- Le liste inventario/feature permettono `create/edit/delete` via `.item-controls` e `[data-action]`.
- Le classi `.rollable` restano presenti e producono chat cards funzionanti.
- Le chat cards mostrano header/contenuto/bottoni/footer senza overflow.
- Le rolltable mostrano righe `.result` e i bottoni eseguono i roll.
- Nessun selettore globale del tema rompe `.sidebar-tab`, `.window-app` o `.directory-list`.

 [TEST PLAN (CHECKLIST)]
 Visual:
 - Nessun testo tagliato o sovrapposto.
 - Stato hover/focus/active visibile su link, tabs, pulsanti.
 - Card compendi e chat leggibili su paper/surface; contrasto AA.
 Funzionale:
 - Dice So Nice: i tiri 3D mostrano il colorset "Brancalonia — Gold & Wax" (body oro, pips/edge inchiostro) senza errori.
 - Dice So Nice: disattivando il modulo i tiri funzionano con renderer standard e il tema non lascia side-effect.
 - Actor/Item/Spell: tutte le tab si aprono, liste scrollano, i pulsanti agiscono.
 - Rolltable: strutture visibili (no “vuoto”), draw dialog leggibile e funzionante.
 - Token/Combat HUD: pulsanti cliccabili, icone allineate, selezioni chiare.
 - Tabs navigate tramite \/nav.sheet-tabs\/ e \/div.tab\/ con data-group/data-tab.
 - Inventario/feature: i pulsanti in .item-controls con data-action funzionano (create/edit/delete).
 - Chat cards: sono generate da elementi .rollable e i bottoni con data-action rispondono.
 - Rolltable: esistono elementi .result in .results e i bottoni con data-document-id agiscono.
 - Orcnog Card Viewer: apertura viewer, zoom/pan/flip, navigazione tra carte e chiusura funzionano senza artefatti.
 - Orcnog Card Viewer: selezione/hover delle carte visibile e coerente (outline dorato), nessun jitter nello zoom.
 - Custom D&D 5e: finestra Gameplay si apre e tutte le opzioni sono leggibili, con tooltip funzionanti.
 - Custom D&D 5e: finestre Configurations (Abilities, Skills, Tools, Damage/Consumable Types, Item Properties, Spell Schools, Actor Sizes, Armor Calculations, Counters) consentono create/edit/delete senza shift di layout.
 - Custom D&D 5e: salvataggi persistono e la UI conferma senza errori in console.
 Compatibilità:
 - Dice So Nice: nessun warning "Multiple instances of Three.js being imported" con il tema attivo; nessuna collisione di z-index con dialog/sheet.
 - dnd5e 5.1.9: nessuna rottura di layout core.
 - crlngn-ui: pattern di spacing/tipografia coerenti; niente override anti-pattern.
 - Theme Engine Carolingiano: export/import temi NON rompe i token (`--branca-*`).
 - Modalità scura/chiara: switch data-theme applica i token corretti senza layout shift.
 - Compendium Editor: finestre/dialog funzionano e restano leggibili.
 - Orcnog Card Viewer: nessuna collisione di z-index con Dialog/Sheet; nessun override di trasformazioni.
 - Custom D&D 5e: stile coerente su v12 (modulo 1.5.x) e v13 (modulo 2.x); nessuna rottura di z-index o conflitti con dnd5e 5.1.9.
 Performance:
 - CSS snello; nessuna animazione pesante; niente immagini 4K per elementi UI.
 A11y:
 - Focus outline visibile; ratio colori validato (AA) per testo e bottoni principali.

- Dice So Nice attivo: zero violazioni CSP imputabili al tema; textures caricate da `self`, nessun 'blob:' o 'data:' inline.
- Nessun errore CSP: zero violazioni 'unsafe-eval' e zero blocchi script 'blob:' in console.
- Nessun warning di deprecazione per: SceneNavigation/Token/ClientSettings/WallsLayer/ControlsLayer/Canvas/CardsConfig.
- Chat: nessun uso di 'renderChatMessage' (solo 'renderChatMessageHTML').
- Nessun uso di Application v1; solo ApplicationV2.
- Dedupe Three.js: nessun warning "Multiple instances of Three.js being imported".
- Hook getSceneControlButtons non genera errori anche con moduli terzi attivi.

[DOC & GIT HYGIENE]
- Aggiorna CHANGELOG e README tecnico: elenco file toccati, motivazioni, screenshot “prima/dopo”.
- Nessuna percentuale “a sensazione”: descrivi fix e impatti in termini tecnici (componenti, selettori, variabili).
- Commit atomici e messaggi convenzionali (feat:, fix:, refactor:, docs:).
- Non rimuovere funzioni; se devi disattivarne una, mettila dietro flag CSS (classe) e documenta.

[DELIVERABLES]
1) Patch/diff dei CSS rifattorizzati + nuovo `tokens.css`.
2) Lista dei token con valori correnti estratti (tabella nel README).
3) 6 screenshot comparativi (Actor, Item, Spells, Compendio, Rolltable, Chat/HUD) a 1920×1080.
4) Checklist test barrata con eventuali note di edge case.

[GUARDRAILS]
- Se un conflitto oppone “estetica attuale” vs “coerenza con il modulo di riferimento”, privilegia **coerenza**, ma preserva i colori via token.
- Evita side-effects globali: nessun selettore generico su body/html senza scope `.theme-brancalonia`.
- Mai degradare leggibilità per effetto “parchment”: se serve, alza l’ink o scurisci il paper leggermente (via token).

[OUTPUT]
- Fornisci: 
  (a) la tabella dei token con i valori che rilevi dal CSS attuale,
  (b) i file CSS aggiornati (in blocchi di codice ordinati per file),
  (c) una breve nota per ciascun componente su cosa è stato allineato a crlngn-ui.
[SORGENTI VISIVE DI RIFERIMENTO]
(Per la documentazione interna: moodboard e palette desunte da materiale ufficiale.)
- Copertine e illustrazioni Brancalonia su ArtStation (palette calde, inchiostri bruni, oro/brass, rosso ceralacca, verde smeraldo; cartigli e fregi): Fabio Porfidia, Lorenzo Nuti, ecc.
- Anteprime di impaginato (pagine su carta pergamena con capolettera, cornici sottili e nastri) dai rivenditori ufficiali e pagine prodotto.
- Kickstarter/Acheron: iconografia e logotipo con cartiglio dorato, uso di mappe seppia e bussola stilizzata.
**Nota**: le referenze sono d'ispirazione visiva; i colori finali vanno estratti dal tema esistente e mappati nei token `--bcl-*`.