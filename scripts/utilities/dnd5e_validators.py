#!/usr/bin/env python3
"""
D&D 5e Data Validation Functions

This module provides validation functions for all D&D 5e data types based on the
official system v5.1.9 data models. Use these functions to validate Brancalonia
data against the exact specifications from the official D&D 5e system.

Source: D&D 5e System v5.1.9 (release-5.1.9 branch)
Generated: September 27, 2025
"""

import re
import json
from typing import Any, Dict, List, Set, Optional, Union
from dataclasses import dataclass


# Configuration constants from D&D 5e system
SPELL_SCHOOLS = {
    "abj", "con", "div", "enc", "evo", "ill", "nec", "tra"
}

CREATURE_TYPES = {
    "aberration", "beast", "celestial", "construct", "dragon", "elemental",
    "fey", "fiend", "giant", "humanoid", "monstrosity", "ooze", "plant", "undead"
}

ITEM_RARITIES = {
    "common", "uncommon", "rare", "veryRare", "legendary", "artifact", ""
}

ABILITIES = {
    "str", "dex", "con", "int", "wis", "cha", "hon", "san"
}

CURRENCIES = {
    "pp", "gp", "ep", "sp", "cp"
}

FEATURE_TYPES = {
    "background", "class", "feat", "monster", "race", "legendary", "lair",
    "enchantment", "eldritch", "metamagic", "maneuver", "rune", "variant"
}

WEAPON_TYPES = {
    "simpleM", "simpleR", "martialM", "martialR", "natural", "improv", "siege"
}

ARMOR_TYPES = {
    "clothing", "light", "medium", "heavy", "natural", "shield"
}

ACTIVATION_TYPES = {
    "action", "bonus", "reaction", "minute", "hour", "day", "special",
    "legendary", "lair", "crew"
}

HIT_DIE_TYPES = {
    "d4", "d6", "d8", "d10", "d12", "d20"
}


@dataclass
class ValidationError:
    """Represents a validation error with field path and message."""
    field: str
    message: str
    value: Any = None


class ValidationResult:
    """Container for validation results."""

    def __init__(self):
        self.errors: List[ValidationError] = []
        self.warnings: List[ValidationError] = []
        self.is_valid = True

    def add_error(self, field: str, message: str, value: Any = None):
        """Add a validation error."""
        self.errors.append(ValidationError(field, message, value))
        self.is_valid = False

    def add_warning(self, field: str, message: str, value: Any = None):
        """Add a validation warning."""
        self.warnings.append(ValidationError(field, message, value))

    def __str__(self):
        lines = []
        if self.errors:
            lines.append("ERRORS:")
            for error in self.errors:
                lines.append(f"  {error.field}: {error.message}")
        if self.warnings:
            lines.append("WARNINGS:")
            for warning in self.warnings:
                lines.append(f"  {warning.field}: {warning.message}")
        return "\n".join(lines) if lines else "Valid"


def validate_identifier(value: str, field_name: str = "identifier") -> ValidationResult:
    """
    Validate an identifier field.

    Identifiers must be:
    - URL-safe (alphanumeric, hyphens, underscores only)
    - Lowercase recommended
    - Non-empty
    """
    result = ValidationResult()

    if not value:
        result.add_error(field_name, "Identifier cannot be empty")
        return result

    if not isinstance(value, str):
        result.add_error(field_name, "Identifier must be a string")
        return result

    # Check for valid identifier pattern
    if not re.match(r'^[a-zA-Z0-9_-]+$', value):
        result.add_error(field_name, "Identifier can only contain letters, numbers, hyphens, and underscores")

    # Check for uppercase (warning only)
    if value != value.lower():
        result.add_warning(field_name, "Identifier should be lowercase")

    return result


def validate_formula(value: str, field_name: str = "formula") -> ValidationResult:
    """
    Validate a dice formula field.

    Examples: "1d8+2", "2d6", "3", "@prof"
    """
    result = ValidationResult()

    if not value:
        return result  # Empty formulas are often allowed

    if not isinstance(value, str):
        result.add_error(field_name, "Formula must be a string")
        return result

    # Basic formula pattern (simplified)
    # Allows: numbers, dice notation, @variables, +, -, *, /, (, ), spaces
    if not re.match(r'^[0-9d@\+\-\*\/\(\)\s\w\.]+$', value):
        result.add_warning(field_name, f"Formula '{value}' contains unusual characters")

    return result


