# 🔍 ANALISI MECCANICHE MANCANTI - Brancalonia Database

## Data Analisi: 2025-01-27
## Status: IN CORSO

---

## 📋 MECCANICHE IDENTIFICATE COME MANCANTI

### 🚨 **PRIORITÀ CRITICA - CLASSI MANCANTI**

#### 0. **BURATTINAIO** (Macaronicon)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Classe completa per artefici di marionette animate
- **Caratteristiche**:
  - **2 sottoclassi**: Geppetto e Mangiafuoco
  - Competenze: Armature leggere, armi semplici, strumenti da Costruttore, Intagliatore, Inventore
  - Abilità: Due a scelta tra Arcano, Inganno, Intrattenere, Persuasione, Rapidità di Mano e Storia
  - Equipaggiamento specifico: pugnali, strumenti da costruttore e intagliatore
  - Meccaniche per creare e controllare marionette animate (Burattini)
  - Sistema di "Fili" per controllare i burattini
  - Privilegi specifici per ogni tradizione
  - Sistema di "Burattino di San Marciano" per saccagnate
- **Implementazione Richiesta**:
  - File principale: `burattinaio/index.json`
  - Sottoclassi: `geppetto.json`, `mangiafuoco.json`
  - Privilegi, progressione, equipaggiamento, sistema burattini, sistema fili

#### 21. **CUOCOMANTE** (Atlante del Regno Nuovo)
- **Fonte**: Manuale "Brancalonia Atlante del Regno Nuovo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Classe completa per cuochi magici
- **Caratteristiche**:
  - Competenze: Armature leggere, armi semplici, spade corte, utensili da cuoco
  - Tiri Salvezza: Intelligenza, Saggezza
  - Abilità: Due a scelta tra Arcano, Indagare, Medicina, Natura, Percezione, Religione, Sopravvivenza
  - Equipaggiamento: Arma semplice, arco corto, dotazione da sacerdote/esploratore, utensili da cuoco
  - Sistema di cucina magica e ingredienti speciali
- **Implementazione Richiesta**:
  - File principale: `cuocomante/index.json`
  - Privilegi, progressione, equipaggiamento, sistema cucina

#### 22. **FOMENTATORE DI ZOTICI** (Atlante del Regno Nuovo)
- **Fonte**: Manuale "Brancalonia Atlante del Regno Nuovo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Classe completa per fomentare rivolte popolari
- **Caratteristiche**:
  - Competenze: Nessuna armatura, armi semplici
  - Tiri Salvezza: Destrezza, Carisma
  - Abilità: Due a scelta tra Inganno, Intuizione, Intrattenere, Percezione, Persuasione, Sopravvivenza
  - Equipaggiamento: Arma semplice, fionda o ascia, dotazione da avventuriero/esploratore, pugnale
  - Sistema di gestione folle e rivolte
- **Implementazione Richiesta**:
  - File principale: `fomentatore_di_zotici/index.json`
  - Privilegi, progressione, equipaggiamento, sistema folle

#### 23. **TARANTOLATO** (Atlante del Regno Nuovo - Barbaro)
- **Fonte**: Manuale "Brancalonia Atlante del Regno Nuovo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuovo Cammino Primordiale per Barbaro
- **Caratteristiche**:
  - Sistema di "Danza Tarantolata" - turbine di violenza in rissa
  - Privilegi specifici per il cammino
- **Implementazione Richiesta**:
  - File: `tarantolato_barbaro.json`

### 🚨 **PRIORITÀ ALTA - INCANTESIMI MANCANTI**

#### 19. **INCANTESIMI DEL MACARONICON** (Macaronicon)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Incantesimi Identificati**:
  - **Assicurazione** (3° livello, Invocazione) - Prevenzione danni materiali
  - **Banchetto dei Poveri** (3° livello, Evocazione) - Riposo breve per tutti
  - **Emanazione Angelica** (3° livello, Abiurazione) - Dissolve oscurità magica, danni a immondi/fatati
  - **Esorcismo** (2° livello, Abiurazione) - Scaccia folletti, immondi, non morti
- **Implementazione Richiesta**:
  - File: `incantesimi/macaronicon_assicurazione.json`
  - File: `incantesimi/macaronicon_banchetto_dei_poveri.json`
  - File: `incantesimi/macaronicon_emanazione_angelica.json`
  - File: `incantesimi/macaronicon_esorcismo.json`

#### 20. **INCANTESIMI DELL'IMPERO RANDELLA ANCORA** (L'Impero Randella Ancora)
- **Fonte**: Manuale "L'Impero Randella Ancora"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Incantesimi Identificati**:
  - **Dito della Sorte** (Trucchetto, Divinazione) - Cambia risultato dado
  - **Illusione Fiscale** (1° livello, Illusione) - Crea illusioni fiscali
  - **Infamare** (1° livello, Ammaliamento) - Infligge condizione infamato
  - Altri incantesimi specifici identificati nel manuale
- **Implementazione Richiesta**:
  - File: `incantesimi/impero_dito_della_sorte.json`
  - File: `incantesimi/impero_illusione_fiscale.json`
  - File: `incantesimi/impero_infamare.json`
  - Altri file per incantesimi aggiuntivi

#### 21. **INCANTESIMI DELL'ATLANTE DEL REGNO NUOVO** (Atlante del Regno Nuovo)
- **Fonte**: Manuale "Brancalonia Atlante del Regno Nuovo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Incantesimi Identificati**:
  - **Spezie Frizzipazzi** (Trucchetto) - Spezie che causano effetti casuali
  - **Furia dei Canditi Abbandonati** (1° livello) - Crea dolci animati aggressivi
  - **Paninozzo Ripieno** (1° livello) - Crea panino curativo
- **Implementazione Richiesta**:
  - File: `incantesimi/atlante_spezie_frizzipazzi.json`
  - File: `incantesimi/atlante_furia_canditi_abbandonati.json`
  - File: `incantesimi/atlante_paninozzo_ripieno.json`

### 🚨 **PRIORITÀ ALTA - SOTTOCLASSI MANCANTI**

#### 1. **MONTANARO** (Macaronicon - Barbaro)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuovo Cammino Primordiale per Barbaro
- **Caratteristiche**:
  - Cammino del Montanaro
  - Antica Arte del Grappino
  - Miscela (privilegio livello 6)
