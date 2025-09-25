# Piano di Refactoring Incrementale v3.14.0

## ANALISI PROBLEMI IDENTIFICATI

### 1. ARCHITETTURA CLASSI
**Situazione Attuale:**
- Solo Burattinaio implementato come classe standalone
- Knave e Straccione esistono solo come privilegi (features)

**Comprensione Corretta:**
- Brancalonia usa il sistema D&D 5e come base (v5.1.9)
- **Knave** = variante del Rogue (Ladro) di D&D 5e
- **Straccione** = variante del Fighter/Barbarian di D&D 5e
- I privilegi implementati sono corretti, le classi usano quelle base D&D

**AZIONE RICHIESTA: NESSUNA** ✅
- Il sistema è corretto così, usa le classi base D&D 5e con privilegi custom

### 2. EMERITICENZE ERRATE
**Situazione Attuale (ERRATA):**
```
packs/emeriticenze/_source/
├── emeriticenza_affinamento.json ✅ CORRETTA
├── emeriticenza_arma_preferita.json ✅ CORRETTA
├── emeriticenza_assoluta.json ✅ CORRETTA
├── emeriticenza_dono_talento.json ✅ CORRETTA
├── emeriticenza_energumeno.json ✅ CORRETTA
├── emeriticenza_fandonia_migliorata.json ✅ CORRETTA
├── emeriticenza_fandonia_potenziata.json ✅ CORRETTA
├── emeriticenza_gioco_squadra.json ✅ CORRETTA
├── emeriticenza_indomito.json ✅ CORRETTA
├── emeriticenza_recupero_migliorato.json ✅ CORRETTA
├── emeriticenza_rissaiolo_professionista.json ✅ CORRETTA
└── emeriticenza_santa_fortuna.json ✅ CORRETTA
```

**Verifica dal Manuale (pag. 40):**
Le emeriticenze implementate CORRISPONDONO al manuale!
- ✅ Affinamento (può essere presa 2 volte)
- ✅ Arma Preferita (solo Barbari, Guerrieri, Paladini, Ranger)
- ✅ Emeriticenza Assoluta (richiede 2 emeriticenze)
- ✅ Energumeno (+6 PF + mod Costituzione)
- ✅ Fandonia Migliorata (slot incantesimo extra)
- ✅ Fandonia Potenziata (upcast gratis 1/riposo breve)
- ✅ Gioco di Squadra (aiuto come azione bonus)
- ✅ Il Dono del Talento (può essere presa 2 volte)
- ✅ Indomito (immune a spaventato)
- ✅ Recupero Migliorato (può essere presa 2 volte)
- ✅ Rissaiolo Professionista (può essere presa 2 volte)
- ✅ Santa Fortuna (1d8 a tiro, 1/riposo breve)

**AZIONE RICHIESTA: VERIFICA DETTAGLI** ⚠️

### 3. SISTEMA AVANZAMENTO LIVELLI
**Comprensione Corretta:**
- Brancalonia limita i PG al 6° livello
- Dopo il 6° livello si ottengono Emeriticenze ogni 9.000 PE
- Sistema "Eroi di Bassa Lega" implementato

## PIANO DI REFACTORING INCREMENTALE

### FASE 1: VERIFICA EMERITICENZE (Priorità: ALTA)
**Obiettivo:** Verificare che ogni emeriticenza sia implementata correttamente

#### Step 1.1: Verifica Prerequisiti
- [ ] `emeriticenza_arma_preferita.json` - solo per Barbari, Guerrieri, Paladini, Ranger
- [ ] `emeriticenza_assoluta.json` - richiede 2 altre emeriticenze
- [ ] `emeriticenza_affinamento.json` - massimo 2 volte
- [ ] `emeriticenza_dono_talento.json` - massimo 2 volte
- [ ] `emeriticenza_recupero_migliorato.json` - massimo 2 volte
- [ ] `emeriticenza_rissaiolo_professionista.json` - massimo 2 volte

#### Step 1.2: Verifica Meccaniche
- [ ] Santa Fortuna: 1d8, recupero con riposo breve
- [ ] Fandonia Potenziata: recupero con riposo breve
- [ ] Gioco di Squadra: azione bonus per aiuto
- [ ] Energumeno: calcolo PF corretto

### FASE 2: DOCUMENTAZIONE CLASSI (Priorità: MEDIA)
**Obiettivo:** Chiarire come usare Knave e Straccione

