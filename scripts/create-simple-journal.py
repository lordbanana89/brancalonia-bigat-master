#!/usr/bin/env python3

import json

# Create a minimal working journal entry
journal = {
    "_id": "test123",
    "_key": "!journal!test123",
    "name": "Test Journal",
    "type": "JournalEntry",
    "img": "icons/svg/book.svg",
    "pages": [
        {
            "_id": "page1",
            "name": "Page 1",
            "type": "text",
            "text": {
                "format": 1,
                "content": "Test content"
            },
            "title": {
                "show": True,
                "level": 1
            },
            "src": None,
            "system": {},
            "sort": 0,
            "ownership": {
                "default": 0
            },
            "flags": {}
        }
    ],
    "folder": None,
    "sort": 0,
    "ownership": {
        "default": 0
    },
    "flags": {}
}

with open('/tmp/test_journal.json', 'w') as f:
    json.dump(journal, f, indent=2)

print("Created test journal at /tmp/test_journal.json")