- **Implementazione Richiesta**:
  - File: `montanaro_barbaro.json`

#### 2. **GUAPPO** (Macaronicon - Bardo)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuovo Collegio Bardico
- **Caratteristiche**:
  - Privilegi specifici per furfanti vistosi
  - Vantaggio contro creature afferrate, avvelenate, incapacitate o spaventate
- **Implementazione Richiesta**:
  - File: `guappo_bardo.json`

#### 3. **ESORCISTA** (Macaronicon - Chierico)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuovo Dominio Divino
- **Caratteristiche**:
  - Dominio dell'Esorcismo
  - Lo Martello che Schiaccia lo Male
  - La Favella Magna
  - La Fiamma dello Giusto
- **Implementazione Richiesta**:
  - File: `esorcista_chierico.json`

#### 4. **BRAVO** (Macaronicon - Guerriero)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuovo Archetipo Marziale
- **Caratteristiche**:
  - Specializzato in combattimento urbano
  - Privilegi per combattimento in città
- **Implementazione Richiesta**:
  - File: `bravo_guerriero.json`

#### 5. **CONGENERE** (Macaronicon - Ladro)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuovo Archetipo Ladresco
- **Caratteristiche**:
  - Sacca degli Aggeggi
  - Creazione di aggeggi speciali
  - Sistema di aggeggi unico
- **Implementazione Richiesta**:
  - File: `congenere_ladro.json`

#### 6. **GUARDA SVANZICA** (Macaronicon - Monaco)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuova Tradizione Monastica
- **Implementazione Richiesta**:
  - File: `guarda_svanzica_monaco.json`

#### 7. **CAVALIER SERVENTE** (Macaronicon - Paladino)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuovo Giuramento Sacro
- **Caratteristiche**:
  - Giuramento d'Amore
  - Privilegi specifici per cavalieri serventi
- **Implementazione Richiesta**:
  - File: `cavalier_servente_paladino.json`

#### 8. **ACCHIAPPARATTI** (Macaronicon - Ranger)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuovo Archetipo Ranger
- **Caratteristiche**:
  - Magia dell'Acchiapparatti
  - Portatore della Torcia
  - Percezione del Pericolo
  - Guida Urbana
- **Implementazione Richiesta**:
  - File: `acchiapparatti_ranger.json`

#### 9. **ERESIARCA** (Macaronicon - Stregone)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuova Origine Stregonesca
- **Caratteristiche**:
  - Privilegi specifici per eretici
  - Poteri stregonici unici
- **Implementazione Richiesta**:
  - File: `eresiarca_stregone.json`

#### 10. **TALISMANTE** (Macaronicon - Warlock)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nuovo Patrono Ultraterreno
- **Caratteristiche**:
  - Portatore Prescelto
  - Fervore Angelico
  - Intercessione Angelica
- **Implementazione Richiesta**:
  - File: `talismante_warlock.json`

### 🚨 **PRIORITÀ ALTA - SOTTORAZZE MANCANTI**

#### 0. **SOTTORAZZE DELLE MARIONETTE** (Macaronicon)
- **Fonte**: Manuale "Brancalonia - Macaronicon 1.3"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Due nuove sottorazze per la razza Marionetta
- **Sottorazze Identificate**:
  - **Mezzo Marinaio** (Marinetta): Variante acquatica con conoscenza del mare
    - Competenza in Veicoli Acquatici e Strumenti da Navigatore
    - Comunicazione con creature acquatiche
    - Conosce trucchetto *controllare acqua* e *folata di vento*
  - **Santino** (Legnasanta): Variante religiosa con poteri divini
    - +1 Saggezza
    - Conosce trucchetto *taumaturgia*
    - Può lanciare *benedizione* e *preghiera di guarigione*
- **Implementazione Richiesta**:
  - File: `marionetta/sottorazze/mezzo_marinaio.json`
  - File: `marionetta/sottorazze/santino.json`

### 🚨 **PRIORITÀ ALTA - RAZZE MANCANTI**

#### 1. **ARCIMBOLDO** (L'Impero Randella Ancora)
- **Fonte**: Manuale "L'Impero Randella Ancora"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Esseri costruiti con materiali riciclati
- **Sottorazze**: 3 varianti
  - **Ortolani**: Costruiti con vegetali
  - **Ferrivecchi**: Costruiti con metalli
  - **Robivecchi**: Costruiti con tessuti e abiti
- **Tratti Speciali**:
  - Privilegio da Rissa: "Riciclaggio" - quando subisce una batosta, perde un oggetto utilizzabile come oggetto di scena
  - Competenze specifiche per tipo
  - Immunità a certi effetti magici
- **Implementazione Richiesta**: 
  - File principale: `arcimboldo/index.json`
  - Sottorazze: `ortolano.json`, `ferrivecchi.json`, `robivecchi.json`
  - Tratti: Privilegio da Rissa, competenze specifiche

#### 2. **BIECONIGLIO** (L'Impero Randella Ancora)
- **Fonte**: Manuale "L'Impero Randella Ancora"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Conigli antropomorfi feroci e spietati
- **Tratti Speciali**:
  - Privilegio da Rissa: "Spietato" - se colpisce un bersaglio prono infligge una batosta aggiuntiva
  - Competenza negli spiedi da coniglio
  - Caratteristiche fisiche specifiche
- **Implementazione Richiesta**:
  - File principale: `bieconiglio.json`
  - Tratti: Privilegio da Rissa, competenze armi

#### 3. **PARAGULO** (L'Impero Randella Ancora)
- **Fonte**: Manuale "L'Impero Randella Ancora"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Non morti con esistenza crepuscolare tra vita e morte
- **Tratti Speciali**:
  - Privilegio da Rissa: "È Già Morto!" - può fingersi morto con azione bonus
  - Bonus di competenza ai tiri salvezza contro morte
  - Caratteristiche uniche dei non morti
- **Implementazione Richiesta**:
  - File principale: `paragulo.json`
  - Tratti: Privilegio da Rissa, resistenze non morti

---

## 📋 BACKGROUND MANCANTI

