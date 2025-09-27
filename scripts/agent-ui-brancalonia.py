#!/usr/bin/env python3
"""
AGENT_UI: Brancalonia UI/UX Customization Script
==============================================

Comprehensive UI customization script for Brancalonia module.
Creates Italian Renaissance-themed UI with tavern/rogue atmosphere.

Features:
- Enhanced CSS with Italian Renaissance theme
- Custom character sheet modifications
- Foundry UI hooks for D&D 5e overrides
- Asset generation for authentic Italian setting
- Module configuration updates
"""

import os
import json
import shutil
from pathlib import Path

class BrancaloniaUIAgent:
    def __init__(self, base_path="/Users/erik/Desktop/brancalonia-bigat-master"):
        self.base_path = Path(base_path)
        self.colors = {
            # Tavern/Renaissance color palette
            'tavern_wood': '#8B4513',        # Saddle brown
            'aged_parchment': '#F4E4BC',     # Warm cream
            'renaissance_gold': '#FFD700',    # Gold
            'tuscan_red': '#8B0000',         # Dark red
            'wine_red': '#722F37',           # Deep wine
            'venetian_blue': '#4682B4',      # Steel blue
            'florentine_green': '#228B22',   # Forest green
            'burnt_orange': '#CC5500',       # Burnt orange
            'antique_brass': '#CD7F32',      # Bronze
            'shadow_brown': '#654321',       # Dark brown
            'warm_ivory': '#FFF8DC',         # Cornsilk
            'deep_burgundy': '#800020'       # Burgundy
        }

        self.fonts = {
            'title': 'EB Garamond Bold',
            'heading': 'EB Garamond Bold',
            'body': 'EB Garamond Regular',
            'italic': 'EB Garamond Italic',
            'decorative': 'IM Fell',
            'ui': 'Benton',
            'grunge': 'Tracker Grunge'
        }

    def create_enhanced_css(self):
        """Generate enhanced Brancalonia CSS with Italian Renaissance theme"""
        css_content = f'''/* =========================
   BRANCALONIA ENHANCED UI CSS
   Italian Renaissance Theme with Tavern Atmosphere
   Compatible with Foundry VTT v13+
   ========================= */

/* Enhanced Font Definitions */
@font-face {{
  font-family: "Tracker Grunge";
  src: url("./fonts/tracker_grunge_regular.ttf");
  font-display: swap;
}}

@font-face {{
  font-family: "EB Garamond Regular";
  src: url("./fonts/ebgaramond_regular.ttf");
  font-display: swap;
}}

@font-face {{
  font-family: "EB Garamond Italic";
  src: url("./fonts/ebgaramond_italic.ttf");
  font-display: swap;
}}

@font-face {{
  font-family: "EB Garamond Bold";
  src: url("./fonts/ebgaramond_bold.ttf");
  font-display: swap;
}}

@font-face {{
  font-family: "IM Fell";
  src: url("./fonts/im_fell_english_regular.ttf");
  font-display: swap;
}}

@font-face {{
  font-family: "Benton";
  src: url("./fonts/bentonsans_regular.otf");
  font-display: swap;
}}

/* =========================
   Italian Renaissance Theme Variables
   ========================= */
:root {{
  /* Primary Brancalonia Colors */
  --brancalonia-red: {self.colors['tuscan_red']};
  --brancalonia-gold: {self.colors['renaissance_gold']};
  --brancalonia-wood: {self.colors['tavern_wood']};
  --brancalonia-parchment: {self.colors['aged_parchment']};
  --brancalonia-wine: {self.colors['wine_red']};
  --brancalonia-brass: {self.colors['antique_brass']};
  --brancalonia-ivory: {self.colors['warm_ivory']};
  --brancalonia-burgundy: {self.colors['deep_burgundy']};

  /* UI Element Colors */
  --brancalonia-bg-example: var(--brancalonia-parchment);
  --brancalonia-border: var(--brancalonia-wood);
  --brancalonia-accent: var(--brancalonia-gold);
  --brancalonia-text-primary: var(--brancalonia-red);
  --brancalonia-text-secondary: var(--brancalonia-wine);

  /* Tavern Atmosphere */
  --tavern-shadow: rgba(139, 69, 19, 0.4);
  --tavern-highlight: rgba(255, 215, 0, 0.3);
  --parchment-texture: linear-gradient(45deg, transparent 25%, rgba(139, 69, 19, 0.05) 25%);

  /* Font Variables */
  --font-title: "{self.fonts['title']}";
  --font-heading: "{self.fonts['heading']}";
  --font-body: "{self.fonts['body']}";
  --font-italic: "{self.fonts['italic']}";
  --font-decorative: "{self.fonts['decorative']}";
  --font-ui: "{self.fonts['ui']}";
}}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {{
  :root {{
    --brancalonia-red: #C42421;
    --brancalonia-parchment: #3a3633;
    --brancalonia-ivory: #2c2925;
    --brancalonia-bg-example: rgba(58, 54, 51, 0.8);
    --tavern-shadow: rgba(255, 215, 0, 0.2);
  }}
}}

/* =========================
   CHARACTER SHEET CUSTOMIZATIONS
   ========================= */

/* D&D 5e Character Sheet Overrides */
.dnd5e.sheet.actor .sheet-header {{
  background: linear-gradient(135deg, var(--brancalonia-wood), var(--brancalonia-wine));
  border: 2px solid var(--brancalonia-gold);
  border-radius: 8px;
  box-shadow: 0 4px 8px var(--tavern-shadow);
}}

.dnd5e.sheet.actor .sheet-header .profile-img {{
  border: 3px solid var(--brancalonia-gold);
  box-shadow: 0 0 10px var(--tavern-highlight);
}}

.dnd5e.sheet.actor .sheet-header h1 {{
  font-family: var(--font-title);
  color: var(--brancalonia-gold);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  font-size: 1.8em;
}}

/* Brancalonia-specific sections */
.brancalonia-infamia {{
  background: linear-gradient(90deg, var(--brancalonia-red), var(--brancalonia-burgundy));
  border: 2px solid var(--brancalonia-gold);
  border-radius: 6px;
  padding: 8px;
  margin: 4px 0;
  color: white;
  font-family: var(--font-heading);
}}

.brancalonia-baraonda {{
  background: var(--brancalonia-wood);
  border: 2px solid var(--brancalonia-brass);
  border-radius: 6px;
  padding: 6px;
  margin: 4px 0;
  color: var(--brancalonia-ivory);
}}

.brancalonia-lavori-sporchi {{
  background: linear-gradient(45deg, var(--brancalonia-wine), transparent);
  border: 1px dashed var(--brancalonia-gold);
  padding: 6px;
  margin: 4px 0;
  border-radius: 4px;
}}

.brancalonia-rifugio {{
  background: var(--brancalonia-parchment);
  border: 2px solid var(--brancalonia-wood);
  border-radius: 8px;
  padding: 10px;
  margin: 8px 0;
  box-shadow: inset 0 0 10px var(--tavern-shadow);
}}

/* Tabs and Navigation */
.dnd5e.sheet.actor .sheet-tabs {{
  background: var(--brancalonia-wood);
  border-bottom: 3px solid var(--brancalonia-gold);
}}

.dnd5e.sheet.actor .sheet-tabs .item {{
  background: var(--brancalonia-brass);
  border: 1px solid var(--brancalonia-gold);
  color: var(--brancalonia-ivory);
  font-family: var(--font-ui);
  font-weight: bold;
}}

.dnd5e.sheet.actor .sheet-tabs .item.active {{
  background: var(--brancalonia-gold);
  color: var(--brancalonia-wood);
  box-shadow: 0 2px 4px var(--tavern-highlight);
}}

/* =========================
   JOURNAL ENHANCEMENT
   ========================= */

.journal-entry-page h1,
.journal-entry-content h1 {{
  font-family: var(--font-title);
  font-size: 2.5em;
  text-align: center;
  border: none;
  color: var(--brancalonia-text-primary);
  text-shadow: 2px 2px 4px var(--tavern-shadow);
  position: relative;
}}

.journal-entry-page h1::before,
.journal-entry-content h1::before {{
  content: "⚜";
  color: var(--brancalonia-gold);
  font-size: 0.6em;
  margin-right: 0.3em;
}}

.journal-entry-page h1::after,
.journal-entry-content h1::after {{
  content: "⚜";
  color: var(--brancalonia-gold);
  font-size: 0.6em;
  margin-left: 0.3em;
}}

.journal-entry-page h2,
.journal-entry-content h2 {{
  font-family: var(--font-heading);
  font-size: 1.8em;
  border: none;
  margin-left: 5px;
  color: var(--brancalonia-text-primary);
  border-left: 4px solid var(--brancalonia-gold);
  padding-left: 10px;
}}

.journal-entry-page h3,
.journal-entry-content h3 {{
  font-family: var(--font-heading);
  font-size: 1.4em;
  border: none;
  margin-left: 5px;
  color: var(--brancalonia-text-secondary);
}}

/* Enhanced Journal Background */
.journal-sheet .journal-entry-content,
.sheet.journal-entry .journal-entry-content {{
  background-image:
    var(--parchment-texture),
    url('./assets/artwork/fond.webp');
  background-repeat: repeat;
  background-size:
    20px 20px,
    cover;
  background-blend-mode: multiply;
}}

/* =========================
   BRANCALONIA MODULE STYLES
   ========================= */

.brancalonia-mod .window-content {{
  background: linear-gradient(135deg, var(--brancalonia-parchment), var(--brancalonia-ivory));
  border: 2px solid var(--brancalonia-wood);
  box-shadow: 0 4px 12px var(--tavern-shadow);
}}

.brancalonia-mod .window-content h1 {{
  font-family: var(--font-title);
  font-size: 2.2em;
  text-align: center;
  border: none;
  color: var(--brancalonia-text-primary);
  background: linear-gradient(90deg, transparent, var(--brancalonia-gold), transparent);
  padding: 10px;
  border-radius: 4px;
  text-shadow: 1px 1px 2px var(--tavern-shadow);
}}

.brancalonia-mod .window-content h2 {{
  font-family: var(--font-heading);
  font-size: 1.8em;
  border: none;
  margin-left: 5px;
  color: var(--brancalonia-text-primary);
  border-left: 3px solid var(--brancalonia-brass);
  padding-left: 12px;
}}

.brancalonia-mod .window-content h3 {{
  font-family: var(--font-heading);
  font-size: 1.4em;
  border: none;
  margin-left: 5px;
  color: var(--brancalonia-text-secondary);
}}

.brancalonia-mod h4 {{
  font-family: var(--font-decorative);
  font-size: 1.2em;
  border: none;
  margin-left: 5px;
  letter-spacing: 1px;
  color: var(--brancalonia-wine);
}}

/* Enhanced Text Styles */
.brancalonia-mod .citation p {{
  font-family: var(--font-decorative);
  font-size: 1.1em;
  text-indent: 0.2cm;
  text-align: justify;
  font-style: italic;
  background: rgba(139, 69, 19, 0.1);
  padding: 8px;
  border-left: 3px solid var(--brancalonia-brass);
  margin: 10px 0;
}}

.brancalonia-mod p {{
  font-family: var(--font-body);
  font-size: 1.1em;
  text-indent: 0.2cm;
  text-align: justify;
  line-height: 1.6;
}}

.brancalonia-mod li {{
  font-family: var(--font-body);
  font-size: 1.1em;
  line-height: 1.5;
}}

.brancalonia-mod em {{
  font-family: var(--font-italic);
  font-size: 1.1em;
  color: var(--brancalonia-wine);
}}

/* Enhanced Examples */
.brancalonia-mod .exemple {{
  background: linear-gradient(135deg, var(--brancalonia-bg-example), var(--brancalonia-ivory));
  text-indent: 0cm;
  border: 2px solid var(--brancalonia-border);
  border-radius: 8px;
  box-shadow:
    0 4px 8px var(--tavern-shadow),
    inset 0 1px 0 var(--tavern-highlight);
  padding: 15px 20px;
  margin: 15px 0;
  position: relative;
}}

.brancalonia-mod .exemple::before {{
  content: "📜";
  position: absolute;
  top: -10px;
  left: 15px;
  background: var(--brancalonia-parchment);
  padding: 5px;
  border-radius: 50%;
  font-size: 1.2em;
}}

/* Enhanced Tables */
.brancalonia-mod table {{
  width: 95%;
  border-collapse: collapse;
  border: 3px solid var(--brancalonia-wood);
  margin: 1em auto;
  text-align: center;
  box-shadow: 0 4px 8px var(--tavern-shadow);
  background: var(--brancalonia-parchment);
}}

.brancalonia-mod table thead,
.brancalonia-mod table th {{
  font-family: var(--font-heading);
  color: var(--brancalonia-ivory);
  background: linear-gradient(135deg, var(--brancalonia-wood), var(--brancalonia-wine));
  font-weight: bold;
  font-size: 1.2em;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  padding: 12px 8px;
}}

.brancalonia-mod table tbody {{
  font-family: var(--font-body);
  font-size: 1em;
}}

.brancalonia-mod table tr:nth-child(even) {{
  background: rgba(139, 69, 19, 0.1);
}}

.brancalonia-mod table tr:hover {{
  background: var(--tavern-highlight);
}}

.brancalonia-mod table td {{
  border: 1px solid var(--brancalonia-brass);
  padding: 8px;
}}

/* Enhanced Icons and Logos */
.brancalonia-mod .logo {{
  border: 3px solid var(--brancalonia-gold);
  border-radius: 8px;
  box-shadow: 0 4px 8px var(--tavern-shadow);
  content: url('./assets/artwork/logo_generique.webp');
  display: block;
  margin: 20px auto;
  width: 20%;
}}

.brancalonia-mod .logo_systeme {{
  border: 3px solid var(--brancalonia-brass);
  border-radius: 8px;
  content: url('./assets/artwork/logo_systeme.webp');
  display: block;
  margin: 20px auto;
  width: 20%;
}}

.brancalonia-mod .logo_aventure {{
  border: 3px solid var(--brancalonia-wine);
  border-radius: 8px;
  content: url('./assets/artwork/logo_aventure.webp');
  display: block;
  margin: 20px auto;
  width: 20%;
}}

/* =========================
   UI WINDOWS AND DIALOGS
   ========================= */

/* Application Windows */
.app.window-app {{
  border: 2px solid var(--brancalonia-wood);
  box-shadow: 0 6px 12px var(--tavern-shadow);
}}

.app.window-app .window-header {{
  background: linear-gradient(135deg, var(--brancalonia-wood), var(--brancalonia-brass));
  border-bottom: 2px solid var(--brancalonia-gold);
  color: var(--brancalonia-ivory);
  font-family: var(--font-ui);
  font-weight: bold;
}}

.app.window-app .window-title {{
  font-family: var(--font-heading);
  color: var(--brancalonia-gold);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}}

/* Dialog Windows */
.dialog .window-content {{
  background: linear-gradient(135deg, var(--brancalonia-parchment), var(--brancalonia-ivory));
  border: 1px solid var(--brancalonia-brass);
}}

/* Buttons */
button, .button, input[type="button"] {{
  background: linear-gradient(135deg, var(--brancalonia-brass), var(--brancalonia-gold));
  border: 2px solid var(--brancalonia-wood);
  color: var(--brancalonia-wood);
  font-family: var(--font-ui);
  font-weight: bold;
  border-radius: 4px;
  box-shadow: 0 2px 4px var(--tavern-shadow);
  transition: all 0.2s ease;
}}

button:hover, .button:hover {{
  background: linear-gradient(135deg, var(--brancalonia-gold), var(--brancalonia-brass));
  box-shadow: 0 4px 8px var(--tavern-highlight);
  transform: translateY(-1px);
}}

/* =========================
   CHAT AND ROLLS
   ========================= */

#chat-log .message {{
  border: 1px solid var(--brancalonia-brass);
  background: var(--brancalonia-parchment);
  border-radius: 4px;
  margin: 2px 0;
}}

#chat-log .message.whisper {{
  background: linear-gradient(135deg, var(--brancalonia-wine), transparent);
  border-left: 4px solid var(--brancalonia-gold);
}}

.dice-roll {{
  background: var(--brancalonia-wood);
  color: var(--brancalonia-ivory);
  border: 2px solid var(--brancalonia-gold);
  border-radius: 6px;
  font-family: var(--font-ui);
  font-weight: bold;
}}

/* =========================
   SIDEBAR AND NAVIGATION
   ========================= */

#sidebar {{
  background: linear-gradient(180deg, var(--brancalonia-wood), var(--brancalonia-wine));
  border-right: 3px solid var(--brancalonia-gold);
}}

#sidebar .sidebar-tab {{
  background: var(--brancalonia-brass);
  border: 1px solid var(--brancalonia-gold);
  color: var(--brancalonia-ivory);
}}

#sidebar .sidebar-tab.active {{
  background: var(--brancalonia-gold);
  color: var(--brancalonia-wood);
}}

/* Directory Items */
.directory .directory-item {{
  border-bottom: 1px solid var(--brancalonia-brass);
  font-family: var(--font-ui);
}}

.directory .directory-item:hover {{
  background: var(--tavern-highlight);
}}

/* =========================
   RESPONSIVE DESIGN
   ========================= */

@media (max-width: 768px) {{
  .brancalonia-mod .window-content h1 {{
    font-size: 1.8em;
  }}

  .brancalonia-mod table {{
    font-size: 0.9em;
  }}

  .brancalonia-mod .two-col {{
    grid-template-columns: 1fr;
  }}
}}

/* =========================
   ACCESSIBILITY
   ========================= */

/* High contrast mode support */
@media (prefers-contrast: high) {{
  :root {{
    --brancalonia-text-primary: #000000;
    --brancalonia-text-secondary: #333333;
    --brancalonia-bg-example: #ffffff;
  }}
}}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {{
  button, .button {{
    transition: none;
  }}

  button:hover, .button:hover {{
    transform: none;
  }}
}}

/* Focus indicators */
button:focus, input:focus, select:focus {{
  outline: 3px solid var(--brancalonia-gold);
  outline-offset: 2px;
}}

/* =========================
   PRINT STYLES
   ========================= */

@media print {{
  .brancalonia-mod * {{
    background: white !important;
    color: black !important;
    box-shadow: none !important;
  }}

  .brancalonia-mod .window-content {{
    border: 1px solid black;
  }}
}}
'''

        css_file = self.base_path / "styles" / "brancalonia-enhanced.css"
        css_file.parent.mkdir(exist_ok=True)
        css_file.write_text(css_content, encoding='utf-8')
        print(f"✅ Created enhanced CSS: {css_file}")
        return css_file

    def create_ui_hooks(self):
        """Create UI hooks JavaScript module for D&D 5e overrides"""
        js_content = '''/**
 * Brancalonia UI Hooks
 *
 * JavaScript module for customizing D&D 5e UI elements with Italian Renaissance theme
 * Adds Brancalonia-specific UI elements and tavern atmosphere
 */

export class BrancaloniaUIHooks {

    static initialize() {
        console.log("🏛️ Brancalonia UI Hooks | Initializing Italian Renaissance theme");

        // Register hooks
        this.registerRenderHooks();
        this.registerSheetHooks();
        this.registerChatHooks();
        this.registerUIEnhancements();

        // Apply theme
        this.applyBrancaloniaTheme();

        console.log("✅ Brancalonia UI Hooks | Italian Renaissance theme applied");
    }

    static registerRenderHooks() {
        // Actor sheet rendering
        Hooks.on("renderActorSheet5eCharacter", (app, html, data) => {
            this.enhanceCharacterSheet(app, html, data);
        });

        // Item sheet rendering
        Hooks.on("renderItemSheet5e", (app, html, data) => {
            this.enhanceItemSheet(app, html, data);
        });

        // Journal rendering
        Hooks.on("renderJournalPageSheet", (app, html, data) => {
            this.enhanceJournalSheet(app, html, data);
        });

        // Application rendering
        Hooks.on("renderApplication", (app, html, data) => {
            this.enhanceGenericSheet(app, html, data);
        });
    }

    static registerSheetHooks() {
        // Add Brancalonia-specific elements to character sheets
        Hooks.on("renderActorSheet", (app, html, data) => {
            if (data.actor?.type === "character") {
                this.addBrancaloniaElements(html, data);
            }
        });
    }

    static registerChatHooks() {
        // Enhance chat messages
        Hooks.on("renderChatMessage", (app, html, data) => {
            this.enhanceChatMessage(html, data);
        });

        // Custom dice roll styling
        Hooks.on("diceSoNiceRollComplete", (chatMessageId) => {
            this.enhanceDiceRoll(chatMessageId);
        });
    }

    static registerUIEnhancements() {
        // Sidebar enhancements
        Hooks.on("renderSidebar", (app, html, data) => {
            this.enhanceSidebar(html);
        });

        // Hotbar enhancements
        Hooks.on("renderHotbar", (app, html, data) => {
            this.enhanceHotbar(html);
        });

        // Dialog enhancements
        Hooks.on("renderDialog", (app, html, data) => {
            this.enhanceDialog(html);
        });
    }

    static enhanceCharacterSheet(app, html, data) {
        // Add Brancalonia class for styling
        html.addClass("brancalonia-character-sheet");

        // Add Italian Renaissance decorative elements
        const header = html.find(".sheet-header");
        if (header.length) {
            header.prepend('<div class="brancalonia-ornament top">⚜</div>');
            header.append('<div class="brancalonia-ornament bottom">🏛️</div>');
        }

        // Customize profile image frame
        const profileImg = html.find(".profile-img");
        if (profileImg.length) {
            profileImg.wrap('<div class="brancalonia-portrait-frame"></div>');
        }

        // Add Infamia tracker if not present
        this.addInfamiaTracker(html, data);

        // Add Baraonda counter
        this.addBaraondaCounter(html, data);

        // Add Lavori Sporchi tracker
        this.addLavoriSporchiTracker(html, data);

        // Add Rifugio management
        this.addRifugioManager(html, data);

        console.log("🎭 Enhanced character sheet with Brancalonia elements");
    }

    static addInfamiaTracker(html, data) {
        const resourcesSection = html.find(".resources");
        if (resourcesSection.length && !html.find(".brancalonia-infamia").length) {
            const infamiaHtml = `
                <div class="brancalonia-infamia">
                    <div class="resource flex-group-center">
                        <label>🗡️ Infamia</label>
                        <div class="resource-content flexrow flex-group-center">
                            <input name="system.resources.infamia.value" type="text"
                                   value="${data.actor.system.resources?.infamia?.value || 0}"
                                   placeholder="0" data-dtype="Number">
                            <span class="sep">/</span>
                            <input name="system.resources.infamia.max" type="text"
                                   value="${data.actor.system.resources?.infamia?.max || 10}"
                                   placeholder="10" data-dtype="Number">
                        </div>
                    </div>
                </div>
            `;
            resourcesSection.append(infamiaHtml);
        }
    }

    static addBaraondaCounter(html, data) {
        const resourcesSection = html.find(".resources");
        if (resourcesSection.length && !html.find(".brancalonia-baraonda").length) {
            const baraondaHtml = `
                <div class="brancalonia-baraonda">
                    <div class="resource flex-group-center">
                        <label>🍺 Baraonda</label>
                        <div class="resource-content flexrow flex-group-center">
                            <input name="system.resources.baraonda.value" type="text"
                                   value="${data.actor.system.resources?.baraonda?.value || 0}"
                                   placeholder="0" data-dtype="Number">
                        </div>
                    </div>
                </div>
            `;
            resourcesSection.append(baraondaHtml);
        }
    }

    static addLavoriSporchiTracker(html, data) {
        const featuresTab = html.find('[data-tab="features"]');
        if (featuresTab.length && !html.find(".brancalonia-lavori-sporchi").length) {
            const lavoriHtml = `
                <div class="brancalonia-lavori-sporchi">
                    <h3>💰 Lavori Sporchi</h3>
                    <div class="lavori-sporchi-content">
                        <input name="system.details.lavoriSporchi" type="text"
                               value="${data.actor.system.details?.lavoriSporchi || ''}"
                               placeholder="Descrivi i lavori sporchi completati...">
                    </div>
                </div>
            `;
            featuresTab.prepend(lavoriHtml);
        }
    }

    static addRifugioManager(html, data) {
        const featuresTab = html.find('[data-tab="features"]');
        if (featuresTab.length && !html.find(".brancalonia-rifugio").length) {
            const rifugioHtml = `
                <div class="brancalonia-rifugio">
                    <h3>🏠 Rifugio</h3>
                    <div class="rifugio-content">
                        <div class="rifugio-details">
                            <label>Nome del Rifugio:</label>
                            <input name="system.details.rifugio.name" type="text"
                                   value="${data.actor.system.details?.rifugio?.name || ''}"
                                   placeholder="Es: La Taverna del Gatto Nero">
                        </div>
                        <div class="rifugio-details">
                            <label>Livello Comfort:</label>
                            <select name="system.details.rifugio.comfort">
                                <option value="modesto">Modesto</option>
                                <option value="confortevole">Confortevole</option>
                                <option value="lussuoso">Lussuoso</option>
                            </select>
                        </div>
                        <div class="rifugio-details">
                            <label>Descrizione:</label>
                            <textarea name="system.details.rifugio.description"
                                      placeholder="Descrivi il tuo rifugio...">${data.actor.system.details?.rifugio?.description || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;
            featuresTab.append(rifugioHtml);
        }
    }

    static enhanceItemSheet(app, html, data) {
        html.addClass("brancalonia-item-sheet");

        // Add Italian item type indicators
        const itemType = data.item.type;
        let iconClass = '';

        switch(itemType) {
            case 'weapon':
                iconClass = '⚔️';
                break;
            case 'equipment':
                iconClass = '🎒';
                break;
            case 'consumable':
                iconClass = '🧪';
                break;
            case 'spell':
                iconClass = '📜';
                break;
            case 'feat':
                iconClass = '🏅';
                break;
            default:
                iconClass = '📋';
        }

        const header = html.find(".sheet-header h4");
        if (header.length) {
            header.prepend(`<span class="brancalonia-item-icon">${iconClass}</span> `);
        }
    }

    static enhanceJournalSheet(app, html, data) {
        html.addClass("brancalonia-journal");

        // Add parchment texture overlay
        const content = html.find(".journal-entry-content");
        if (content.length) {
            content.prepend('<div class="brancalonia-parchment-overlay"></div>');
        }

        // Enhance content links for Italian terms
        this.enhanceContentLinks(html);
    }

    static enhanceContentLinks(html) {
        // Add tooltips for Italian gaming terms
        const italianTerms = {
            'Infamia': 'Reputazione negativa del personaggio nel mondo criminale',
            'Baraonda': 'Contatore per le risse da taverna',
            'Rifugio': 'Base operativa del personaggio o gruppo',
            'Compagnia': 'Gruppo di avventurieri Brancalonia',
            'Malefatte': 'Crimini e misfatti commessi',
            'Emeriticenze': 'Privilegi speciali di Brancalonia',
            'Lavori Sporchi': 'Missioni e incarichi illegali'
        };

        Object.entries(italianTerms).forEach(([term, description]) => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            html.find('p, li, td').each(function() {
                let content = $(this).html();
                content = content.replace(regex, `<span class="brancalonia-term" title="${description}">${term}</span>`);
                $(this).html(content);
            });
        });
    }

    static enhanceChatMessage(html, data) {
        // Add Italian flair to chat messages
        if (data.message.flavor) {
            html.addClass("brancalonia-chat-message");

            // Add decorative elements for certain message types
            if (data.message.flavor.includes("Infamia")) {
                html.find(".message-header").prepend('<span class="chat-icon">🗡️</span>');
            } else if (data.message.flavor.includes("Baraonda")) {
                html.find(".message-header").prepend('<span class="chat-icon">🍺</span>');
            } else if (data.message.flavor.includes("Rifugio")) {
                html.find(".message-header").prepend('<span class="chat-icon">🏠</span>');
            }
        }
    }

    static enhanceDiceRoll(chatMessageId) {
        // Add Italian exclamations to critical rolls
        const message = game.messages.get(chatMessageId);
        if (message?.rolls) {
            message.rolls.forEach(roll => {
                if (roll.dice && roll.dice.length > 0) {
                    const die = roll.dice[0];
                    if (die.total === die.faces) {
                        // Critical success - add Italian celebration
                        ChatMessage.create({
                            content: `<em style="color: gold;">🎉 Fantastico! Colpo critico! 🎯</em>`,
                            whisper: [game.user.id]
                        });
                    } else if (die.total === 1) {
                        // Critical failure - add Italian commiseration
                        ChatMessage.create({
                            content: `<em style="color: red;">💥 Madonna! Che sfortuna! 😱</em>`,
                            whisper: [game.user.id]
                        });
                    }
                }
            });
        }
    }

    static enhanceSidebar(html) {
        html.addClass("brancalonia-sidebar");

        // Add decorative header
        const nav = html.find("#sidebar-tabs");
        if (nav.length) {
            nav.before('<div class="brancalonia-sidebar-header">🏛️ Regno di Taglia 🏛️</div>');
        }
    }

    static enhanceHotbar(html) {
        html.addClass("brancalonia-hotbar");

        // Style macro slots with Italian theme
        html.find(".macro").each(function() {
            $(this).addClass("brancalonia-macro-slot");
        });
    }

    static enhanceDialog(html) {
        html.addClass("brancalonia-dialog");

        // Add Italian button text where appropriate
        html.find('button[data-button="yes"]').html("Sì");
        html.find('button[data-button="no"]').html("No");
        html.find('button[data-button="ok"]').html("Va bene");
        html.find('button[data-button="cancel"]').html("Annulla");
    }

    static enhanceGenericSheet(app, html, data) {
        // Apply general Brancalonia styling to any sheet
        if (html.hasClass("app") && !html.hasClass("brancalonia-styled")) {
            html.addClass("brancalonia-styled");

            // Add subtle Italian theming
            const header = html.find(".window-header");
            if (header.length && header.find(".brancalonia-window-ornament").length === 0) {
                header.append('<span class="brancalonia-window-ornament">⚜</span>');
            }
        }
    }

    static addBrancaloniaElements(html, data) {
        // Add custom Brancalonia sections to any character sheet
        const actor = data.actor;

        // Check if this is a Brancalonia character (has Italian background or class)
        const isBrancaloniaCharacter = this.isBrancaloniaCharacter(actor);

        if (isBrancaloniaCharacter) {
            html.addClass("brancalonia-character");

            // Add visual indicators
            const nameField = html.find('input[name="name"]');
            if (nameField.length) {
                nameField.before('<span class="brancalonia-character-indicator" title="Personaggio di Brancalonia">🇮🇹</span>');
            }
        }
    }

    static isBrancaloniaCharacter(actor) {
        // Check various indicators that this is a Brancalonia character
        const background = actor.system.details?.background?.toLowerCase();
        const classes = actor.items.filter(i => i.type === "class");

        // Italian backgrounds or Brancalonia-specific content
        const italianBackgrounds = ['furfante', 'mariuolo', 'scugnizzo', 'mercante'];

        return italianBackgrounds.some(bg => background?.includes(bg)) ||
               classes.some(cls => cls.name.includes('Brancalonia')) ||
               actor.system.resources?.infamia !== undefined;
    }

    static applyBrancaloniaTheme() {
        // Apply theme-wide enhancements
        $('body').addClass('brancalonia-theme');

        // Add custom CSS variables for dynamic theming
        const root = document.documentElement;
        root.style.setProperty('--brancalonia-active', 'true');

        // Apply favicon if available
        this.updateFavicon();

        // Custom cursor for Italian flair (optional)
        this.applyCustomCursor();
    }

    static updateFavicon() {
        const favicon = document.querySelector('link[rel="icon"]');
        const brancaloniaIcon = '/modules/brancalonia-bigat/assets/artwork/favicon.ico';

        if (favicon && game.modules.get('brancalonia-bigat')?.active) {
            favicon.href = brancaloniaIcon;
        }
    }

    static applyCustomCursor() {
        // Optional: Apply Italian-themed cursor
        const style = document.createElement('style');
        style.textContent = `
            .brancalonia-theme {
                cursor: url('/modules/brancalonia-bigat/assets/ui/cursors/default.cur'), auto;
            }
            .brancalonia-theme button:hover {
                cursor: url('/modules/brancalonia-bigat/assets/ui/cursors/pointer.cur'), pointer;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when Foundry is ready
Hooks.once("ready", () => {
    BrancaloniaUIHooks.initialize();
});

// Re-apply theme when settings change
Hooks.on("updateSetting", (setting) => {
    if (setting.key.includes("brancalonia")) {
        BrancaloniaUIHooks.applyBrancaloniaTheme();
    }
});
'''

        js_file = self.base_path / "modules" / "brancalonia-ui-hooks.js"
        js_file.write_text(js_content, encoding='utf-8')
        print(f"✅ Created UI hooks module: {js_file}")
        return js_file

    def create_character_sheet_styles(self):
        """Create character sheet specific CSS"""
        css_content = f'''/* =========================
   BRANCALONIA CHARACTER SHEET STYLES
   Italian Renaissance Character Sheets
   ========================= */

/* Character Sheet Layout */
.dnd5e.sheet.actor.character {{
  background: linear-gradient(135deg, {self.colors['aged_parchment']}, {self.colors['warm_ivory']});
  border: 3px solid {self.colors['tavern_wood']};
  border-radius: 12px;
  box-shadow: 0 8px 16px {self.colors['shadow_brown']}44;
}}

/* Header Enhancements */
.dnd5e.sheet.actor .sheet-header {{
  background:
    linear-gradient(45deg, transparent 25%, {self.colors['tavern_wood']}22 25%),
    linear-gradient(135deg, {self.colors['tavern_wood']}, {self.colors['wine_red']});
  border: 3px solid {self.colors['renaissance_gold']};
  border-radius: 8px;
  box-shadow:
    0 4px 8px {self.colors['shadow_brown']}66,
    inset 0 1px 0 {self.colors['renaissance_gold']}44;
  position: relative;
}}

.dnd5e.sheet.actor .sheet-header::before {{
  content: "";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 20px;
  background: {self.colors['renaissance_gold']};
  border-radius: 20px 20px 0 0;
  box-shadow: inset 0 2px 4px {self.colors['shadow_brown']};
}}

/* Profile Image Frame */
.dnd5e.sheet.actor .sheet-header .profile-img {{
  border: 4px solid {self.colors['renaissance_gold']};
  border-radius: 50%;
  box-shadow:
    0 0 15px {self.colors['renaissance_gold']}66,
    inset 0 0 10px {self.colors['shadow_brown']}33;
  position: relative;
}}

.brancalonia-portrait-frame {{
  position: relative;
  display: inline-block;
}}

.brancalonia-portrait-frame::before {{
  content: "⚜";
  position: absolute;
  top: -5px;
  right: -5px;
  background: {self.colors['renaissance_gold']};
  color: {self.colors['tavern_wood']};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  z-index: 1;
}}

/* Character Name */
.dnd5e.sheet.actor .sheet-header h1 {{
  font-family: {self.fonts['title']};
  color: {self.colors['renaissance_gold']};
  text-shadow:
    2px 2px 4px {self.colors['shadow_brown']},
    0 0 10px {self.colors['renaissance_gold']}66;
  font-size: 1.8em;
  text-align: center;
  margin: 0;
  padding: 10px;
  position: relative;
}}

.dnd5e.sheet.actor .sheet-header h1::before,
.dnd5e.sheet.actor .sheet-header h1::after {{
  content: "❦";
  font-size: 0.7em;
  color: {self.colors['antique_brass']};
  margin: 0 10px;
}}

/* Class and Level */
.dnd5e.sheet.actor .sheet-header .charlevel {{
  background: linear-gradient(90deg, transparent, {self.colors['antique_brass']}, transparent);
  color: {self.colors['warm_ivory']};
  font-family: {self.fonts['heading']};
  text-align: center;
  padding: 5px;
  border-radius: 4px;
  font-weight: bold;
}}

/* Tabs */
.dnd5e.sheet.actor .sheet-tabs {{
  background: linear-gradient(135deg, {self.colors['tavern_wood']}, {self.colors['shadow_brown']});
  border-bottom: 3px solid {self.colors['renaissance_gold']};
  border-radius: 8px 8px 0 0;
}}

.dnd5e.sheet.actor .sheet-tabs .item {{
  background: {self.colors['antique_brass']};
  border: 1px solid {self.colors['renaissance_gold']};
  border-bottom: none;
  color: {self.colors['warm_ivory']};
  font-family: {self.fonts['ui']};
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 2px;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
}}

.dnd5e.sheet.actor .sheet-tabs .item:hover {{
  background: {self.colors['renaissance_gold']};
  color: {self.colors['tavern_wood']};
  transform: translateY(-2px);
  box-shadow: 0 4px 8px {self.colors['shadow_brown']}66;
}}

.dnd5e.sheet.actor .sheet-tabs .item.active {{
  background: {self.colors['renaissance_gold']};
  color: {self.colors['tavern_wood']};
  box-shadow:
    0 2px 4px {self.colors['shadow_brown']},
    inset 0 2px 4px {self.colors['warm_ivory']}44;
  transform: translateY(-1px);
}}

/* Ability Scores */
.dnd5e.sheet.actor .ability-scores {{
  background: linear-gradient(135deg, {self.colors['aged_parchment']}, {self.colors['warm_ivory']});
  border: 2px solid {self.colors['antique_brass']};
  border-radius: 8px;
  padding: 10px;
  margin: 10px 0;
}}

.dnd5e.sheet.actor .ability-scores .ability {{
  background: {self.colors['warm_ivory']};
  border: 2px solid {self.colors['tavern_wood']};
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  margin: 2px;
  box-shadow: inset 0 2px 4px {self.colors['shadow_brown']}22;
  transition: all 0.2s ease;
}}

.dnd5e.sheet.actor .ability-scores .ability:hover {{
  background: {self.colors['aged_parchment']};
  border-color: {self.colors['renaissance_gold']};
  transform: scale(1.05);
}}

.dnd5e.sheet.actor .ability-scores .ability .ability-name {{
  font-family: {self.fonts['ui']};
  font-weight: bold;
  color: {self.colors['wine_red']};
  text-transform: uppercase;
  font-size: 0.8em;
  letter-spacing: 1px;
}}

.dnd5e.sheet.actor .ability-scores .ability .ability-score {{
  font-family: {self.fonts['heading']};
  font-size: 1.8em;
  font-weight: bold;
  color: {self.colors['tuscan_red']};
}}

.dnd5e.sheet.actor .ability-scores .ability .ability-mod {{
  font-family: {self.fonts['body']};
  color: {self.colors['shadow_brown']};
  font-size: 1em;
}}

/* Resources */
.dnd5e.sheet.actor .resources {{
  background: linear-gradient(135deg, {self.colors['aged_parchment']}, {self.colors['warm_ivory']});
  border: 2px solid {self.colors['antique_brass']};
  border-radius: 8px;
  padding: 10px;
  margin: 10px 0;
}}

.dnd5e.sheet.actor .resources .resource {{
  background: {self.colors['warm_ivory']};
  border: 1px solid {self.colors['tavern_wood']};
  border-radius: 4px;
  padding: 5px;
  margin: 3px 0;
}}

/* Brancalonia-specific Resources */
.brancalonia-infamia {{
  background: linear-gradient(90deg, {self.colors['tuscan_red']}, {self.colors['deep_burgundy']}) !important;
  border: 2px solid {self.colors['renaissance_gold']} !important;
  color: {self.colors['warm_ivory']} !important;
  text-shadow: 1px 1px 2px {self.colors['shadow_brown']};
}}

.brancalonia-infamia label {{
  font-family: {self.fonts['heading']};
  font-weight: bold;
  color: {self.colors['renaissance_gold']};
}}

.brancalonia-baraonda {{
  background: {self.colors['tavern_wood']} !important;
  border: 2px solid {self.colors['antique_brass']} !important;
  color: {self.colors['warm_ivory']} !important;
}}

.brancalonia-baraonda label {{
  font-family: {self.fonts['heading']};
  font-weight: bold;
  color: {self.colors['aged_parchment']};
}}

.brancalonia-lavori-sporchi {{
  background: linear-gradient(45deg, {self.colors['wine_red']}44, transparent) !important;
  border: 1px dashed {self.colors['renaissance_gold']} !important;
  border-radius: 4px;
  padding: 10px;
  margin: 8px 0;
}}

.brancalonia-lavori-sporchi h3 {{
  font-family: {self.fonts['heading']};
  color: {self.colors['wine_red']};
  margin: 0 0 8px 0;
}}

.brancalonia-rifugio {{
  background: {self.colors['aged_parchment']} !important;
  border: 2px solid {self.colors['tavern_wood']} !important;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  box-shadow: inset 0 0 10px {self.colors['shadow_brown']}33;
}}

.brancalonia-rifugio h3 {{
  font-family: {self.fonts['heading']};
  color: {self.colors['tavern_wood']};
  text-align: center;
  margin: 0 0 10px 0;
  border-bottom: 2px solid {self.colors['antique_brass']};
  padding-bottom: 5px;
}}

.rifugio-details {{
  margin: 8px 0;
}}

.rifugio-details label {{
  font-family: {self.fonts['ui']};
  font-weight: bold;
  color: {self.colors['wine_red']};
  display: block;
  margin-bottom: 3px;
}}

.rifugio-details input,
.rifugio-details select,
.rifugio-details textarea {{
  width: 100%;
  background: {self.colors['warm_ivory']};
  border: 1px solid {self.colors['antique_brass']};
  border-radius: 3px;
  padding: 4px;
  font-family: {self.fonts['body']};
}}

/* Skills */
.dnd5e.sheet.actor .skills-list {{
  background: {self.colors['aged_parchment']};
  border: 2px solid {self.colors['antique_brass']};
  border-radius: 8px;
  padding: 10px;
}}

.dnd5e.sheet.actor .skills-list .skill {{
  border-bottom: 1px dotted {self.colors['antique_brass']};
  padding: 3px 0;
  transition: background 0.2s ease;
}}

.dnd5e.sheet.actor .skills-list .skill:hover {{
  background: {self.colors['warm_ivory']};
}}

.dnd5e.sheet.actor .skills-list .skill .skill-name {{
  font-family: {self.fonts['body']};
  color: {self.colors['wine_red']};
}}

/* Combat Stats */
.dnd5e.sheet.actor .combat-stats {{
  background: linear-gradient(135deg, {self.colors['wine_red']}, {self.colors['tuscan_red']});
  color: {self.colors['warm_ivory']};
  border: 3px solid {self.colors['renaissance_gold']};
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}}

.dnd5e.sheet.actor .combat-stats .combat-stat {{
  background: {self.colors['shadow_brown']}44;
  border: 1px solid {self.colors['antique_brass']};
  border-radius: 4px;
  padding: 8px;
  margin: 5px;
}}

.dnd5e.sheet.actor .combat-stats .combat-stat .stat-name {{
  font-family: {self.fonts['ui']};
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: {self.colors['renaissance_gold']};
}}

.dnd5e.sheet.actor .combat-stats .combat-stat .stat-value {{
  font-family: {self.fonts['heading']};
  font-size: 1.5em;
  font-weight: bold;
  color: {self.colors['warm_ivory']};
}}

/* Inventory */
.dnd5e.sheet.actor .inventory {{
  background: {self.colors['aged_parchment']};
  border: 2px solid {self.colors['antique_brass']};
  border-radius: 8px;
  padding: 10px;
}}

.dnd5e.sheet.actor .inventory .item {{
  border-bottom: 1px solid {self.colors['antique_brass']};
  padding: 5px 0;
  transition: background 0.2s ease;
}}

.dnd5e.sheet.actor .inventory .item:hover {{
  background: {self.colors['warm_ivory']};
}}

.dnd5e.sheet.actor .inventory .item .item-name {{
  font-family: {self.fonts['body']};
  color: {self.colors['wine_red']};
  font-weight: bold;
}}

/* Spells */
.dnd5e.sheet.actor .spellbook {{
  background: linear-gradient(135deg, {self.colors['aged_parchment']}, {self.colors['warm_ivory']});
  border: 2px solid {self.colors['antique_brass']};
  border-radius: 8px;
  padding: 10px;
}}

.dnd5e.sheet.actor .spellbook .spell-level {{
  background: {self.colors['wine_red']};
  color: {self.colors['warm_ivory']};
  border-radius: 6px;
  padding: 8px;
  margin: 8px 0;
  font-family: {self.fonts['heading']};
  text-align: center;
}}

/* Biography */
.dnd5e.sheet.actor .biography {{
  background: {self.colors['aged_parchment']};
  border: 2px solid {self.colors['antique_brass']};
  border-radius: 8px;
  padding: 15px;
  font-family: {self.fonts['body']};
  line-height: 1.6;
}}

.dnd5e.sheet.actor .biography h1,
.dnd5e.sheet.actor .biography h2,
.dnd5e.sheet.actor .biography h3 {{
  color: {self.colors['wine_red']};
  font-family: {self.fonts['heading']};
}}

/* Ornamental Elements */
.brancalonia-ornament {{
  position: absolute;
  color: {self.colors['renaissance_gold']};
  font-size: 1.5em;
  text-shadow: 1px 1px 2px {self.colors['shadow_brown']};
}}

.brancalonia-ornament.top {{
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
}}

.brancalonia-ornament.bottom {{
  bottom: -15px;
  right: 20px;
}}

.brancalonia-character-indicator {{
  display: inline-block;
  margin-right: 5px;
  font-size: 1.2em;
  filter: drop-shadow(1px 1px 2px {self.colors['shadow_brown']});
}}

/* Responsive Design */
@media (max-width: 768px) {{
  .dnd5e.sheet.actor .sheet-header h1 {{
    font-size: 1.4em;
  }}

  .dnd5e.sheet.actor .ability-scores .ability {{
    margin: 1px;
    padding: 4px;
  }}

  .brancalonia-rifugio {{
    padding: 10px;
  }}
}}
'''

        css_file = self.base_path / "styles" / "brancalonia-character-sheets.css"
        css_file.write_text(css_content, encoding='utf-8')
        print(f"✅ Created character sheet CSS: {css_file}")
        return css_file

    def create_ui_assets(self):
        """Create UI asset directories and placeholder files"""

        # Create directory structure
        ui_dirs = [
            "ui/banners",
            "ui/frames",
            "ui/icons",
            "ui/cursors",
            "ui/backgrounds",
            "ui/ornaments"
        ]

        for ui_dir in ui_dirs:
            dir_path = self.base_path / ui_dir
            dir_path.mkdir(parents=True, exist_ok=True)

            # Create a README for each directory
            readme_content = self.get_asset_readme(ui_dir)
            readme_file = dir_path / "README.md"
            readme_file.write_text(readme_content, encoding='utf-8')

        print(f"✅ Created UI asset directories")

        # Create CSS for UI elements
        ui_elements_css = f'''/* =========================
   BRANCALONIA UI ELEMENTS
   Italian Renaissance UI Assets
   ========================= */

/* Banner Styles */
.brancalonia-banner {{
  background: linear-gradient(135deg, {self.colors['tavern_wood']}, {self.colors['wine_red']});
  border: 3px solid {self.colors['renaissance_gold']};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}}

.brancalonia-banner::before {{
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    {self.colors['renaissance_gold']}22 10px,
    {self.colors['renaissance_gold']}22 20px
  );
  opacity: 0.3;
  z-index: 0;
}}

.brancalonia-banner-content {{
  position: relative;
  z-index: 1;
  color: {self.colors['warm_ivory']};
  font-family: {self.fonts['title']};
  text-shadow: 2px 2px 4px {self.colors['shadow_brown']};
}}

/* Frame Styles */
.brancalonia-frame {{
  border: 8px solid;
  border-image: linear-gradient(45deg,
    {self.colors['renaissance_gold']},
    {self.colors['antique_brass']},
    {self.colors['renaissance_gold']}
  ) 1;
  border-radius: 12px;
  padding: 15px;
  background: {self.colors['aged_parchment']};
  position: relative;
}}

.brancalonia-frame::before {{
  content: "⚜";
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: {self.colors['renaissance_gold']};
  color: {self.colors['tavern_wood']};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}}

.brancalonia-frame.ornate {{
  border-width: 12px;
  border-image: repeating-linear-gradient(
    45deg,
    {self.colors['renaissance_gold']},
    {self.colors['renaissance_gold']} 10px,
    {self.colors['antique_brass']} 10px,
    {self.colors['antique_brass']} 20px
  ) 1;
}}

.brancalonia-frame.ornate::after {{
  content: "❦";
  position: absolute;
  bottom: -12px;
  right: 20px;
  background: {self.colors['antique_brass']};
  color: {self.colors['warm_ivory']};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}}

/* Icon Containers */
.brancalonia-icon {{
  display: inline-block;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, {self.colors['renaissance_gold']}, {self.colors['antique_brass']});
  border: 2px solid {self.colors['tavern_wood']};
  border-radius: 6px;
  text-align: center;
  line-height: 28px;
  color: {self.colors['tavern_wood']};
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 4px {self.colors['shadow_brown']}66;
  transition: all 0.2s ease;
}}

.brancalonia-icon:hover {{
  transform: scale(1.1);
  box-shadow: 0 4px 8px {self.colors['shadow_brown']}88;
}}

.brancalonia-icon.large {{
  width: 48px;
  height: 48px;
  line-height: 44px;
  font-size: 24px;
  border-radius: 8px;
}}

.brancalonia-icon.small {{
  width: 24px;
  height: 24px;
  line-height: 20px;
  font-size: 12px;
  border-radius: 4px;
}}

/* Ornament Styles */
.brancalonia-ornament-corner {{
  position: absolute;
  width: 40px;
  height: 40px;
  background: {self.colors['renaissance_gold']};
  clip-path: polygon(0 0, 100% 0, 0 100%);
}}

.brancalonia-ornament-corner.top-left {{
  top: 0;
  left: 0;
}}

.brancalonia-ornament-corner.top-right {{
  top: 0;
  right: 0;
  transform: rotate(90deg);
}}

.brancalonia-ornament-corner.bottom-left {{
  bottom: 0;
  left: 0;
  transform: rotate(-90deg);
}}

.brancalonia-ornament-corner.bottom-right {{
  bottom: 0;
  right: 0;
  transform: rotate(180deg);
}}

/* Background Patterns */
.brancalonia-bg-parchment {{
  background:
    radial-gradient(circle at 20% 30%, {self.colors['aged_parchment']}44 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, {self.colors['tavern_wood']}22 1px, transparent 1px),
    linear-gradient(135deg, {self.colors['aged_parchment']}, {self.colors['warm_ivory']});
  background-size: 30px 30px, 40px 40px, 100% 100%;
}}

.brancalonia-bg-tavern {{
  background:
    repeating-linear-gradient(
      45deg,
      {self.colors['tavern_wood']},
      {self.colors['tavern_wood']} 2px,
      transparent 2px,
      transparent 20px
    ),
    linear-gradient(135deg, {self.colors['wine_red']}, {self.colors['deep_burgundy']});
}}

.brancalonia-bg-renaissance {{
  background:
    radial-gradient(circle at center, {self.colors['renaissance_gold']}33 2px, transparent 2px),
    linear-gradient(45deg, {self.colors['aged_parchment']}, {self.colors['warm_ivory']});
  background-size: 50px 50px, 100% 100%;
}}

/* Cursor Styles (for reference) */
.brancalonia-cursor-default {{
  cursor: url('ui/cursors/default.cur'), auto;
}}

.brancalonia-cursor-pointer {{
  cursor: url('ui/cursors/pointer.cur'), pointer;
}}

.brancalonia-cursor-text {{
  cursor: url('ui/cursors/text.cur'), text;
}}

/* Special Effects */
.brancalonia-glow {{
  box-shadow: 0 0 20px {self.colors['renaissance_gold']}66;
  animation: brancalonia-pulse 2s ease-in-out infinite alternate;
}}

@keyframes brancalonia-pulse {{
  from {{
    box-shadow: 0 0 20px {self.colors['renaissance_gold']}66;
  }}
  to {{
    box-shadow: 0 0 30px {self.colors['renaissance_gold']}88;
  }}
}}

.brancalonia-shimmer {{
  position: relative;
  overflow: hidden;
}}

.brancalonia-shimmer::before {{
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    {self.colors['renaissance_gold']}44,
    transparent
  );
  animation: brancalonia-shimmer 2s ease-in-out infinite;
}}

@keyframes brancalonia-shimmer {{
  0% {{
    left: -100%;
  }}
  50%, 100% {{
    left: 100%;
  }}
}}
'''

        ui_css_file = self.base_path / "styles" / "brancalonia-ui-elements.css"
        ui_css_file.write_text(ui_elements_css, encoding='utf-8')
        print(f"✅ Created UI elements CSS: {ui_css_file}")

        return ui_css_file

    def get_asset_readme(self, asset_type):
        """Get README content for asset directories"""
        asset_descriptions = {
            "ui/banners": """# Brancalonia Banners

Italian Renaissance-themed banners for UI headers and important announcements.

## Recommended Assets:
- `tavern-header.webp` - Main tavern banner (1200x200px)
- `renaissance-border.webp` - Decorative border banner (1000x150px)
- `guild-banner.webp` - Company/guild banner (800x120px)
- `italy-flag-vintage.webp` - Vintage Italian flag banner (600x100px)

## Style Guidelines:
- Use warm colors: golds, deep reds, browns
- Include Italian Renaissance motifs: fleur-de-lis, heraldic elements
- Maintain medieval/tavern atmosphere
- Support both light and dark themes""",

            "ui/frames": """# Brancalonia Frames

Ornate Italian Renaissance frames for important UI elements.

## Recommended Assets:
- `ornate-gold-frame.webp` - Primary gold frame (variable size)
- `bronze-simple-frame.webp` - Secondary bronze frame (variable size)
- `parchment-border.webp` - Subtle parchment border (variable size)
- `tavern-wood-frame.webp` - Rustic wooden frame (variable size)

## Usage:
- Character sheet sections
- Important dialog boxes
- Journal entry highlights
- Equipment panels""",

            "ui/icons": """# Brancalonia Icons

Italian-themed icons for Brancalonia-specific UI elements.

## Recommended Icons:
- `infamia.webp` - Sword icon for Infamia (32x32px)
- `baraonda.webp` - Tankard icon for Baraonda (32x32px)
- `rifugio.webp` - House icon for Rifugio (32x32px)
- `lavori-sporchi.webp` - Coin purse for Dirty Jobs (32x32px)
- `compagnia.webp` - Group icon for Company (32x32px)
- `malefatte.webp` - Dagger icon for Misdeeds (32x32px)
- `emeriticenze.webp` - Crown icon for Emeritences (32x32px)

## Formats:
- Primary: WebP format for web optimization
- Fallback: PNG with transparency
- Sizes: 16x16, 24x24, 32x32, 48x48px""",

            "ui/cursors": """# Brancalonia Cursors

Custom cursor files for Italian Renaissance theme.

## Recommended Cursors:
- `default.cur` - Standard arrow cursor
- `pointer.cur` - Hand pointer for buttons
- `text.cur` - Text selection cursor
- `grab.cur` - Dragging cursor
- `resize.cur` - Window resize cursor

## Notes:
- Use .cur format for Windows compatibility
- Include hotspot coordinates
- Keep cursors subtle and theme-appropriate""",

            "ui/backgrounds": """# Brancalonia Backgrounds

Background textures and patterns for UI elements.

## Recommended Assets:
- `parchment-texture.webp` - Aged parchment texture (seamless)
- `wood-grain.webp` - Tavern wood texture (seamless)
- `renaissance-pattern.webp` - Decorative Renaissance pattern
- `italy-map-vintage.webp` - Vintage Italian map background
- `tavern-wall.webp` - Stone/brick tavern wall texture

## Technical Specs:
- Seamless tiling patterns
- Multiple resolutions: 512x512, 1024x1024
- Optimized for web (WebP format)
- Subtle, non-distracting patterns""",

            "ui/ornaments": """# Brancalonia Ornaments

Decorative elements for enhanced UI styling.

## Recommended Elements:
- `fleur-de-lis.webp` - Italian heraldic symbol (various sizes)
- `renaissance-corner.webp` - Corner decorations (64x64px)
- `tavern-divider.webp` - Section dividers (variable width)
- `italian-crest.webp` - Italian coat of arms (128x128px)
- `vine-border.webp` - Decorative vine borders (variable)

## Usage:
- Header decorations
- Section dividers
- Corner embellishments
- Button decorations"""
        }

        return asset_descriptions.get(asset_type, "# Brancalonia UI Assets\n\nItalian Renaissance-themed UI assets for Foundry VTT.")

    def update_module_json(self):
        """Update module.json with UI configurations"""

        # Read current module.json
        module_file = self.base_path / "module.json"
        with open(module_file, 'r', encoding='utf-8') as f:
            module_data = json.load(f)

        # Add UI enhancements to esmodules
        ui_modules = [
            "modules/brancalonia-ui-hooks.js"
        ]

        for module in ui_modules:
            if module not in module_data.get("esmodules", []):
                module_data.setdefault("esmodules", []).append(module)

        # Add enhanced styles
        ui_styles = [
            "styles/brancalonia-enhanced.css",
            "styles/brancalonia-character-sheets.css",
            "styles/brancalonia-ui-elements.css"
        ]

        for style in ui_styles:
            if style not in module_data.get("styles", []):
                module_data.setdefault("styles", []).append(style)

        # Add UI flags
        module_data.setdefault("flags", {}).setdefault("brancalonia-bigat", {}).update({
            "uiEnhanced": True,
            "italianTheme": True,
            "renaissanceStyle": True,
            "tavernAtmosphere": True,
            "customCharacterSheets": True
        })

        # Write updated module.json
        with open(module_file, 'w', encoding='utf-8') as f:
            json.dump(module_data, f, indent=2, ensure_ascii=False)

        print(f"✅ Updated module.json with UI configurations")
        return module_file

    def create_ui_documentation(self):
        """Create comprehensive UI customization documentation"""

        readme_content = '''# Brancalonia UI Customization

Complete Italian Renaissance theme for the Brancalonia module in Foundry VTT.

## Overview

This UI enhancement transforms the standard D&D 5e interface into an authentic Italian Renaissance experience with tavern atmosphere, bringing the world of Brancalonia to life through visual design.

## Features

### 🏛️ Italian Renaissance Theme
- Warm color palette: tavern woods, renaissance golds, wine reds
- Authentic Italian fonts and typography
- Ornate decorative elements and borders
- Parchment textures and vintage backgrounds

### 🎭 Character Sheet Enhancements
- **Infamia Tracker**: Monitor character reputation in the criminal underworld
- **Baraonda Counter**: Track tavern brawl participation
- **Lavori Sporchi**: Record completed dirty jobs and criminal activities
- **Rifugio Manager**: Manage character havens and safe houses
- Custom Italian styling for all character elements

### 🖼️ Visual Enhancements
- Ornate borders and frames with Renaissance motifs
- Italian-themed icons for Brancalonia-specific mechanics
- Enhanced journal styling with parchment textures
- Custom banners and decorative elements

### 🎲 UI Interactions
- Italian button text and dialog translations
- Custom chat message styling for Brancalonia rolls
- Enhanced tooltips for Italian gaming terms
- Atmospheric visual feedback for critical rolls

## File Structure

```
styles/
├── brancalonia-enhanced.css          # Main enhanced CSS
├── brancalonia-character-sheets.css  # Character sheet styling
├── brancalonia-ui-elements.css       # UI components
├── brancalonia-systems.css           # Existing systems CSS
└── brancalonia-rules.css             # Existing rules CSS

modules/
├── brancalonia-ui-hooks.js           # UI enhancement hooks
└── [existing modules...]

ui/
├── banners/                          # Italian-themed banners
├── frames/                           # Renaissance frames
├── icons/                            # Brancalonia-specific icons
├── cursors/                          # Custom cursor files
├── backgrounds/                      # Texture backgrounds
└── ornaments/                        # Decorative elements
```

## Color Palette

The Brancalonia UI uses an authentic Italian Renaissance color scheme:

| Color | Hex Code | Usage |
|-------|----------|-------|
| Tavern Wood | `#8B4513` | Primary structural elements |
| Renaissance Gold | `#FFD700` | Accent colors, highlights |
| Tuscan Red | `#8B0000` | Headers, important text |
| Wine Red | `#722F37` | Secondary accents |
| Aged Parchment | `#F4E4BC` | Background textures |
| Antique Brass | `#CD7F32` | Borders, frames |
| Warm Ivory | `#FFF8DC` | Text backgrounds |
| Deep Burgundy | `#800020` | Dark accents |

## Typography

- **Titles**: EB Garamond Bold - Elegant Renaissance headers
- **Headings**: EB Garamond Bold - Section headers and labels
- **Body Text**: EB Garamond Regular - Main content text
- **Italics**: EB Garamond Italic - Emphasis and flavor text
- **UI Elements**: Benton - Modern readability for interface
- **Decorative**: IM Fell - Atmospheric medieval text

## Brancalonia-Specific Elements

### Infamia Tracker
Displays character's criminal reputation with Italian styling:
```css
.brancalonia-infamia {
  background: linear-gradient(90deg, #8B0000, #800020);
  border: 2px solid #FFD700;
  color: #FFF8DC;
}
```

### Rifugio Manager
Haven management interface with Renaissance styling:
- Haven name input with Italian placeholder text
- Comfort level selector (Modesto, Confortevole, Lussuoso)
- Description textarea for detailed haven information

### Character Sheet Ornaments
- Renaissance fleur-de-lis decorations
- Italian flag indicators for Brancalonia characters
- Ornate portrait frames with gold accents
- Decorative corner elements

## Technical Implementation

### CSS Architecture
- CSS custom properties for consistent theming
- Dark mode support with `prefers-color-scheme`
- Responsive design for various screen sizes
- Accessibility features (high contrast, reduced motion)

### JavaScript Hooks
- `renderActorSheet5eCharacter` - Character sheet enhancements
- `renderJournalPageSheet` - Journal styling
- `renderChatMessage` - Chat message improvements
- `renderApplication` - General UI enhancements

### Asset Management
- WebP format for optimal web performance
- Fallback PNG support for compatibility
- Seamless texture patterns for backgrounds
- Multiple icon sizes (16px, 24px, 32px, 48px)

## Customization

### Adding Custom Elements
To add new Brancalonia-specific UI elements:

1. Define CSS classes following the naming convention:
   ```css
   .brancalonia-[element-name] {
     /* Italian Renaissance styling */
   }
   ```

2. Add JavaScript hooks in `brancalonia-ui-hooks.js`:
   ```javascript
   static addCustomElement(html, data) {
     // Implementation
   }
   ```

3. Update color palette using CSS custom properties:
   ```css
   :root {
     --brancalonia-custom-color: #yourcolor;
   }
   ```

### Theming Guidelines
- Maintain warm, tavern-like atmosphere
- Use Italian Renaissance visual motifs
- Ensure accessibility and readability
- Support both light and dark modes
- Keep performance optimized

## Browser Compatibility

- **Chrome/Edge**: Full support with all features
- **Firefox**: Full support with all features
- **Safari**: Full support, some CSS optimizations
- **Mobile**: Responsive design with touch-friendly interfaces

## Performance Considerations

- CSS optimized for minimal reflow/repaint
- WebP images with PNG fallbacks
- Font loading optimization with `font-display: swap`
- Efficient CSS selectors and minimal JavaScript overhead

## Installation and Setup

1. The UI enhancements are automatically loaded with the Brancalonia module
2. CSS files are included in the module's `styles` array
3. JavaScript hooks initialize on Foundry's `ready` hook
4. No additional configuration required

## Troubleshooting

### Common Issues

**Fonts not loading**: Check font file paths in CSS
**Icons missing**: Verify UI asset directory structure
**Colors incorrect**: Ensure CSS custom properties are defined
**Layout broken**: Check for CSS conflicts with other modules

### Debug Information
- Check browser console for JavaScript errors
- Verify CSS files are loaded in Foundry's settings
- Confirm module dependencies are installed
- Test with minimal module setup for conflicts

## Future Enhancements

Planned improvements for future versions:
- Animated UI elements with Italian flair
- Sound effects for UI interactions
- Additional regional Italian themes (Venetian, Florentine)
- Enhanced mobile experience
- Accessibility improvements

## Credits

- **Theme Design**: Inspired by Italian Renaissance art and architecture
- **Color Palette**: Based on traditional Italian tavern and villa aesthetics
- **Typography**: Selected for historical accuracy and modern readability
- **Implementation**: Modern CSS and JavaScript techniques for Foundry VTT

---

*Per aspera ad astra - through hardships to the stars*
*Welcome to the Renaissance adventure of Brancalonia!*
'''

        readme_file = self.base_path / "UI_CUSTOMIZATION.md"
        readme_file.write_text(readme_content, encoding='utf-8')
        print(f"✅ Created UI customization documentation: {readme_file}")
        return readme_file

    def run(self):
        """Execute the complete UI customization process"""
        print("🏛️ Starting Brancalonia UI/UX Customization...")
        print("=" * 60)

        try:
            # Create enhanced CSS files
            self.create_enhanced_css()
            self.create_character_sheet_styles()
            ui_css = self.create_ui_assets()

            # Create JavaScript UI hooks
            self.create_ui_hooks()

            # Update module configuration
            self.update_module_json()

            # Create documentation
            self.create_ui_documentation()

            print("\n" + "=" * 60)
            print("✅ Brancalonia UI/UX Customization Complete!")
            print("\n📋 Summary of created files:")
            print("   • Enhanced CSS with Italian Renaissance theme")
            print("   • Character sheet customizations")
            print("   • UI hooks for D&D 5e overrides")
            print("   • Asset directories with documentation")
            print("   • Updated module.json configuration")
            print("   • Comprehensive UI documentation")
            print("\n🎭 Features implemented:")
            print("   • Infamia, Baraonda, Lavori Sporchi, Rifugio trackers")
            print("   • Italian Renaissance color palette and fonts")
            print("   • Ornate borders, frames, and decorative elements")
            print("   • Enhanced character sheets with tavern atmosphere")
            print("   • Custom chat styling and Italian UI text")
            print("   • Responsive design with accessibility features")
            print("\n🏛️ Welcome to Renaissance Italy! The taverns await...")

        except Exception as e:
            print(f"❌ Error during UI customization: {e}")
            raise

if __name__ == "__main__":
    agent = BrancaloniaUIAgent()
    agent.run()