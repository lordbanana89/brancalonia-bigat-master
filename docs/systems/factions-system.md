# 🏛️ Sistema Fazioni - Brancalonia

Il Sistema Fazioni gestisce le organizzazioni potenti, le alleanze politiche e le rivalità nel Regno di Taglia.

## 🏰 Fazioni Principali

### Chiesa Calendaria
- **Tipo**: Religiosa
- **Allineamento**: Legale Buono
- **Potere**: 9/10
- **Sede**: Vaticantica
- **Leader**: Papa Innocenzo XXIII
- **Risorse**: 10.000 mo, 500 soldati, 100 chierici
- **Influenza**: Nazionale, controllo morale popolazione

### Nobiltà
- **Tipo**: Politica
- **Allineamento**: Legale Neutrale
- **Potere**: 8/10
- **Sede**: Varie città principali
- **Leader**: Duchi e conti locali
- **Risorse**: Terre, castelli, soldati privati
- **Influenza**: Locale, controllo terre e tasse

### Gilde Mercantili
- **Tipo**: Economica
- **Allineamento**: Neutrale
- **Potere**: 7/10
- **Sede**: Porti commerciali
- **Leader**: Maestri di gilda
- **Risorse**: Commercio, navi, magazzini
- **Influenza**: Economica, controllo mercati

### Ordine Draconiano
- **Tipo**: Militare
- **Allineamento**: Legale Neutrale
- **Potere**: 8/10
- **Sede**: Caserme principali
- **Leader**: Gran Maestro
- **Risorse**: Cavalieri, armi, fortezze
- **Influenza**: Militare, sicurezza regno

## 📊 Sistema Reputazione Fazione

### Livelli Reputazione
| Livello | Nome | Benefici |
|---------|------|----------|
| **0-25** | Sconosciuto | Nessun beneficio |
| **25-50** | Conosciuto | Informazioni base |
| **50-75** | Alleato | Sconti servizi 10% |
| **75-90** | Onorato | Accesso privilegiato |
| **90-100** | Venerato | Benefici massimi |

### Reputazione Negativa
- **-25**: Sospetto, controlli aumentati
- **-50**: Nemico, cacciatori attivati
- **-75**: Traditore, taglia attiva
- **-100**: Eretico, esecuzione immediata

## 🎯 Missioni Fazione

### Tipi di Missione

#### Chiesa Calendaria
- **Recupero Reliquie**: Ritrovare oggetti sacri perduti
- **Eliminazione Eretici**: Rimuovere minacce religiose
- **Raccolta Decime**: Riscossione tasse ecclesiastiche
- **Conversione Pagani**: Convertire popolazioni rurali

#### Nobiltà
- **Raccolta Tasse**: Riscossione tributi contadini
- **Caccia Briganti**: Eliminazione banditi locali
- **Diplomatico**: Negoziazione trattati
- **Gestione Terre**: Supervisione proprietà

#### Gilde Mercantili
- **Scorta Carovane**: Protezione commercianti
- **Contrabbando**: Trasporto merci illegali
- **Spionaggio Economico**: Informazioni concorrenti
- **Gestione Porti**: Controllo traffici marittimi

#### Ordine Draconiano
- **Pattugliamento**: Sorveglianza strade
- **Caccia Mostri**: Eliminazione creature pericolose
- **Addestramento**: Formazione nuove reclute
- **Difesa Confini**: Protezione frontiere

## 🏆 Sistema Gradi Fazione

### Chiesa Calendaria
- **Fedele** (0+): Membro base
- **Accolito** (10+): Assistente chierici
- **Chierico** (25+): Sacerdote minore
- **Canonico** (50+): Sacerdote importante
- **Vescovo** (75+): Alto prelato
- **Cardinale** (90+): Membro curia

### Nobiltà
- **Paggio** (0+): Servitore nobile
- **Scudiero** (10+): Assistente cavaliere
- **Cavaliere** (25+): Cavaliere armato
- **Barone** (50+): Nobile minore
- **Conte** (75+): Nobile maggiore
- **Duca** (90+): Alto nobile

### Gilde Mercantili
- **Apprendista** (0+): Lavorante
- **Artigiano** (10+): Membro qualificato
- **Maestro** (25+): Artigiano esperto
- **Mercante** (50+): Commerciante indipendente
- **Maestro di Gilda** (75+): Dirigente gilda
- **Gran Maestro** (90+): Leader supremo

### Ordine Draconiano
- **Recluta** (0+): Soldato base
- **Soldato** (10+): Guerriero addestrato
- **Sergente** (25+): Sottufficiale
- **Cavaliere** (50+): Cavaliere armato
- **Capitano** (75+): Ufficiale
- **Gran Maestro** (90+): Leader ordine

## 💰 Benefici Fazione

### Benefici Chiesa
- **Cure Gratuite**: Guarigione senza costo
- **Alloggio Monasteri**: Riparo sicuro
- **Protezione Legale**: Immunità diplomatica
- **Benedizioni**: Bonus spirituali