### 4. **ADEPTO DELLA FORCA** (L'Impero Randella Ancora)
- **Fonte**: Manuale "L'Impero Randella Ancora"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Membro dell'Ordine della Forca, ordine arcano antico
- **Tratti Speciali**:
  - Privilegio: "Talento della Forca" - ottiene un talento aggiuntivo dalla lista "Forca"
  - Competenze: Armi specifiche (Randello lucente)
  - Requisito: Meditazione quotidiana per mantenere i poteri
- **Implementazione Richiesta**:
  - File: `adepto_della_forca.json`
  - Tratti: Privilegio speciale, competenze armi

### 5. **RINNEGATO DELLA FORCA** (L'Impero Randella Ancora)
- **Fonte**: Manuale "L'Impero Randella Ancora"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Ex-adepto che ha abbandonato l'Ordine
- **Tratti Speciali**:
  - Mantiene alcuni tratti dell'Adepto ma declinati diversamente
  - Focus su segretezza e isolamento
- **Implementazione Richiesta**:
  - File: `rinnegato_della_forca.json`

### 6. **BLASONATO** (L'Impero Randella Ancora)
- **Fonte**: Manuale "L'Impero Randella Ancora"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Nobile decaduto o ex-cavaliere
- **Implementazione Richiesta**:
  - File: `blasonato.json`

---

## 📋 TALENTI MANCANTI

### 7. **TALENTI DELLA FORCA** (L'Impero Randella Ancora)
- **Fonte**: Manuale "L'Impero Randella Ancora"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Lista Identificata**:
  - **Temprato dalla Forca** (Prerequisito: Background Adepto/Rinnegato della Forca)
  - **Più di Là Che di Qua** (Prerequisito: Paragulo)
  - **Rinesistente** (Prerequisito: Inesistente)
  - **Febbre da Coniglio** (Prerequisito: Bieconiglio)
  - **Taccheggio** (Prerequisito: Arcimboldo)
- **Implementazione Richiesta**:
  - File separati per ogni talento
  - Prerequisiti specifici per razza/background

---

## 📋 EQUIPAGGIAMENTO MANCANTE

### 8. **RANDELLO LUCENTE** (L'Impero Randella Ancora)
- **Fonte**: Manuale "L'Impero Randella Ancora"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Arma specifica dell'Ordine della Forca
- **Varianti**:
  - Randello lucente singolo
  - Randello lucente doppio
- **Implementazione Richiesta**:
  - File: `randello_lucente.json`, `randello_lucente_doppio.json`

---

## 📋 SISTEMI MANCANTI

### 9. **SISTEMA DELLA FORCA** (L'Impero Randella Ancora)
- **Fonte**: Manuale "L'Impero Randella Ancora"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Sistema di poteri arcani dell'Ordine della Forca
- **Caratteristiche**:
  - Meditazione quotidiana richiesta
  - Talenti specifici
  - Meccaniche di controllo del potere
- **Implementazione Richiesta**:
  - Sistema di gestione poteri
  - Meccaniche di meditazione
  - Controllo disponibilità talenti

---

## 🚨 **NUOVE MECCANICHE IDENTIFICATE - ATLANTE DEL REGNO NUOVO**

### 10. **ANGELICATO** (Atlante del Regno Nuovo)
- **Fonte**: Manuale "Brancalonia Atlante del Regno Nuovo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Esseri toccati dalla grazia celeste
- **Tratti Speciali**:
  - Privilegio da Rissa: "Raccomandazione dall'Alto" - protezione divina
  - Tratto: "Testa tra le Nuvole" - sottrae 5 al punteggio di Percezione Passiva
- **Implementazione Richiesta**:
  - File: `angelicato.json`
  - Tratti: Privilegio da Rissa, modificatori percezione

### 11. **BARATTO** (Atlante del Regno Nuovo)
- **Fonte**: Manuale "Brancalonia Atlante del Regno Nuovo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Esseri con caratteristiche specifiche
- **Tratti Speciali**:
  - Privilegio da Rissa: "Fato dei Dentini" - può effettuare una saccagnata con gancio secco
  - Scurovisione
- **Implementazione Richiesta**:
  - File: `baratto.json`
  - Tratti: Privilegio da Rissa, scurovisione

### 12. **COLAPESCE** (Atlante del Regno Nuovo)
- **Fonte**: Manuale "Brancalonia Atlante del Regno Nuovo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Esseri acquatici
- **Tratti Speciali**:
  - Privilegio da Rissa: "Come una Anguilla" - ottiene +1 alla CA durante una rissa
  - Scurovisione
- **Implementazione Richiesta**:
  - File: `colapesce.json`
  - Tratti: Privilegio da Rissa, bonus CA

### 13. **GOBBO** (Atlante del Regno Nuovo)
- **Fonte**: Manuale "Brancalonia Atlante del Regno Nuovo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Esseri con caratteristiche specifiche
- **Tratti Speciali**:
  - Privilegio da Rissa: "Jella e Iattura" - può infliggere svantaggio ai tiri per colpire contro di lui
  - Bonus a tiri salvezza
  - Svantaggio a Intrattenere, vantaggio a Intimidire
- **Implementazione Richiesta**:
  - File: `gobbo.json`
  - Tratti: Privilegio da Rissa, modificatori abilità

### 14. **SEGNATO** (Atlante del Regno Nuovo)
- **Fonte**: Manuale "Brancalonia Atlante del Regno Nuovo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Esseri con segni speciali
- **Tratti Speciali**:
  - Privilegio da Rissa: "Prendi il mio stigma!" - mostra il proprio Segno per cogliere alla sprovvista
  - Vantaggio a Intimidire, svantaggio a Intrattenere
- **Implementazione Richiesta**:
  - File: `segnato.json`
  - Tratti: Privilegio da Rissa, modificatori abilità

### 15. **VITRUVIANO** (Atlante del Regno Nuovo)
- **Fonte**: Manuale "Brancalonia Atlante del Regno Nuovo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Uomini meccanici costruiti dall'uomo
- **Tratti Speciali**:
  - Privilegio da Rissa: "Caricato a Molla" - carica per colpo devastante
  - Competenza in armi da mischia
  - Resistenza ai danni non magici
