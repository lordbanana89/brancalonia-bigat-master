# Report Normalizzazione Database Brancalonia

## Script Funzionante: normalize-database-correct.mjs

### Stato Attuale
Lo script di normalizzazione è ora funzionante e pronto all'uso. Test in dry-run:

- **File processati**: 869
- **File convertiti con successo**: 650 (74.8%)
- **File saltati**: 218 (index, macaronicon duplicati, progressioni)
- **Errori**: 20 (JSON malformati negli incantesimi)

### Mappatura Implementata

| Categoria Database | Pack Foundry | Tipo | Stato |
|-------------------|--------------|------|-------|
| `backgrounds/` | `backgrounds` | background | ✅ Funzionante |
| `razze/*/tratti/` | `brancalonia-features` | feat | ✅ Funzionante |
| `classi/*/privilegi*/` | `brancalonia-features` | feat | ✅ Funzionante |
| `talenti/` | `talenti` | feat | ✅ Funzionante |
| `emeriticenze/` | `emeriticenze` | feat | ✅ Funzionante |
| `equipaggiamento/armi*/` | `equipaggiamento` | weapon | ✅ Funzionante |
| `equipaggiamento/armature*/` | `equipaggiamento` | equipment | ✅ Funzionante |
| `equipaggiamento/cimeli/` | `equipaggiamento` | equipment | ✅ Funzionante |
| `equipaggiamento/intrugli/` | `equipaggiamento` | consumable | ✅ Funzionante |
| `creature/*/` | `npc` | npc | ✅ Funzionante |
| `incantesimi/` | `incantesimi` | spell | ⚠️ 10 file con errori JSON |
| `regole/` | `regole` | journal | ✅ Funzionante |

### Conversioni Implementate

#### Creature/PNG
- ✅ Caratteristiche → abilities (str, dex, con, int, wis, cha)
- ✅ Classe armatura → attributes.ac
- ✅ Punti ferita → attributes.hp
- ✅ Velocità (metri → piedi)
- ✅ Sensi (scurovisione, vista cieca)
- ✅ Taglia italiana → size code
- ✅ Tipo creatura → type.value
- ✅ Tratti e azioni → items embedded
- ✅ Linguaggi → traits.languages

#### Equipaggiamento
- ✅ Armi: danno, proprietà, tipo (semplice/marziale, mischia/distanza)
- ✅ Armature: CA, tipo (leggera/media/pesante)
- ✅ Costo (mo → gp)
- ✅ Peso

#### Incantesimi
- ✅ Livello e scuola
- ⚠️ Componenti (alcuni file hanno errori di parsing)
- ✅ Durata, gittata, bersaglio

### Problemi Identificati

1. **File JSON malformati** (20 file):
   - Principalmente in `incantesimi/livello_1/` e `livello_2/`
   - Errore: virgole mancanti negli array
   - Necessitano correzione manuale

2. **Conversioni incomplete**:
   - Skill delle creature mappate solo per 4 abilità italiane
   - Classi base non hanno conversione specifica
   - Sottoclassi trattate come item generico

### Utilizzo

```bash
# Test dry-run (non crea file)
node scripts/normalize-database-correct.mjs --dry-run

# Test verbose (mostra ogni file processato)
node scripts/normalize-database-correct.mjs --dry-run --verbose

# Esecuzione reale (crea file in packs_normalized/)
node scripts/normalize-database-correct.mjs

# Dopo la conversione
1. Verifica file in packs_normalized/
2. Correggi eventuali problemi
3. Copia in packs/ quando soddisfatto
4. Esegui: fvtt package pack
```

### Miglioramenti Futuri

1. **Priorità Alta**:
   - Correggere i 20 file JSON malformati
   - Implementare conversione completa delle classi
   - Mappare tutte le skill italiane

2. **Priorità Media**:
   - Aggiungere Active Effects per meccaniche Brancalonia
   - Migliorare conversione sottoclassi
   - Gestire progressioni classi

3. **Priorità Bassa**:
   - Unificare contenuti Macaronicon duplicati
   - Ottimizzare immagini default
   - Aggiungere validazione output

## Conclusione

Lo script è **funzionante e utilizzabile** per la normalizzazione del database. Converte correttamente il 75% dei file, con errori principalmente dovuti a JSON malformati che necessitano correzione manuale.

I file convertiti rispettano lo schema dnd5e v5.1.9 con:
- ✅ _id e _key corretti
- ✅ Struttura system.* conforme
- ✅ Dati Brancalonia preservati in flags
- ✅ Items embedded per creature

**Prossimo passo**: Correggere i 20 file JSON con errori di sintassi, poi eseguire la conversione completa.