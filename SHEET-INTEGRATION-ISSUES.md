# 🚨 PROBLEMI INTEGRAZIONE SHEET - Identificati da GPT-5

**Data**: 5 Ottobre 2025  
**Issue**: Multiple moduli modificano renderActorSheet causando duplicazioni  

---

## 🔴 PROBLEMA CRITICO

**20 moduli** registrano tutti `Hooks.on('renderActorSheet')`:

1. background-privileges.js
2. brancalonia-compatibility-fix.js
3. brancalonia-mechanics.js
4. brancalonia-modules-init-fix.js
5. brancalonia-sheets.js ← **Principale**
6. brancalonia-ui-coordinator.js
7. compagnia-manager.js
8. diseases-system.js
9. dueling-system.js
10. environmental-hazards.js
11. factions-system.js
12. favori-system.js
13. malefatte-taglie-nomea.js
14. menagramo-system.js
15. menagramo-warlock-patron.js
16. reputation-infamia-unified.js
17. rest-system.js
18. shoddy-equipment.js
19. tavern-brawl.js
20. tavern-entertainment-consolidated.js

---

## 🔴 DUPLICAZIONI TROVATE

### Compagnia Section (4x)
- brancalonia-sheets.js:301 `addCompagniaSection()`
- compagnia-manager.js:223 `_addCompagniaTab()`
- brancalonia-ui-coordinator.js:322 `_addCompagniaTab()`
- brancalonia-compatibility-fix.js:125 chiama manager

### Malefatte/Taglia (2x)
- brancalonia-sheets.js:304 `addMalefatteSection()`
- malefatte-taglie-nomea.js:345 `_renderTagliaSection()`

---

## ✅ SOLUZIONE RACCOMANDATA

### Approccio 1: Coordinator Pattern
Usare `brancalonia-ui-coordinator.js` come UNICO punto di rendering

### Approccio 2: Event System
Ogni modulo emette evento, coordinator ascolta e rende

### Approccio 3: Registry
Moduli si registrano, sheets chiama registry

---

**Status**: Identificato, da fixare
**Priorità**: ALTA (causa performance + potenziali conflitti)
**Effort**: Refactoring architetturale (2-3 giorni)
