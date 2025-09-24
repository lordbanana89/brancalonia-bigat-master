#!/usr/bin/env python3
import json
import os
import re

# Directory con i file JSON
source_dir = "packs/regole/_source"

# Pattern per rimuovere emoji
emoji_pattern = re.compile("["
    u"\U0001F600-\U0001F64F"  # emoticons
    u"\U0001F300-\U0001F5FF"  # symbols & pictographs
    u"\U0001F680-\U0001F6FF"  # transport & map symbols
    u"\U0001F1E0-\U0001F1FF"  # flags
    u"\U00002702-\U000027B0"
    u"\U000024C2-\U0001F251"
    u"\U0001F900-\U0001F9FF"  # supplemental symbols
    u"\u2600-\u26FF"         # misc symbols
    u"\u2700-\u27BF"         # dingbats
    "]+", flags=re.UNICODE)

def clean_html_content(content):
    """Pulisce il contenuto HTML rimuovendo emoji e semplificando la formattazione"""
    # Rimuovi emoji
    content = emoji_pattern.sub('', content)

    # Rimuovi spazi extra lasciati dalle emoji
    content = re.sub(r'<h1>\s*', '<h1>', content)
    content = re.sub(r'<h2>\s*', '<h2>', content)
    content = re.sub(r'<h3>\s*', '<h3>', content)
    content = re.sub(r'\s+</h', '</h', content)

    # Rimuovi div con classe 'note' e sostituisci con blockquote
    content = re.sub(r"<div class='note'>", '<blockquote>', content)
    content = re.sub(r'</div>', '</blockquote>', content)

    # Pulisci spazi multipli
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'>\s+<', '><', content)

    return content.strip()

# Processa ogni file JSON
for filename in os.listdir(source_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(source_dir, filename)

        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Pulisci il contenuto delle pagine
        if 'pages' in data:
            for page in data['pages']:
                if 'text' in page and 'content' in page['text']:
                    original = page['text']['content']
                    cleaned = clean_html_content(original)
                    page['text']['content'] = cleaned

                    if original != cleaned:
                        print(f"✓ Pulito: {filename}")

        # Salva il file aggiornato
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

print("\nCompletato! Tutti i file sono stati puliti.")