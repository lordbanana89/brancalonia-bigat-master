#!/usr/bin/env python3
import json
from pathlib import Path

def add_missing_advancements(file_path):
    """Aggiunge HitPoints e ASI advancement mancanti"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'advancement' not in data['system']:
        data['system']['advancement'] = []
    
    advancements = data['system']['advancement']
    
    # Check for HitPoints
    has_hp = any(a.get('type') == 'HitPoints' for a in advancements)
    if not has_hp:
        advancements.insert(0, {
            "_id": "hp" + data['_id'][-6:],
            "type": "HitPoints",
            "configuration": {},
            "value": {},
            "title": "Punti Ferita"
        })
    
    # Add ASI at levels 4,8,12,16,19
    asi_levels = [4, 8, 12, 16, 19]
    for level in asi_levels:
        advancements.append({
            "_id": f"asi{level}" + data['_id'][-4:],
            "type": "AbilityScoreImprovement",
            "configuration": {
                "points": 2,
                "fixed": {}
            },
            "value": {
                "type": "asi"
            },
            "level": level,
            "title": "Aumento Caratteristica"
        })
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Fix all classes
classes_dir = Path('packs/classi/_source')
for class_file in classes_dir.glob('*.json'):
    if not class_file.name.endswith('_fixed.json'):
        print(f"Fixing {class_file.name}...")
        add_missing_advancements(class_file)

print("✅ Advancement aggiunti!")
