# Brancalonia Theme - Design Tokens Documentation

## Tabella Token Colori

| Token | Valore Light | Valore Dark | Utilizzo |
|-------|--------------|-------------|----------|
| `--bcl-bg` | #15110C | #0F0C08 | Background principale dell'applicazione |
| `--bcl-surface` | #F3E6CC | #2B2218 | Superficie delle finestre e dialog |
| `--bcl-paper` | #E7D6AE | #3A2E20 | Background dei contenuti (pergamena) |
| `--bcl-paper-weak` | #EFE0BD | #453626 | Background secondario chiaro |
| `--bcl-paper-strong` | #D9C38F | #302518 | Background enfasi scuro |
| `--bcl-ink` | #2B1F14 | #F3E6CC | Testo principale (inchiostro) |
| `--bcl-ink-weak` | #4A3826 | #D9C38F | Testo secondario |
| `--bcl-ink-strong` | #1C140D | #FAF6ED | Testo enfatizzato |
| `--bcl-muted` | #6C5A43 | #C9B691 | Testo disabilitato/mutato |
| `--bcl-gold` | #C9A54A | #C9A54A | Oro - accent primario |
| `--bcl-emerald` | #2E7D64 | #2E7D64 | Verde smeraldo |
| `--bcl-accent` | #8C2B27 | #8C2B27 | Rosso ceralacca - accent |
| `--bcl-accent-strong` | #5E1715 | #5E1715 | Rosso vino scuro |
| `--bcl-success` | #2F8F5B | #2F8F5B | Stato successo |
| `--bcl-warning` | #C27C1A | #C27C1A | Stato warning |
| `--bcl-danger` | #952C2C | #952C2C | Stato errore/pericolo |
| `--bcl-focus` | #7A5E1F | #7A5E1F | Focus outline dorato |
| `--bcl-border` | #B99D6B | #7A6546 | Bordi elementi UI |
| `--bcl-divider` | #D6C193 | #5E4C35 | Linee divisorie |
| `--bcl-seal-wax` | #8E1D22 | #8E1D22 | Ceralacca per sigilli |
| `--bcl-ribbon` | #7E1F1B | #7E1F1B | Nastri decorativi |
| `--bcl-shadow-ink` | rgba(28,20,13,.35) | rgba(28,20,13,.35) | Ombra inchiostro |
| `--bcl-paper-overlay` | rgba(43,31,20,.06) | rgba(43,31,20,.06) | Overlay carta |
| `--bcl-nav` | #223F4A | #223F4A | Blu carta nautica |

## Token Tipografici

| Token | Valore | Utilizzo |
|-------|--------|----------|
| `--bcl-font-display` | "Cinzel", serif | Font per titoli e display |
| `--bcl-font-serif` | "Alegreya", Georgia, serif | Font per testo principale |
| `--bcl-font-sans` | "Inter", system-ui, sans-serif | Font UI sans-serif |
| `--bcl-font-mono` | "JetBrains Mono", monospace | Font monospace per codice |
| `--bcl-font-size-base` | 16px | Dimensione base font |
| `--bcl-line` | 1.45 | Line-height base |

## Token Layout

| Token | Valore | Utilizzo |
|-------|--------|----------|
| `--bcl-radius-sm` | 4px | Border radius piccolo |
| `--bcl-radius-md` | 8px | Border radius medio |
| `--bcl-radius-lg` | 14px | Border radius grande |
| `--bcl-shadow-1` | 0 1px 0 rgba(0,0,0,.04), 0 1px 8px rgba(0,0,0,.06) | Ombra leggera |
| `--bcl-shadow-2` | 0 2px 0 rgba(0,0,0,.06), 0 6px 18px rgba(0,0,0,.12) | Ombra media |

## Alias Retrocompatibilità

Tutti i token `--bcl-*` sono mappati anche come `--branca-*` per mantenere la retrocompatibilità con il Theme Engine Carolingiano:

```css
--branca-bg: var(--bcl-bg);
--branca-surface: var(--bcl-surface);
--branca-paper: var(--bcl-paper);
/* ... e così via per tutti i token ... */
```

## Utilizzo nel Codice

### Esempio base
```css
.theme-brancalonia .window-app {
  background: var(--bcl-paper);
  color: var(--bcl-ink);
  border: 1px solid var(--bcl-border);
  border-radius: var(--bcl-radius-md);
}
```

### Esempio con hover
```css
.theme-brancalonia button {
  background: var(--bcl-paper-weak);
  color: var(--bcl-ink);
  border: 1px solid var(--bcl-border);
  transition: all 0.2s ease;
}

.theme-brancalonia button:hover {
  background: var(--bcl-gold);
  color: var(--bcl-ink-strong);
  border-color: var(--bcl-accent);
}
```

## Integrazione Dice So Nice

I token sono utilizzati dinamicamente nell'integrazione con Dice So Nice per creare colorset tematici:

- **Gold & Wax**: Usa `--bcl-gold` e `--bcl-ink-strong`
- **Parchment & Ink**: Usa `--bcl-paper-strong` e `--bcl-ink-strong`
- **Emerald & Gold**: Usa `--bcl-emerald` e `--bcl-gold`
- **Wine & Gold**: Usa `--bcl-accent-strong` e `--bcl-gold`

## Note Importanti

1. **Scope**: Tutti gli stili sono sotto `.theme-brancalonia` per evitare conflitti
2. **Dark Mode**: Attivato con `[data-theme="dark"]` o classe `.dark`
3. **Contrasto**: Tutti i colori rispettano WCAG AA per accessibilità
4. **Performance**: Le texture decorative usano SVG inline con `currentColor`
5. **Compatibilità**: Funziona con Foundry v12-v13 e D&D 5e v5.0-v5.2.x