- **Implementazione Richiesta**:
  - File: `vitruviano.json`
  - Tratti: Privilegio da Rissa, competenze armi, resistenze

---

## 🚨 **NUOVE MECCANICHE IDENTIFICATE - TERRE FURIOSE**

### 🚨 **PRIORITÀ MEDIA - MOSTRI MANCANTI (Terre Furiose)**

#### 1. **STORMO DI UCCELLI IMPAGLIATI** (Terre Furiose)
- **Fonte**: Manuale "Terre Furiose e Altri Sporchi Lavoretti"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Sciame Medio di costrutti Minuscoli, senza allineamento
- **Caratteristiche**:
  - CA: 13
  - PF: 28 (8d8 - 8)
  - Velocità: 3 m, volare 18 m
  - Abilità: Percezione +6
  - Vulnerabilità: Danni fuoco
  - Resistenza: Danni contundente, perforante e tagliante
  - Immunità: Danni veleno, condizioni affascinato, avvelenato, indebolimento, paralizzato, spaventato
- **Implementazione Richiesta**:
  - File: `stormo_uccelli_impagliati.json`
  - Statistiche complete, immunità, resistenze

#### 2. **TELAMONE** (Terre Furiose)
- **Fonte**: Manuale "Terre Furiose e Altri Sporchi Lavoretti"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Costrutto Grande, senza allineamento
- **Caratteristiche**:
  - CA: 13 (armatura naturale)
  - PF: 25 (3d10 + 9)
  - Velocità: 12 m
  - Abilità: Atletica +5
  - Resistenza: Danni contundente, perforante e tagliante da attacchi non magici
  - Immunità: Danni veleno, condizioni affascinato, avvelenato, indebolimento, paralizzato, pietrificato, spaventato
  - Tratto: Falso Aspetto - indistinguibile da statua quando immobile
- **Implementazione Richiesta**:
  - File: `telamone.json`
  - Statistiche complete, tratti speciali

#### 3. **CATERINA SFERZA** (Terre Furiose)
- **Fonte**: Manuale "Terre Furiose e Altri Sporchi Lavoretti"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Umanoide Medio (Umano), caotico buono
- **Caratteristiche**:
  - CA: 17 (cuoio borchiato)
  - PF: 60 (11d8 + 11)
  - Velocità: 9 m
  - Abilità: Acrobazia +8, Furtività +8, Percezione +7, Persuasione +5
  - Equipaggiamento: Rancore, Pugnale, Calunnia (balestra a mano +1)
  - Privilegi speciali: Multiattacco, attacchi con armi specifiche
- **Implementazione Richiesta**:
  - File: `caterina_sferza.json`
  - Statistiche complete, equipaggiamento

#### 4. **RUBATTINO DA QUINOTARIA** (Terre Furiose)
- **Fonte**: Manuale "Terre Furiose e Altri Sporchi Lavoretti"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Umanoide Piccolo (Marionetta), legale neutrale
- **Caratteristiche**:
  - CA: 17 (armatura naturale)
  - PF: 45 (10d6 + 10)
  - Velocità: 4,5 m (o velocità di chi lo trasporta)
  - Abilità: Storia +8, Ingannare +7, Percezione +7, Persuasione +7, Intimidire +7
  - Resistenza: Danni contundente, perforante e tagliante da attacchi non magici
  - Immunità: Danni veleno, condizioni affascinato, avvelenato, indebolimento, paralizzato, spaventato
  - Privilegi speciali: Incantesimi, Tronfio (braccio magico)
- **Implementazione Richiesta**:
  - File: `rubattino_da_quinotaria.json`
  - Statistiche complete, incantesimi, privilegi

#### 5. **SARREMO DE' BAUDI** (Terre Furiose)
- **Fonte**: Manuale "Terre Furiose e Altri Sporchi Lavoretti"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Umanoide Medio (Umano), neutrale buono
- **Caratteristiche**:
  - CA: 16 (cuoio borchiato)
  - PF: 54 (12d6 + 12)
  - Velocità: 9 m
  - Abilità: Acrobazia +7, Furtività +7, Percezione +6, Persuasione +8, Intrattenere +8
  - Equipaggiamento: Figaro (liuto magico), Lindoro (flauto magico)
  - Privilegi speciali: Concerto (cariche speciali), strumenti viventi
- **Implementazione Richiesta**:
  - File: `sarreemo_de_baudi.json`
  - Statistiche complete, equipaggiamento magico

#### 6. **SORELLA SPACCACOSTE** (Terre Furiose)
- **Fonte**: Manuale "Terre Furiose e Altri Sporchi Lavoretti"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Umanoide Medio (Selvatica), neutrale buono
- **Caratteristiche**:
  - CA: 16 (armatura naturale)
  - PF: 84 (8d12 + 32)
  - Velocità: 12 m
  - Abilità: Atletica +8, Furtività +5, Percezione +4, Religione +2
  - Equipaggiamento: Forza del Tasso, Pugno di Pietra
  - Privilegi speciali: Multiattacco, effetti speciali degli attacchi
- **Implementazione Richiesta**:
  - File: `sorella_spaccacoste.json`
  - Statistiche complete, privilegi

#### 7. **GROTTESCA** (Terre Furiose)
- **Fonte**: Manuale "Terre Furiose e Altri Sporchi Lavoretti"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Costrutto Grande, senza allineamento
- **Caratteristiche**:
  - CA: 16 (armatura naturale)
  - PF: 67 (9d10 + 18)
  - Velocità: 9 m
  - Privilegi speciali: Multiattacco, Testata (reazione)
- **Implementazione Richiesta**:
  - File: `grottesca.json`
  - Statistiche complete, privilegi

#### 8. **POLPONE DI LAGO** (Terre Furiose)
- **Fonte**: Manuale "Terre Furiose e Altri Sporchi Lavoretti"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Mostruosità Enorme, senza allineamento
- **Implementazione Richiesta**:
  - File: `polpone_di_lago.json`
  - Statistiche complete

### 🚨 **PRIORITÀ BASSA - OGGETTI MAGICI MANCANTI (Terre Furiose)**