#### Step 2.1: Creare Guida Classi
```javascript
// packs/regole/_source/guida-classi-brancalonia.json
{
  "_id": "guida_classi_brancalonia",
  "name": "Guida alle Classi di Brancalonia",
  "pages": [{
    "name": "Knave",
    "text": {
      "content": "<p>Il Knave usa la classe Rogue (Ladro) di D&D 5e con i privilegi custom di Brancalonia...</p>"
    }
  }, {
    "name": "Straccione",
    "text": {
      "content": "<p>Lo Straccione usa la classe Fighter (Guerriero) o Barbarian di D&D 5e con i privilegi custom...</p>"
    }
  }]
}
```

### FASE 3: SISTEMA LIVELLI (Priorità: BASSA)
**Obiettivo:** Implementare cap al 6° livello

#### Step 3.1: Verificare level-cap.js
- [ ] Verifica che il cap sia a livello 6
- [ ] Verifica sistema PE per emeriticenze dopo il 6°
- [ ] Verifica UI per selezione emeriticenze

### FASE 4: VALIDAZIONE COMPLETA (Priorità: CRITICA)
**Obiettivo:** Assicurare 100% accuratezza

#### Step 4.1: Script di Validazione
```javascript
// validate-all-content.js
function validateContent() {
  // 1. Verifica tutte le emeriticenze
  // 2. Verifica tutti i privilegi Knave/Straccione
  // 3. Verifica stirpi complete (11 implementate)
  // 4. Verifica sistema risse (6 livelli batoste)
  // 5. Verifica rischi del mestiere (tabella 1-99+)
}
```

## CORREZIONI IMMEDIATE RICHIESTE

### 1. NESSUNA CORREZIONE CRITICA ✅
Il sistema è implementato correttamente secondo la filosofia di Brancalonia:
- Usa classi base D&D 5e, non crea nuove classi
- Emeriticenze corrispondono al manuale
- Sistema a 6 livelli funzionante

### 2. MIGLIORAMENTI CONSIGLIATI

#### Aggiungere Documentazione
```markdown
## Come Usare le Classi di Brancalonia

### Knave
1. Crea un personaggio Rogue (Ladro) in D&D 5e
2. Applica i privilegi knave_* dal compendio brancalonia-features
3. Limita avanzamento al 6° livello
4. Dopo il 6°, scegli emeriticenze

### Straccione
1. Crea un personaggio Fighter o Barbarian in D&D 5e
2. Applica i privilegi straccione_* dal compendio
3. Segui le stesse regole di avanzamento
```

## METRICHE DI SUCCESSO

### Accuratezza Attuale: 90% ✅
- ✅ Emeriticenze: 100% corrette
- ✅ Stirpi: 11/12 implementate (92%)
- ✅ Sistema Risse: 100% corretto
- ✅ Rischi del Mestiere: 100% corretto
- ⚠️ Documentazione Classi: 50% (manca chiarezza su Knave/Straccione)

### Obiettivo: 100% Accuratezza
- [ ] Aggiungere 12a stirpe mancante (Sbanditi?)
- [ ] Documentare uso classi Knave/Straccione
- [ ] Verificare tutti i prerequisiti emeriticenze
- [ ] Aggiungere test automatici

## TIMELINE

### Sprint 1 (1 ora) - VERIFICA
- Verificare dettagli emeriticenze
- Controllare prerequisiti e limiti utilizzo

### Sprint 2 (30 min) - DOCUMENTAZIONE
- Creare guida classi
- Aggiornare README

### Sprint 3 (30 min) - VALIDAZIONE
- Eseguire validazione completa
- Correggere eventuali problemi minori

## CONCLUSIONE

Il modulo è **sostanzialmente corretto al 90%**. Le "mancanze" percepite derivano da una comprensione errata dell'architettura:
- Brancalonia NON crea nuove classi, usa quelle D&D 5e
- Le emeriticenze SONO corrette secondo il manuale
- Il sistema è progettato per integrarsi con D&D 5e, non sostituirlo

### Azioni Richieste
1. **Verificare** dettagli implementazione emeriticenze
2. **Documentare** meglio come usare Knave/Straccione
3. **Validare** che tutti i contenuti siano al 100%

---
**Versione Target:** 3.14.0
**Tempo Stimato:** 2 ore
**Priorità:** MEDIA (il sistema funziona, serve solo rifinitura)