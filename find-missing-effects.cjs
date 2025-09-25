/**
 * Identifica TUTTI gli items che mancano di Active Effects
 */

const fs = require('fs');
const path = require('path');

// Items con meccaniche identificate nell'analisi
const ITEMS_WITH_MECHANICS = {
  talenti: [
    'attaccabrighe001', 'fortunadelbifolco001', 'linguasciolta001',
    'maestrodistrada001', 'occhiopergliaffari001', 'portafortuna001',
    'specialistadellearmiimprovvisate001', 'talent_anima_contadina',
    'talent_antica_arte_culinaria', 'talent_compagno_selva',
    'talent_figlio_pantagruele', 'talent_figlio_stelle_stalle',
    'talent_legno_stagionato', 'talent_nostalgia_malebolge',
    'talent_oltremodo_dotato', 'talent_sangue_vilupera',
    'talent_scaglianza', 'talent_scudanza', 'talent_speziale',
    'talent_supercazzola', 'veteranodellecampagne001'
  ],
  features: [
    'arlecchino_batocchio', 'arlecchino_competenze', 'arlecchino_difesa_senza_armatura',
    'arlecchino_silenzio', 'benandante_guardiano', 'benandanti_protection',
    'brigante_arte_imboscata', 'brigante_brigantaggio', 'burattinaio_marionetta_compagna',
    'burattinaio_mossa_classe', 'burattinaio_teatro_fandonia', 'cavaliere_errante_ispirare',
    'cavaliere_errante_proteggere', 'frate_porgi_altra_guancia', 'frate_tecnica_mano',
    'guiscardo_cercatore', 'guiscardo_esperto_oggetti', 'knave_cunning_action',
    'knave_elusive', 'knave_reliable_talent', 'knave_slippery_mind',
    'knave_uncanny_dodge', 'malebranche_maleali', 'malebranche_malefiamme',
    'malebranche_malegambe', 'malebranche_malemani', 'malebranche_malerecchie',
    'malebranche_privilegio_rissa', 'marionetta_costrutto_fanfaluco',
    'marionetta_magico_legno', 'mattatore_maestro_esibizione', 'mattatore_occhio',
    'menagramo_iattura', 'menagramo_tocco', 'miracolaro_per_tutti_i_santi',
    'miracolaro_recitare_calendario', 'miracolaro_tirare_giu_i_santi',
    'morgante_privilegio_rissa', 'morgante_robusto', 'morgante_stomaco',
    'pagano_barbaro_coraggio', 'pagano_ira_irrefrenabile', 'scaramante_protetto_fato',
    'scaramante_rituale', 'selvatico_istinto_primordiale', 'spadaccino_scuola',
    'straccione_extra_attack', 'straccione_hardy', 'straccione_improvised_master',
    'straccione_king_of_beggars', 'straccione_scrounger', 'straccione_street_evasion',
    'straccione_supreme_survivor', 'straccione_survivor', 'umano_privilegio_versatilita'
  ],
  equipaggiamento: [
    'amuletodisanpancrazio001', 'archibugiomalfunzionante001',
    'armaturadecuoiorappezzata001', 'armaturadipezze001', 'bombardatascabile001',
    'borsadelvinoacido001', 'daditruccati001', 'elmoconlecornefinto001',
    'forchettonedaguerra001', 'lanternafumosa001', 'librodipreghieremacchiate001',
    'mantelllorattoppato001', 'mappasbagliata001', 'moschettoarrugginito001',
    'paneraffermo001', 'pistolascadente001', 'pozionedicoraggiolliquido001',
    'scudosfondato001', 'spadaccioarrugginito001', 'stivalibucati001',
    'trombonedaguerra001'
  ]
};

// Analizza ogni compendio
const compendi = {
  talenti: 'talenti',
  features: 'brancalonia-features',
  equipaggiamento: 'equipaggiamento'
};

console.log('🔍 RICERCA ITEMS MANCANTI DI ACTIVE EFFECTS\n');
console.log('=' .repeat(60));

const missingItems = {
  talenti: [],
  features: [],
  equipaggiamento: []
};

for (const [key, packName] of Object.entries(compendi)) {
  const sourcePath = path.join('./packs', packName, '_source');

  if (!fs.existsSync(sourcePath)) continue;

  const files = fs.readdirSync(sourcePath).filter(f => f.endsWith('.json'));
  const allIds = [];

  // Raccogli tutti gli ID
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(sourcePath, file), 'utf-8'));
      allIds.push({
        id: data._id,
        name: data.name,
        file: file
      });
    } catch (e) {
      // skip
    }
  }

  // Trova quelli mancanti
  for (const item of allIds) {
    if (!ITEMS_WITH_MECHANICS[key].includes(item.id)) {
      missingItems[key].push(item);
    }
  }
}

// Report dettagliato
for (const [pack, items] of Object.entries(missingItems)) {
  if (items.length === 0) continue;

  console.log(`\n📦 ${pack.toUpperCase()} - ${items.length} items mancanti`);
  console.log('-'.repeat(60));

  for (const item of items) {
    console.log(`• ${item.id}: ${item.name}`);
    console.log(`  File: ${item.file}`);

    // Leggi descrizione per capire se serve effect
    try {
      const sourcePath = path.join('./packs', compendi[pack], '_source', item.file);
      const data = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
      const desc = data.system?.description?.value || '';

      // Cerca indicatori di meccaniche
      const keywords = ['bonus', 'vantaggio', 'competenza', 'resistenza', 'immune',
                       '+1', '+2', 'aumenta', 'velocità', 'punti ferita'];

      const found = keywords.filter(k => desc.toLowerCase().includes(k));
      if (found.length > 0) {
        console.log(`  ⚠️  Possibili meccaniche: ${found.join(', ')}`);
      } else {
        console.log(`  ✓ Nessuna meccanica evidente`);
      }
    } catch (e) {
      console.log(`  ❌ Errore lettura: ${e.message}`);
    }
  }
}

// Statistiche finali
const totalMissing = Object.values(missingItems).reduce((sum, items) => sum + items.length, 0);
console.log('\n' + '=' .repeat(60));
console.log(`\n📊 TOTALE: ${totalMissing} items da verificare`);

// Mostra anche quelli con meccaniche per confronto
console.log('\n📋 Items CON meccaniche già mappate:');
for (const [pack, ids] of Object.entries(ITEMS_WITH_MECHANICS)) {
  console.log(`${pack}: ${ids.length} items`);
}