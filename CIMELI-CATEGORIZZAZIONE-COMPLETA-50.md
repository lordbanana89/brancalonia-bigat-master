# 📊 Categorizzazione Operativa – 50 Cimeli Maledetti

## 📌 Obiettivo
Questo documento descrive, per ciascuno dei 50 cimeli presenti nel database (`database/equipaggiamento/cimeli`), come trasformare le loro proprietà in meccaniche reali all’interno del modulo Foundry Brancalonia. Per ogni oggetto trovi:

1. **Riferimenti JSON** – File nel DB, campi esistenti da preservare.
2. **Descrizione & Maledizione** – Dal manuale / database.
3. **Uso in gioco** – Come i giocatori e il GM dovrebbero utilizzarlo.
4. **Integrazione tecnica** – Flag, Active Effect, hook o macro da implementare nel codice (`modules/brancalonia-active-effects.js`, sistemi vari…).
5. **Azioni da fare** – Passi concreti che gli sviluppatori devono seguire.
6. **Icona suggerita** – Path da usare nel compendio (tutte le icone sono della libreria Foundry gratuita `icons/` a meno di asset custom).

> 💡 **Nota generale**: quando si parla di “nuovo hook” o “nuova funzione”, si intende estendere i file esistenti (ad es. creare `modules/brancalonia-cimeli.js` oppure aggiungere sezioni a `brancalonia-active-effects.js`). Ogni volta che serve un contatore o un reset, utilizzare `flags.brancalonia.cimeli.*` con struttura `{ uses, lastReset, ... }` per mantenere coerenza.

---

## 🧩 Linee guida comuni

- **Active Effects**: registrare gli effetti nel generatore `modules/data/active-effects-registry-generated.js` (chiave = slug nome) e richiamarli tramite `BrancaloniaActiveEffects.applyCimelio(actor, 'slug')`.
- **Flag e Tracking**: usare `actor.setFlag('brancalonia-bigat', 'cimeli.<nomeFlag>', valore)` per contatori e stati.
- **Dialog/Script**: centralizzare le logiche di consumo (es. sorsi, usi giornalieri) in un nuovo modulo helper `modules/brancalonia-cimeli-manager.js` con API:
  - `CimeliManager.consumeUse(actor, cimelioId)`
  - `CimeliManager.resetDailyFlags()` (chiamato da un hook giornaliero o macro GM).
- **Icone**: uniformare i riferimenti negli item JSON (`img`), così da evitare placeholder.

---

## 📚 Elenco dettagliato

### #001 – L'Anello del Vescovo Ladrone (`001_lanello_del_vescovo_ladrone.json`)
- **Descrizione**: vantaggio Inganno (religione) ; maledizione = svantaggio TS contro effetti divini.
- **Uso**: equipaggiamento sempre attivo.
- **Integrazione**:
  - AE1 `system.skills.dec.bonuses.check = +1` (filtrare prove su religione tramite Midi-QoL `rollOption`).
  - AE2 Flag `flags.dnd5e.disadvantage.save.wis = 1` quando `item.tags` contiene `divine` (richiede check in hook `dnd5e.preRollSavingThrow`).
- **Azioni**: aggiungere logica condizionale in `CompatibilityFix` per intercettare prove religiose; aggiornare registry AE.
- **Icona**: `icons/equipment/finger/ring-cabochon-gold-red.webp`

### #002 – La Bisaccia del Pellegrino Morto (`002_la_bisaccia_del_pellegrino_morto.json`)
- **Descrizione**: genera 1 razione + 1 fiasca ogni alba; maledizione sapore pessimo.
- **Uso**: attivazione al passaggio dell’alba.
- **Integrazione**:
  - Flag `flags.brancalonia.cimeli.bisaccia.lastReset`.
  - Funzione `CimeliManager.resetDaily()` crea items `ration` e `waterskin` nell’inventario del portatore.
  - Chat whisper GM con flavour “Cibo sa di cenere”.
- **Icona**: `icons/containers/bags/satchel-leather-brown.webp`

### #003 – Il Boccale del Gigante Ubriacone (`003_il_boccale_del_gigante_ubriacone.json`)
- **Descrizione**: birra infinita; dopo 3 sorsi TS CON CD 15 o condizione “Ubriaco” (già gestita).
- **Uso**: interazione rapida; bottoni UI.
- **Integrazione**:
  - Flag `flags.brancalonia.cimeli.boccale.sips` (reset giornaliero).
  - Macro `CimeliManager.drinkBoccale(actor)` con dialog che incrementa sorsi e applica condizione via `BrancaloniaConditions.apply('ubriaco')`.