def validate_html_field(value: str, field_name: str) -> ValidationResult:
    """Validate HTML content field."""
    result = ValidationResult()

    # HTML fields can be empty or None
    if value is None or value == "":
        return result

    if not isinstance(value, str):
        result.add_error(field_name, "HTML field must be a string")

    return result


def validate_description_template(data: Dict[str, Any], path: str = "") -> ValidationResult:
    """Validate ItemDescriptionTemplate fields."""
    result = ValidationResult()

    # Required fields
    if "description" not in data:
        result.add_error(f"{path}description", "Description object is required")
        return result

    desc = data["description"]
    if not isinstance(desc, dict):
        result.add_error(f"{path}description", "Description must be an object")
        return result

    # Validate description fields
    desc_result = validate_html_field(desc.get("value"), f"{path}description.value")
    result.errors.extend(desc_result.errors)
    result.warnings.extend(desc_result.warnings)

    desc_result = validate_html_field(desc.get("chat"), f"{path}description.chat")
    result.errors.extend(desc_result.errors)
    result.warnings.extend(desc_result.warnings)

    # Validate identifier
    if "identifier" not in data:
        result.add_error(f"{path}identifier", "Identifier is required")
    else:
        id_result = validate_identifier(data["identifier"], f"{path}identifier")
        result.errors.extend(id_result.errors)
        result.warnings.extend(id_result.warnings)

    return result


def validate_physical_item_template(data: Dict[str, Any], path: str = "") -> ValidationResult:
    """Validate PhysicalItemTemplate fields."""
    result = ValidationResult()

    # Quantity
    quantity = data.get("quantity")
    if quantity is None:
        result.add_error(f"{path}quantity", "Quantity is required")
    elif not isinstance(quantity, (int, float)) or quantity < 0:
        result.add_error(f"{path}quantity", "Quantity must be a non-negative number")

    # Weight
    weight = data.get("weight")
    if weight is None:
        result.add_error(f"{path}weight", "Weight object is required")
    elif isinstance(weight, dict):
        weight_value = weight.get("value")
        if weight_value is None:
            result.add_error(f"{path}weight.value", "Weight value is required")
        elif not isinstance(weight_value, (int, float)) or weight_value < 0:
            result.add_error(f"{path}weight.value", "Weight value must be non-negative")

        weight_units = weight.get("units")
        if not weight_units:
            result.add_error(f"{path}weight.units", "Weight units are required")

    # Price
    price = data.get("price")
    if price is None:
        result.add_error(f"{path}price", "Price object is required")
    elif isinstance(price, dict):
        price_value = price.get("value")
        if price_value is None:
            result.add_error(f"{path}price.value", "Price value is required")
        elif not isinstance(price_value, (int, float)) or price_value < 0:
            result.add_error(f"{path}price.value", "Price value must be non-negative")

        denomination = price.get("denomination")
        if not denomination:
            result.add_error(f"{path}price.denomination", "Price denomination is required")
        elif denomination not in CURRENCIES:
            result.add_error(f"{path}price.denomination", f"Invalid currency: {denomination}")

    # Rarity
    rarity = data.get("rarity")
    if rarity is not None and rarity not in ITEM_RARITIES:
        result.add_error(f"{path}rarity", f"Invalid rarity: {rarity}")

    return result


