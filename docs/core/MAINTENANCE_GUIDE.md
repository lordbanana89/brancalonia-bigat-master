# 📚 GUIDA MANUTENZIONE BRANCALONIA v3.21.0

## 🎯 PANORAMICA
Questa guida documenta il processo completo per mantenere e migliorare la compliance del modulo Brancalonia con Foundry VTT v13 e D&D 5e.

## 📊 STATO COMPLIANCE ATTUALE

### Progressione Compliance Score
- **Iniziale**: 14% (181 errori, 7 warning)
- **Dopo Round 1**: 21% (108 errori, 6 warning)
- **Dopo Round 2**: 23% (93 errori, 5 warning)

### Problemi Risolti ✅
1. **Container Type**: Convertiti da `container` → `backpack` → `equipment`
2. **Hook Deprecati**: Aggiornati `renderChatMessage` → `renderChatLog`
3. **Classi Database**: Aggiunti `hitDice`, `primaryAbility`, `saves`
4. **Journal Pages**: Aggiunte pagine mancanti ai journal entries
5. **Incantesimi Parziali**: 21/94 corretti con level appropriato

### Problemi Rimanenti ⚠️
1. **93 Incantesimi** senza campo `level`
2. **3 NPC** senza `CR` (Challenge Rating)
3. **Active Effects**: Solo 7 implementati (target: 120+)

## 🔧 SCRIPT DI MANUTENZIONE

### 1. Validazione Completa
```bash
# Esegui validazione completa del progetto
node validate-project-compliance.cjs

# Output salvato in: compliance-report.json
```

### 2. Fix Automatici
```bash
# Fix completo di tutti i problemi noti
node fix-all-compliance.cjs

# Fix specifici per problemi rimanenti
node fix-remaining-issues.cjs
```

### 3. Compilazione Database
```bash
# Compila tutti i pack con campo _key preservato
node compile-with-keys.cjs

# Verifica pack compilati
node verify-packs.cjs
```

## 📝 PROCESSO DI FIX MANUALE

### Fix Incantesimi
Per ogni incantesimo senza `level`, aggiungere:
```json
{
  "system": {
    "level": 1,  // 0=cantrip, 1-9=spell level
    "school": "evo",  // abj, con, div, enc, evo, ill, nec, trs
    "materials": {
      "value": "",
      "consumed": false,
      "cost": 0,
      "supply": 0
    },
    "preparation": {
      "mode": "prepared",
      "prepared": false
    }
  }
}
```

### Fix NPC
Per ogni NPC senza CR:
```json
{
  "system": {
    "details": {
      "cr": 1,  // Challenge Rating
      "xp": {
        "value": 200
      }
    },
    "attributes": {
      "hp": {
        "formula": "2d8+2",
        "value": 11,
        "max": 11
      }
    }
  }
}
```

## 🚀 WORKFLOW DI SVILUPPO

### 1. Pre-Commit
```bash
# Validazione prima del commit
node validate-project-compliance.cjs

# Se compliance < 90%, eseguire fix
node fix-all-compliance.cjs

# Rivalidare
node validate-project-compliance.cjs
```

### 2. Testing in Foundry
1. **Avvia Foundry v13**
2. **Attiva il modulo** in un mondo D&D 5e
3. **Verifica compendi**: Tutti devono caricarsi
4. **Test funzionalità**:
   - Crea personaggio con stirpe Brancalonia
   - Assegna classe (Knave/Straccione)
   - Testa sistema Infamia
   - Prova una Rissa da Taverna
   - Verifica Menagramo

### 3. Post-Release
```bash
# Tag della versione
git tag -a v3.21.0 -m "Release v3.21.0 - Compliance improvements"

# Push su GitHub
git push origin main --tags

# Aggiorna module.json con nuova versione
```

## 📊 METRICHE DI QUALITÀ

### Target Minimi
- **Compliance Score**: ≥ 90%
- **Errori Critici**: 0
- **Warning**: < 10
- **Active Effects**: > 100
- **Test Coverage**: > 80%

