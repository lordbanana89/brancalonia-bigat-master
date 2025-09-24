#!/bin/bash

# Script per creare le regole rimanenti

cat > /Users/erik/Desktop/brancalonia-bigat-master/packs/regole/_source/gioco-azzardo.json << 'EOF'
{
  "_id": "giocoAzzardo001",
  "name": "Gioco d'Azzardo e Scommesse",
  "type": "journalEntry",
  "img": "icons/commodities/treasure/playing-dice.webp",
  "system": {},
  "pages": [
    {
      "_id": "giocoAzzardo001_page_1",
      "name": "Gioco d'Azzardo",
      "type": "text",
      "title": {
        "show": true,
        "level": 1
      },
      "text": {
        "format": 1,
        "content": "<h1>🎲 Gioco d'Azzardo e Scommesse</h1><p><em>\"Nel Regno si dice: Chi non rischia non rosica, ma chi troppo rischia finisce in mutande!\"</em></p><h2>🃏 Giochi Popolari</h2><h3>Zara (Dadi)</h3><table><thead><tr><th>Puntata</th><th>Tiro</th><th>Vincita</th></tr></thead><tbody><tr><td>Pari/Dispari</td><td>3d6</td><td>1:1</td></tr><tr><td>Alto/Basso (10+/-)</td><td>3d6</td><td>1:1</td></tr><tr><td>Numero Esatto</td><td>3d6</td><td>10:1</td></tr><tr><td>Tripla</td><td>3d6 uguali</td><td>30:1</td></tr></tbody></table><h3>Briscola Sporca</h3><ul><li><strong>Carte:</strong> Mazzo da 40, 3 carte a testa</li><li><strong>Abilità:</strong> Inganno vs Intuizione</li><li><strong>Barare:</strong> Rapidità di Mano CD 15</li><li><strong>Posta:</strong> 1-50 mo per mano</li></ul><h3>Morra Cinghialesca</h3><ul><li><strong>Meccanica:</strong> Predire somma dita</li><li><strong>Tiro:</strong> Intuizione CD 12</li><li><strong>Ubriachi:</strong> Svantaggio ma +50% vincita</li></ul><h2>💰 Scommesse</h2><h3>Corse di Maiali</h3><table><thead><tr><th>Maiale</th><th>Quote</th><th>Trucco</th></tr></thead><tbody><tr><td>Favorito</td><td>2:1</td><td>-</td></tr><tr><td>Sfidante</td><td>3:1</td><td>Dopato 25%</td></tr><tr><td>Ronzino</td><td>5:1</td><td>Ubriaco 50%</td></tr><tr><td>Brocco</td><td>10:1</td><td>Addormentato 75%</td></tr></tbody></table><h3>Combattimenti</h3><ul><li><strong>Galli:</strong> Mattina, posta 1-10 mo</li><li><strong>Risse:</strong> Sera, posta 5-50 mo</li><li><strong>Duelli:</strong> Eventi speciali, 50+ mo</li></ul><h2>🎯 Barare</h2><table><thead><tr><th>Metodo</th><th>CD</th><th>Bonus</th><th>Rischio</th></tr></thead><tbody><tr><td>Dadi Truccati</td><td>Investigare 15</td><td>+5 al tiro</td><td>Pestaggio</td></tr><tr><td>Carte Segnate</td><td>Percezione 12</td><td>Conosci 1 carta</td><td>Espulsione</td></tr><tr><td>Complice</td><td>Intuizione 18</td><td>Vedi carte nemico</td><td>Taglia</td></tr><tr><td>Specchio</td><td>Percezione 10</td><td>Vedi riflesso</td><td>Multa</td></tr></tbody></table><h2>⚠️ Conseguenze</h2><table><thead><tr><th>Scoperto a Barare</th><th>Conseguenza</th></tr></thead><tbody><tr><td>Prima volta</td><td>Pestaggio (1d4 batoste)</td></tr><tr><td>Seconda</td><td>Dito tagliato</td></tr><tr><td>Terza</td><td>Bandito dalla città</td></tr><tr><td>Con nobili</td><td>Duello all'alba</td></tr><tr><td>Con criminali</td><td>Fiume con pietre</td></tr></tbody></table><h2>🏆 Tornei</h2><div class='note'><h3>Coppa del Baro</h3><p>Torneo annuale dove barare è incoraggiato. Vince chi bara meglio senza essere scoperto. Premio: 1000 mo + immunità legale per 1 anno.</p></div><h2>📊 Gestire il Gioco</h2><h3>Casa da Gioco</h3><table><thead><tr><th>Servizio</th><th>Costo</th><th>Guadagno/Sera</th></tr></thead><tbody><tr><td>Tavolo Dadi</td><td>50 mo setup</td><td>2d20 mo</td></tr><tr><td>Tavolo Carte</td><td>30 mo setup</td><td>3d10 mo</td></tr><tr><td>Ring Combattimenti</td><td>100 mo setup</td><td>5d20 mo</td></tr><tr><td>Protezione</td><td>20 mo/sera</td><td>Evita raid</td></tr></tbody></table>"
      },
      "video": {
        "controls": true,
        "volume": 0.5
      },
      "src": null,
      "system": {},
      "sort": 0,
      "ownership": {
        "default": -1
      },
      "flags": {},
      "_key": "!pages!giocoAzzardo001_page_1"
    }
  ],
  "folder": null,
  "sort": 0,
  "ownership": {
    "default": 0
  },
  "flags": {},
  "_stats": {
    "systemId": "dnd5e",
    "systemVersion": "3.3.1",
    "coreVersion": "13.347",
    "createdTime": null,
    "modifiedTime": null,
    "lastModifiedBy": null
  },
  "_key": "!journal!giocoAzzardo001"
}
EOF