def validate_spell_data(data: Dict[str, Any]) -> ValidationResult:
    """
    Validate a spell item according to SpellData schema.

    Args:
        data: The spell data dictionary

    Returns:
        ValidationResult with any errors or warnings
    """
    result = ValidationResult()

    # Validate base templates
    desc_result = validate_description_template(data)
    result.errors.extend(desc_result.errors)
    result.warnings.extend(desc_result.warnings)

    # Level (required)
    level = data.get("level")
    if level is None:
        result.add_error("level", "Spell level is required")
    elif not isinstance(level, int) or level < 0:
        result.add_error("level", "Spell level must be a non-negative integer")

    # School (required)
    school = data.get("school")
    if not school:
        result.add_error("school", "Spell school is required")
    elif school not in SPELL_SCHOOLS:
        result.add_error("school", f"Invalid spell school: {school}")

    # Materials (required object)
    materials = data.get("materials")
    if materials is None:
        result.add_error("materials", "Materials object is required")
    elif isinstance(materials, dict):
        # materials.value (required)
        if "value" not in materials:
            result.add_error("materials.value", "Materials description is required")

        # materials.consumed (required boolean)
        consumed = materials.get("consumed")
        if consumed is None:
            result.add_error("materials.consumed", "Materials consumed flag is required")
        elif not isinstance(consumed, bool):
            result.add_error("materials.consumed", "Materials consumed must be boolean")

        # materials.cost (required number >= 0)
        cost = materials.get("cost")
        if cost is None:
            result.add_error("materials.cost", "Materials cost is required")
        elif not isinstance(cost, (int, float)) or cost < 0:
            result.add_error("materials.cost", "Materials cost must be non-negative")

        # materials.supply (required number >= 0)
        supply = materials.get("supply")
        if supply is None:
            result.add_error("materials.supply", "Materials supply is required")
        elif not isinstance(supply, (int, float)) or supply < 0:
            result.add_error("materials.supply", "Materials supply must be non-negative")

    # Method (required)
    method = data.get("method")
    if method is None:
        result.add_error("method", "Spell method is required")

    # Prepared (required integer >= 0)
    prepared = data.get("prepared")
    if prepared is None:
        result.add_error("prepared", "Prepared state is required")
    elif not isinstance(prepared, int) or prepared < 0:
        result.add_error("prepared", "Prepared state must be non-negative integer")

    # Properties (optional set)
    properties = data.get("properties", [])
    if not isinstance(properties, (list, set)):
        result.add_error("properties", "Properties must be a list or set")

    # Validate activation, duration, range, target if present
    activation = data.get("activation")
    if activation and isinstance(activation, dict):
        act_type = activation.get("type")
        if act_type and act_type not in ACTIVATION_TYPES:
            result.add_warning("activation.type", f"Unknown activation type: {act_type}")

    return result


def validate_feat_data(data: Dict[str, Any]) -> ValidationResult:
    """
    Validate a feat item according to FeatData schema.

    Args:
        data: The feat data dictionary

    Returns:
        ValidationResult with any errors or warnings
    """
    result = ValidationResult()

    # Validate base templates
    desc_result = validate_description_template(data)
    result.errors.extend(desc_result.errors)
    result.warnings.extend(desc_result.warnings)

    # Requirements (required, can be null)
    if "requirements" not in data:
        result.add_error("requirements", "Requirements field is required (can be null/empty)")

    # Type
    feat_type = data.get("type")
    if feat_type and isinstance(feat_type, dict):
        type_value = feat_type.get("value")
        if type_value and type_value not in FEATURE_TYPES:
            result.add_warning("type.value", f"Unknown feature type: {type_value}")

    # Cover (optional, 0-1)
    cover = data.get("cover")
    if cover is not None:
        if not isinstance(cover, (int, float)) or cover < 0 or cover > 1:
            result.add_error("cover", "Cover must be a number between 0 and 1")

    # Prerequisites
    prereqs = data.get("prerequisites")
    if prereqs and isinstance(prereqs, dict):
        # Level (optional integer >= 0)
        level = prereqs.get("level")
        if level is not None:
            if not isinstance(level, int) or level < 0:
                result.add_error("prerequisites.level", "Level must be non-negative integer")

        # Items (optional set of identifiers)
        items = prereqs.get("items")
        if items and isinstance(items, (list, set)):
            for item in items:
                if not isinstance(item, str):
                    result.add_error("prerequisites.items", "All prerequisite items must be strings")

    # Properties (optional set)
    properties = data.get("properties", [])
    if not isinstance(properties, (list, set)):
        result.add_error("properties", "Properties must be a list or set")

    return result