- **Icona**: `icons/consumables/drinks/beer-stein-brown.webp`

### #004 – La Corda dell'Impiccato Innocente (`004_la_corda_dellimpiccato_innocente.json`)
- **Descrizione**: impossibile da spezzare; sensazione soffocamento.
- **Uso**: narrativo (GM).
- **Integrazione**: aggiungere nota automatica nella descrizione via `renderItemSheet` (callout “Chi la tocca prova soffocamento”).
- **Icona**: `icons/tools/fasteners/rope-noose-brown.webp`

### #005 – I Dadi del Diavolo (`005_i_dadi_del_diavolo.json`)
- **Descrizione**: doppio 6 = vittoria; doppio 1 = anima vincolata.
- **Uso**: gioco d’azzardo.
- **Integrazione**:
  - Funzione `CimeliManager.rollDevilDice(actor)` → tira 2d6, gestisce outcome e applica flag `flags.brancalonia.cimeli.dadi.maledizione=true` (DM rimuove quando “vinci scommessa impossibile”).
- **Icona**: `icons/sundries/gaming/dice-runed-brown.webp`

### #006 – L'Elmo del Cavaliere Codardo (`006_lelmo_del_cavaliere_codardo.json`)
- **Descrizione**: +1 CA, svantaggio TS paura.
- **Integrazione**: AE `system.attributes.ac.bonus=+1`; `flags.dnd5e.disadvantage.save.wis = 1` (filtrare `fear`).
- **Icona**: `icons/equipment/head/helm-barbute-tan.webp`

### #007 – Il Fazzoletto della Dama Nera (`007_il_fazzoletto_della_dama_nera.json`)
- **Descrizione**: vantaggio Carisma con sesso opposto, TS Sag o innamorato.
- **Integrazione**:
  - AE condizionale Carisma (Midi: `effect.data.changes` con macro `if (target.gender!=actor.gender)`).
  - Flag `flags.brancalonia.cimeli.fazzoletto.infatuato` con durata 24h; condizione custom “Infatuato”.
- **Icona**: `icons/tools/scribal/ink-quill-orange.webp`

### #008 – Il Guanto del Boia (`008_il_guanto_del_boia.json`)
- **Descrizione**: percepisce menzogne sulla colpevolezza.
- **Integrazione**: macro `CimeliManager.judgeGuilt(actor, target)` → se target mente, invia whisper GM/giocatore.
- **Icona**: `icons/tools/fasteners/glove-leather-red.webp`

### #009 – L'Idolo Pagano (`009_lidolo_pagano.json`)
- **Descrizione**: domanda sì/no; costo 1 PF permanente.
- **Integrazione**:
  - Dialog `askIdolo(actor)` → `actor.update({'system.attributes.hp.max': current-1})`.
  - Flag `flags.brancalonia.cimeli.idolo.lastQuestion` (reset giornaliero).
- **Icona**: `icons/sundries/idols/idol-stone-yellow.webp`

### #010 – La Lanterna del Guardiano del Faro (`010_la_lanterna_del_guardiano_del_faro.json`)
- **Descrizione**: darkvision + rivela invisibili; attira spiriti.
- **Integrazione**:
  - AE: `system.attributes.senses.darkvision = Math.max(current,120)` + `flags.brancalonia.seeInvisible = true`.
  - Flag per GM: `flags.brancalonia.cimeli.lanterna.attractSpirits = true` → encounter planner.
- **Icona**: `icons/sundries/lights/lantern-iron-yellow.webp`

### #011 – La Maschera del Carnefice (`011_la_maschera_del_carnefice.json`)
- **Descrizione**: +2 Intimidire; anonimato; non rimovibile 24h.
- **Integrazione**:
  - AE: `system.skills.itm.bonuses.check = +2`.
  - Timer: flag `flags.brancalonia.cimeli.maschera.expire`. Trigger `preDeleteItem` blocca rimozione finché `Date.now() < expire`.
- **Icona**: `icons/equipment/head/mask-carved-scream-tan.webp`

### #012 – Il Naso di Pinocchio (`012_il_naso_di_pinocchio.json`)
- **Meccanica**: notifica se fallisce tiro Inganno → chat “Il naso si allunga!”
- **Icona**: `icons/equipment/head/mask-carved-tan.webp`