### Benefici Nobiltà
- **Terre**: Possesso proprietà terriere
- **Titoli**: Riconoscimento sociale
- **Matrimoni**: Alleanze matrimoniali
- **Esercito Privato**: Soldati personali

### Benefici Mercanti
- **Sconti Commercio**: Riduzioni prezzi
- **Navi**: Accesso flotte mercantili
- **Magazzini**: Deposito sicuro merci
- **Informazioni**: Rete spionaggio commerciale

### Benefici Militari
- **Addestramento**: Formazione combattimento
- **Equipaggiamento**: Armi e armature
- **Fortezze**: Accesso basi militari
- **Cavalli**: Cavalcature da guerra

## ⚔️ Guerre tra Fazioni

### Eventi di Guerra Fazione
- **Guerre Religiose**: Chiesa vs culti eretici
- **Guerre Nobiliari**: Dispute territoriali
- **Guerre Economiche**: Concorrenza commerciale
- **Guerre Militari**: Conflitti armati

### Conseguenze Guerra
- **Cambio Territorio**: Ridistribuzione terre
- **Cambio Leadership**: Nuovi leader emergono
- **Cambio Alleanze**: Riallineamento fazioni
- **Cambio Economia**: Impatto commerciale

## 🎮 Gestione Fazioni

### Comandi Disponibili
```
/fazione join <fazione>                    # Unisciti a fazione
/fazione leave                             # Abbandona fazione
/fazione reputation <fazione> <valore>     # Modifica reputazione
/fazione status <fazione>                  # Stato fazione
/fazione quests <fazione>                  # Missioni disponibili
/fazione ranks <fazione>                   # Gradi fazione
/fazione benefits <fazione>                # Benefici reputazione
/fazione war <fazione1> <fazione2>         # Inizia guerra fazioni
/fazione peace <fazione1> <fazione2>       # Termina guerra
```

### Eventi Fazione
```
/fazione events                            # Eventi fazione attivi
/fazione meetings                          # Riunioni fazione
/fazione ceremonies                        # Cerimonie fazione
/fazione promotions                        # Promozioni membri
```

## 🏅 Achievement Fazione

### Traguardi Fazione
- **Primo Alleato**: Prima alleanza formata
- **Fazione Dominante**: Fazione più potente mondo
- **Pacificatore**: Terminata guerra importante
- **Traditore**: Abbandonato fazione per altra

### Ricompense Achievement
- **Titoli Nobiliari**: Riconoscimento ufficiale
- **Terre**: Possesso proprietà
- **Immunità**: Protezione speciale
- **Risorse**: Accesso risorse fazione

## ⚙️ Configurazione

### Impostazioni Fazioni
- **Guerre Abilitate**: Se fazioni combattono
- **Missioni Automatiche**: Generazione missioni automatiche
- **Eventi Fazione**: Frequenza eventi fazione
- **Diplomazia Attiva**: Interazioni diplomatiche

### Eventi Speciali
- **Concili Ecclesiastici**: Riunioni religiose
- **Tornei Nobiliari**: Competizioni aristocratiche
- **Fiere Mercantili**: Eventi commerciali
- **Parate Militari**: Dimostrazioni forza

## 📊 Integrazione Altri Sistemi

### Infamia
- **Reputazione Influenza Infamia**: Alta reputazione riduce infamia
- **Fazioni Proteggono**: Fazioni possono proteggere membri
- **Taglie Ridotte**: Reputazione alta riduce taglie

### Compagnia
- **Compagnie Fazione**: Compagnie affiliate fazioni
- **Missioni Fazione**: Lavori speciali per fazioni
- **Alleanze Compagnia-Fazione**: Benefici reciproci

### Duelli
- **Campioni Fazione**: Duellanti rappresentano fazioni
- **Duelli Politici**: Risoluzione dispute diplomatiche
- **Sfide d'Onore**: Mantenimento reputazione fazione

## 🌍 Influenza Territoriale

### Zone di Influenza
- **Territorio Chiesa**: Aree sotto controllo religioso
- **Feudi Nobiliari**: Terre controllate da nobili
- **Porti Mercantili**: Zone commerciali
- **Forte militari**: Aree sotto controllo militare

### Modificatori Territoriali
- **Chiesa**: +20% infamia crimini religiosi
- **Nobili**: +15% infamia crimini contro nobili
- **Mercanti**: -10% costi commerciali
- **Militari**: +10% sicurezza generale

## 📈 Analytics

### Statistiche Tracciate
- **Fazioni Più Potenti**: Classifica potere fazioni
- **Guerre Più Lunghe**: Conflitti più duraturi
- **Missioni Completate**: Success rate missioni
- **Membri Più Attivi**: Partecipazione giocatori

### Report Disponibili
```javascript
// Report fazioni settimanale
game.brancalonia.analytics.generateFactionsReport()

// Statistiche giocatore
game.brancalonia.analytics.getPlayerFactionStats(actor)
```

---

Il Sistema Fazioni aggiunge profondità politica e sociale al mondo di gioco, permettendo ai giocatori di influenzare il Regno di Taglia attraverso alleanze e rivalità organizzate.