def validate_class_data(data: Dict[str, Any]) -> ValidationResult:
    """
    Validate a class item according to ClassData schema.

    Args:
        data: The class data dictionary

    Returns:
        ValidationResult with any errors or warnings
    """
    result = ValidationResult()

    # Validate base templates
    desc_result = validate_description_template(data)
    result.errors.extend(desc_result.errors)
    result.warnings.extend(desc_result.warnings)

    # Hit Dice (required object)
    hd = data.get("hd")
    if hd is None:
        result.add_error("hd", "Hit dice object is required")
    elif isinstance(hd, dict):
        # Denomination (required, must match pattern)
        denomination = hd.get("denomination")
        if not denomination:
            result.add_error("hd.denomination", "Hit die denomination is required")
        elif denomination not in HIT_DIE_TYPES:
            result.add_error("hd.denomination", f"Invalid hit die type: {denomination}")

        # Spent (required integer >= 0)
        spent = hd.get("spent")
        if spent is None:
            result.add_error("hd.spent", "Hit dice spent is required")
        elif not isinstance(spent, int) or spent < 0:
            result.add_error("hd.spent", "Hit dice spent must be non-negative integer")

        # Additional (required formula)
        additional = hd.get("additional")
        if additional is not None:
            formula_result = validate_formula(additional, "hd.additional")
            result.errors.extend(formula_result.errors)
            result.warnings.extend(formula_result.warnings)

    # Levels (required integer >= 0)
    levels = data.get("levels")
    if levels is None:
        result.add_error("levels", "Class levels is required")
    elif not isinstance(levels, int) or levels < 0:
        result.add_error("levels", "Class levels must be non-negative integer")

    # Primary Ability
    primary_ability = data.get("primaryAbility")
    if primary_ability and isinstance(primary_ability, dict):
        abilities = primary_ability.get("value", [])
        if isinstance(abilities, (list, set)):
            for ability in abilities:
                if ability not in ABILITIES:
                    result.add_error("primaryAbility.value", f"Invalid ability: {ability}")

    # Spellcasting
    spellcasting = data.get("spellcasting")
    if spellcasting and isinstance(spellcasting, dict):
        progression = spellcasting.get("progression")
        if progression and progression not in {"full", "half", "third", "pact", "artificer", "none"}:
            result.add_warning("spellcasting.progression", f"Unknown progression: {progression}")

    return result


def validate_npc_data(data: Dict[str, Any]) -> ValidationResult:
    """
    Validate an NPC actor according to NPCData schema.

    Args:
        data: The NPC data dictionary

    Returns:
        ValidationResult with any errors or warnings
    """
    result = ValidationResult()

    # Attributes
    attributes = data.get("attributes")
    if attributes is None:
        result.add_error("attributes", "Attributes object is required")
        return result

    # HP (required)
    hp = attributes.get("hp")
    if hp is None:
        result.add_error("attributes.hp", "HP object is required")
    elif isinstance(hp, dict):
        # Value (required integer >= 0)
        value = hp.get("value")
        if value is None:
            result.add_error("attributes.hp.value", "HP value is required")
        elif not isinstance(value, int) or value < 0:
            result.add_error("attributes.hp.value", "HP value must be non-negative integer")

        # Max (required integer >= 0)
        max_hp = hp.get("max")
        if max_hp is None:
            result.add_error("attributes.hp.max", "HP max is required")
        elif not isinstance(max_hp, int) or max_hp < 0:
            result.add_error("attributes.hp.max", "HP max must be non-negative integer")

        # Formula (required)
        formula = hp.get("formula")
        if not formula:
            result.add_error("attributes.hp.formula", "HP formula is required")
        else:
            formula_result = validate_formula(formula, "attributes.hp.formula")
            result.errors.extend(formula_result.errors)
            result.warnings.extend(formula_result.warnings)

        # Temp (optional integer >= 0)
        temp = hp.get("temp")
        if temp is not None:
            if not isinstance(temp, int) or temp < 0:
                result.add_error("attributes.hp.temp", "Temp HP must be non-negative integer")

    # Details
    details = data.get("details")
    if details is None:
        result.add_error("details", "Details object is required")
    elif isinstance(details, dict):
        # Challenge Rating (required, can be null)
        cr = details.get("cr")
        if cr is not None:
            if not isinstance(cr, (int, float)) or cr < 0:
                result.add_error("details.cr", "Challenge rating must be non-negative number")

        # Type
        creature_type = details.get("type")
        if creature_type and isinstance(creature_type, dict):
            type_value = creature_type.get("value")
            if type_value and type_value not in CREATURE_TYPES:
                result.add_error("details.type.value", f"Invalid creature type: {type_value}")

    return result


