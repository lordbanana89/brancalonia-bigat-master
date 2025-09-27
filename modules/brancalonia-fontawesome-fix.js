/**
 * Brancalonia - Fix completo per icone Font Awesome
 * Carica Font Awesome e assicura visibilità icone
 */

console.log("Brancalonia | Font Awesome fix inizializzato");

// Carica Font Awesome immediatamente
(() => {
  // Verifica se Font Awesome è già caricato
  const existingFA = document.querySelector('link[href*="font-awesome"]') ||
                     document.querySelector('link[href*="fontawesome"]');

  if (!existingFA) {
    console.log("Brancalonia | Carico Font Awesome 5...");

    // Font Awesome 5 (versione usata da Foundry v13)
    const fa5Link = document.createElement('link');
    fa5Link.rel = 'stylesheet';
    fa5Link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    fa5Link.crossOrigin = 'anonymous';
    document.head.appendChild(fa5Link);

    // Font Awesome 6 come fallback
    const fa6Link = document.createElement('link');
    fa6Link.rel = 'stylesheet';
    fa6Link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    fa6Link.crossOrigin = 'anonymous';
    document.head.appendChild(fa6Link);
  }
})();

// CSS critico per icone
const criticalCSS = `
  /* Font Awesome base setup */
  .fas, .far, .fab, .fa {
    font-family: 'Font Awesome 5 Free', 'Font Awesome 6 Free' !important;
    font-style: normal !important;
    font-variant: normal !important;
    text-rendering: auto !important;
    -webkit-font-smoothing: antialiased !important;
    display: inline-block !important;
  }

  .fas, .fa { font-weight: 900 !important; }
  .far { font-weight: 400 !important; }
  .fab { font-weight: 400 !important; }

  /* Fix per tutti i bottoni */
  button i[class*="fa-"],
  button .fas,
  button .far,
  button .fa,
  a.control i,
  .control-icon i,
  .item-control i,
  .dialog-button i {
    font-family: 'Font Awesome 5 Free', 'Font Awesome 6 Free' !important;
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: auto !important;
    height: auto !important;
  }

  /* Unicode mappings per icone comuni */
  i.fa-plus::before, i.fas.fa-plus::before { content: "\\f067" !important; }
  i.fa-minus::before, i.fas.fa-minus::before { content: "\\f068" !important; }
  i.fa-trash::before, i.fas.fa-trash::before { content: "\\f2ed" !important; }
  i.fa-trash-alt::before, i.fas.fa-trash-alt::before { content: "\\f2ed" !important; }
  i.fa-edit::before, i.fas.fa-edit::before { content: "\\f044" !important; }
  i.fa-pen::before, i.fas.fa-pen::before { content: "\\f304" !important; }
  i.fa-cog::before, i.fas.fa-cog::before { content: "\\f013" !important; }
  i.fa-cogs::before, i.fas.fa-cogs::before { content: "\\f085" !important; }
  i.fa-times::before, i.fas.fa-times::before { content: "\\f00d" !important; }
  i.fa-check::before, i.fas.fa-check::before { content: "\\f00c" !important; }
  i.fa-search::before, i.fas.fa-search::before { content: "\\f002" !important; }
  i.fa-dice::before, i.fas.fa-dice::before { content: "\\f522" !important; }
  i.fa-dice-d20::before, i.fas.fa-dice-d20::before { content: "\\f6cf" !important; }
  i.fa-dice-d6::before, i.fas.fa-dice-d6::before { content: "\\f6d1" !important; }
  i.fa-shield-alt::before, i.fas.fa-shield-alt::before { content: "\\f3ed" !important; }
  i.fa-heart::before, i.fas.fa-heart::before { content: "\\f004" !important; }
  i.fa-star::before, i.fas.fa-star::before { content: "\\f005" !important; }
  i.fa-user::before, i.fas.fa-user::before { content: "\\f007" !important; }
  i.fa-users::before, i.fas.fa-users::before { content: "\\f0c0" !important; }
  i.fa-book::before, i.fas.fa-book::before { content: "\\f02d" !important; }
  i.fa-bars::before, i.fas.fa-bars::before { content: "\\f0c9" !important; }
  i.fa-comment::before, i.fas.fa-comment::before { content: "\\f075" !important; }
  i.fa-comments::before, i.fas.fa-comments::before { content: "\\f086" !important; }
  i.fa-eye::before, i.fas.fa-eye::before { content: "\\f06e" !important; }
  i.fa-eye-slash::before, i.fas.fa-eye-slash::before { content: "\\f070" !important; }
  i.fa-lock::before, i.fas.fa-lock::before { content: "\\f023" !important; }
  i.fa-unlock::before, i.fas.fa-unlock::before { content: "\\f09c" !important; }
  i.fa-download::before, i.fas.fa-download::before { content: "\\f019" !important; }
  i.fa-upload::before, i.fas.fa-upload::before { content: "\\f093" !important; }
  i.fa-sync::before, i.fas.fa-sync::before { content: "\\f021" !important; }
  i.fa-sync-alt::before, i.fas.fa-sync-alt::before { content: "\\f2f1" !important; }
  i.fa-save::before, i.fas.fa-save::before { content: "\\f0c7" !important; }
  i.fa-file::before, i.fas.fa-file::before { content: "\\f15b" !important; }
  i.fa-folder::before, i.fas.fa-folder::before { content: "\\f07b" !important; }
  i.fa-folder-open::before, i.fas.fa-folder-open::before { content: "\\f07c" !important; }
  i.fa-angle-up::before, i.fas.fa-angle-up::before { content: "\\f106" !important; }
  i.fa-angle-down::before, i.fas.fa-angle-down::before { content: "\\f107" !important; }
  i.fa-angle-left::before, i.fas.fa-angle-left::before { content: "\\f104" !important; }
  i.fa-angle-right::before, i.fas.fa-angle-right::before { content: "\\f105" !important; }
  i.fa-chevron-up::before, i.fas.fa-chevron-up::before { content: "\\f077" !important; }
  i.fa-chevron-down::before, i.fas.fa-chevron-down::before { content: "\\f078" !important; }
  i.fa-chevron-left::before, i.fas.fa-chevron-left::before { content: "\\f053" !important; }
  i.fa-chevron-right::before, i.fas.fa-chevron-right::before { content: "\\f054" !important; }
  i.fa-arrow-up::before, i.fas.fa-arrow-up::before { content: "\\f062" !important; }
  i.fa-arrow-down::before, i.fas.fa-arrow-down::before { content: "\\f063" !important; }
  i.fa-arrow-left::before, i.fas.fa-arrow-left::before { content: "\\f060" !important; }
  i.fa-arrow-right::before, i.fas.fa-arrow-right::before { content: "\\f061" !important; }
  i.fa-play::before, i.fas.fa-play::before { content: "\\f04b" !important; }
  i.fa-pause::before, i.fas.fa-pause::before { content: "\\f04c" !important; }
  i.fa-stop::before, i.fas.fa-stop::before { content: "\\f04d" !important; }

  /* Icone Foundry specifiche */
  i.fa-fist-raised::before, i.fas.fa-fist-raised::before { content: "\\f6de" !important; }
  i.fa-hand-paper::before, i.fas.fa-hand-paper::before { content: "\\f256" !important; }
  i.fa-handshake::before, i.fas.fa-handshake::before { content: "\\f2b5" !important; }
  i.fa-home::before, i.fas.fa-home::before { content: "\\f015" !important; }
  i.fa-map::before, i.fas.fa-map::before { content: "\\f279" !important; }
  i.fa-compass::before, i.fas.fa-compass::before { content: "\\f14e" !important; }
  i.fa-crosshairs::before, i.fas.fa-crosshairs::before { content: "\\f05b" !important; }
  i.fa-ruler::before, i.fas.fa-ruler::before { content: "\\f545" !important; }

  /* Fix controlli Foundry */
  #controls .control-tool i,
  #controls .scene-control i,
  #navigation .control-tool i,
  #hotbar .macro i,
  .window-app button i {
    display: inline-block !important;
    font-family: 'Font Awesome 5 Free' !important;
    font-weight: 900 !important;
  }

  /* Fix character sheet */
  .dnd5e.sheet button i,
  .dnd5e.sheet .item-control i {
    display: inline-block !important;
    font-family: 'Font Awesome 5 Free' !important;
    margin-right: 3px;
  }
`;

