#!/usr/bin/env python3
import json
import os
import glob

# Directory containing the JSON files
source_dir = "/Users/erik/Desktop/brancalonia-bigat-master/packs/regole/_source"

# Process each JSON file
for filepath in glob.glob(os.path.join(source_dir, "*.json")):
    print(f"Processing: {os.path.basename(filepath)}")

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Fix the structure
    if 'pages' in data:
        for page in data['pages']:
            # Remove unnecessary fields
            if 'title' in page:
                del page['title']
            if 'video' in page:
                del page['video']
            if 'src' in page:
                del page['src']

            # Ensure text field has proper format
            if 'text' in page and isinstance(page['text'], dict):
                if 'format' not in page['text']:
                    page['text']['format'] = 1  # HTML format

                # Ensure content is present
                if 'content' not in page['text']:
                    page['text']['content'] = ""

    # Write back the fixed JSON
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Done! All journal entries have been fixed.")