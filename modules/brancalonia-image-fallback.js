/**
 * Brancalonia - Image Fallback System
 * Gestisce immagini mancanti e fornisce fallback appropriati
 */

console.log("Brancalonia | Image Fallback System inizializzato");

// Mappa immagini mancanti a fallback appropriati
const IMAGE_FALLBACKS = {
    'icons/equipment/chest/breastplate-metal-copper.webp': 'icons/svg/shield.svg',
    'breastplate-metal-copper.webp': 'icons/svg/shield.svg'
};

// Fallback generici per categoria - usa solo SVG che esistono sempre
const CATEGORY_FALLBACKS = {
    'chest': 'icons/svg/shield.svg',
    'armor': 'icons/svg/shield.svg',
    'weapon': 'icons/svg/sword.svg',
    'shield': 'icons/svg/shield.svg',
    'clothing': 'icons/svg/item-bag.svg',
    'equipment': 'icons/svg/item-bag.svg',
    'default': 'icons/svg/item-bag.svg'
};

// Intercetta errori di caricamento immagini
function setupImageErrorHandling() {
    // Usa il namespace corretto per Foundry v13
    const TextEditorClass = foundry.applications.ux?.TextEditor?.implementation || TextEditor;

    // Override del metodo enrichHTML per sostituire immagini mancanti
    const originalEnrichHTML = TextEditorClass.enrichHTML;
    TextEditorClass.enrichHTML = function(content, options = {}) {
        // Sostituisci riferimenti a immagini mancanti nel contenuto
        if (content && typeof content === 'string') {
            content = content.replace(/breastplate-metal-copper\.webp/g, 'shield.svg');
            content = content.replace(/breastplate-steel\.webp/g, 'shield.svg');
        }
        return originalEnrichHTML.call(this, content, options);
    };

    // Gestisci errori di caricamento immagini nel DOM
    document.addEventListener('error', function(event) {
        const target = event.target;
        if (target.tagName === 'IMG') {
            const src = target.src;

            // Controlla se è un'immagine nota mancante
            const filename = src.split('/').pop();
            if (filename === 'breastplate-metal-copper.webp' ||
                filename === 'breastplate-steel.webp' ||
                src.includes('breastplate-metal-copper.webp') ||
                src.includes('breastplate-steel.webp')) {

                console.log(`Brancalonia | Sostituisco immagine mancante: ${filename}`);
                target.src = 'icons/svg/shield.svg';
                target.onerror = null; // Previeni loop infiniti
                event.preventDefault();
                event.stopPropagation();
            }
            // Gestisci altre immagini di equipaggiamento mancanti
            else if (src.includes('/equipment/') || src.includes('/icons/')) {
                const category = detectImageCategory(src);
                const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default;

                console.log(`Brancalonia | Immagine mancante, uso fallback: ${fallback}`);
                target.src = fallback;
                target.onerror = null;
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }, true);
}

// Rileva categoria immagine dal percorso
function detectImageCategory(path) {
    if (path.includes('/chest/') || path.includes('armor') || path.includes('armatura')) return 'chest';
    if (path.includes('/shield/') || path.includes('scudo')) return 'shield';
    if (path.includes('/weapon/') || path.includes('sword') || path.includes('spada')) return 'weapon';
    if (path.includes('/clothing/') || path.includes('abito') || path.includes('cloth')) return 'clothing';
    return 'equipment';
}

// Hook per modificare dati degli item prima del rendering
Hooks.on("preCreateItem", (document, data, options, userId) => {
    if (data.img?.includes('breastplate-metal-copper.webp')) {
        console.log(`Brancalonia | Correggo immagine in creazione item: ${data.name}`);
        data.img = 'icons/equipment/chest/breastplate-steel.webp';
    }
});

Hooks.on("preUpdateItem", (document, changes, options, userId) => {
    if (changes.img?.includes('breastplate-metal-copper.webp')) {
        console.log(`Brancalonia | Correggo immagine in update item: ${document.name}`);
        changes.img = 'icons/equipment/chest/breastplate-steel.webp';
    }
});

// Hook per chat messages (v13 compatible)
Hooks.on("renderChatMessageHTML", (message, html) => {
    // Sostituisci immagini mancanti nei messaggi chat
    // html è ora un HTMLElement invece di jQuery
    const images = html.querySelectorAll('img');
    images.forEach(img => {
        if (img.src.includes('breastplate-metal-copper.webp') || img.src.includes('breastplate-steel.webp')) {
            img.src = 'icons/svg/shield.svg';
            img.onerror = null;
        }
    });
});

// Hook per actor sheets
Hooks.on("renderActorSheet", (app, html, data) => {
    // Sostituisci immagini mancanti nelle schede
    html.find('img').each((i, img) => {
        if (img.src.includes('breastplate-metal-copper.webp') || img.src.includes('breastplate-steel.webp')) {
            img.src = 'icons/svg/shield.svg';
            img.onerror = null;
        }
    });
});

// Hook per item sheets
Hooks.on("renderItemSheet", (app, html, data) => {
    // Sostituisci immagini mancanti nelle schede item
    html.find('img').each((i, img) => {
        if (img.src.includes('breastplate-metal-copper.webp') || img.src.includes('breastplate-steel.webp')) {
            img.src = 'icons/svg/shield.svg';
            img.onerror = null;
        }
    });
});

// Inizializza sistema al ready
Hooks.once("ready", () => {
    setupImageErrorHandling();

    // Correggi immagini già presenti nel DOM
    document.querySelectorAll('img').forEach(img => {
        if (img.src.includes('breastplate-metal-copper.webp') || img.src.includes('breastplate-steel.webp')) {
            img.src = 'icons/svg/shield.svg';
            img.onerror = null;
        }
    });

    console.log("Brancalonia | Image Fallback System pronto");
});

// Intercetta anche le richieste fetch per le immagini
const originalFetch = window.fetch;
window.fetch = function(url, ...args) {
    if (typeof url === 'string' && url.includes('breastplate-metal-copper.webp')) {
        console.log("Brancalonia | Intercettato fetch immagine mancante, redirigo");
        url = url.replace('breastplate-metal-copper.webp', 'breastplate-steel.webp');
    }
    return originalFetch.call(this, url, ...args);
};

console.log("Brancalonia | Image Fallback System completato");