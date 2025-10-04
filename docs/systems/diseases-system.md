# 🦠 Sistema Malattie - Brancalonia

Il Sistema Malattie simula malattie, contagi e condizioni mediche nel Regno di Taglia, aggiungendo realismo e rischio alle avventure.

## 🏥 Malattie Implementate

### Febbre Palustre
- **Incubazione**: 1d4 giorni
- **Contagio**: Punture insetti, acqua stagnante
- **Fase 1** (1d4 giorni): -5 HP massimi, svantaggio TS Costituzione
- **Fase 2** (2d4 giorni): -10 HP massimi, -2 Forza, svantaggio tutto
- **Fase 3** (permanente): 3 livelli sfinimento

### Peste Nera
- **Incubazione**: 1d6 giorni
- **Contagio**: Contatto diretto, probabilità 25%
- **Fase 1** (1d3 giorni): -10 HP massimi, -2 Costituzione
- **Fase 2** (1d6 giorni): Morte apparente (coma)
- **Cura**: Magia potente o quarantena

### Sifilide
- **Incubazione**: 2d4 settimane
- **Contagio**: Contatto intimo, 15% probabilità
- **Effetti**: -2 Carisma, cicatrici permanenti
- **Cura**: Magia o trattamento mercuriale

### Tifo Petecchiale
- **Incubazione**: 1d4 giorni
- **Contagio**: Acqua/acqua contaminata
- **Effetti**: Febbre alta, delirio, -4 prove abilità
- **Durata**: 2d6 giorni

### Vaiolo
- **Incubazione**: 1d6 giorni
- **Contagio**: Contatto diretto, 20% probabilità
- **Effetti**: Cicatrici permanenti (-2 Carisma), febbre
- **Cura**: Sopravvivenza per immunità

### Tubercolosi
- **Incubazione**: 2d4 settimane
- **Contagio**: Aria, tosse, 10% probabilità
- **Effetti**: -2 Costituzione, tosse cronica
- **Progressione**: Debolezza crescente

### Rabbia
- **Incubazione**: 1d4 settimane
- **Contagio**: Morsi animali, 50% probabilità
- **Effetti**: Aggressività, allucinazioni
- **Cura**: Magia entro 1d4 giorni

### Dissenteria
- **Incubazione**: 1d3 giorni
- **Contagio**: Acqua/cibo contaminato
- **Effetti**: Diarrea, disidratazione, -2 Forza
- **Durata**: 1d6 giorni

## 🦠 Meccaniche di Contagio

### Probabilità Contagio
```javascript
// Sistema probabilità contagio
const contagioBase = 0.15; // 15% base

// Modificatori
const modifiers = {
  contattoDiretto: +0.20,     // Contatto diretto +20%
  contattoIndiretto: +0.05,   // Contatto indiretto +5%
  immunitaAlta: -0.10,        // Costituzione alta -10%
  malattiaVirulenta: +0.15,   // Malattia molto contagiosa +15%
  condizioniSanitarie: +0.10  // Condizioni igieniche povere +10%
};

const finalProbability = Math.min(contagioBase + modifiers.total, 0.95);
```

### Eventi di Contagio
- **Contatto Malato**: Interazione con NPC infetto
- **Acqua Contaminata**: Bere da fonti infette
- **Cibo Avariato**: Consumare cibo guasto
- **Insetti Vettori**: Punture di insetti infetti
- **Aria Infetta**: Respirare aria contaminata

## 💊 Sistema Cure

### Metodi di Cura Disponibili

#### Cure Naturali
- **Riposo**: Riduce durata malattia
- **Erbe Medicinali**: +2 ai tiri cura
- **Quarantena**: Previene contagio ad altri
- **Igiene**: Prevenzione primaria

#### Cure Mediche
- **Medicina CD 15**: Cura malattia con successo
- **Chirurgia**: Per ferite infette
- **Farmaci**: Pozioni ed elisir
- **Trattamenti**: Bagni, salassi, ecc.

#### Cure Magiche
- **Cura Ferite**: Cura sintomi immediati
- **Ristorare Inferiore**: Cura una malattia
- **Ristorare Superiore**: Cura tutte le malattie
- **Rimuovi Maledizione**: Per aspetti soprannaturali

## 📊 Progressione Malattia

### Fasi Standard
1. **Incubazione**: Periodo senza sintomi
2. **Sintomi Iniziali**: Primi effetti lievi
3. **Sintomi Acuti**: Effetti massimi
4. **Crisi**: Punto critico, possibilità morte
5. **Convalescenza**: Recupero graduale
6. **Immunità**: Resistenza futura

### Tiri di Costituzione
```javascript
// Tiri giornalieri per progressione
const conRoll = await actor.rollAbility('con');
const diseaseDC = 12; // DC base malattia

if (conRoll.total >= diseaseDC) {
  // Miglioramento: -1 giorno durata
  disease.duration -= 1;
} else if (conRoll.total <= diseaseDC - 5) {
  // Peggioramento: +1 giorno durata, effetti aumentati
  disease.duration += 1;
  disease.intensity += 1;
}
```