### #013 – L'Occhio di Vetro del Pirata (`013_locchio_di_vetro_del_pirata.json`)
- **Integrazione**: AE su senses; flag `flags.brancalonia.cimeli.occhioSacrificato=true` (perdite permanenti).
- **Icona**: `icons/commodities/gems/pearl-brown-grey.webp`

### #014 – Il Pennello del Pittore Maledetto (`014_il_pennello_del_pittore_maledetto.json`)
- **Uso**: narrativo; creare flag `flags.brancalonia.cimeli.pennello.targetActorId` per tenere traccia del ritratto attivo.
- **Icona**: `icons/tools/scribal/brush-simple-brown.webp`

### #015 – La Pipa del Filosofo (`015_la_pipa_del_filosofo.json`)
- **Integrazione**:
  - AE buff INT (durata 10 min).
  - AE debuff CON (durata 1h) schedulato dopo 10 min via `setTimeout`/`EffectDurationManager`.
- **Icona**: `icons/tools/cooking/pipe-brown.webp`

### #016 – Il Quadrifoglio Appassito (`016_il_quadrifoglio_appassito.json`)
- **Integrazione**: flag `usesDaily`, `usesTotal`; hook reroll.
- **Icona**: `icons/magic/nature/leaf-clover-inscribed.webp`

### #017 – La Rosa di Ferro (`017_la_rosa_di_ferro.json`)
- **Integrazione**: flag durata fino tramonto; auto-success Persuasione = `Midi` effect che imposta `rollResult = targetDC`.
- **Icona**: `icons/magic/nature/rose-thorned-red.webp`

### #018 – Lo Specchio della Strega (`018_lo_specchio_della_strega.json`)
- **Integrazione**: macro con d20; se 1 mostra orrore e applica condizione “Spaventato”.
- **Icona**: `icons/sundries/misc/mirror-hand-steel.webp`

### #019 – Il Teschio del Santo Eretico (`019_il_teschio_del_santo_eretico.json`)
- **Integrazione**: aura condizione immunità; usare ActiveAuras se presente, altrimenti hook `midi-qol.RollComplete`.
- **Icona**: `icons/magic/death/skull-humanoid-crown-white.webp`

### #020 – L'Ultimo Chiodo della Croce (`020_lultimo_chiodo_della_croce.json`)
- **Integrazione**: hook `dnd5e.rollDamage` moltiplica danno vs `fiend/undead`.
- **Icona**: `icons/tools/fasteners/nail-steel.webp`

### #021 – Il Violino del Diavolo (`021_il_violino_del_diavolo.json`)
- **Uso**: affascina ascoltatori, costo 1 giorno vita.
- **Integrazione**: flag `flags.brancalonia.cimeli.violino.lifeDebt += 1`; condizione `Charmed` applicata a `targets` con throw.
- **Icona**: `icons/tools/instruments/lute-gold-brown.webp`

### #022 – La Zappa del Contadino Ribelle (`022_la_zappa_del_contadino_ribelle.json`)
- **Integrazione**: AE `system.bonuses.mwak.attack/damage` +1 se target `actor.hasTag('nobile'|'soldato')`.
- **Icona**: `icons/tools/farming/hoe-simple-steel-brown.webp`

### #023 – L'Ampolla di Sangue di San Geniale (`023_lampolla_di_sangue_di_san_geniale.json`)
- **Integrazione**: flag `dangerDetector` invia notifica al GM quando si attiva (hook `updateCombat` o `checkForDanger` custom).
- **Icona**: `icons/consumables/potions/bottle-round-corked-red.webp`

### #024 – Il Bastone del Mendicante Re (`024_il_bastone_del_mendicante_re.json`)
- **Integrazione**: reminder DM; può dare bonus `Downtime` (no AE).
- **Icona**: `icons/weapons/staves/staff-simple-spiral-green.webp`

### #025 – La Catena del Cane Infernale (`025_la_catena_del_cane_infernale.json`)
- **Integrazione**:
  - AE condizionale `restrained` su target fallisce TS Forza 30.
  - Flag `flags.brancalonia.cimeli.catena.attractHounds = true` (DM trigger encounter).
- **Icona**: `icons/tools/fasteners/chain-iron-steel.webp`

