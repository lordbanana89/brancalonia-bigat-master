/**
 * Rimuove _id dagli effects arrays
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'packs/brancalonia-features/_source/knave-uncanny-dodge.json',
  'packs/brancalonia-features/_source/straccione-hardy.json',
  'packs/brancalonia-features/_source/straccione-unarmored-defense.json',
  'packs/emeriticenze/_source/emeriticenza_affinamento.json',
  'packs/emeriticenze/_source/emeriticenza_arma_preferita.json',
  'packs/emeriticenze/_source/emeriticenza_assoluta.json',
  'packs/emeriticenze/_source/emeriticenza_energumeno.json',
  'packs/emeriticenze/_source/emeriticenza_fandonia_migliorata.json',
  'packs/emeriticenze/_source/emeriticenza_gioco_squadra.json',
  'packs/emeriticenze/_source/emeriticenza_indomito.json',
  'packs/emeriticenze/_source/emeriticenza_rissaiolo_professionista.json',
  'packs/emeriticenze/_source/emeriticenza_santa_fortuna.json',
  'packs/razze/_source/malebranche.json',
  'packs/razze/_source/marionetta.json',
  'packs/razze/_source/morgante.json'
];

console.log('🔧 Rimuovendo _id dagli effects...\n');

filesToFix.forEach(filePath => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (data.effects && Array.isArray(data.effects)) {
      data.effects = data.effects.map(effect => {
        const cleanEffect = { ...effect };
        delete cleanEffect._id;
        return cleanEffect;
      });

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      console.log(`✅ ${path.basename(filePath)}`);
    }
  } catch (e) {
    console.log(`❌ ${path.basename(filePath)}: ${e.message}`);
  }
});

console.log('\n✅ Completato!');