## 🏥 Luoghi di Cura

### Ospedali e Cliniche
- **Casa di Cura**: +2 ai tiri cura
- **Ospedale**: +4 ai tiri cura, cure specializzate
- **Clinica Privata**: Cure premium, costo elevato

### Templi e Santuari
- **Tempio Locale**: Cure base, preghiere
- **Santuario Maggiore**: Cure avanzate, benedizioni
- **Cattedrale**: Cure miracolose, costi elevati

### Guaritori Itineranti
- **Medici**: Cure professionali, costosi
- **Erboristi**: Cure naturali, economici
- **Streghe**: Cure magiche, rischiose

## 🌍 Epidemie e Eventi di Massa

### Eventi Epidemici
- **Focolaio Locale**: Malattia si diffonde in zona
- **Epidemia Cittadina**: Città intera colpita
- **Pandemia Regionale**: Intera regione infetta

### Effetti Eventi di Massa
- **Chiusura Città**: Quarentena forzata
- **Migrazione**: Popolazione fugge zone infette
- **Crisi Economica**: Commercio interrotto
- **Intervento Autorità**: Misure sanitarie obbligatorie

## 🎮 Gestione Malattie

### Comandi Disponibili
```
/malattia infect <malattia> <bersaglio>    # Infetta personaggio
/malattia cure <metodo>                    # Tenta cura malattia
/malattia status                           # Stato malattie attive
/malattia symptoms                         # Sintomi attuali
/malattia progression                      # Progressione malattia
/malattia diseases                         # Lista malattie disponibili
/malattia contagion <malattia>             # Info contagio malattia
/malattia treatments <malattia>            # Cure disponibili
```

### Eventi Giornalieri
```
/malattia daily                            # Eventi giornalieri malattia
/malattia roll <malattia>                  # Tiro progressione malattia
/malattia heal <malattia>                  # Tenta guarigione
```

## 🔬 Ricerca e Sviluppo

### Studio Malattie
- **Ricerca Accademica**: Studiare cause e cure
- **Esperimenti**: Testare trattamenti
- **Documentazione**: Registrare osservazioni

### Sviluppo Cure
- **Erbe Medicinali**: Scoprire nuove piante curative
- **Pozioni**: Creare elisir magici
- **Trattamenti**: Sviluppare protocolli medici

## 📈 Integrazione Sistemi

### Infamia e Compagnia
- **Malattie Compagnia**: Possono diffondersi tra membri
- **Cure Collettive**: Guarigione di gruppo
- **Reputazione**: Compagnie sane più rispettate

### Haven
- **Infermeria**: Stanze per cure e quarantena
- **Erboristeria**: Produzione erbe medicinali
- **Cappella**: Cure divine per malattie

### Lavori Sporchi
- **Epidemie Opportunità**: Lavori durante epidemie
- **Cure Contrabbando**: Medicinali illegali
- **Ricerca Pericolosa**: Studiare malattie rischiose

## 🏆 Achievement Medici

### Traguardi Medici
- **Primo Guaritore**: Prima malattia curata
- **Specialista**: 10 malattie diverse curate
- **Salvatore**: Salvato villaggio da epidemia
- **Ricercatore**: Scoperto nuova cura

### Ricompense
- **Titolo Medico**: Riconoscimento professionale
- **Clientela Ricca**: Pazienti facoltosi
- **Immunità Locale**: Accesso zone in quarantena

## ⚙️ Configurazione

### Impostazioni Malattie
- **Contagio Automatico**: Se malattie si trasmettono automaticamente
- **CD Contagio Base**: Difficoltà evitare contagio
- **Durata Malattie**: Moltiplicatore durata
- **Cure Disponibili**: Quali metodi cura attivi

### Eventi Epidemici
- **Frequenza Epidemie**: Ogni quanto eventi epidemici
- **Severità Base**: Pericolosità epidemie
- **Zone Colpite**: Aree più suscettibili

## 📊 Analytics

### Statistiche Tracciate
- **Malattie Contratte**: Frequenza per malattia
- **Cure Utilizzate**: Metodi cura più efficaci
- **Epidemie Affrontate**: Eventi epidemici risolti
- **Morti per Malattia**: Statistiche mortalità

### Report Disponibili
```javascript
// Report malattie settimanale
game.brancalonia.analytics.generateDiseasesReport()

// Statistiche giocatore
game.brancalonia.analytics.getPlayerDiseaseStats(actor)
```

---

Il Sistema Malattie aggiunge realismo e pericolo al mondo di gioco, forzando i giocatori a considerare igiene, medicina e sopravvivenza oltre al semplice combattimento.