cat > /Users/erik/Desktop/brancalonia-bigat-master/packs/regole/_source/regole-strada.json << 'EOF'
{
  "_id": "regoleStrada001",
  "name": "Regole della Strada",
  "type": "journalEntry",
  "img": "icons/environment/settlement/wagon-black.webp",
  "system": {},
  "pages": [
    {
      "_id": "regoleStrada001_page_1",
      "name": "Regole della Strada",
      "type": "text",
      "title": {
        "show": true,
        "level": 1
      },
      "text": {
        "format": 1,
        "content": "<h1>🛤️ Regole della Strada</h1><p><em>\"Sulla strada del Regno vigono leggi non scritte più sacre di qualsiasi editto reale.\"</em></p><h2>📜 Il Codice dei Viandanti</h2><div class='note'><h3>Le Cinque Regole Sacre</h3><ol><li>Chi offre ospitalità va rispettato</li><li>Il pane si divide sempre</li><li>Le notizie si scambiano gratis</li><li>I morti sulla strada si seppelliscono</li><li>Il fuoco del campo è sacro</li></ol></div><h2>🏕️ Diritto di Campo</h2><table><thead><tr><th>Luogo</th><th>Permesso</th><th>Tributo</th><th>Protezione</th></tr></thead><tbody><tr><td>Crocevia</td><td>Libero</td><td>-</td><td>Nessuna</td></tr><tr><td>Ponte</td><td>Pedaggio</td><td>2-5 mr</td><td>Guardie</td></tr><tr><td>Bosco Reale</td><td>Vietato</td><td>Multa 10 mo</td><td>Rangers ostili</td></tr><tr><td>Campi Aperti</td><td>Tollerato</td><td>1 mr al contadino</td><td>Cani</td></tr><tr><td>Rovine</td><td>A proprio rischio</td><td>-</td><td>Mostri</td></tr></tbody></table><h2>🤝 Incontri sulla Strada</h2><h3>Protocollo d'Incontro</h3><ol><li><strong>Saluto:</strong> A 30 passi, mano alzata</li><li><strong>Approccio:</strong> Armi abbassate/riposte</li><li><strong>Scambio:</strong> Nome, destinazione, notizie</li><li><strong>Commiato:</strong> Auguri di buon viaggio</li></ol><h3>Segnali di Pericolo</h3><ul><li>⚠️ <strong>Cappuccio alzato:</strong> Non disturbare</li><li>🚫 <strong>Arma in vista:</strong> State lontani</li><li>✋ <strong>Palmo aperto:</strong> Pace/Commercio</li><li>👊 <strong>Pugno chiuso:</strong> Pericolo avanti</li></ul><h2>🛡️ Carovane e Compagnie</h2><table><thead><tr><th>Tipo</th><th>Velocità</th><th>Protezione</th><th>Costo Unirsi</th></tr></thead><tbody><tr><td>Mercanti</td><td>Lenta</td><td>Guardie mercenarie</td><td>5 mo + turni guardia</td></tr><tr><td>Pellegrini</td><td>Media</td><td>Numeri + fede</td><td>Preghiere + storie</td></tr><tr><td>Militare</td><td>Veloce</td><td>Soldati armati</td><td>Servizio ausiliario</td></tr><tr><td>Zingari</td><td>Variabile</td><td>Astuzia + magia</td><td>Intrattenimento</td></tr><tr><td>Nobili</td><td>Comoda</td><td>Scorta pesante</td><td>Non accettano</td></tr></tbody></table><h2>⚖️ Giustizia Stradale</h2><h3>Crimini e Punizioni</h3><table><thead><tr><th>Crimine</th><th>Punizione Tradizionale</th></tr></thead><tbody><tr><td>Rubare a viandante</td><td>Mano tagliata</td></tr><tr><td>Falso pellegrino</td><td>Marchio sulla fronte</td></tr><tr><td>Avvelenare pozzo</td><td>Morte per annegamento</td></tr><tr><td>Brigantaggio</td><td>Impiccagione al crocevia</td></tr><tr><td>Violazione ospitalità</td><td>Esilio e infamia</td></tr></tbody></table><h2>🎭 Figure della Strada</h2><div class='note'><ul><li><strong>Il Vagabondo Saggio:</strong> Offre consigli per cibo</li><li><strong>La Vecchia del Crocevia:</strong> Vende amuleti e maledizioni</li><li><strong>Il Brigante Gentiluomo:</strong> Ruba solo ai ricchi</li><li><strong>Il Falso Pellegrino:</strong> Truffatore con tonaca</li><li><strong>Il Corriere Reale:</strong> Intoccabile per legge</li></ul></div><h2>🗺️ Segnaletica Stradale</h2><table><thead><tr><th>Segno</th><th>Significato</th><th>Chi lo Lascia</th></tr></thead><tbody><tr><td>☠️ Teschio su palo</td><td>Pericolo mortale</td><td>Autorità/Briganti</td></tr><tr><td>🏠 Casa con X</td><td>Peste/Malattia</td><td>Guaritori</td></tr><tr><td>⭐ Stella a 5 punte</td><td>Locanda sicura</td><td>Viaggiatori</td></tr><tr><td>🔄 Spirale</td><td>Territorio magico</td><td>Maghi/Streghe</td></tr><tr><td>➡️ Freccia con numero</td><td>Distanza in giorni</td><td>Mercanti</td></tr></tbody></table><h2>🌙 Viaggi Notturni</h2><h3>Rischi e Regole</h3><ul><li><strong>Mai da soli:</strong> Minimo 3 persone</li><li><strong>Torce sempre:</strong> 1 ogni 2 persone</li><li><strong>Turni guardia:</strong> 2 ore ciascuno</li><li><strong>Fuochi segnale:</strong> 3 fuochi = aiuto</li></ul><h2>💰 Pedaggi e Gabelle</h2><table><thead><tr><th>Passaggio</th><th>Costo Base</th><th>Evitabile Con</th></tr></thead><tbody><tr><td>Ponte</td><td>2 mr a persona</td><td>Guado pericoloso</td></tr><tr><td>Porta città</td><td>5 mr + ispezione</td><td>Corruzione guardie</td></tr><tr><td>Traghetto</td><td>1 mo per carro</td><td>Nuoto (rischio)</td></tr><tr><td>Passo montano</td><td>3 mo carovana</td><td>Sentiero dei contrabbandieri</td></tr></tbody></table><h2>🏃 Diritto di Fuga</h2><p>Un viandante inseguito che raggiunge:</p><ul><li><strong>Chiesa:</strong> Santuario per 3 giorni</li><li><strong>Locanda:</strong> Protezione se paga</li><li><strong>Crocevia:</strong> Può invocare duello</li><li><strong>Confine:</strong> Nuova giurisdizione</li></ul>"
      },
      "video": {
        "controls": true,
        "volume": 0.5
      },
      "src": null,
      "system": {},
      "sort": 0,
      "ownership": {
        "default": -1
      },
      "flags": {},
      "_key": "!pages!regoleStrada001_page_1"
    }
  ],
  "folder": null,
  "sort": 0,
  "ownership": {
    "default": 0
  },
  "flags": {},
  "_stats": {
    "systemId": "dnd5e",
    "systemVersion": "3.3.1",
    "coreVersion": "13.347",
    "createdTime": null,
    "modifiedTime": null,
    "lastModifiedBy": null
  },
  "_key": "!journal!regoleStrada001"
}
EOF