// Inietta CSS immediatamente
const style = document.createElement('style');
style.id = 'brancalonia-fa-critical';
style.textContent = criticalCSS;
document.head.appendChild(style);

// Funzione per fixare icone mancanti
function fixMissingIcons() {
  const iconElements = document.querySelectorAll('i[class*="fa-"]');
  let fixed = 0;

  iconElements.forEach(el => {
    // Aggiungi fas se manca classe Font Awesome
    if (!el.classList.contains('fas') &&
        !el.classList.contains('far') &&
        !el.classList.contains('fab') &&
        !el.classList.contains('fa')) {
      el.classList.add('fas');
      fixed++;
    }

    // Assicura che l'elemento sia visibile
    if (el.style.display === 'none' || el.style.visibility === 'hidden') {
      el.style.display = 'inline-block';
      el.style.visibility = 'visible';
      fixed++;
    }
  });

  if (fixed > 0) {
    console.log(`Brancalonia | Fixate ${fixed} icone`);
  }
}

// Applica fix dopo che DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixMissingIcons);
} else {
  fixMissingIcons();
}

// Hook Foundry per applicare fix
Hooks.once("init", () => {
  console.log("Brancalonia | Font Awesome fix init");
  fixMissingIcons();
});

Hooks.once("ready", () => {
  console.log("Brancalonia | Font Awesome fix ready");

  // Fix iniziale
  setTimeout(fixMissingIcons, 500);

  // Fix periodico per elementi dinamici
  setInterval(fixMissingIcons, 3000);
});

// Fix per rendering dinamico
Hooks.on("renderActorSheet", () => setTimeout(fixMissingIcons, 100));
Hooks.on("renderItemSheet", () => setTimeout(fixMissingIcons, 100));
Hooks.on("renderDialog", () => setTimeout(fixMissingIcons, 100));
Hooks.on("renderSidebarTab", () => setTimeout(fixMissingIcons, 100));
Hooks.on("renderApplication", () => setTimeout(fixMissingIcons, 100));

console.log("Brancalonia | Font Awesome fix completato");