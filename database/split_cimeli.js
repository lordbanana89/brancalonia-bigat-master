const fs = require('fs');
const path = require('path');

// Leggi il file agglomerato
const data = JSON.parse(fs.readFileSync('./equipaggiamento/cimeli/TUTTI_CIMELI.json', 'utf8'));

// Directory per i file singoli
const outputDir = './equipaggiamento/cimeli';

// Funzione per creare nome file sicuro
function sanitizeFilename(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
}

// Crea file individuali per ogni cimelo
data.cimeli.forEach(cimelo => {
    const numero = String(cimelo.numero).padStart(3, '0');
    const nomeFile = sanitizeFilename(cimelo.nome);
    const filename = `${numero}_${nomeFile}.json`;
    const filepath = path.join(outputDir, filename);

    // Struttura del file individuale
    const cimeloIndividuale = {
        id: numero,
        nome: cimelo.nome,
        categoria: "Cimelo",
        fonte: "Brancalonia Manuale Base",
        descrizione: cimelo.descrizione,
        proprieta: cimelo.proprieta,
        maledizione: cimelo.maledizione || null,
        effetto_speciale: cimelo.effetto_speciale || null,
        meccanica: cimelo.meccanica || null,
        valore: cimelo.valore,
        storia: cimelo.storia,
        note: cimelo.note || null,
        utilizzo: cimelo.utilizzo || null,
        attivazione: cimelo.attivazione || null,
        limite: cimelo.limite || null,
        prezzo: cimelo.prezzo || null,
        implementazione: {
            tipo: determinaTipo(cimelo),
            attivo: determinaSeAttivo(cimelo),
            active_effects: []
        }
    };

    // Rimuovi campi null
    Object.keys(cimeloIndividuale).forEach(key => {
        if (cimeloIndividuale[key] === null) {
            delete cimeloIndividuale[key];
        }
    });

    // Scrivi il file
    fs.writeFileSync(filepath, JSON.stringify(cimeloIndividuale, null, 2));
    console.log(`Creato: ${filename}`);
});

// Funzioni helper
function determinaTipo(cimelo) {
    if (cimelo.proprieta?.includes('vantaggio') || cimelo.proprieta?.includes('+')) {
        return 'magico_minore';
    }
    if (cimelo.maledizione) {
        return 'maledetto';
    }
    return 'narrativo';
}

function determinaSeAttivo(cimelo) {
    return cimelo.meccanica || cimelo.proprieta?.includes('TS') || cimelo.proprieta?.includes('CD');
}

console.log('\n✅ Completata divisione in file individuali');
console.log('⚠️  Ricorda di eliminare TUTTI_CIMELI.json dopo la verifica');