### #026 – Il Diario del Condannato (`026_il_diario_del_condannato.json`)
- **Integrazione**: script che aggiunge voce al Journal globale quando il portatore commette peccati (hook `createChatMessage`).
- **Icona**: `icons/sundries/books/book-worn-brown-blue.webp`

### #027 – L'Elmetto del Soldato Sconosciuto (`027_lelmetto_del_soldato_sconosciuto.json`)
- **Integrazione**: AE `stealth advantage`; flag `memoryFog` per NPC/PG (DM reminder).
- **Icona**: `icons/equipment/head/helm-barbute-steel.webp`

### #028 – Il Ferro di Cavallo Fortunato (`028_il_ferro_di_cavallo_fortunato.json`)
- **Integrazione**: flag `usesDaily`, `usesTotal=77`; hook `dnd5e.preRollAttack` per convertire critico.
- **Icona**: `icons/commodities/metal/horseshoe-steel.webp`

### #029 – Il Grimorio dello Studente Suicida (`029_il_grimorio_dello_studente_suicida.json`)
- **Integrazione**: quando si apprende incantesimo -> `actor.update({'system.abilities.wis.value': -1})`; traccia incantesimi appresi (`flags.brancalonia.cimeli.grimorio.learnedSpellIds`).
- **Icona**: `icons/sundries/books/book-symbol-eye-purple.webp`

### #030 – Il Crocifisso Capovolto (`030_il_crocifisso_capovolto.json`)
- **Integrazione**: flag `antiDemonAura`; GM: +5 TS vs demoni (AE) ma applica condizione `SuspectedHeretic` nelle città religiose.
- **Icona**: `icons/magic/symbols/cross-stone-green.webp`

### #031 – La Moneta del Traghettatore (`031_la_moneta_del_traghettatore.json`)
- **Integrazione**: flag `hasResurrection` e hook `updateActor` → se HP <=0 e flag true, ripristina a 1 HP e set flag false.
- **Icona**: `icons/commodities/currency/coin-embossed-skull-gold.webp`

### #032 – L'Orecchio del Confessore (`032_lorecchio_del_confessore.json`)
- **Integrazione**: macro `listenConfessions` (whisper GM). Flag `hallucinations` se troppo usato.
- **Icona**: `icons/commodities/biological/organ-heart-pink.webp`

### #033 – Il Pugnale del Traditore (`033_il_pugnale_del_traditore.json`)
- **Integrazione**: AE +3 attacco/danni contro `friendly` target (Midi macro). TS SAG CD15 per non attaccare.
- **Icona**: `icons/weapons/daggers/dagger-straight-blood.webp`

### #034 – La Ruota della Tortura (`034_la_ruota_della_tortura.json`)
- **Integrazione**: flag `touchedTargets` (array actorId, expire 24h). Azione: `dealPsychicDamage(target, 1d4)`
- **Icona**: `icons/tools/fasteners/wheel-spoked-tan.webp`

### #035 – Lo Stendardo Strappato (`035_lo_stendardo_strappato.json`)
- **Integrazione**: Aura 9m (ActiveAuras) → vantaggio vs paura; flag `cannotRetreat` con penalità se tenta fuga.
- **Icona**: `icons/equipment/waist/banner-flag-red.webp`

### #036 – Il Tamburo di Guerra Silenzioso (`036_il_tamburo_di_guerra_silenzioso.json`)
- **Integrazione**: hook `rollInitiative` per dare vantaggio agli alleati entro 18m; `chatMessage` di ritmo telepatico.
- **Icona**: `icons/tools/instruments/drum-tan.webp`

### #037 – L'Uncino del Pirata Fantasma (`037_luncino_del_pirata_fantasma.json`)
- **Integrazione**: AE `attack` su creature incorporee (midi condition check). Flag `armParalyzed` in tempeste (DM).
- **Icona**: `icons/commodities/metal/hook-iron.webp`

### #038 – La Veste del Monaco Apostata (`038_la_veste_del_monaco_apostata.json`)
- **Integrazione**: AE `flags.brancalonia.noDivination = true`; hook su `SceneControl` per bloccare ingresso luoghi consacrati (messaggio).
- **Icona**: `icons/equipment/chest/robe-layered-white-purple.webp`