def validate_weapon_data(data: Dict[str, Any]) -> ValidationResult:
    """
    Validate a weapon item according to WeaponData schema.

    Args:
        data: The weapon data dictionary

    Returns:
        ValidationResult with any errors or warnings
    """
    result = ValidationResult()

    # Validate base templates
    desc_result = validate_description_template(data)
    result.errors.extend(desc_result.errors)
    result.warnings.extend(desc_result.warnings)

    physical_result = validate_physical_item_template(data)
    result.errors.extend(physical_result.errors)
    result.warnings.extend(physical_result.warnings)

    # Type
    weapon_type = data.get("type")
    if weapon_type and isinstance(weapon_type, dict):
        type_value = weapon_type.get("value")
        if type_value and type_value not in WEAPON_TYPES:
            result.add_warning("type.value", f"Unknown weapon type: {type_value}")

    # Properties (optional set)
    properties = data.get("properties", [])
    if not isinstance(properties, (list, set)):
        result.add_error("properties", "Properties must be a list or set")

    # Mastery
    mastery = data.get("mastery")
    if mastery and isinstance(mastery, dict):
        progress = mastery.get("progress")
        if progress is not None:
            if not isinstance(progress, int) or progress < 0:
                result.add_error("mastery.progress", "Mastery progress must be non-negative integer")

    return result


def validate_equipment_data(data: Dict[str, Any]) -> ValidationResult:
    """
    Validate an equipment item according to EquipmentData schema.

    Args:
        data: The equipment data dictionary

    Returns:
        ValidationResult with any errors or warnings
    """
    result = ValidationResult()

    # Validate as weapon first (equipment extends weapon)
    weapon_result = validate_weapon_data(data)
    result.errors.extend(weapon_result.errors)
    result.warnings.extend(weapon_result.warnings)

    # Armor (required for armor items)
    armor = data.get("armor")
    if armor and isinstance(armor, dict):
        # Type (required)
        armor_type = armor.get("type")
        if not armor_type:
            result.add_error("armor.type", "Armor type is required")
        elif armor_type not in ARMOR_TYPES:
            result.add_error("armor.type", f"Invalid armor type: {armor_type}")

        # Value (required integer >= 0)
        value = armor.get("value")
        if value is None:
            result.add_error("armor.value", "Armor AC value is required")
        elif not isinstance(value, int) or value < 0:
            result.add_error("armor.value", "Armor AC value must be non-negative integer")

        # Magical bonus (optional integer)
        magical_bonus = armor.get("magicalBonus")
        if magical_bonus is not None:
            if not isinstance(magical_bonus, int):
                result.add_error("armor.magicalBonus", "Magical bonus must be integer")

    # Strength requirement (optional integer)
    strength = data.get("strength")
    if strength is not None:
        if not isinstance(strength, int) or strength < 0:
            result.add_error("strength", "Strength requirement must be non-negative integer")

    return result


def validate_item_by_type(item_type: str, data: Dict[str, Any]) -> ValidationResult:
    """
    Validate an item based on its type.

    Args:
        item_type: The type of item (spell, feat, class, etc.)
        data: The item data dictionary

    Returns:
        ValidationResult with any errors or warnings
    """
    validators = {
        "spell": validate_spell_data,
        "feat": validate_feat_data,
        "class": validate_class_data,
        "weapon": validate_weapon_data,
        "equipment": validate_equipment_data,
        "consumable": lambda d: validate_physical_item_template(d),
        "tool": lambda d: validate_physical_item_template(d),
        "loot": lambda d: validate_physical_item_template(d),
        "container": lambda d: validate_physical_item_template(d),
        "race": validate_feat_data,  # Similar structure to feat
        "background": validate_feat_data,  # Similar structure to feat
        "subclass": validate_feat_data,  # Similar structure to feat
    }

    validator = validators.get(item_type)
    if not validator:
        result = ValidationResult()
        result.add_warning("type", f"No specific validator for item type: {item_type}")
        # Fall back to basic description validation
        desc_result = validate_description_template(data)
        result.errors.extend(desc_result.errors)
        result.warnings.extend(desc_result.warnings)
        return result

    return validator(data)


