#!/usr/bin/env python3

import PyPDF2
import sys
import os

def extract_text_from_pdf(pdf_path, start_page=1, end_page=None, output_file=None):
    """Estrae testo da un range di pagine del PDF"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)

            if end_page is None:
                end_page = num_pages

            end_page = min(end_page, num_pages)

            print(f"PDF ha {num_pages} pagine totali")
            print(f"Estraendo pagine {start_page} a {end_page}")

            text = ""
            for page_num in range(start_page - 1, end_page):
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text()
                text += f"\n\n--- PAGINA {page_num + 1} ---\n\n"
                text += page_text

            if output_file:
                with open(output_file, 'w', encoding='utf-8') as out:
                    out.write(text)
                print(f"Testo estratto salvato in {output_file}")
            else:
                print(text)

            return text

    except Exception as e:
        print(f"Errore: {e}")
        return None

if __name__ == "__main__":
    pdf_path = "/Users/erik/Downloads/544189217-Brancalonia-ITA-Manuale-di-Ambientazione.pdf"

    # Estrai sezioni specifiche del manuale
    sections = [
        {"name": "personaggi", "start": 10, "end": 50},  # Cerco le regole dei personaggi
        {"name": "risse", "start": 51, "end": 57},
        {"name": "riposo", "start": 58, "end": 62},
        {"name": "giochi", "start": 63, "end": 67},
        {"name": "malefatte", "start": 68, "end": 75},
        {"name": "avanzamento", "start": 76, "end": 85},
        {"name": "emeriticenze", "start": 86, "end": 95}
    ]

    for section in sections:
        output = f"manual_{section['name']}.txt"
        print(f"\nEstraendo sezione {section['name']}...")
        extract_text_from_pdf(pdf_path, section['start'], section['end'], output)