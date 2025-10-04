#!/usr/bin/env python3
"""
Script per verificare il database Brancalonia usando Dolphin AI
Richiede: pip install transformers torch pillow pdf2image
"""

import json
import os
from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from PIL import Image
from pdf2image import convert_from_path

class BrancaloniaVerifier:
    def __init__(self, model_path="bytedance/dolphin-vision-0.3b"):
        """Inizializza Dolphin per parsing documenti"""
        print(f"Caricamento modello Dolphin...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto"
        )

    def extract_from_pdf(self, pdf_path, page_numbers=None):
        """Estrae informazioni da pagine specifiche del PDF"""
        pages = convert_from_path(pdf_path, dpi=150)
        results = []

        for i, page in enumerate(pages):
            if page_numbers and i not in page_numbers:
                continue

            # Query per estrarre dati strutturati
            prompt = """Estrai TUTTI i seguenti dati dalla pagina:
            - Nome personaggio/oggetto/talento
            - Tipo (background, razza, classe, talento, equipaggiamento)
            - Competenze e bonus
            - Privilegi speciali
            - Equipaggiamento iniziale
            - Tabelle con dadi (d6, d8, etc)
            Formato JSON strutturato."""

            # Processo con Dolphin
            inputs = self.tokenizer(prompt, return_tensors="pt")
            outputs = self.model.generate(**inputs, max_length=2048)
            result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

            results.append({
                "page": i + 1,
                "data": json.loads(result)
            })

        return results

    def compare_with_database(self, extracted_data, db_path):
        """Confronta dati estratti con il database esistente"""
        discrepancies = []

        for item in extracted_data:
            db_file = Path(db_path) / f"{item['name'].lower().replace(' ', '_')}.json"

            if db_file.exists():
                with open(db_file, 'r', encoding='utf-8') as f:
                    db_data = json.load(f)

                # Confronta campi chiave
                if db_data.get('name') != item['name']:
                    discrepancies.append({
                        "file": str(db_file),
                        "field": "name",
                        "manual": item['name'],
                        "database": db_data.get('name')
                    })

                # Confronta competenze
                manual_skills = item.get('competenze', [])
                db_skills = db_data.get('system', {}).get('skills', [])
                if set(manual_skills) != set(db_skills):
                    discrepancies.append({
                        "file": str(db_file),
                        "field": "skills",
                        "manual": manual_skills,
                        "database": db_skills
                    })

            else:
                discrepancies.append({
                    "issue": "missing_file",
                    "expected": str(db_file),
                    "item": item['name']
                })

        return discrepancies

# Esempio di utilizzo
if __name__ == "__main__":
    verifier = BrancaloniaVerifier()

    # Pagine specifiche del manuale per backgrounds (32-39)
    background_pages = range(31, 40)  # 0-indexed

    print("Estrazione dati dal manuale...")
    manual_data = verifier.extract_from_pdf(
        "Brancalonia_Manuale_Base.pdf",
        page_numbers=background_pages
    )

    print("Confronto con database...")
    issues = verifier.compare_with_database(
        manual_data,
        "/Users/erik/Desktop/brancalonia-bigat-master/packs/backgrounds"
    )

    # Salva report
    with open("verification_report.json", "w", encoding='utf-8') as f:
        json.dump({
            "total_items_checked": len(manual_data),
            "discrepancies_found": len(issues),
            "details": issues
        }, f, ensure_ascii=False, indent=2)

    print(f"✅ Verifica completata: {len(issues)} discrepanze trovate")
    print("📄 Report salvato in verification_report.json")