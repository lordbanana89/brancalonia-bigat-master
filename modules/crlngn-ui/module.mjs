/**
 * Brancalonia Settings System - Module Entry Point
 *
 * CSS files are registered in module.json for correct load order:
 * 1. brancalonia-tokens-unified.css (base tokens)
 * 2. crlngn-ui styles (vars, main, ui-*, scene-nav, chat, camera, sheets, players-list, token-wheel, other-modules)
 * 3. brancalonia theme variants (classic, dark, parchment, gold)
 * 4. brancalonia.css (main Brancalonia styles)
 * 5. brancalonia-dnd5e-v5.css (dnd5e v5+ overrides)
 * 6. covo-system.css (Covo system styles)
 */

import { BrancaloniaSettingsMain } from "./components/Main.mjs";

BrancaloniaSettingsMain.init();