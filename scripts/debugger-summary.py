#!/usr/bin/env python3
"""
AGENT DEBUGGER SUMMARY - Quick overview of findings
Shows the most critical issues found by the deep debugger
"""

import json
from pathlib import Path

def show_summary():
    """Show summary of debugger findings"""

    report_file = Path(__file__).parent / "debug_report.json"

    if not report_file.exists():
        print("❌ Nessun report trovato. Eseguire prima agent-debugger-profondo.py")
        return

    with open(report_file, 'r', encoding='utf-8') as f:
        report = json.load(f)

    print("🎯 AGENT DEBUGGER PROFONDO - SOMMARIO RISULTATI")
    print("=" * 60)

    # Content stats
    stats = report['content_statistics']
    print(f"\n📊 CONTENUTO MODULO:")
    print(f"  • Classi trovate: {stats['classes']}")
    print(f"  • Incantesimi: {stats['spells']}")
    print(f"  • Oggetti: {stats['items']}")
    print(f"  • Tabelle: {stats['rolltables']}")

    # Issues summary
    validation = report['validation_results']
    print(f"\n🚨 PROBLEMI TOTALI: {validation['total_issues']}")
    print(f"  • CRITICI: {validation['critical_issues']} (DA RISOLVERE SUBITO)")
    print(f"  • Warning: {validation['warning_issues']}")
    print(f"  • Info: {validation['info_issues']}")

    # Top 5 categories
    print(f"\n📋 TOP 5 CATEGORIE PROBLEMI:")
    categories = validation['issues_by_category']
    sorted_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)

    for i, (category, count) in enumerate(sorted_categories[:5]):
        severity = "🔴" if count > 1000 else "🟡" if count > 100 else "🔵"
        print(f"  {i+1}. {severity} {category}: {count}")

    # Spell system
    spells = report['spell_system_analysis']
    print(f"\n✨ SISTEMA INCANTESIMI:")
    print(f"  • Totale: {spells['total_spells']} incantesimi")
    print(f"  • Livelli mancanti: {spells['missing_levels']}")

    # Auto-fixes
    fixes = report['auto_fix_scripts']
    if fixes:
        print(f"\n🔧 SCRIPT AUTO-FIX GENERATI: {len(fixes)}")
        for fix in fixes:
            print(f"  • {fix['name']}: {fix['description']}")

    # Recommendations
    recommendations = report['recommendations']
    if recommendations:
        print(f"\n💡 RACCOMANDAZIONI PRINCIPALI:")
        for i, rec in enumerate(recommendations[:3]):
            print(f"  {i+1}. {rec}")

    # Critical file issues
    print(f"\n🔴 ESEMPI PROBLEMI CRITICI:")
    critical_issues = [issue for issue in report['detailed_issues'] if issue['severity'] == 'critical']

    for i, issue in enumerate(critical_issues[:5]):
        file_name = Path(issue['file']).name if issue['file'] else 'N/A'
        print(f"  • {issue['category']}: {file_name}")
        print(f"    {issue['description'][:80]}...")

    print(f"\n📈 STATO MODULO:")
    if validation['critical_issues'] > 5000:
        print("  🔴 ROSSO - Molti problemi critici")
    elif validation['critical_issues'] > 1000:
        print("  🟡 GIALLO - Alcuni problemi da risolvere")
    elif validation['critical_issues'] > 0:
        print("  🟠 ARANCIONE - Pochi problemi critici")
    else:
        print("  🟢 VERDE - Nessun problema critico!")

    print(f"\n📄 Report completo: {report_file}")
    print("🔧 Script fix in: scripts/auto-fixes/")

if __name__ == "__main__":
    show_summary()