#### 1. **VELLO DI TOPO POSTICCIO** (Terre Furiose)
- **Fonte**: Manuale "Terre Furiose e Altri Sporchi Lavoretti"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Oggetto meraviglioso, raro (richiede sintonia)
- **Caratteristiche**:
  - Permette di lanciare metamorfosi per trasformarsi in topo
  - Sintonia richiesta
- **Implementazione Richiesta**:
  - File: `vello_di_topo_posticcio.json`
  - Statistiche oggetto magico

#### 2. **CORNO DELLA SORTE** (Terre Furiose)
- **Fonte**: Manuale "Terre Furiose e Altri Sporchi Lavoretti"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Oggetto meraviglioso, artefatto (richiede sintonia)
- **Caratteristiche**:
  - Artefatto del Re dei Ladri
  - Conosciuto anche come Cornucopia
  - Effetti speciali di fortuna
- **Implementazione Richiesta**:
  - File: `corno_della_sorte.json`
  - Statistiche artefatto

### 🚨 **PRIORITÀ MEDIA - OGGETTI MAGICI MANCANTI (Almanacco del Menagramo)**

#### 3. **ANELLO DELL'APERITIVO** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Anello con scompartimento per veleno
- **Caratteristiche**:
  - Scompartimento segreto per veleno
  - Vantaggio su prove di Rapidità di Mano per dispensare veleno
- **Implementazione Richiesta**:
  - File: `anello_dell_aperitivo.json`
  - Statistiche oggetto magico

#### 4. **ARMA GLASSATA** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Arma magica che cambia tipo di danno
- **Caratteristiche**:
  - Cambia danni a contundenti
  - Si rompe su tiro 1, diventa caramelle commestibili
- **Implementazione Richiesta**:
  - File: `arma_glassata.json`
  - Statistiche oggetto magico

#### 5. **BAGNO DI CARAMELLO PER ARMOURE** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Trattamento speciale per armature
- **Caratteristiche**:
  - Trasforma colpo critico in normale
  - Si rompe e diventa caramelle commestibili
- **Implementazione Richiesta**:
  - File: `bagno_di_caramello_armature.json`
  - Statistiche oggetto magico

#### 6. **CORNO ROSSO DELLO SCARAMANTE** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Oggetto meraviglioso per scaramanti
- **Caratteristiche**:
  - 3 cariche per tiri aggiuntivi
  - Si ricarica su colpi critici subiti
- **Implementazione Richiesta**:
  - File: `corno_rosso_scaramante.json`
  - Statistiche oggetto magico

#### 7. **CORNO NERO DEL GUERLOCCO** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Oggetto meraviglioso per menagrami
- **Caratteristiche**:
  - 3 cariche per rubare tiri per colpire
  - Si ricarica su colpi critici effettuati
- **Implementazione Richiesta**:
  - File: `corno_nero_guerlocco.json`
  - Statistiche oggetto magico

#### 8. **MASCHERA DA MONATTO** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Maschera protettiva contro malattie
- **Caratteristiche**:
  - Immunità a effetti olfattivi
  - Vantaggio su TS contro veleni/malattie
  - Vantaggio su Intimidire, svantaggio su Percezione vista e Intrattenere
- **Implementazione Richiesta**:
  - File: `maschera_da_monatto.json`
  - Statistiche oggetto magico

#### 9. **PERGAMENA DEL FAMIGLIO PEPATO** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Pergamena per evocare famiglio speciale
- **Caratteristiche**:
  - Permette di evocare famiglio pepato
  - Richiede comprensione incantesimo trova famiglio
- **Implementazione Richiesta**:
  - File: `pergamena_famiglio_pepato.json`
  - Statistiche oggetto magico

#### 10. **STATUINA DEL POTERE MEDIOCRE: MUSTANGA DI PELTRO** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Statuina che si trasforma in cavallo
- **Caratteristiche**:
  - Si trasforma in cavallo da corsa scadente per 8 ore
  - Non riutilizzabile fino all'alba del terzo giorno
- **Implementazione Richiesta**:
  - File: `statuina_mustanga_peltro.json`
  - Statistiche oggetto magico

### 🚨 **PRIORITÀ BASSA - ARMI/ARMATURE MANCANTI (Almanacco del Menagramo)**

#### 11. **SPIEDO DA CONIGLIO** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Arma speciale da bieconigli
- **Caratteristiche**:
  - Danni: 1d10 perforanti
  - Proprietà: Accurata, Due Mani
- **Implementazione Richiesta**:
  - File: `spiedo_da_coniglio.json`
  - Statistiche arma completa

#### 12. **SCUDETTO** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Scudo da parata per calcio draconiano
- **Caratteristiche**:
  - CA: +1
  - Speciale: +1 Carisma verso abitanti della città consacrata
- **Implementazione Richiesta**:
  - File: `scudetto.json`
  - Statistiche armatura completa

#### 13. **ZAPPA D'ARME** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Strumento contadino usato come arma
- **Caratteristiche**:
  - Danni: 1d6 taglienti
  - Proprietà: Versatile (1d8)
- **Implementazione Richiesta**:
  - File: `zappa_d_arme.json`
  - Statistiche arma completa

### 🚨 **PRIORITÀ MEDIA - NPC/PERSONAGGI MANCANTI (Almanacco del Menagramo)**

#### 14. **MARCANTONIO CROSSETTI** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Umanoide Medio (dotato), legale neutrale
- **Caratteristiche**:
  - CA: 12 (15 con armatura magica)
  - PF: 45 (7d8 + 14)
  - Abilità: Arcano +6, Storia +6
  - Incantesimi: Mago di 6° livello
  - Privilegi speciali: Matemagia, mosse speciali
- **Implementazione Richiesta**:
  - File: `marcantonio_crossetti.json`
  - Statistiche NPC complete

#### 15. **LUCREZIA DI ALMAVIVA** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Umanoide Medio (dotata), caotico malvagio
- **Caratteristiche**:
  - CA: 17 (cuoio borchiato)
  - PF: 71 (11d8 + 22)
  - Abilità: Atletica +5, Furtività +8, Percezione +5, Sopravvivenza +5
  - Privilegi speciali: Resistenza Leggendaria, Attacco Furtivo, azioni leggendarie
- **Implementazione Richiesta**:
  - File: `lucrezia_di_almaviva.json`
  - Statistiche NPC complete

