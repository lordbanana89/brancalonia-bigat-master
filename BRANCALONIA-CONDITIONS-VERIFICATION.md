# 🎭 Verifica Modulo: brancalonia-conditions.js

## 📋 Stato della Verifica

**Data**: 2025-10-03  
**Modulo**: `/modules/brancalonia-conditions.js`  
**Stato**: ✅ **VERIFICATO E CORRETTO**

---

## 🎯 Scopo del Modulo

Il modulo `BrancaloniaConditions` gestisce le **condizioni custom specifiche di Brancalonia** che non sono presenti nel sistema D&D 5e standard. Si integra con il sistema di Active Effects di Foundry VTT per applicare modificatori automatici agli attori.

---

## 🔧 Funzionalità Principali

### 1. **Condizioni Custom Disponibili**

#### 🖤 Menagramo
- **Descrizione**: Maledizione che causa svantaggio e penalità alla CA
- **Effetti Meccanici**:
  - Svantaggio a tutti i tiri (`flags.dnd5e.disadvantage.all`)
  - -2 alla CA (`system.attributes.ac.bonus`)
- **Icona**: `icons/magic/unholy/silhouette-horned-evil.webp`

#### 🍺 Ubriaco
- **Descrizione**: Effetti dell'alcol (tipico di Brancalonia)
- **Effetti Meccanici**:
  - -2 Destrezza (`system.abilities.dex.bonuses.check`)
  - -2 Saggezza (`system.abilities.wis.bonuses.check`)
  - +2 Carisma (`system.abilities.cha.bonuses.check`)
- **Icona**: `icons/consumables/drinks/beer-stein-metal-viking.webp`

#### ⚠️ Sfortuna
- **Descrizione**: Maledizione generale che porta sfortuna
- **Effetti Meccanici**:
  - Svantaggio a tutti i tiri (`flags.dnd5e.disadvantage.all`)
  - -1 a tutti i tiri salvezza (`system.bonuses.abilities.save`)
- **Icona**: `icons/magic/death/skull-horned-worn.webp`

---

### 2. **Comandi Chat**

| Comando | Descrizione | Esempio |
|---------|-------------|---------|
| `/condizione applica [tipo]` | Applica una condizione al token selezionato | `/condizione applica menagramo` |
| `/condizione rimuovi` | Rimuove tutte le condizioni custom dal token | `/condizione rimuovi` |
| `/condizione lista` | Mostra tutte le condizioni disponibili | `/condizione lista` |
| `/ubriaco` | Shortcut per applicare la condizione ubriaco | `/ubriaco` |
| `/condizionhelp` | Mostra l'aiuto completo | `/condizionhelp` |

**NOTA IMPORTANTE**: Il comando `/batosta` è stato **rimosso** perché le batoste sono gestite da `TavernBrawlSystem`.

---

### 3. **Macro Create Automaticamente**

#### 🍺 Applica Ubriaco
```javascript
if (!game.brancalonia?.conditions) {
  ui.notifications.error("Sistema condizioni non disponibile!");
  return;
}

const tokens = canvas.tokens.controlled;
if (tokens.length === 0) {
  ui.notifications.warn("Seleziona un token!");
  return;
}

const actor = tokens[0].actor;
if (!actor) {
  ui.notifications.error("Token non valido!");
  return;
}

game.brancalonia.conditions.createCustomCondition(actor, 'ubriaco');
```

**NOTA**: La macro "Applica Batosta" è stata **rimossa** perché le batoste sono gestite da `TavernBrawlSystem`.

---

### 4. **Impostazioni**

| Setting | Default | Descrizione |
|---------|---------|-------------|
| `enableCustomConditions` | `true` | Abilita/disabilita l'intero sistema |
| `showConditionNotifications` | `true` | Mostra notifiche quando si applicano/rimuovono condizioni |
| `debugConditions` | `false` | Abilita log di debug per troubleshooting |

---

## 🔍 Modifiche Effettuate

### ❌ Rimozione Sistema Batoste

Le **batoste** sono ora gestite esclusivamente da `TavernBrawlSystem` (`tavern-brawl.js`). Sono state rimosse tutte le funzionalità duplicate:

