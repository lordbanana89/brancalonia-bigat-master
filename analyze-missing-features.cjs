/**
 * Analizza i 23 privilegi mancanti per identificare meccaniche nascoste
 */

const fs = require('fs');
const path = require('path');

// Lista dei 23 privilegi mancanti (dal find-missing-effects.cjs)
const missingFeatures = [
  'benandante_guardare_oltre_il_velo',
  'benandante_incantesimi_circolo',
  'cavaliere_errante_oath_spells',
  'dotato_influsso_magico',
  'dotato_privilegio_rissa',
  'dotato_risonanza_magica',
  'guiscardo_chincaglieria',
  'guiscardo_maestria',
  'knave-evasion',
  'knave-stroke-of-luck',
  'knave-thieves-cant',
  'malebranche_malavoce',
  'marionetta_aggiustarsi',
  'marionetta_privilegio_rissa',
  'menagramo_lista_incantesimi',
  'miracolaro_domain_spells',
  'morgante_gigantesco',
  'pagano_umano',
  'selvatico_istinto_bestiale',
  'straccione_rugged',
  'straccione_street_resilience',
  'straccione_tough_resolve',
  'straccione_unarmored_defense'
];

// Ulteriori features da controllare
const additionalFeatures = [
  'straccione-hardy',
  'straccione-survivor',
  'straccione-supreme-survivor',
  'straccione-beggars-fortune',
  'pagano_barbaro_coraggio'
];

const sourcePath = path.join('./packs/brancalonia-features/_source');
const featuresWithMechanics = [];

console.log('🔍 ANALISI PRIVILEGI MANCANTI\n');
console.log('=' .repeat(60));

// Cerca i file corrispondenti
for (const featureId of [...missingFeatures, ...additionalFeatures]) {
  // Prova vari formati di nome file
  const possibleFiles = [
    `${featureId}.json`,
    `${featureId.replace(/_/g, '-')}.json`,
    `${featureId.replace(/-/g, '_')}.json`
  ];

  let found = false;
  for (const fileName of possibleFiles) {
    const filePath = path.join(sourcePath, fileName);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const desc = data.system?.description?.value || '';

        // Analisi approfondita delle meccaniche
        const mechanics = [];

        // Bonus numerici
        if (desc.match(/\+\d+|aumenta di \d+|-\d+/i)) {
          mechanics.push('bonus numerico');
        }

        // CA
        if (desc.match(/CA|classe armatura|10 \+/i)) {
          mechanics.push('modifica CA');
        }

        // Vantaggio/Svantaggio
        if (desc.match(/vantaggio|svantaggio/i)) {
          mechanics.push('vantaggio/svantaggio');
        }

        // Resistenze/Immunità
        if (desc.match(/resistenza|immune|immunità/i)) {
          mechanics.push('resistenza/immunità');
        }

        // PF
        if (desc.match(/punti ferita|PF|dadi vita|d\d+ extra/i)) {
          mechanics.push('modifica PF');
        }

        // Velocità
        if (desc.match(/velocità|movimento/i)) {
          mechanics.push('modifica velocità');
        }

        // Competenze
        if (desc.match(/competenz[ae]/i)) {
          mechanics.push('competenze');
        }

        // Capacità trasporto
        if (desc.match(/capacità di trasporto|taglia più grande/i)) {
          mechanics.push('capacità trasporto');
        }

        // Tiri salvezza
        if (desc.match(/tiri? salvezza|TS/i)) {
          mechanics.push('tiri salvezza');
        }

        if (mechanics.length > 0) {
          featuresWithMechanics.push({
            id: data._id,
            name: data.name,
            file: fileName,
            mechanics: mechanics,
            description: desc.substring(0, 150)
          });
          console.log(`\n✅ ${data.name} (${data._id})`);
          console.log(`   Meccaniche: ${mechanics.join(', ')}`);
          console.log(`   File: ${fileName}`);
        } else {
          console.log(`\n⚪ ${data.name} (${data._id})`);
          console.log(`   Nessuna meccanica evidente (probabilmente narrativo)`);
          console.log(`   File: ${fileName}`);
        }

        found = true;
        break;
      } catch (e) {
        // skip
      }
    }
  }

  if (!found) {
    console.log(`\n❌ ${featureId}: FILE NON TROVATO`);
  }
}

// Report finale
console.log('\n' + '=' .repeat(60));
console.log('\n📊 RIEPILOGO:');
console.log(`   Privilegi con meccaniche: ${featuresWithMechanics.length}`);
console.log(`   Privilegi narrativi: ${missingFeatures.length + additionalFeatures.length - featuresWithMechanics.length}`);

if (featuresWithMechanics.length > 0) {
  console.log('\n📝 PRIVILEGI DA IMPLEMENTARE:');
  for (const feat of featuresWithMechanics) {
    console.log(`\n'${feat.id}': [{`);
    console.log(`  label: '${feat.name}',`);
    console.log(`  icon: 'icons/svg/aura.svg',`);
    console.log(`  changes: [`);
    console.log(`    // ${feat.mechanics.join(', ')}`);
    console.log(`    // TODO: Implementare effetti`);
    console.log(`  ],`);
    console.log(`  transfer: true`);
    console.log(`}],`);
  }
}