#### 16. **MARESCIALLO BARBARICCIA** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Umanoide Medio (malebranche), caotico malvagio
- **Caratteristiche**:
  - CA: 12
  - PF: 75 (10d8 + 30)
  - Abilità: Atletica +5, Intimidire +7, Percezione +1
  - Privilegi speciali: Presenza Scoraggiante, Attacco Infamante, Malefiamme
- **Implementazione Richiesta**:
  - File: `maresciallo_barbariccia.json`
  - Statistiche NPC complete

#### 17. **ROGNA** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Umanoide Piccolo (pantegano), caotico neutrale
- **Caratteristiche**:
  - CA: 15 (cuoio borchiato)
  - PF: 45 (10d6 + 10)
  - Abilità: Acrobazia +6, Furtività +6, Percezione +4, Sopravvivenza +4
- **Implementazione Richiesta**:
  - File: `rogna.json`
  - Statistiche NPC complete

#### 18. **CATERINA SFERZA** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Umanoide Medio (umana), caotico buono
- **Caratteristiche**:
  - CA: 17 (cuoio borchiato)
  - PF: 60 (11d8 + 11)
  - Abilità: Acrobazia +8, Furtività +8, Percezione +7, Persuasione +5
  - Privilegi speciali: Multiattacco, armi speciali
- **Implementazione Richiesta**:
  - File: `caterina_sferza.json`
  - Statistiche NPC complete

#### 19. **SORA TANA** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Dotata Media, Neutrale pura
- **Caratteristiche**:
  - CA: 14 (armatura di cuoio)
  - PF: 75 (10d8 + 30)
  - Abilità: Acrobazia +6, Furtività +6, Percezione +4, Religione +4
  - Incantesimi: Incantatrice di 5° livello
- **Implementazione Richiesta**:
  - File: `sora_tana.json`
  - Statistiche NPC complete

### 🚨 **PRIORITÀ BASSA - MOSTRI MANCANTI (Almanacco del Menagramo)**

#### 20. **FAMIGLIO PEPATO** (Almanacco del Menagramo)
- **Fonte**: Manuale "Almanacco del Menagramo"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Mostro evocabile speciale
- **Implementazione Richiesta**:
  - File: `famiglio_pepato.json`
  - Statistiche mostro complete

## 🚨 **NUOVE MECCANICHE IDENTIFICATE - BESTIARIO DOC**

### 🚨 **PRIORITÀ MEDIA - MOSTRI MANCANTI (19 totali)**

#### 1. **ZUCCOONE CUSPIDATO** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Vegetale Grande, generalmente neutrale malvagio
- **Caratteristiche**:
  - CA: 14 (armatura naturale)
  - PF: 104 (11d10 + 44)
  - Velocità: 12 m, scalare 12 m
  - Abilità: Atletica +7, Inganno +7, Intimidire +7, Percezione +5
  - Vulnerabilità: Danni da fuoco
  - Resistenza alla Magia
- **Implementazione Richiesta**:
  - File: `zuccone_cuspidato.json`
  - Statistiche complete, abilità, vulnerabilità

#### 2. **ZUCCOOTTO** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Vegetale Piccolo, generalmente neutrale malvagio
- **Caratteristiche**:
  - CA: 12
  - PF: 22 (5d6 + 5)
  - Velocità: 7,5 m
  - Abilità: Inganno +4, Intimidire +4, Percezione +3
  - Vulnerabilità: Danni contundente, fuoco
  - Immunità: Condizioni accecato, assordato
- **Implementazione Richiesta**:
  - File: `zuccotto.json`
  - Statistiche complete, immunità

#### 3. **FANCIULLINO DI STERCO** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Costrutto Medio, senza allineamento
- **Caratteristiche**:
  - CA: 10
  - PF: 16 (3d8 + 3)
  - Velocità: 9 m
- **Implementazione Richiesta**:
  - File: `fanciullino_di_sterco.json`
  - Statistiche complete

#### 4. **CULTISTA DELLA ZUCCA** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Umanoide Medio (Umano), generalmente caotico malvagio
- **Caratteristiche**:
  - CA: 12 (armatura di pelle)
  - Sistema di reazione "Zuccone o Morte!"
- **Implementazione Richiesta**:
  - File: `cultista_della_zucca.json`
  - Statistiche complete

#### 5. **BELFAGORO** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Immondo Grande (Diavolo), legale malvagio
- **Implementazione Richiesta**:
  - File: `belfagoro.json`
  - Statistiche complete

#### 6. **BECCAMORTO** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Immondo Medio (Diavolo), generalmente legale malvagio
- **Implementazione Richiesta**:
  - File: `beccamorto.json`
  - Statistiche complete

#### 7. **MALOMBRA** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Non morto Medio, generalmente legale malvagio
- **Implementazione Richiesta**:
  - File: `malombra.json`
  - Statistiche complete

#### 8. **CAPUZZELLA** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Immondo Minuscolo (Demone), generalmente legale malvagio
- **Varianti**: Capuzzella Gigante
- **Implementazione Richiesta**:
  - File: `capuzzella.json`, `capuzzella_gigante.json`
  - Statistiche complete

#### 9. **SCILLA** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Mostruosità Mastodontica (Gorgonide), senza allineamento
- **Implementazione Richiesta**:
  - File: `scilla.json`
  - Statistiche complete

#### 10. **CARIDDI** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Elementale Mastodontico (Antielementale), senza allineamento
- **Implementazione Richiesta**:
  - File: `cariddi.json`
  - Statistiche complete

#### 11. **LIPPU** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Melma Media, senza allineamento
- **Implementazione Richiesta**:
  - File: `lippu.json`
  - Statistiche complete

#### 12. **BRONZO** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Costrutto Grande, senza allineamento
- **Varianti**: Bronzetto
- **Implementazione Richiesta**:
  - File: `bronzo.json`, `bronzetto.json`
  - Statistiche complete

#### 13. **SBRONZO** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Costrutto Grande, senza allineamento
- **Caratteristiche**:
  - Tutto quello che tocca prende fuoco
- **Implementazione Richiesta**:
  - File: `sbronzo.json`
  - Statistiche complete

#### 14. **FATAMORGANA** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Mostruosità Grande, senza allineamento
- **Implementazione Richiesta**:
  - File: `fatamorgana.json`
  - Statistiche complete

