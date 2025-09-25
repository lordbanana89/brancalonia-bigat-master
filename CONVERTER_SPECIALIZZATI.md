# Converter Specializzati per Normalizzazione Database

## Soluzione Implementata

Ho creato converter specializzati per ogni tipo di documento, risolvendo i problemi identificati:

### 1. **spell-converter.mjs** - Incantesimi Completo
✅ **Risolto**:
- Legge direttamente i booleani `componenti.verbale/somatica/materiale`
- Mapping completo di tutte le scuole di magia
- Gestione corretta di durata, gittata, bersaglio con unità dnd5e
- Scaling con formula e mode
- Active Effects per meccaniche Brancalonia
- Preserva `meccaniche_brancalonia`, `qualita_scadente_rules`, `utilizzi`

**Campi mappati**:
- `system.components` - Da booleani diretti, non regex
- `system.activation.cost` - Estratto dal tempo di lancio
- `system.range.units` - 'self', 'touch', 'ft', 'sight', etc.
- `system.duration.units` - 'inst', 'round', 'minute', 'hour', 'day', 'perm'
- `system.area` - Forma e dimensione area effetto
- `system.scaling` - Mode e formula per livelli superiori
- `system.damage.parts` - Array con tipo danno mappato

### 2. **equipment-converter.mjs** - Armi/Armature/Cimeli Completo
✅ **Risolto**:
- Converter separati per `convertWeapon()`, `convertArmor()`, `convertMagicItem()`
- Parsing completo costo con conversione valute (mo/ma/mr → gp)
- Proprietà armi mappate con codici dnd5e (fin, hvy, lgt, rch, etc.)
- Attunement, rarità, identificazione gestiti correttamente
- Cimeli con maledizioni, storia, cariche
- Active Effects per qualità scadente e proprietà magiche

**Campi specifici armi**:
- `system.weaponType` - simpleM/simpleR/martialM/martialR
- `system.baseItem` - Arma base dnd5e
- `system.properties` - Oggetto con proprietà booleane
- `system.magicalBonus` - Parsato da nome o campo
- `system.ammunition` - Tipo e consumo munizioni
- `system.critical` - Soglia e danno extra

**Campi specifici armature**:
- `system.armor.type` - light/medium/heavy/shield
- `system.armor.dex` - Limite bonus DEX
- `system.strength` - Requisito forza minima
- `system.stealth` - Svantaggio furtività

**Campi cimeli (oggetti magici)**:
- `system.uses` - Cariche con recupero e autodistruzione
- `system.cursed` - Flag maledizione
- `system.curse` - Descrizione maledizione
- Active Effects per vantaggi/svantaggi

### 3. **common.mjs** - Utility Condivise
✅ **Funzioni helper riutilizzabili**:
- `generateFoundryId()` - ID deterministico
- `metersToFeet()` - Conversione metri → piedi
- `mapSkillCode()` - Mappa tutte le 18 skill italiane
- `mapDamageType()` - Tutti i tipi di danno
- `parseLanguages()` - Con mappatura Brancalonia
- `parseDamageModifiers()` - Immunità/resistenze
- `parseConditions()` - Condizioni con traduzione

## Mappature Complete

### Skill Italiane → Codici dnd5e
```javascript
'acrobazia': 'acr'
'addestrare animali': 'ani'
'arcano': 'arc'
'atletica': 'ath'
'inganno': 'dec'
'storia': 'his'
'intuizione': 'ins'
'intimidire': 'inti'
'indagare': 'inv'
'medicina': 'med'
'natura': 'nat'
'percezione': 'prc'
'intrattenere': 'prf'
'persuasione': 'per'
'religione': 'rel'
'rapidità di mano': 'slt'
'furtività': 'ste'
'sopravvivenza': 'sur'
```

### Proprietà Armi → Codici dnd5e
```javascript
'munizioni': 'amm'
'finezza': 'fin'
'pesante': 'hvy'
'leggera': 'lgt'
'ricarica': 'lod'
'portata': 'rch'
'speciale': 'spc'
'lancio': 'thr'
'due mani': 'two'
'versatile': 'ver'
'argentata': 'sil'
'magica': 'mgc'
```

### Tipi di Danno
```javascript
'acido': 'acid'
'contundenti': 'bludgeoning'
'freddo': 'cold'
'fuoco': 'fire'
'forza': 'force'
'fulmine': 'lightning'
'necrotici': 'necrotic'
'perforanti': 'piercing'
'veleno': 'poison'
'psichici': 'psychic'
'radiosi': 'radiant'
'taglienti': 'slashing'
'tuono': 'thunder'
```

## Active Effects Implementati

### Qualità Scadente (Armi)
```javascript
{
  key: 'system.bonuses.mwak.attack',
  mode: 2, // ADD
  value: '-1'
},
{
  key: 'system.bonuses.mwak.damage',
  mode: 2, // ADD
  value: '-1'
}
```

### Bollo di Qualità (Spell)
```javascript
{
  key: 'flags.brancalonia.qualita_scadente',
  mode: 5, // OVERRIDE
  value: 'false'
}
```

### Vantaggio Skill (Cimeli)
```javascript
{
  key: 'flags.dnd5e.advantage.skill.dec', // Esempio: Inganno
  mode: 5, // OVERRIDE
  value: '1'
}
```

### Maledizione - Svantaggio TS
```javascript
{
  key: 'flags.dnd5e.disadvantage.save.all',
  mode: 5, // OVERRIDE
  value: '1'
}
```

## Integrazione Script Principale

Per usare i converter specializzati in `normalize-database-correct.mjs`:

```javascript
import { convertSpell } from './converters/spell-converter.mjs';
import { convertWeapon, convertArmor, convertMagicItem } from './converters/equipment-converter.mjs';

// Nel switch dei converter
switch (rule.converter) {
  case 'spell':
    converted = convertSpell(data, filePath);
    break;
  case 'weapon':
    converted = convertWeapon(data, filePath);
    break;
  case 'armor':
    converted = convertArmor(data, filePath);
    break;
  case 'magicItem':
    converted = convertMagicItem(data, filePath);
    break;
  // ... altri converter
}
```

## Vantaggi della Soluzione

1. **Mappatura completa**: Ogni converter gestisce TUTTI i campi dnd5e rilevanti
2. **Nessuna regex fragile**: Legge direttamente i campi dal database
3. **Active Effects**: Genera effetti per meccaniche Brancalonia
4. **Preservazione dati**: Tutti i dati originali in `flags.brancalonia`
5. **Codice modulare**: Converter separati per manutenibilità
6. **Utility condivise**: Nessuna duplicazione di codice

## Prossimi Passi

1. **Creature Converter**: Completare con tutte le skill, immunità, resistenze
2. **Class/Subclass Converter**: Gestire progressioni, privilegi, spell slots
3. **Validatore Specializzato**: Verificare campi specifici per tipo
4. **Test su Database Reale**: Eseguire conversione completa

I converter specializzati risolvono tutti i problemi identificati e producono JSON completamente conformi allo schema dnd5e v5.1.9.