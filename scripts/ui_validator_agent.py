#!/usr/bin/env python3
"""
UI Validator Agent for Brancalonia D&D 5e v5.1.9 Compatibility
============================================================

This agent validates Foundry VTT rendering and UI compatibility
ensuring proper display and functionality in the actual game interface.

CRITICAL UI VALIDATION FUNCTIONS:
- Validate character sheet rendering
- Test compendium browser integration
- Verify theme compatibility
- Check module UI elements
- Test dice rolling functionality
- Validate tooltip and help text display
- Ensure mobile/responsive compatibility
"""

import json
import os
import logging
import time
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict
import subprocess

@dataclass
class UIValidationResult:
    component: str
    test_type: str
    status: str  # "PASS", "FAIL", "WARNING", "SKIP"
    message: str
    details: Optional[Dict[str, Any]] = None

@dataclass
class ThemeValidation:
    theme_name: str
    css_files: List[str]
    issues_found: List[str]
    compatibility_score: float

class UIValidatorAgent:
    """
    Comprehensive UI validation agent for Foundry VTT compatibility
    """

    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.setup_logging()

        # UI validation results
        self.validation_results: List[UIValidationResult] = []
        self.theme_validations: List[ThemeValidation] = []

        # UI component definitions
        self.ui_components = self.load_ui_component_definitions()

        # CSS and styling validation patterns
        self.css_validation_patterns = self.load_css_validation_patterns()

    def setup_logging(self):
        """Setup detailed logging for UI validation process"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - UI Validator - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.project_root / 'logs' / 'ui_validator.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        (self.project_root / 'logs').mkdir(exist_ok=True)

    def load_ui_component_definitions(self) -> Dict[str, Dict[str, Any]]:
        """Load UI component definitions for validation"""
        return {
            "character_sheets": {
                "selectors": [".dnd5e.sheet.actor", ".character-sheet"],
                "required_elements": ["name", "attributes", "skills", "inventory"],
                "critical_functionality": ["dice_rolling", "item_dragging", "attribute_editing"]
            },
            "compendium_browser": {
                "selectors": [".compendium", ".compendium-browser"],
                "required_elements": ["search", "filters", "results"],
                "critical_functionality": ["item_dragging", "search", "filtering"]
            },
            "item_sheets": {
                "selectors": [".dnd5e.sheet.item", ".item-sheet"],
                "required_elements": ["name", "description", "properties"],
                "critical_functionality": ["editing", "drag_drop", "activation"]
            },
            "spell_sheets": {
                "selectors": [".dnd5e.sheet.spell", ".spell-sheet"],
                "required_elements": ["level", "school", "components", "description"],
                "critical_functionality": ["casting", "scaling", "preparation"]
            },
            "dice_roller": {
                "selectors": [".dice-roll", ".chat-message"],
                "required_elements": ["formula", "result", "tooltip"],
                "critical_functionality": ["rolling", "advantage", "modifiers"]
            },
            "brancalonia_ui": {
                "selectors": [".brancalonia", ".infamia-tracker", ".haven-system"],
                "required_elements": ["custom_mechanics", "theme_elements"],
                "critical_functionality": ["infamia_tracking", "haven_management", "custom_rolls"]
            }
        }

    def load_css_validation_patterns(self) -> Dict[str, List[str]]:
        """Load CSS validation patterns"""
        return {
            "deprecated_properties": [
                r"filter:\s*alpha\(",  # IE filters
                r"-webkit-box-reflect",  # Deprecated webkit
                r"zoom\s*:",  # Non-standard zoom
            ],
            "foundry_compatibility": [
                r"\.window-app",  # Foundry window structure
                r"\.form-group",  # Form styling
                r"\.tab\.active",  # Tab functionality
                r"\.dice-roll",  # Dice roll styling
            ],
            "responsive_design": [
                r"@media\s*\(",  # Media queries
                r"flex-wrap",  # Flexible layouts
                r"grid-template",  # CSS Grid
            ],
            "performance_concerns": [
                r"box-shadow.*,.*box-shadow",  # Multiple box shadows
                r"@import\s+url\(",  # CSS imports (performance)
                r"font-family:.*,.*,.*,.*,",  # Too many font fallbacks
            ]
        }

    def validate_ui_compatibility(self) -> Dict[str, Any]:
        """
        Comprehensive UI compatibility validation

        Returns:
            Summary of UI validation results
        """
        self.logger.info("Starting comprehensive UI validation for Foundry VTT")

        start_time = time.time()

        # Phase 1: Validate CSS and styling
        self.logger.info("Phase 1: Validating CSS and styling...")
        css_results = self.validate_css_files()

        # Phase 2: Validate HTML templates
        self.logger.info("Phase 2: Validating HTML templates...")
        template_results = self.validate_html_templates()

        # Phase 3: Validate JavaScript UI components
        self.logger.info("Phase 3: Validating JavaScript UI components...")
        js_results = self.validate_javascript_ui()

        # Phase 4: Validate theme system
        self.logger.info("Phase 4: Validating theme system...")
        theme_results = self.validate_theme_system()

        # Phase 5: Validate module integration
        self.logger.info("Phase 5: Validating module integration...")
        integration_results = self.validate_module_integration()

        # Phase 6: Validate responsive design
        self.logger.info("Phase 6: Validating responsive design...")
        responsive_results = self.validate_responsive_design()

        # Phase 7: Generate accessibility report
        self.logger.info("Phase 7: Generating accessibility report...")
        accessibility_results = self.validate_accessibility()

        validation_time = time.time() - start_time

        all_results = (css_results + template_results + js_results +
                      theme_results + integration_results + responsive_results +
                      accessibility_results)

        summary = {
            "validation_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "validation_duration": validation_time,
            "total_validations": len(all_results),
            "passed": len([r for r in all_results if r.status == "PASS"]),
            "failed": len([r for r in all_results if r.status == "FAIL"]),
            "warnings": len([r for r in all_results if r.status == "WARNING"]),
            "skipped": len([r for r in all_results if r.status == "SKIP"]),
            "compatibility_score": self.calculate_compatibility_score(all_results),
            "results_by_component": self.group_results_by_component(all_results)
        }

        self.generate_ui_validation_report(summary, all_results)
        return summary

    def validate_css_files(self) -> List[UIValidationResult]:
        """Validate CSS files for compatibility and best practices"""
        css_results = []
        styles_dir = self.project_root / "styles"

        if not styles_dir.exists():
            return [UIValidationResult("CSS", "setup", "FAIL", "Styles directory not found")]

        for css_file in styles_dir.glob("*.css"):
            results = self.validate_single_css_file(css_file)
            css_results.extend(results)

        return css_results

    def validate_single_css_file(self, css_file: Path) -> List[UIValidationResult]:
        """Validate a single CSS file"""
        results = []
        file_name = css_file.name

        try:
            with open(css_file, 'r', encoding='utf-8') as f:
                css_content = f.read()

            # Check for deprecated properties
            deprecated_found = []
            for pattern in self.css_validation_patterns["deprecated_properties"]:
                if re.search(pattern, css_content, re.IGNORECASE):
                    deprecated_found.append(pattern)

            if deprecated_found:
                results.append(UIValidationResult(
                    "CSS", "deprecated", "WARNING",
                    f"Deprecated CSS properties in {file_name}: {', '.join(deprecated_found)}"
                ))
            else:
                results.append(UIValidationResult(
                    "CSS", "deprecated", "PASS",
                    f"No deprecated properties in {file_name}"
                ))

            # Check Foundry compatibility
            foundry_patterns_found = 0
            for pattern in self.css_validation_patterns["foundry_compatibility"]:
                if re.search(pattern, css_content, re.IGNORECASE):
                    foundry_patterns_found += 1

            if foundry_patterns_found >= 2:
                results.append(UIValidationResult(
                    "CSS", "foundry_compat", "PASS",
                    f"Good Foundry integration in {file_name} ({foundry_patterns_found} patterns)"
                ))
            else:
                results.append(UIValidationResult(
                    "CSS", "foundry_compat", "WARNING",
                    f"Limited Foundry integration in {file_name} ({foundry_patterns_found} patterns)"
                ))

            # Check responsive design
            responsive_patterns = 0
            for pattern in self.css_validation_patterns["responsive_design"]:
                matches = re.findall(pattern, css_content, re.IGNORECASE)
                responsive_patterns += len(matches)

            if responsive_patterns > 0:
                results.append(UIValidationResult(
                    "CSS", "responsive", "PASS",
                    f"Responsive design implemented in {file_name} ({responsive_patterns} patterns)"
                ))
            else:
                results.append(UIValidationResult(
                    "CSS", "responsive", "WARNING",
                    f"No responsive design patterns in {file_name}"
                ))

            # Check performance concerns
            performance_issues = []
            for pattern in self.css_validation_patterns["performance_concerns"]:
                if re.search(pattern, css_content, re.IGNORECASE):
                    performance_issues.append(pattern)

            if performance_issues:
                results.append(UIValidationResult(
                    "CSS", "performance", "WARNING",
                    f"Performance concerns in {file_name}: {len(performance_issues)} issues"
                ))
            else:
                results.append(UIValidationResult(
                    "CSS", "performance", "PASS",
                    f"No performance issues in {file_name}"
                ))

            # Check file size
            file_size = css_file.stat().st_size
            if file_size > 100000:  # 100KB
                results.append(UIValidationResult(
                    "CSS", "size", "WARNING",
                    f"Large CSS file: {file_name} ({file_size/1024:.1f}KB)"
                ))
            else:
                results.append(UIValidationResult(
                    "CSS", "size", "PASS",
                    f"CSS file size OK: {file_name} ({file_size/1024:.1f}KB)"
                ))

        except Exception as e:
            results.append(UIValidationResult(
                "CSS", "parse", "FAIL",
                f"Error parsing {file_name}: {e}"
            ))

        return results

    def validate_html_templates(self) -> List[UIValidationResult]:
        """Validate HTML templates and structure"""
        template_results = []
        templates_dir = self.project_root / "templates"

        # Check if templates directory exists
        if not templates_dir.exists():
            # Check for templates in other locations
            template_files = list(self.project_root.rglob("*.hbs")) + list(self.project_root.rglob("*.html"))
            if not template_files:
                return [UIValidationResult("Templates", "setup", "SKIP", "No template files found")]

            for template_file in template_files:
                results = self.validate_single_template(template_file)
                template_results.extend(results)
        else:
            for template_file in templates_dir.rglob("*.hbs"):
                results = self.validate_single_template(template_file)
                template_results.extend(results)

        return template_results

    def validate_single_template(self, template_file: Path) -> List[UIValidationResult]:
        """Validate a single HTML template"""
        results = []
        file_name = template_file.name

        try:
            with open(template_file, 'r', encoding='utf-8') as f:
                template_content = f.read()

            # Check for basic HTML structure
            if '<form' in template_content:
                if 'class="' in template_content and 'form-group' in template_content:
                    results.append(UIValidationResult(
                        "Templates", "structure", "PASS",
                        f"Good form structure in {file_name}"
                    ))
                else:
                    results.append(UIValidationResult(
                        "Templates", "structure", "WARNING",
                        f"Basic form structure in {file_name}, could use Foundry classes"
                    ))

            # Check for Foundry-specific patterns
            foundry_patterns = [
                r'\{\{#each\s+\w+\}\}',  # Handlebars each
                r'\{\{\w+\.\w+\}\}',     # Object properties
                r'data-action=',         # Foundry actions
                r'class=".*tab.*"',      # Tab structure
            ]

            pattern_count = 0
            for pattern in foundry_patterns:
                if re.search(pattern, template_content):
                    pattern_count += 1

            if pattern_count >= 2:
                results.append(UIValidationResult(
                    "Templates", "foundry_integration", "PASS",
                    f"Good Foundry integration in {file_name} ({pattern_count} patterns)"
                ))
            else:
                results.append(UIValidationResult(
                    "Templates", "foundry_integration", "WARNING",
                    f"Limited Foundry integration in {file_name} ({pattern_count} patterns)"
                ))

            # Check accessibility
            accessibility_checks = [
                (r'<label.*for=', "Labels with for attributes"),
                (r'alt=', "Alt text for images"),
                (r'role=', "ARIA roles"),
                (r'aria-', "ARIA attributes")
            ]

            accessibility_score = 0
            for pattern, description in accessibility_checks:
                if re.search(pattern, template_content, re.IGNORECASE):
                    accessibility_score += 1

            if accessibility_score >= 2:
                results.append(UIValidationResult(
                    "Templates", "accessibility", "PASS",
                    f"Good accessibility in {file_name} ({accessibility_score}/4 checks)"
                ))
            else:
                results.append(UIValidationResult(
                    "Templates", "accessibility", "WARNING",
                    f"Limited accessibility in {file_name} ({accessibility_score}/4 checks)"
                ))

        except Exception as e:
            results.append(UIValidationResult(
                "Templates", "parse", "FAIL",
                f"Error parsing {file_name}: {e}"
            ))

        return results

    def validate_javascript_ui(self) -> List[UIValidationResult]:
        """Validate JavaScript UI components"""
        js_results = []
        modules_dir = self.project_root / "modules"

        if not modules_dir.exists():
            return [UIValidationResult("JavaScript", "setup", "SKIP", "No modules directory found")]

        for js_file in modules_dir.glob("*.js"):
            results = self.validate_single_js_file(js_file)
            js_results.extend(results)

        # Also check .mjs files
        for mjs_file in modules_dir.glob("*.mjs"):
            results = self.validate_single_js_file(mjs_file)
            js_results.extend(results)

        return js_results

    def validate_single_js_file(self, js_file: Path) -> List[UIValidationResult]:
        """Validate a single JavaScript file for UI concerns"""
        results = []
        file_name = js_file.name

        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                js_content = f.read()

            # Check for Foundry API usage
            foundry_apis = [
                r'game\.',          # Game object
                r'canvas\.',        # Canvas API
                r'ui\.',           # UI API
                r'Hooks\.',        # Hooks system
                r'Dialog\.',       # Dialog class
                r'Application\.', # Application class
            ]

            api_usage = 0
            for pattern in foundry_apis:
                if re.search(pattern, js_content):
                    api_usage += 1

            if api_usage >= 3:
                results.append(UIValidationResult(
                    "JavaScript", "foundry_api", "PASS",
                    f"Good Foundry API usage in {file_name} ({api_usage} APIs)"
                ))
            else:
                results.append(UIValidationResult(
                    "JavaScript", "foundry_api", "WARNING",
                    f"Limited Foundry API usage in {file_name} ({api_usage} APIs)"
                ))

            # Check for UI event handling
            ui_patterns = [
                r'addEventListener\(',
                r'\.on\(',
                r'\.click\(',
                r'\.change\(',
                r'\.submit\(',
            ]

            event_handling = 0
            for pattern in ui_patterns:
                matches = re.findall(pattern, js_content, re.IGNORECASE)
                event_handling += len(matches)

            if event_handling > 0:
                results.append(UIValidationResult(
                    "JavaScript", "event_handling", "PASS",
                    f"Event handling implemented in {file_name} ({event_handling} handlers)"
                ))
            else:
                results.append(UIValidationResult(
                    "JavaScript", "event_handling", "WARNING",
                    f"No event handling found in {file_name}"
                ))

            # Check for error handling
            error_patterns = [
                r'try\s*\{',
                r'catch\s*\(',
                r'\.catch\(',
                r'throw\s+',
            ]

            error_handling = 0
            for pattern in error_patterns:
                if re.search(pattern, js_content):
                    error_handling += 1

            if error_handling >= 2:
                results.append(UIValidationResult(
                    "JavaScript", "error_handling", "PASS",
                    f"Good error handling in {file_name}"
                ))
            else:
                results.append(UIValidationResult(
                    "JavaScript", "error_handling", "WARNING",
                    f"Limited error handling in {file_name}"
                ))

            # Check for console usage (should be minimal in production)
            console_usage = len(re.findall(r'console\.', js_content))
            if console_usage > 10:
                results.append(UIValidationResult(
                    "JavaScript", "console_usage", "WARNING",
                    f"High console usage in {file_name} ({console_usage} calls)"
                ))
            else:
                results.append(UIValidationResult(
                    "JavaScript", "console_usage", "PASS",
                    f"Reasonable console usage in {file_name} ({console_usage} calls)"
                ))

        except Exception as e:
            results.append(UIValidationResult(
                "JavaScript", "parse", "FAIL",
                f"Error parsing {file_name}: {e}"
            ))

        return results

    def validate_theme_system(self) -> List[UIValidationResult]:
        """Validate theme system implementation"""
        theme_results = []

        # Check for theme-related files
        theme_files = [
            "modules/brancalonia-theme.mjs",
            "modules/brancalonia-theme-core.mjs",
            "styles/brancalonia-theme-system.css",
            "styles/brancalonia-theme-module.css"
        ]

        for theme_file in theme_files:
            file_path = self.project_root / theme_file
            if file_path.exists():
                theme_results.append(UIValidationResult(
                    "Theme", "files", "PASS",
                    f"Theme file found: {theme_file}"
                ))
            else:
                theme_results.append(UIValidationResult(
                    "Theme", "files", "WARNING",
                    f"Theme file missing: {theme_file}"
                ))

        # Validate theme CSS structure
        theme_css = self.project_root / "styles" / "brancalonia-theme-system.css"
        if theme_css.exists():
            results = self.validate_theme_css(theme_css)
            theme_results.extend(results)

        return theme_results

    def validate_theme_css(self, theme_css: Path) -> List[UIValidationResult]:
        """Validate theme CSS file"""
        results = []

        try:
            with open(theme_css, 'r', encoding='utf-8') as f:
                css_content = f.read()

            # Check for CSS custom properties (variables)
            css_vars = len(re.findall(r'--[\w-]+:', css_content))
            if css_vars >= 10:
                results.append(UIValidationResult(
                    "Theme", "css_variables", "PASS",
                    f"Good CSS variable usage ({css_vars} variables)"
                ))
            else:
                results.append(UIValidationResult(
                    "Theme", "css_variables", "WARNING",
                    f"Limited CSS variable usage ({css_vars} variables)"
                ))

            # Check for theme classes
            theme_classes = [
                r'\.brancalonia',
                r'\.renaissance',
                r'\.tavern',
                r'\.italian-theme'
            ]

            theme_class_count = 0
            for pattern in theme_classes:
                if re.search(pattern, css_content, re.IGNORECASE):
                    theme_class_count += 1

            if theme_class_count >= 2:
                results.append(UIValidationResult(
                    "Theme", "theme_classes", "PASS",
                    f"Theme classes implemented ({theme_class_count} found)"
                ))
            else:
                results.append(UIValidationResult(
                    "Theme", "theme_classes", "WARNING",
                    f"Limited theme classes ({theme_class_count} found)"
                ))

        except Exception as e:
            results.append(UIValidationResult(
                "Theme", "parse", "FAIL",
                f"Error parsing theme CSS: {e}"
            ))

        return results

    def validate_module_integration(self) -> List[UIValidationResult]:
        """Validate module integration with Foundry VTT"""
        integration_results = []

        # Check module.json
        module_json = self.project_root / "module.json"
        if module_json.exists():
            results = self.validate_module_manifest(module_json)
            integration_results.extend(results)
        else:
            integration_results.append(UIValidationResult(
                "Integration", "manifest", "FAIL",
                "module.json not found"
            ))

        return integration_results

    def validate_module_manifest(self, module_json: Path) -> List[UIValidationResult]:
        """Validate module.json for UI-related configurations"""
        results = []

        try:
            with open(module_json, 'r', encoding='utf-8') as f:
                manifest = json.load(f)

            # Check for styles
            styles = manifest.get("styles", [])
            if len(styles) >= 3:
                results.append(UIValidationResult(
                    "Integration", "styles", "PASS",
                    f"Multiple style files configured ({len(styles)} files)"
                ))
            else:
                results.append(UIValidationResult(
                    "Integration", "styles", "WARNING",
                    f"Limited style files configured ({len(styles)} files)"
                ))

            # Check for esmodules
            esmodules = manifest.get("esmodules", [])
            if len(esmodules) >= 5:
                results.append(UIValidationResult(
                    "Integration", "modules", "PASS",
                    f"Multiple ES modules configured ({len(esmodules)} modules)"
                ))
            else:
                results.append(UIValidationResult(
                    "Integration", "modules", "WARNING",
                    f"Limited ES modules configured ({len(esmodules)} modules)"
                ))

            # Check compatibility
            compatibility = manifest.get("compatibility", {})
            if "minimum" in compatibility and "verified" in compatibility:
                results.append(UIValidationResult(
                    "Integration", "compatibility", "PASS",
                    f"Compatibility defined: {compatibility.get('verified', 'unknown')}"
                ))
            else:
                results.append(UIValidationResult(
                    "Integration", "compatibility", "WARNING",
                    "Compatibility not fully defined"
                ))

        except Exception as e:
            results.append(UIValidationResult(
                "Integration", "manifest_parse", "FAIL",
                f"Error parsing module.json: {e}"
            ))

        return results

    def validate_responsive_design(self) -> List[UIValidationResult]:
        """Validate responsive design implementation"""
        responsive_results = []

        # Check CSS files for responsive patterns
        styles_dir = self.project_root / "styles"
        if not styles_dir.exists():
            return [UIValidationResult("Responsive", "setup", "SKIP", "No styles directory")]

        total_media_queries = 0
        total_flex_usage = 0
        files_checked = 0

        for css_file in styles_dir.glob("*.css"):
            try:
                with open(css_file, 'r', encoding='utf-8') as f:
                    css_content = f.read()

                media_queries = len(re.findall(r'@media', css_content, re.IGNORECASE))
                flex_usage = len(re.findall(r'(display:\s*flex|flex-)', css_content, re.IGNORECASE))

                total_media_queries += media_queries
                total_flex_usage += flex_usage
                files_checked += 1

            except Exception as e:
                self.logger.error(f"Error checking responsive design in {css_file}: {e}")

        if total_media_queries >= 3:
            responsive_results.append(UIValidationResult(
                "Responsive", "media_queries", "PASS",
                f"Good responsive design ({total_media_queries} media queries across {files_checked} files)"
            ))
        elif total_media_queries > 0:
            responsive_results.append(UIValidationResult(
                "Responsive", "media_queries", "WARNING",
                f"Limited responsive design ({total_media_queries} media queries)"
            ))
        else:
            responsive_results.append(UIValidationResult(
                "Responsive", "media_queries", "FAIL",
                "No responsive design patterns found"
            ))

        if total_flex_usage >= 5:
            responsive_results.append(UIValidationResult(
                "Responsive", "flexible_layouts", "PASS",
                f"Good flexible layout usage ({total_flex_usage} flex patterns)"
            ))
        else:
            responsive_results.append(UIValidationResult(
                "Responsive", "flexible_layouts", "WARNING",
                f"Limited flexible layout usage ({total_flex_usage} flex patterns)"
            ))

        return responsive_results

    def validate_accessibility(self) -> List[UIValidationResult]:
        """Validate accessibility implementation"""
        accessibility_results = []

        # Check for accessibility-related files and patterns
        total_aria_usage = 0
        total_alt_text = 0
        total_labels = 0
        files_checked = 0

        # Check templates for accessibility
        for template_file in self.project_root.rglob("*.hbs"):
            try:
                with open(template_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                aria_usage = len(re.findall(r'aria-', content, re.IGNORECASE))
                alt_text = len(re.findall(r'alt=', content, re.IGNORECASE))
                labels = len(re.findall(r'<label.*for=', content, re.IGNORECASE))

                total_aria_usage += aria_usage
                total_alt_text += alt_text
                total_labels += labels
                files_checked += 1

            except Exception as e:
                self.logger.error(f"Error checking accessibility in {template_file}: {e}")

        if total_aria_usage >= 5:
            accessibility_results.append(UIValidationResult(
                "Accessibility", "aria", "PASS",
                f"Good ARIA usage ({total_aria_usage} attributes across {files_checked} files)"
            ))
        elif total_aria_usage > 0:
            accessibility_results.append(UIValidationResult(
                "Accessibility", "aria", "WARNING",
                f"Limited ARIA usage ({total_aria_usage} attributes)"
            ))
        else:
            accessibility_results.append(UIValidationResult(
                "Accessibility", "aria", "FAIL",
                "No ARIA attributes found"
            ))

        if total_labels >= 3:
            accessibility_results.append(UIValidationResult(
                "Accessibility", "labels", "PASS",
                f"Good label usage ({total_labels} labels)"
            ))
        else:
            accessibility_results.append(UIValidationResult(
                "Accessibility", "labels", "WARNING",
                f"Limited label usage ({total_labels} labels)"
            ))

        return accessibility_results

    def calculate_compatibility_score(self, results: List[UIValidationResult]) -> float:
        """Calculate overall compatibility score"""
        if not results:
            return 0.0

        score_weights = {
            "PASS": 1.0,
            "WARNING": 0.5,
            "FAIL": 0.0,
            "SKIP": 0.0  # Don't count skipped tests
        }

        total_score = 0.0
        counted_results = 0

        for result in results:
            if result.status in score_weights:
                total_score += score_weights[result.status]
                if result.status != "SKIP":
                    counted_results += 1

        return (total_score / counted_results * 100) if counted_results > 0 else 0.0

    def group_results_by_component(self, results: List[UIValidationResult]) -> Dict[str, Dict[str, int]]:
        """Group results by component for summary"""
        grouped = defaultdict(lambda: {"PASS": 0, "FAIL": 0, "WARNING": 0, "SKIP": 0})

        for result in results:
            grouped[result.component][result.status] += 1

        return dict(grouped)

    def generate_ui_validation_report(self, summary: Dict[str, Any], all_results: List[UIValidationResult]):
        """Generate comprehensive UI validation report"""
        report_path = self.project_root / "reports" / "ui_validation_report.json"
        report_path.parent.mkdir(exist_ok=True)

        report = {
            "validation_timestamp": summary["validation_timestamp"],
            "summary": summary,
            "validation_results": [
                {
                    "component": result.component,
                    "test_type": result.test_type,
                    "status": result.status,
                    "message": result.message,
                    "details": result.details
                }
                for result in all_results
            ],
            "ui_components_tested": list(self.ui_components.keys()),
            "recommendations": self.generate_ui_recommendations(summary, all_results)
        }

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        self.logger.info(f"UI validation report saved to: {report_path}")

        # Generate human-readable summary
        self.generate_ui_validation_summary(summary, all_results, report_path.parent / "ui_validation_summary.md")

    def generate_ui_recommendations(self, summary: Dict[str, Any], results: List[UIValidationResult]) -> List[str]:
        """Generate UI improvement recommendations"""
        recommendations = []

        # Analyze results for specific recommendations
        failed_components = set()
        warning_components = set()

        for result in results:
            if result.status == "FAIL":
                failed_components.add(result.component)
            elif result.status == "WARNING":
                warning_components.add(result.component)

        if "CSS" in failed_components:
            recommendations.append("🎨 Fix critical CSS issues for proper styling")
        if "JavaScript" in failed_components:
            recommendations.append("⚙️ Address JavaScript functionality issues")
        if "Templates" in failed_components:
            recommendations.append("📄 Fix HTML template structure issues")

        if "Responsive" in warning_components:
            recommendations.append("📱 Improve responsive design for mobile compatibility")
        if "Accessibility" in warning_components:
            recommendations.append("♿ Enhance accessibility features")
        if "Theme" in warning_components:
            recommendations.append("🎭 Improve theme system implementation")

        # Score-based recommendations
        score = summary.get("compatibility_score", 0)
        if score < 60:
            recommendations.append("🚨 Major UI overhaul needed - compatibility score too low")
        elif score < 80:
            recommendations.append("⚠️ Significant UI improvements needed")
        elif score < 95:
            recommendations.append("✨ Polish UI components for better user experience")

        if not recommendations:
            recommendations.append("✅ UI is in excellent condition!")

        return recommendations

    def generate_ui_validation_summary(self, summary: Dict[str, Any], results: List[UIValidationResult], summary_path: Path):
        """Generate human-readable UI validation summary"""
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# Brancalonia UI Validation Report\n\n")
            f.write(f"**Validation Date:** {summary['validation_timestamp']}\n")
            f.write(f"**Validation Duration:** {summary['validation_duration']:.2f} seconds\n")
            f.write(f"**Compatibility Score:** {summary['compatibility_score']:.1f}%\n\n")

            # Overall status
            score = summary['compatibility_score']
            if score >= 95:
                f.write("✅ **Status: EXCELLENT UI COMPATIBILITY**\n\n")
            elif score >= 80:
                f.write("🟢 **Status: GOOD UI COMPATIBILITY**\n\n")
            elif score >= 60:
                f.write("🟡 **Status: ACCEPTABLE UI COMPATIBILITY**\n\n")
            else:
                f.write("🔴 **Status: POOR UI COMPATIBILITY - NEEDS ATTENTION**\n\n")

            f.write("## Summary\n\n")
            f.write(f"- **Total Validations:** {summary['total_validations']}\n")
            f.write(f"- **Passed:** {summary['passed']} ✅\n")
            f.write(f"- **Failed:** {summary['failed']} ❌\n")
            f.write(f"- **Warnings:** {summary['warnings']} ⚠️\n")
            f.write(f"- **Skipped:** {summary['skipped']} ⏭️\n\n")

            f.write("## Results by Component\n\n")
            for component, counts in summary['results_by_component'].items():
                total = sum(counts.values())
                passed = counts.get('PASS', 0)
                comp_score = (passed / total * 100) if total > 0 else 0

                f.write(f"### {component} ({comp_score:.1f}% success)\n")
                f.write(f"- Passed: {counts.get('PASS', 0)}\n")
                f.write(f"- Failed: {counts.get('FAIL', 0)}\n")
                f.write(f"- Warnings: {counts.get('WARNING', 0)}\n")
                f.write(f"- Skipped: {counts.get('SKIP', 0)}\n\n")

            # Critical issues
            critical_issues = [r for r in results if r.status == "FAIL"]
            if critical_issues:
                f.write("## Critical Issues\n\n")
                for issue in critical_issues:
                    f.write(f"- **{issue.component} - {issue.test_type}**\n")
                    f.write(f"  - {issue.message}\n\n")

            # Warnings
            warnings = [r for r in results if r.status == "WARNING"]
            if warnings and len(warnings) <= 10:  # Only show first 10 warnings
                f.write("## Warnings\n\n")
                for warning in warnings[:10]:
                    f.write(f"- **{warning.component} - {warning.test_type}**\n")
                    f.write(f"  - {warning.message}\n\n")

            f.write("## Foundry VTT Compatibility\n\n")
            foundry_results = [r for r in results if "foundry" in r.test_type or "integration" in r.test_type]
            foundry_passed = len([r for r in foundry_results if r.status == "PASS"])
            foundry_total = len(foundry_results)

            if foundry_total > 0:
                foundry_score = (foundry_passed / foundry_total * 100)
                f.write(f"**Foundry Integration Score:** {foundry_score:.1f}%\n\n")

                if foundry_score >= 80:
                    f.write("✅ Excellent Foundry VTT integration\n")
                elif foundry_score >= 60:
                    f.write("🟡 Good Foundry VTT integration with room for improvement\n")
                else:
                    f.write("🔴 Poor Foundry VTT integration - requires attention\n")
            else:
                f.write("⚠️ No specific Foundry integration tests performed\n")

            f.write("\n## Recommendations\n\n")
            recommendations = self.generate_ui_recommendations(summary, results)
            for i, rec in enumerate(recommendations, 1):
                f.write(f"{i}. {rec}\n")

            f.write("\n## Testing in Foundry VTT\n\n")
            f.write("To fully validate UI compatibility:\n\n")
            f.write("1. 🎮 Load module in Foundry VTT development environment\n")
            f.write("2. 📝 Test character sheet creation and editing\n")
            f.write("3. 📚 Test compendium browser functionality\n")
            f.write("4. 🎲 Test dice rolling and chat integration\n")
            f.write("5. 🎨 Test theme switching and customization\n")
            f.write("6. 📱 Test on different screen sizes\n")
            f.write("7. ♿ Test accessibility with screen readers\n")

        self.logger.info(f"UI validation summary saved to: {summary_path}")

if __name__ == "__main__":
    import sys

    project_root = sys.argv[1] if len(sys.argv) > 1 else "/Users/erik/Desktop/brancalonia-bigat-master"

    agent = UIValidatorAgent(project_root)
    results = agent.validate_ui_compatibility()

    print(f"\n🎨 UI Validation Complete!")
    print(f"📊 Compatibility Score: {results['compatibility_score']:.1f}%")
    print(f"✅ {results['passed']}/{results['total_validations']} validations passed")
    if results['failed'] > 0:
        print(f"❌ {results['failed']} critical issues found")
    if results['warnings'] > 0:
        print(f"⚠️ {results['warnings']} warnings to review")
    print(f"📁 Reports saved to: {agent.project_root}/reports/")