#!/usr/bin/env python3
"""
Script per standardizzare tutti i file index.json del progetto Brancalonia.
Unifica la struttura, corregge case sensitivity e naming consistency.
"""

import json
import os
from pathlib import Path
import re

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

def get_standard_structure(old_data, filepath):
    """Converte qualsiasi struttura index.json nel formato standard con 'elementi'."""

    # Estrai informazioni base
    categoria = old_data.get('categoria', '')
    if not categoria:
        # Prova a derivare dalla path
        parts = Path(filepath).parts
        if 'database' in parts:
            idx = parts.index('database')
            if idx + 1 < len(parts):
                categoria = parts[idx + 1].replace('_', ' ').title()

    fonte = old_data.get('fonte', 'Brancalonia Manuale Base')
    descrizione = old_data.get('descrizione', f'Contenuti della categoria {categoria}')

    # Trova gli elementi (possono essere in varie chiavi)
    elementi = []
    possible_keys = ['elementi', 'oggetti', 'cimeli', 'incantesimi', 'privilegi',
                     'backgrounds', 'classi', 'razze', 'talenti', 'sottoclassi']

    for key in possible_keys:
        if key in old_data and isinstance(old_data[key], list):
            elementi = old_data[key]
            break

    # Se non troviamo elementi, prova a costruirli dai file nella directory
    if not elementi:
        dirpath = Path(filepath).parent
        json_files = sorted([f for f in dirpath.glob('*.json') if f.name != 'index.json'])

        elementi = []
        for json_file in json_files:
            # Estrai ID dal nome file
            file_name = json_file.name
            match = re.match(r'^(\d+)[_-](.+)\.json$', file_name)
            if match:
                num = match.group(1)
                name_part = match.group(2).replace('_', ' ').replace('-', ' ')
                # Capitalizza correttamente
                nome = ' '.join(word.capitalize() for word in name_part.split())
                elementi.append({
                    "id": f"{categoria.lower()}-{num}",
                    "nome": nome,
                    "file": file_name
                })
            else:
                # File senza numero
                name_part = file_name.replace('.json', '').replace('_', ' ').replace('-', ' ')
                nome = ' '.join(word.capitalize() for word in name_part.split())
                elementi.append({
                    "id": name_part.lower().replace(' ', '-'),
                    "nome": nome,
                    "file": file_name
                })

    # Standardizza gli elementi esistenti
    standard_elementi = []
    for elem in elementi:
        std_elem = {}

        # ID
        if 'id' in elem:
            std_elem['id'] = elem['id']
        elif 'numero' in elem:
            std_elem['id'] = f"{categoria.lower()}-{elem['numero']:03d}"
        else:
            std_elem['id'] = elem.get('nome', 'unknown').lower().replace(' ', '-')

        # Nome (correggi case sensitivity)
        if 'nome' in elem:
            nome = elem['nome']
        elif 'name' in elem:
            nome = elem['name']
        elif 'titolo' in elem:
            nome = elem['titolo']
        else:
            nome = "Senza Nome"

        # Correggi capitalizzazione
        if nome.isupper() or nome.islower():
            nome = ' '.join(word.capitalize() for word in nome.split())
        std_elem['nome'] = nome

        # File
        if 'file' in elem:
            std_elem['file'] = elem['file']
        elif 'path' in elem:
            std_elem['file'] = Path(elem['path']).name
        else:
            # Prova a derivare dal nome o ID
            safe_name = re.sub(r'[^\w\s-]', '', nome.lower())
            safe_name = re.sub(r'[-\s]+', '_', safe_name)
            std_elem['file'] = f"{safe_name}.json"

        # Campi opzionali
        if 'descrizione' in elem:
            std_elem['descrizione'] = elem['descrizione']
        if 'fonte' in elem:
            std_elem['fonte'] = elem['fonte']

        standard_elementi.append(std_elem)

    # Costruisci struttura standard
    standard = {
        "categoria": categoria,
        "descrizione": descrizione,
        "fonte": fonte,
        "totale": len(standard_elementi),
        "elementi": standard_elementi
    }

    # Preserva eventuali metadati aggiuntivi importanti
    preserve_keys = ['nota_generale', 'versione', 'ultima_modifica', 'autore']
    for key in preserve_keys:
        if key in old_data:
            standard[key] = old_data[key]

    return standard

def process_directory(base_path):
    """Processa tutti gli index.json in una directory."""

    stats = {
        'processed': 0,
        'updated': 0,
        'errors': 0,
        'already_standard': 0
    }

    # Trova tutti gli index.json
    index_files = list(Path(base_path).rglob('index.json'))
    print(f"\n📁 Trovati {len(index_files)} file index.json\n")

    for filepath in sorted(index_files):
        rel_path = filepath.relative_to(base_path)

        # Carica il file
        data = load_json(filepath)
        if not data:
            stats['errors'] += 1
            continue

        stats['processed'] += 1

        # Controlla se è già nel formato standard
        if 'elementi' in data and 'categoria' in data and 'totale' in data:
            # Verifica che sia veramente standard
            needs_update = False
            for elem in data.get('elementi', []):
                if 'id' not in elem or 'nome' not in elem or 'file' not in elem:
                    needs_update = True
                    break

            if not needs_update:
                print(f"✅ {rel_path} - già standard")
                stats['already_standard'] += 1
                continue

        # Standardizza
        print(f"🔧 {rel_path} - standardizzazione...")
        new_data = get_standard_structure(data, filepath)

        # Salva
        save_json(filepath, new_data)
        stats['updated'] += 1
        print(f"   ✨ Aggiornato con {len(new_data['elementi'])} elementi")

    return stats

def main():
    """Main function."""
    print("=" * 60)
    print("🔧 STANDARDIZZAZIONE INDEX.JSON")
    print("=" * 60)

    base_path = Path(__file__).parent.parent
    database_path = base_path / 'database'

    if not database_path.exists():
        print(f"❌ Directory database non trovata: {database_path}")
        return

    # Processa tutti gli index
    stats = process_directory(database_path)

    # Report finale
    print("\n" + "=" * 60)
    print("📊 REPORT FINALE")
    print("=" * 60)
    print(f"📁 File processati: {stats['processed']}")
    print(f"✅ Già standard: {stats['already_standard']}")
    print(f"🔧 Aggiornati: {stats['updated']}")
    print(f"❌ Errori: {stats['errors']}")

    if stats['updated'] > 0:
        print(f"\n✨ Standardizzazione completata! {stats['updated']} file aggiornati.")
    else:
        print("\n✨ Tutti i file sono già nel formato standard!")

if __name__ == "__main__":
    main()