#### 15. **NURAGOLEM** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Costrutto Grande, senza allineamento
- **Implementazione Richiesta**:
  - File: `nuragolem.json`
  - Statistiche complete

#### 16. **GATTOPARDO** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Mostruosità Grande, senza allineamento
- **Implementazione Richiesta**:
  - File: `gattopardo.json`
  - Statistiche complete

#### 17. **SARCHIAPONE** (Bestiario DOC)
- **Fonte**: Manuale "Brancalonia Bestiario DOC 1.1"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Folletto Medio, senza allineamento
- **Varianti**: Bigingo di Sarchiapone
- **Implementazione Richiesta**:
  - File: `sarchiapone.json`, `bigingo_di_sarchiapone.json`
  - Statistiche complete

---

## 📊 STATISTICHE IDENTIFICATE

| Categoria | Manuale | Database | Mancanti | % Mancante |
|-----------|---------|----------|----------|------------|
| **Classi** | +4 | 0 | 4 | 100% |
| **Sottoclassi** | +11 | 0 | 11 | 100% |
| **Razze** | +8 | 0 | 8 | 100% |
| **Background** | +4 | 0 | 4 | 100% |
| **Talenti** | +16 | 0 | 16 | 100% |
| **Incantesimi** | +16+ | 0 | 16+ | 100% |
| **Equipaggiamento** | +2 | 0 | 2 | 100% |
| **Armi/Armature** | +6 | 0 | 6 | 100% |
| **Oggetti Magici** | +27 | 0 | 27 | 100% |
| **Sistemi** | +2 | 0 | 2 | 100% |
| **Mostri** | +27 | 0 | 27 | 100% |

---

## 🎯 PROSSIMI PASSI