cat > /Users/erik/Desktop/brancalonia-bigat-master/packs/regole/_source/superstizioni-tradizioni.json << 'EOF'
{
  "_id": "superstizioniTradizioni001",
  "name": "Superstizioni e Tradizioni",
  "type": "journalEntry",
  "img": "icons/magic/symbols/runes-triangle-blue.webp",
  "system": {},
  "pages": [
    {
      "_id": "superstizioniTradizioni001_page_1",
      "name": "Superstizioni e Tradizioni",
      "type": "text",
      "title": {
        "show": true,
        "level": 1
      },
      "text": {
        "format": 1,
        "content": "<h1>🔮 Superstizioni e Tradizioni</h1><p><em>\"Nel Regno, anche i più scettici fanno le corna quando passa un gatto nero.\"</em></p><h2>🐈‍⬛ Superstizioni Comuni</h2><table><thead><tr><th>Superstizione</th><th>Effetto se Rispettata</th><th>Conseguenza se Ignorata</th></tr></thead><tbody><tr><td>Gatto nero attraversa</td><td>Tornare indietro</td><td>-2 prossimo tiro</td></tr><tr><td>Camminare sotto scala</td><td>Girarci intorno</td><td>Attiva prossima trappola</td></tr><tr><td>Versare sale</td><td>Gettarne dietro spalla</td><td>-1 tutti i tiri per 1 ora</td></tr><tr><td>Specchio rotto</td><td>Seppellire i pezzi</td><td>7 anni sfortuna (-1 permanente)</td></tr><tr><td>Civetta canta</td><td>Sputare 3 volte</td><td>Qualcuno muore entro 3 giorni</td></tr><tr><td>Aprire ombrello in casa</td><td>Non farlo mai</td><td>Piove per 7 giorni</td></tr></tbody></table><h2>🌙 Tradizioni Lunari</h2><h3>Fasi e Attività</h3><table><thead><tr><th>Fase Lunare</th><th>Propizia Per</th><th>Evitare</th></tr></thead><tbody><tr><td>Luna Nuova</td><td>Maledizioni, rituali oscuri</td><td>Matrimoni, nascite</td></tr><tr><td>Luna Crescente</td><td>Nuovi affari, semina</td><td>Tagliare capelli</td></tr><tr><td>Luna Piena</td><td>Magia, trasformazioni</td><td>Dormire all'aperto</td></tr><tr><td>Luna Calante</td><td>Esorcismi, pulizie</td><td>Iniziare viaggi</td></tr></tbody></table><h2>🎭 Feste Tradizionali</h2><div class='note'><h3>Calendario delle Festività</h3><ul><li><strong>Sbraco (Primavera):</strong> 7 giorni di bagordi</li><li><strong>Notte dei Fuochi (Estate):</strong> Falò contro spiriti</li><li><strong>Vendemmia Maledetta (Autunno):</strong> Vino gratis ma pericoloso</li><li><strong>Festa dei Morti (Inverno):</strong> Lasciare cibo per defunti</li></ul></div><h2>🧿 Amuleti Protettivi</h2><table><thead><tr><th>Amuleto</th><th>Protegge Da</th><th>Costo</th><th>Durata</th></tr></thead><tbody><tr><td>Corno rosso</td><td>Malocchio</td><td>5 ma</td><td>1 mese</td></tr><tr><td>Ferro di cavallo</td><td>Sfortuna generale</td><td>2 mo</td><td>1 anno</td></tr><tr><td>Aglio</td><td>Vampiri e malattie</td><td>1 mr</td><td>1 settimana</td></tr><tr><td>Sale benedetto</td><td>Demoni e spiriti</td><td>1 mo</td><td>1 uso</td></tr><tr><td>Occhio di pavone</td><td>Invidia</td><td>3 mo</td><td>Permanente</td></tr><tr><td>Chiodo arrugginito</td><td>Streghe</td><td>2 ma</td><td>1 notte</td></tr></tbody></table><h2>🎲 Presagi e Segni</h2><table><thead><tr><th>Presagio</th><th>Significato</th><th>Azione Consigliata</th></tr></thead><tbody><tr><td>Corvo alla finestra</td><td>Notizie in arrivo</td><td>Preparare ospitalità</td></tr><tr><td>Prurito mano destra</td><td>Denaro in arrivo</td><td>Non spendere per 3 giorni</td></tr><tr><td>Prurito mano sinistra</td><td>Perdita imminente</td><td>Nascondere valori</td></tr><tr><td>Orecchie fischiano</td><td>Qualcuno parla di te</td><td>Mordere lingua</td></tr><tr><td>Candela si spegne</td><td>Spirito presente</td><td>Dire preghiera</td></tr></tbody></table><h2>🏚️ Luoghi Maledetti</h2><div class='note'><h3>Regole per Luoghi Infestati</h3><ul><li>Mai entrare di venerdì 13</li><li>Portare sempre sale e ferro</li><li>Non guardare negli specchi</li><li>Non pronunciare nomi di morti</li><li>Uscire prima del tramonto</li></ul></div><h2>💀 Rituali Scaramantici</h2><h3>Protezione Casa</h3><ol><li>Sale agli angoli delle stanze</li><li>Ferri di cavallo sopra porte</li><li>Scope capovolte dietro porta</li><li>Specchio verso esterno</li></ol><h3>Prima del Viaggio</h3><ol><li>Mai partire di martedì o venerdì</li><li>Sedersi sui bagagli</li><li>Guardare indietro 3 volte</li><li>Portare pane per il ritorno</li></ol><h2>🎯 Maledizioni Popolari</h2><table><thead><tr><th>Maledizione</th><th>Causa</th><th>Rimozione</th></tr></thead><tbody><tr><td>Malocchio</td><td>Invidia altrui</td><td>Olio in acqua + preghiera</td></tr><tr><td>Fattura</td><td>Strega pagata</td><td>Bruciare effetti personali</td></tr><tr><td>Legamento</td><td>Amore non corrisposto</td><td>Tagliare con forbici benedette</td></tr><tr><td>Sfortuna nera</td><td>Offesa a spiriti</td><td>Pellegrinaggio penitenza</td></tr></tbody></table><h2>🌟 Giorni Fausti e Infausti</h2><table><thead><tr><th>Giorno</th><th>Fausto Per</th><th>Infausto Per</th></tr></thead><tbody><tr><td>Lunedì</td><td>Iniziare lavori</td><td>Matrimoni</td></tr><tr><td>Martedì</td><td>Battaglie</td><td>Viaggi</td></tr><tr><td>Mercoledì</td><td>Commerci</td><td>Prestiti</td></tr><tr><td>Giovedì</td><td>Contratti</td><td>Funerali</td></tr><tr><td>Venerdì</td><td>Amore</td><td>Tutto il resto</td></tr><tr><td>Sabato</td><td>Riposo</td><td>Nuove imprese</td></tr><tr><td>Domenica</td><td>Benedizioni</td><td>Lavoro</td></tr></tbody></table>"
      },
      "video": {
        "controls": true,
        "volume": 0.5
      },
      "src": null,
      "system": {},
      "sort": 0,
      "ownership": {
        "default": -1
      },
      "flags": {},
      "_key": "!pages!superstizioniTradizioni001_page_1"
    }
  ],
  "folder": null,
  "sort": 0,
  "ownership": {
    "default": 0
  },
  "flags": {},
  "_stats": {
    "systemId": "dnd5e",
    "systemVersion": "3.3.1",
    "coreVersion": "13.347",
    "createdTime": null,
    "modifiedTime": null,
    "lastModifiedBy": null
  },
  "_key": "!journal!superstizioniTradizioni001"
}
EOF

echo "Regole create con successo!"