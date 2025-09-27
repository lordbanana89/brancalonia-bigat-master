#!/usr/bin/env python3
"""
AGENT ORCHESTRATOR - Sistema di orchestrazione multi-agent parallelo
Esegue tutti gli agent di fix in parallelo per massima efficienza
Versione: 2.0.0
"""

import json
import subprocess
import concurrent.futures
import time
from pathlib import Path
from typing import Dict, List, Tuple
import threading

class AgentOrchestrator:
    def __init__(self):
        self.agents = {
            "MONITOR": {
                "script": "agent-monitor-dnd5e.py",
                "description": "Analisi repository D&D 5e",
                "priority": 1
            },
            "VALIDATOR": {
                "script": "agent-validator.py",
                "description": "Validazione completa modulo",
                "priority": 2
            },
            "DATABASE": {
                "script": "agent-database.py",
                "description": "Normalizzazione database",
                "priority": 1
            },
            "CLASSES": {
                "script": "agent-classes.py",
                "description": "Fix classi e advancement",
                "priority": 2
            },
            "SPELL_FIXER": {
                "script": "agent-spell-fixer.py",
                "description": "Fix incantesimi con schema D&D 5e",
                "priority": 2
            },
            "CLASS_FIXER": {
                "script": "agent-class-fixer.py",
                "description": "Fix classi con schema esatto",
                "priority": 2
            },
            "ITEM_FIXER": {
                "script": "agent-item-fixer.py",
                "description": "Fix equipaggiamento con schema D&D 5e",
                "priority": 2
            },
            "RESTORE_CONTENT": {
                "script": "agent-restore-all-content.py",
                "description": "Ripristina TUTTI i contenuti rimossi",
                "priority": 1
            },
            "FIX_REMAINING": {
                "script": "agent-fix-remaining.py",
                "description": "Fix UUID dnd5e e descrizioni mancanti",
                "priority": 3
            },
            "FEATURES": {
                "script": "agent-features-check.py",
                "description": "Validazione features",
                "priority": 3
            },
            "UI": {
                "script": "agent-ui-brancalonia.py",
                "description": "Customizzazione UI Brancalonia",
                "priority": 4
            },
            "DEBUGGER": {
                "script": "agent-debugger-profondo.py",
                "description": "Debug profondo e test",
                "priority": 5
            }
        }

        self.results = {}
        self.lock = threading.Lock()
        self.start_time = None

    def run_agent(self, name: str, config: Dict) -> Tuple[str, bool, str]:
        """Esegue un singolo agent"""
        script_path = Path("scripts") / config["script"]

        print(f"\n🤖 [{name}] Avvio: {config['description']}")

        try:
            result = subprocess.run(
                ["python3", str(script_path)],
                capture_output=True,
                text=True,
                timeout=300  # 5 minuti timeout
            )

            success = result.returncode == 0
            output = result.stdout if success else result.stderr

            # Estrai statistiche dal output
            stats = self.extract_stats(output)

            with self.lock:
                self.results[name] = {
                    "success": success,
                    "output": output[-1000:],  # Ultimi 1000 caratteri
                    "stats": stats,
                    "duration": time.time() - self.start_time
                }

            if success:
                print(f"✅ [{name}] Completato con successo")
                if stats:
                    print(f"   📊 {stats}")
            else:
                print(f"❌ [{name}] Fallito: {result.stderr[:200]}")

            return name, success, output

        except subprocess.TimeoutExpired:
            print(f"⏰ [{name}] Timeout dopo 5 minuti")
            return name, False, "Timeout"
        except Exception as e:
            print(f"❌ [{name}] Errore: {str(e)}")
            return name, False, str(e)

    def extract_stats(self, output: str) -> str:
        """Estrae statistiche chiave dall'output"""
        stats = []

        # Cerca pattern comuni
        patterns = [
            ("file corretti", r"Corretti (\d+) file"),
            ("errori trovati", r"(\d+) errori"),
            ("fix applicati", r"(\d+) fix"),
            ("file normalizzati", r"Normalizzati (\d+)"),
            ("test passati", r"(\d+) test passati"),
            ("problemi critici", r"(\d+) problemi critici")
        ]

        import re
        for label, pattern in patterns:
            match = re.search(pattern, output, re.IGNORECASE)
            if match:
                stats.append(f"{match.group(1)} {label}")

        return ", ".join(stats) if stats else ""

    def run_parallel_by_priority(self):
        """Esegue agent in parallelo raggruppati per priorità"""
        self.start_time = time.time()

        # Raggruppa per priorità
        priority_groups = {}
        for name, config in self.agents.items():
            priority = config["priority"]
            if priority not in priority_groups:
                priority_groups[priority] = []
            priority_groups[priority].append((name, config))

        # Esegui per priorità
        for priority in sorted(priority_groups.keys()):
            agents = priority_groups[priority]
            print(f"\n{'='*60}")
            print(f"🚀 ESECUZIONE GRUPPO PRIORITÀ {priority}")
            print(f"   Agents: {', '.join([a[0] for a in agents])}")
            print('='*60)

            with concurrent.futures.ThreadPoolExecutor(max_workers=len(agents)) as executor:
                futures = []
                for name, config in agents:
                    future = executor.submit(self.run_agent, name, config)
                    futures.append(future)

                # Aspetta che tutti finiscano
                concurrent.futures.wait(futures)

    def run_all_parallel(self):
        """Esegue TUTTI gli agent in parallelo simultaneamente"""
        self.start_time = time.time()

        print("\n" + "="*60)
        print("🚀 ESECUZIONE PARALLELA TOTALE - TUTTI GLI AGENT")
        print("="*60)

        with concurrent.futures.ThreadPoolExecutor(max_workers=len(self.agents)) as executor:
            futures = []
            for name, config in self.agents.items():
                future = executor.submit(self.run_agent, name, config)
                futures.append(future)

            # Mostra progresso mentre eseguono
            completed = 0
            total = len(futures)

            for future in concurrent.futures.as_completed(futures):
                completed += 1
                name, success, _ = future.result()
                status = "✅" if success else "❌"
                print(f"\n[{completed}/{total}] {status} {name} completato")

    def generate_report(self):
        """Genera report finale consolidato"""
        duration = time.time() - self.start_time

        print("\n" + "="*80)
        print("📊 REPORT FINALE ORCHESTRAZIONE MULTI-AGENT")
        print("="*80)

        successful = sum(1 for r in self.results.values() if r["success"])
        failed = len(self.results) - successful

        print(f"\n⏱️ Tempo totale: {duration:.2f} secondi")
        print(f"✅ Agent completati: {successful}/{len(self.results)}")
        print(f"❌ Agent falliti: {failed}/{len(self.results)}")

        print("\n📈 DETTAGLI PER AGENT:")
        print("-" * 60)

        for name, result in self.results.items():
            status = "✅" if result["success"] else "❌"
            print(f"\n{status} {name}:")
            print(f"   Tempo: {result['duration']:.2f}s")
            if result["stats"]:
                print(f"   Stats: {result['stats']}")

        # Salva report JSON
        report_data = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "duration": duration,
            "successful": successful,
            "failed": failed,
            "agents": self.results
        }

        report_path = Path("orchestrator_report.json")
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)

        print(f"\n📄 Report dettagliato salvato in: {report_path}")
        print("="*80)

    def compile_all_packs(self):
        """Compila tutti i pack dopo i fix"""
        print("\n" + "="*60)
        print("📦 COMPILAZIONE FINALE TUTTI I PACK")
        print("="*60)

        compile_script = Path("scripts/compile-all-packs.sh")
        if compile_script.exists():
            result = subprocess.run(
                ["bash", str(compile_script)],
                capture_output=True,
                text=True
            )
            print(result.stdout)
            if result.returncode == 0:
                print("✅ Compilazione completata con successo")
            else:
                print(f"❌ Errori nella compilazione: {result.stderr}")
        else:
            print("⚠️ Script di compilazione non trovato")

def main():
    orchestrator = AgentOrchestrator()

    print("🎯 BRANCALONIA AGENT ORCHESTRATOR v2.0")
    print("Strategia multi-agent parallela per fix completo")
    print("\nOpzioni:")
    print("1. Esecuzione per priorità (consigliato)")
    print("2. Esecuzione parallela totale (max performance)")
    print("3. Solo compilazione pack")

    # Default: esecuzione parallela totale per massima velocità
    choice = "2"  # Forza esecuzione parallela totale

    if choice == "1":
        orchestrator.run_parallel_by_priority()
    elif choice == "2":
        orchestrator.run_all_parallel()
    elif choice == "3":
        orchestrator.compile_all_packs()
        return

    # Genera report
    orchestrator.generate_report()

    # Chiedi se compilare
    print("\n❓ Vuoi compilare tutti i pack ora? (consigliato dopo fix)")
    compile = "y"  # Forza compilazione
    if compile.lower() == "y":
        orchestrator.compile_all_packs()

    print("\n✨ ORCHESTRAZIONE COMPLETATA")

if __name__ == "__main__":
    main()