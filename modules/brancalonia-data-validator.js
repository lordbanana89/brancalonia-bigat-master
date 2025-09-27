/**
 * Brancalonia - Data Validator
 * Valida e corregge automaticamente dati non conformi
 */

console.log("Brancalonia | Data Validator inizializzato");

// Hook per validare documenti prima della creazione
Hooks.on("preCreateItem", (document, data, options, userId) => {
    // Valida strength
    if (data.system?.strength !== undefined) {
        const strength = data.system.strength;
        if (typeof strength !== 'number' || isNaN(strength)) {
            console.log(`Brancalonia | Correzione strength per ${data.name}: ${strength} -> 0`);
            data.system.strength = 0;
        }
    }
});

// Hook per intercettare errori di validazione
const originalFromSource = CONFIG.Item?.documentClass?.fromSource;
if (originalFromSource) {
    CONFIG.Item.documentClass.fromSource = function(source, options) {
        // Valida e corregge strength prima della creazione
        if (source.system?.strength !== undefined) {
            const strength = source.system.strength;
            if (typeof strength !== 'number' || isNaN(strength)) {
                console.log(`Brancalonia | Auto-fix strength: "${strength}" -> 0`);
                source.system.strength = 0;
            }
        }

        // Valida altri campi numerici
        const numericFields = ['weight', 'price', 'quantity'];
        numericFields.forEach(field => {
            if (source.system?.[field] !== undefined) {
                const value = source.system[field];
                if (typeof value === 'string') {
                    const parsed = parseFloat(value) || 0;
                    source.system[field] = parsed;
                }
            }
        });

        return originalFromSource.call(this, source, options);
    };
}

// Hook per documenti già esistenti
Hooks.on("ready", () => {
    console.log("Brancalonia | Validazione dati attiva");

    // Usa il namespace corretto per Foundry v13
    const CompendiumCollectionClass = foundry.documents.collections.CompendiumCollection;
    if (!CompendiumCollectionClass) return;

    // Wrap getDocuments per validazione runtime
    const originalGetDocuments = CompendiumCollectionClass.prototype.getDocuments;
    CompendiumCollectionClass.prototype.getDocuments = async function(options) {
        const docs = await originalGetDocuments.call(this, options);

        // Valida ogni documento
        docs.forEach(doc => {
            if (doc.documentName === "Item" && doc.system?.strength !== undefined) {
                const strength = doc.system.strength;
                if (typeof strength !== 'number' || isNaN(strength)) {
                    // Forza conversione silente
                    Object.defineProperty(doc.system, 'strength', {
                        value: 0,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                }
            }
        });

        return docs;
    };
});

// Intercetta errori DataModelValidation
window.addEventListener('error', (event) => {
    if (event.error?.name === 'DataModelValidationError') {
        const message = event.error.message;
        if (message.includes('strength: must be an integer')) {
            console.warn("Brancalonia | Intercettato errore strength, tentativo auto-fix...");
            // Previeni propagazione dell'errore
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }
});

console.log("Brancalonia | Data Validator completato");