#!/usr/bin/env python3
"""
Script per correggere case sensitivity e naming consistency nei file index.json.
Verifica che i nomi dei file referenziati esistano e corregge discrepanze.
"""

import json
import os
from pathlib import Path
import re
from difflib import SequenceMatcher

def load_json(filepath):
    """Carica un file JSON gestendo encoding."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Errore caricando {filepath}: {e}")
        return None

def save_json(filepath, data):
    """Salva un file JSON con formattazione corretta."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def find_similar_file(directory, target_name):
    """Trova file simili con case sensitivity diversa."""
    target_lower = target_name.lower()
    best_match = None
    best_ratio = 0

    for file in directory.iterdir():
        if file.is_file() and file.suffix == '.json' and file.name != 'index.json':
            ratio = SequenceMatcher(None, target_lower, file.name.lower()).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = file.name

    return best_match if best_ratio > 0.8 else None

def standardize_name(name):
    """Standardizza il naming di un elemento."""
    # Rimuovi caratteri speciali eccetto spazi e apostrofi
    name = re.sub(r'[^\w\s\'\-àèéìòù]', '', name)

    # Capitalizza correttamente
    words = name.split()
    result = []

    # Parole che restano minuscole
    lowercase_words = {'di', 'da', 'del', 'della', 'dei', 'delle', 'il', 'la', 'le', 'lo', 'gli', 'e', 'd'}

    for i, word in enumerate(words):
        # Prima parola sempre maiuscola
        if i == 0:
            # Gestisci apostrofi
            if "'" in word:
                parts = word.split("'")
                result.append(parts[0].capitalize() + "'" + parts[1].lower() if len(parts) > 1 else parts[0].capitalize())
            else:
                result.append(word.capitalize())
        elif word.lower() in lowercase_words:
            result.append(word.lower())
        else:
            # Gestisci apostrofi
            if "'" in word:
                parts = word.split("'")
                result.append(parts[0].capitalize() + "'" + parts[1].lower() if len(parts) > 1 else parts[0].capitalize())
            else:
                result.append(word.capitalize())

    return ' '.join(result)

def fix_index_file(index_path):
    """Corregge un singolo file index.json."""
    data = load_json(index_path)
    if not data:
        return False, 0, 0

    directory = Path(index_path).parent
    fixes = 0
    warnings = 0

    # Controlla ogni elemento
    elementi = data.get('elementi', [])
    for elem in elementi:
        # Standardizza il nome
        if 'nome' in elem:
            old_name = elem['nome']
            new_name = standardize_name(old_name)
            if old_name != new_name:
                print(f"   📝 Nome: '{old_name}' → '{new_name}'")
                elem['nome'] = new_name
                fixes += 1

        # Verifica che il file esista
        if 'file' in elem:
            file_path = directory / elem['file']
            if not file_path.exists():
                # Cerca un file simile
                similar = find_similar_file(directory, elem['file'])
                if similar:
                    print(f"   🔄 File: '{elem['file']}' → '{similar}' (corretto case)")
                    elem['file'] = similar
                    fixes += 1
                else:
                    print(f"   ⚠️  File non trovato: '{elem['file']}'")
                    warnings += 1

        # Standardizza ID
        if 'id' in elem:
            old_id = elem['id']
            # Assicura che l'ID sia lowercase con trattini
            new_id = re.sub(r'[^\w\-]', '-', old_id.lower())
            new_id = re.sub(r'-+', '-', new_id).strip('-')
            if old_id != new_id:
                print(f"   🆔 ID: '{old_id}' → '{new_id}'")
                elem['id'] = new_id
                fixes += 1

    # Standardizza la categoria
    if 'categoria' in data:
        old_cat = data['categoria']
        new_cat = standardize_name(old_cat) if isinstance(old_cat, str) else old_cat
        if old_cat != new_cat:
            print(f"   📂 Categoria: '{old_cat}' → '{new_cat}'")
            data['categoria'] = new_cat
            fixes += 1

    # Salva se ci sono modifiche
    if fixes > 0:
        save_json(index_path, data)

    return True, fixes, warnings

def process_all_indexes(base_path):
    """Processa tutti gli index.json nel progetto."""

    stats = {
        'total': 0,
        'fixed': 0,
        'total_fixes': 0,
        'total_warnings': 0
    }

    # Trova tutti gli index.json
    index_files = list(Path(base_path).rglob('index.json'))
    print(f"\n📁 Trovati {len(index_files)} file index.json\n")

    for index_path in sorted(index_files):
        rel_path = index_path.relative_to(base_path)
        stats['total'] += 1

        print(f"🔍 {rel_path}")
        success, fixes, warnings = fix_index_file(index_path)

        if fixes > 0:
            stats['fixed'] += 1
            stats['total_fixes'] += fixes
            print(f"   ✅ {fixes} correzioni applicate")
        elif warnings > 0:
            stats['total_warnings'] += warnings
        else:
            print(f"   ✨ Già corretto")

    return stats

def main():
    """Main function."""
    print("=" * 60)
    print("🔧 FIX NAMING CONSISTENCY")
    print("=" * 60)

    base_path = Path(__file__).parent.parent
    database_path = base_path / 'database'

    if not database_path.exists():
        print(f"❌ Directory database non trovata: {database_path}")
        return

    # Processa tutti gli index
    stats = process_all_indexes(database_path)

    # Report finale
    print("\n" + "=" * 60)
    print("📊 REPORT FINALE")
    print("=" * 60)
    print(f"📁 File processati: {stats['total']}")
    print(f"🔧 File corretti: {stats['fixed']}")
    print(f"✅ Totale correzioni: {stats['total_fixes']}")
    print(f"⚠️  Totale warning: {stats['total_warnings']}")

    if stats['total_fixes'] > 0:
        print(f"\n✨ Correzioni completate! {stats['total_fixes']} fix applicati.")
    else:
        print("\n✨ Tutti i file hanno già naming consistency corretta!")

    if stats['total_warnings'] > 0:
        print(f"\n⚠️  Attenzione: {stats['total_warnings']} file referenziati non trovati.")
        print("   Potrebbe essere necessario creare o rinominare questi file.")

if __name__ == "__main__":
    main()