### Monitoraggio
```javascript
// Script per monitoraggio continuo
const checkCompliance = async () => {
  const report = JSON.parse(fs.readFileSync('compliance-report.json'));
  
  if (report.score < 90) {
    console.log(`⚠️ Compliance basso: ${report.score}%`);
    console.log(`Errori: ${report.errors.length}`);
    console.log(`Warning: ${report.warnings.length}`);
    return false;
  }
  
  console.log(`✅ Compliance OK: ${report.score}%`);
  return true;
};
```

## 🐛 TROUBLESHOOTING

### Problema: Compendi vuoti in Foundry
**Causa**: Campo `_key` mancante nei documenti
**Soluzione**: 
```bash
node add-keys.cjs
node compile-with-keys.cjs
```

### Problema: Hook deprecati
**Causa**: API Foundry v13 cambiata
**Soluzione**: Aggiornare tutti gli hook nei moduli:
- `renderChatMessage` → `renderChatLog`
- `CONFIG.statusEffects.push()` → `CONFIG.statusEffects = CONFIG.statusEffects.concat([])`

### Problema: Active Effects non applicati
**Causa**: Foundry CLI issue #41
**Soluzione**: Applicazione runtime con `brancalonia-active-effects-complete.js`

## 📋 CHECKLIST RELEASE

### Pre-Release
- [ ] Compliance Score ≥ 90%
- [ ] Tutti i test passati
- [ ] Documentazione aggiornata
- [ ] Changelog compilato
- [ ] Version bump in module.json
- [ ] Backup database

### Release
- [ ] Tag Git creato
- [ ] Push su GitHub
- [ ] Release su GitHub con changelog
- [ ] Notifica community Discord
- [ ] Update Foundry package listing

### Post-Release
- [ ] Monitor issue tracker
- [ ] Rispondere a feedback utenti
- [ ] Pianificare hotfix se necessario
- [ ] Aggiornare roadmap

## 🔄 AUTOMAZIONE CI/CD

### GitHub Actions Workflow
```yaml
name: Validation CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run validation
      run: node validate-project-compliance.cjs
    
    - name: Check compliance
      run: |
        SCORE=$(grep -o '"score": [0-9]*' compliance-report.json | grep -o '[0-9]*')
        if [ $SCORE -lt 90 ]; then
          echo "Compliance too low: $SCORE%"
          exit 1
        fi
    
    - name: Upload report
      uses: actions/upload-artifact@v2
      with:
        name: compliance-report
        path: compliance-report.json
```

## 📚 RISORSE

### Documentazione
- [Foundry VTT v13 API](https://foundryvtt.com/api/)
- [D&D 5e System Documentation](https://github.com/foundryvtt/dnd5e/wiki)
- [Module Development Guide](https://foundryvtt.com/article/module-development/)

### Tool Utili
- **Classic Level**: Per database LevelDB
- **Foundry CLI**: Per operazioni batch (con cautela)
- **JSON Validator**: Per verificare sintassi

### Community
- Discord Brancalonia: #foundry-vtt
- Foundry VTT Discord: #module-development
- GitHub Issues: Per bug tracking

## 🎯 PROSSIMI OBIETTIVI

### Breve Termine (1-2 settimane)
1. Correggere i 93 incantesimi rimanenti
2. Implementare Active Effects mancanti
3. Aggiungere CR agli NPC

### Medio Termine (1 mese)
1. Raggiungere 95% compliance
2. Implementare test automatici
3. Creare documentazione utente

### Lungo Termine (3 mesi)
1. Piena compatibilità Foundry v14
2. Integrazione con altri moduli
3. Traduzione in inglese

## ✅ CONCLUSIONE

Questa guida fornisce tutto il necessario per mantenere e migliorare il modulo Brancalonia. Seguire i processi documentati garantirà qualità costante e compatibilità con le versioni future di Foundry VTT.

---
*Ultimo aggiornamento: 27 Settembre 2025*
*Versione modulo: v3.21.0*
*Maintainer: Brancalonia Community*