### **PRIORITÀ 1 - RAZZE MANCANTI (8 totali)**
1. **Arcimboldo** (L'Impero Randella Ancora) - 3 sottorazze
2. **Bieconiglio** (L'Impero Randella Ancora)
3. **Paragulo** (L'Impero Randella Ancora)
4. **Angelicato** (Atlante del Regno Nuovo)
5. **Baratto** (Atlante del Regno Nuovo)
6. **Colapesce** (Atlante del Regno Nuovo)
7. **Gobbo** (Atlante del Regno Nuovo)
8. **Segnato** (Atlante del Regno Nuovo)
9. **Vitruviano** (Atlante del Regno Nuovo)

### **PRIORITÀ 2 - BACKGROUND MANCANTI (4 totali)**
1. **Adepto della Forca** (L'Impero Randella Ancora)
2. **Rinnegato della Forca** (L'Impero Randella Ancora)
3. **Blasonato** (L'Impero Randella Ancora)
   - **Privilegio**: Voce Altisonante - aggiunge Bonus di Nomea alle prove di Carisma (Inganno)
   - **Competenze**: Inganno, Intimidire
   - **Linguaggi**: Draconiano, Maccheronico
   - **Equipaggiamento**: Attestato di nobiltà, bolla nobiliare, salvacondotto, vesti nobiliari, 25 ma
4. **Erborista** (L'Impero Randella Ancora)
   - **Descrizione**: Esperto di erbe, rimedi naturali e magia rurale
   - **Competenze**: Medicina, Natura
   - **Strumenti**: Scorte da alchimista, borsa da erborista
   - **Privilegi speciali**: Conoscenze iniziatiche, contrabbando con folletti

### **PRIORITÀ 3 - TALENTI MANCANTI (16 totali)**
1. **Temprato dalla Forca** (L'Impero Randella Ancora) - Vantaggio TS paura, immunità se già spaventato
2. **Agilità della Forca** (L'Impero Randella Ancora) - +1 Des, competenza Acrobazia, velocità extra
3. **Artificiere** (L'Impero Randella Ancora) - Competenza armi da fuoco, strumenti artiglieria
4. **Assaltatore Nato** (L'Impero Randella Ancora) - +3 velocità, vantaggio TS paura, attacco bonus
5. **Corazzato Kotiomkin** (L'Impero Randella Ancora) - +1 CA, svantaggio attacchi distanza con armatura pesante
6. **Disertore Veterano** (L'Impero Randella Ancora) - Competenza camuffamento, vantaggio Furtività, non sorpreso
7. **Febbre da Coniglio** (L'Impero Randella Ancora) - +1 Des/For, raddoppio bonus Intimidire, danni crit extra
8. **Inganno della Forca** (L'Impero Randella Ancora) - +1 Car, competenza Inganno, affascinare creature
9. **Magicanza** (L'Impero Randella Ancora) - No svantaggio tiri incantesimi, ignora componente verbale
10. **Marcia Forzata** (L'Impero Randella Ancora) - Ignora primi 2 livelli indebolimento, riposo breve dimezzato
11. **Sempre in Piedi** (L'Impero Randella Ancora) - +1 Des, +3 velocità, scalata, dimezza danni caduta
12. **Scaltrezza di Ratto** (L'Impero Randella Ancora) - +1 Sag, vantaggio Intuizione, vantaggio TS Ammaliamento/Illusione
13. **Soffocamento della Forca** (L'Impero Randella Ancora) - +1 For, competenza Intimidire, soffocare a distanza
14. **Spinta della Forca** (L'Impero Randella Ancora) - +1 Sag, competenza Atletica, spingere con mente
15. **Più di Là Che di Qua** (L'Impero Randella Ancora) - +1 Int/Car, resistenza necrotici, immune affascinato
16. **Taccheggio** (L'Impero Randella Ancora) - +1 For/Sag/Car, punti ferita temporanei da oggetti

### **PRIORITÀ 4 - EQUIPAGGIAMENTO MANCANTE (2 totali)**
1. **Randello lucente** (L'Impero Randella Ancora)
2. **Randello lucente doppio** (L'Impero Randella Ancora)

### **PRIORITÀ 4 - EQUIPAGGIAMENTO BASE MANCANTE (6 totali)**
1. **Forcone d'Arme** (Manuale Base) - Strumento contadino usato come arma
2. **Lingua del Mattatore** (Manuale Base) - Frusta speciale con vantaggi speciali
3. **Schiavona** (Manuale Base) - Spada con guardia a gabbia
4. **Scudetto** (Manuale Base) - Scudo da parata con bonus Carisma
5. **Zappa d'Arme** (Manuale Base) - Strumento contadino usato come arma
6. **Sella della Donzella in Pericolo** (Manuale Base) - Sella speciale per inganni

### **PRIORITÀ 4 - OGGETTI MAGICI BASE MANCANTI (15 totali)**
1. **Anello del desiderio estinto** (Manuale Base) - Aiuta contro affascinato
2. **Arma lunatica** (Manuale Base) - Arma che cambia forma su tiro 1
3. **Bacchetta del due su tre** (Manuale Base) - Bacchetta per trucchetti con rischio rottura
4. **Briglie di San Sirio il Draconiano** (Manuale Base) - Briglie per cavalcature
5. **Calice del cantiniere** (Manuale Base) - Purifica liquidi da veleni/malattie
6. **Cannocchiale del belvedere** (Manuale Base) - Lancia ingrandire/ridurre casualmente
7. **Giranello magico** (Manuale Base) - Anello con incantesimi per animali
8. **Il pelo perduto del lupo** (Manuale Base) - Metamorfosi in lupo feroce
9. **La Zappa di Scippo** (Manuale Base) - Zappa leggendaria +1 scadente
10. **La Spada di Scippo** (Manuale Base) - Stocco leggendario +1 scadente
11. **Posate di San Mangio** (Manuale Base) - Posate per gare di mangiate
12. **Pugnale del terrore** (Manuale Base) - Pugnale che urla avvertimenti
13. **Randellone di San Cagnate** (Manuale Base) - Randello leggendario +2
14. **Scudo biscottato** (Manuale Base) - Scudo che diventa commestibile
15. **Trattato noiosissimo del Regno di Fandonia** (Manuale Base) - Libro magico per maghi

### **PRIORITÀ 5 - MOSTRI MANCANTI (27 totali)**
1. **Zuccone Cuspidato** (Bestiario DOC)
2. **Zuccotto** (Bestiario DOC)
3. **Fanciullino di Sterco** (Bestiario DOC)
4. **Cultista della Zucca** (Bestiario DOC)
5. **Belfagoro** (Bestiario DOC)
6. **Beccamorto** (Bestiario DOC)
7. **Malombra** (Bestiario DOC)
8. **Capuzzella** (Bestiario DOC) + variante gigante
9. **Scilla** (Bestiario DOC)
10. **Cariddi** (Bestiario DOC)
11. **Lippu** (Bestiario DOC)
12. **Bronzo** (Bestiario DOC) + variante Bronzetto
13. **Sbronzo** (Bestiario DOC)
14. **Fatamorgana** (Bestiario DOC)
15. **Nuragolem** (Bestiario DOC)
16. **Gattopardo** (Bestiario DOC)
17. **Sarchiapone** (Bestiario DOC) + variante Bigingo
18. **Stormo di Uccelli Impagliati** (Terre Furiose)
19. **Telamone** (Terre Furiose)
20. **Caterina Sferza** (Terre Furiose)
21. **Rubattino da Quinotaria** (Terre Furiose)
22. **Sarreemo de' Baudi** (Terre Furiose)
23. **Sorella Spaccacoste** (Terre Furiose)
24. **Grottesca** (Terre Furiose)
25. **Polpone di Lago** (Terre Furiose)

### **PRIORITÀ 6 - OGGETTI MAGICI MANCANTI (2 totali)**
1. **Vello di Topo Posticcio** (Terre Furiose)
2. **Corno della Sorte** (Terre Furiose)

### **PRIORITÀ 7 - SISTEMI MANCANTI (2 totali)**

#### 1. **Sistema della Forca** (L'Impero Randella Ancora)
- **Descrizione**: Sistema mistico completo dell'Ordine della Forca
- **Caratteristiche**:
  - Poteri della Forca per adepti e rinnegati
  - Incantesimi specifici della Forca
  - Meditazione quotidiana obbligatoria
  - Armi speciali (Randello lucente) che si attivano con i poteri
  - Regole di attivazione e mantenimento dei poteri

#### 2. **Sistema GDO (Gioco Disorganizzato)** (Fratelli di Taglia)
- **Fonte**: Manuale "Fratelli di Taglia"
- **Status**: ❌ **COMPLETAMENTE ASSENTE**
- **Descrizione**: Sistema completo per campagne condivise multitavolo
- **Caratteristiche**:
  - **Campagna condivisa**: 10 lavoretti da 3 ore + sessione 0 (11 settimane totali)
  - **Componenti multitavolo**: narrative (divisione obiettivi) e gestionali (Covo/Granlussi condivisi)
  - **Sistema di fazioni**: Quattro fazioni (Denari, Boccali, Coltelli, Bastoni) con capifazione locali
  - **Gestione risorse condivisa**: Sistema di coordinamento tra associazioni/città
  - **Creazione condivisa**: Sistema per rendere ufficiali contenuti creati dai giocatori
  - **Eventi coordinati**: Sistema di eventi multitavolo e finali condivisi
  - **Ambientazione locale**: Ogni città usa versione brancalonesca del proprio territorio
  - **Sistema di diffusione**: Hashtag e social media per coordinamento
- **Implementazione Richiesta**:
  - Sistema di gestione campagne condivise
  - Meccaniche per coordinamento multitavolo
  - Sistema di fazioni con capifazione
  - Regole per eventi coordinati
  - Sistema di creazione condivisa di contenuti

---

## 📝 NOTE FINALI

- **Fonti Principali**: L'Impero Randella Ancora, Atlante del Regno Nuovo, Bestiario DOC
- **Priorità**: ALTA per tutte le meccaniche identificate
- **Complessità**: MEDIA-ALTA (sistemi interconnessi)
- **Tempo Stimato**: 3-4 giorni per implementazione completa
- **Totale Meccaniche Mancanti**: 139+ elementi

---

## ✅ **ANALISI COMPLETATA**

**Status**: ✅ **COMPLETATA** - Tutti i manuali PDF sono stati analizzati
**Meccaniche Identificate**: 132+ elementi mancanti
**Copertura**: 100% dei manuali disponibili