### #039 – Lo Zufolo del Pifferaio (`039_lo_zufolo_del_pifferaio.json`)
- **Integrazione**: macro che chiama `animateAnimals`/*charmChildren*; flag `lostControl` se fallisce TS Carisma (CD15).
- **Icona**: `icons/tools/instruments/flute.simple-bone.webp`

### #040 – L'Anello Spezzato (`040_lanello_spezzato.json`)
- **Integrazione**: flag `otherHalfOwnerId`; se due attori hanno flag reciprocamente → uno controlla l’altro (condizione `Dominated`).
- **Icona**: `icons/equipment/finger/ring-signet-gold.webp`

### #041 – Il Bicchiere Avvelenato (`041_il_bicchiere_avvelenato.json`)
- **Integrazione**: macro `neutralizePoison(item)` se bevanda = veleno; track `poisonedWater=true` se acqua pura (alert).
- **Icona**: `icons/consumables/drinks/goblet-ornate-gold.webp`

### #042 – La Candela del Vegliardo (`042_la_candela_del_vegliardo.json`)
- **Integrazione**: AE `removeExhaustion`; flag `flags.brancalonia.lifeCost += 1` per ogni notte.
- **Icona**: `icons/sundries/lights/candle-pillar-red.webp`

### #043 – Il Dado del Destino (`043_il_dado_del_destino.json`)
- **Integrazione**: macro `forceRollResult(actor, result)` una volta nella vita; flag `used=true`.
- **Icona**: `icons/sundries/gaming/dice-ornate-blue.webp`

### #044 – L'Elmo del Generale Sconfitto (`044_lelmo_del_generale_sconfitto.json`)
- **Integrazione**: AE `system.abilities.cha.value +2`, `system.abilities.int.value -2` attivi insieme.
- **Icona**: `icons/equipment/head/helm-bascinet-steel.webp`

### #045 – La Fiala delle Lacrime di Gioia (`045_la_fiala_delle_lacrime_di_gioia.json`)
- **Integrazione**: AE rimuove condizioni negative tipo `Depressed` per 7 giorni; schedule debuff dopo 8° giorno (`CimeliManager.scheduleEffect`).
- **Icona**: `icons/consumables/potions/bottle-round-corked-pink.webp`

### #046 – Il Guanto del Duellante (`046_il_guanto_del_duellante.json`)
- **Integrazione**: macro `challengeDuel(target)` → se rifiuta, AE `system.abilities.cha.value -4` per 30 giorni (calcolati in `game.time.worldTime`).
- **Icona**: `icons/equipment/hand/glove-fancy-blue.webp`

### #047 – L'Icona Piangente (`047_licona_piangente.json`)
- **Integrazione**: flag `cryingTimestamp` = 24h prima evento; GM deve pianificare disgrazie; notifica automatica.
- **Icona**: `icons/magic/death/skull-angel-wings.webp`

### #048 – La Lettera Mai Consegnata (`048_la_lettera_mai_consegnata.json`)
- **Integrazione**: AE advantage Survival (navigazione); flag `returnHome=true` per eventuale teletrasporto narrativo.
- **Icona**: `icons/sundries/scrolls/scroll-bound-blue.webp`

### #049 – La Mappa del Tesoro Maledetto (`049_la_mappa_del_tesoro_maledetto.json`)
- **Integrazione**: DM tool: generare quest con tesoro < costo; flag `lastTreasureValue` per storicizzare.
- **Icona**: `icons/sundries/documents/document-treasure-map.webp`

### #050 – La Spada Spezzata dell'Eroe (`050_la_spada_spezzata_delleroe.json`)
- **Integrazione**: AE base +2; se `flags.brancalonia.cimeli.spada.riforgiata=true` passa a +5 (macro `forgeHeroSword`).
- **Icona**: `icons/weapons/swords/sword-bastard-broadfire.webp`

---

## 📋 Riepilogo task di sviluppo
- Creare `modules/brancalonia-cimeli-manager.js` con tutte le funzioni menzionate.
- Ampliare `brancalonia-active-effects.js` con nuovi effetti dove indicato.
- Aggiornare gli item JSON aggiungendo `img` suggerite, eventuali flag/metadata (`implementazione.active_effects` con slug).
- Aggiornare la documentazione utenti (macro, comandi) quando si introducono nuove UI.
- Aggiornare i test (se presenti) o scriverne di nuovi per gli hook critici (es. reroll, damage multiplier).

## ✅ Stato
La mappatura e le istruzioni operative sono ora complete per tutti i 50 cimeli. Ogni voce del database ha una chiara traduzione in logica Foundry pronta per essere implementata.