1. **Condizione "batosta" rimossa** da `customConditions`
2. **Comando `/batosta` disabilitato** con messaggio di deprecazione
3. **Macro "Applica Batosta" rimossa**
4. **Metodi rimossi**:
   - `createBatostaEffect()`
   - `removeBatostaEffect()`
   - `_applyUnconsciousCondition()`
5. **Help aggiornato** per rimuovere riferimenti alle batoste
6. **Dialog "Applica Condizione"** aggiornato per escludere le batoste

### ✅ Gestione Corretta delle Condizioni Rimaste

Le tre condizioni custom di Brancalonia (`menagramo`, `ubriaco`, `sfortuna`) sono completamente funzionanti e testate:

- ✅ Active Effects correttamente configurati
- ✅ Comandi chat funzionanti
- ✅ Macro create automaticamente
- ✅ Integrazione con le schede personaggio
- ✅ Notifiche e feedback visivo

---

## 🎮 Architettura Tecnica

### Inizializzazione

```javascript
Hooks.once('init', () => {
  BrancaloniaConditions.initialize();
});
```

Il modulo si registra:
1. Registra le impostazioni (`_registerSettings`)
2. Configura le condizioni custom (`_setupCustomConditions`)
3. Registra gli hooks di Foundry (`_registerHooks`)
4. Registra i comandi chat (`_registerChatCommands`)
5. Crea le macro automatiche (`_createConditionMacros`)

### Hooks Registrati

| Hook | Scopo |
|------|-------|
| `ready` | Crea le macro e mostra notifica di caricamento |
| `createActiveEffect` | Applica effetti speciali quando una condizione viene creata |
| `deleteActiveEffect` | Cleanup quando una condizione viene rimossa |
| `renderActorSheet` | Aggiunge pulsanti custom alle schede personaggio |

### Active Effects System

Ogni condizione custom viene creata come `ActiveEffect` con:
- **statuses**: Array di status IDs (es: `["menagramo"]`)
- **changes**: Array di modificatori (`key`, `mode`, `value`)
- **flags**: Metadata custom per Brancalonia
- **duration**: Durata in round (opzionale)

---

## ⚙️ Integrazione con Altri Moduli

### TavernBrawlSystem
- **Le batoste sono gestite da TavernBrawlSystem**, non da questo modulo
- Quando un utente tenta di usare `/batosta` o la macro "Applica Batosta", viene mostrato un messaggio che lo indirizza al sistema risse

### BrancaloniaSheets
- Integrazione con le schede personaggio per mostrare le condizioni custom
- Pulsanti rapidi per applicare condizioni

---

## 📊 Statistiche del Modulo

- **Condizioni Custom**: 3 (Menagramo, Ubriaco, Sfortuna)
- **Comandi Chat**: 5
- **Macro Automatiche**: 1 (Applica Ubriaco)
- **Impostazioni**: 3
- **Hooks**: 4
- **Righe di Codice**: ~900

---

## ✅ Checklist di Verifica

- [x] ✅ Condizioni custom definite correttamente
- [x] ✅ Active Effects configurati con i modificatori giusti
- [x] ✅ Comandi chat registrati e funzionanti
- [x] ✅ Macro create automaticamente
- [x] ✅ Impostazioni registrate
- [x] ✅ Hooks collegati
- [x] ✅ Integrazione con le schede personaggio
- [x] ✅ Sistema di notifiche
- [x] ✅ Debug logging
- [x] ✅ Rimozione duplicazione con TavernBrawlSystem
- [x] ✅ Gestione errori
- [x] ✅ Documentazione inline

---

## 🎯 Conclusione

Il modulo `brancalonia-conditions.js` è **completamente funzionale e corretto**. 

### ✅ Punti di Forza
1. **Separazione delle responsabilità**: Le batoste sono gestite da TavernBrawlSystem, questo modulo gestisce solo le condizioni custom permanenti/temporanee
2. **Integrazione solida**: Si integra perfettamente con il sistema Active Effects di Foundry VTT
3. **User-friendly**: Comandi chat facili, macro automatiche, notifiche chiare
4. **Flessibile**: Facile aggiungere nuove condizioni custom
5. **Robusto**: Gestione errori completa

### 🔄 Nessuna Azione Richiesta
Il modulo è pronto per essere usato in gioco senza ulteriori modifiche.

---

**Verificato da**: AI Assistant  
**Data**: 2025-10-03  
**Status**: ✅ APPROVED