def validate_actor_by_type(actor_type: str, data: Dict[str, Any]) -> ValidationResult:
    """
    Validate an actor based on its type.

    Args:
        actor_type: The type of actor (character, npc, vehicle)
        data: The actor data dictionary

    Returns:
        ValidationResult with any errors or warnings
    """
    if actor_type == "npc":
        return validate_npc_data(data)
    else:
        result = ValidationResult()
        result.add_warning("type", f"No specific validator for actor type: {actor_type}")
        return result


def validate_foundry_document(document: Dict[str, Any]) -> ValidationResult:
    """
    Validate a complete Foundry document (with _id, name, type, system, etc.).

    Args:
        document: The complete Foundry document

    Returns:
        ValidationResult with any errors or warnings
    """
    result = ValidationResult()

    # Basic document structure
    if not isinstance(document, dict):
        result.add_error("document", "Document must be a dictionary")
        return result

    # Required top-level fields
    if "name" not in document:
        result.add_error("name", "Document name is required")

    if "type" not in document:
        result.add_error("type", "Document type is required")
        return result

    doc_type = document["type"]
    system_data = document.get("system", {})

    # Validate system data based on document type
    if "system" in document:
        if doc_type in ["spell", "feat", "class", "subclass", "race", "background",
                       "weapon", "equipment", "consumable", "tool", "loot", "container"]:
            item_result = validate_item_by_type(doc_type, system_data)
            result.errors.extend(item_result.errors)
            result.warnings.extend(item_result.warnings)
        elif doc_type in ["character", "npc", "vehicle"]:
            actor_result = validate_actor_by_type(doc_type, system_data)
            result.errors.extend(actor_result.errors)
            result.warnings.extend(actor_result.warnings)

    return result


# Utility functions for batch validation

def validate_compendium_file(file_path: str) -> Dict[str, ValidationResult]:
    """
    Validate all documents in a compendium JSON file.

    Args:
        file_path: Path to the compendium JSON file

    Returns:
        Dictionary mapping document names to validation results
    """
    results = {}

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if isinstance(data, list):
            documents = data
        elif isinstance(data, dict) and "entries" in data:
            documents = data["entries"]
        else:
            return {"file_error": ValidationResult().add_error("file", "Invalid file format")}

        for doc in documents:
            name = doc.get("name", "unnamed")
            results[name] = validate_foundry_document(doc)

    except Exception as e:
        error_result = ValidationResult()
        error_result.add_error("file", f"Error reading file: {str(e)}")
        results["file_error"] = error_result

    return results


def print_validation_summary(results: Dict[str, ValidationResult]):
    """Print a summary of validation results."""
    total_docs = len(results)
    valid_docs = sum(1 for r in results.values() if r.is_valid)
    error_docs = total_docs - valid_docs
    total_errors = sum(len(r.errors) for r in results.values())
    total_warnings = sum(len(r.warnings) for r in results.values())

    print(f"\nValidation Summary:")
    print(f"  Total documents: {total_docs}")
    print(f"  Valid documents: {valid_docs}")
    print(f"  Documents with errors: {error_docs}")
    print(f"  Total errors: {total_errors}")
    print(f"  Total warnings: {total_warnings}")

    if error_docs > 0:
        print(f"\nDocuments with errors:")
        for name, result in results.items():
            if not result.is_valid:
                print(f"  {name}: {len(result.errors)} errors")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python dnd5e_validators.py <compendium_file.json>")
        sys.exit(1)

    file_path = sys.argv[1]
    print(f"Validating {file_path}...")

    results = validate_compendium_file(file_path)
    print_validation_summary(results)

    # Print detailed errors for invalid documents
    for name, result in results.items():
        if not result.is_valid:
            print(f"\n{name}:")
            print(result)