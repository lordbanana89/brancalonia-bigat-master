#!/usr/bin/env python3
import json
import os
import re

# Directory con i file JSON
source_dir = "packs/regole/_source"

def remove_h1_from_content(content):
    """Rimuove il primo tag H1 dal contenuto HTML"""
    # Pattern per trovare il primo H1 completo
    pattern = r'^<h1>[^<]*</h1>'

    # Rimuovi il primo H1
    content = re.sub(pattern, '', content)

    # Pulisci eventuali spazi iniziali
    content = content.strip()

    return content

# Processa ogni file JSON
for filename in os.listdir(source_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(source_dir, filename)

        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        modified = False

        # Rimuovi H1 dal contenuto delle pagine
        if 'pages' in data:
            for page in data['pages']:
                if 'text' in page and 'content' in page['text']:
                    original = page['text']['content']
                    cleaned = remove_h1_from_content(original)

                    if original != cleaned:
                        page['text']['content'] = cleaned
                        modified = True
                        print(f"✓ Rimosso H1 duplicato da: {filename}")

        # Salva il file se è stato modificato
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

print("\nCompletato! Titoli H1 duplicati rimossi da tutti i file.")