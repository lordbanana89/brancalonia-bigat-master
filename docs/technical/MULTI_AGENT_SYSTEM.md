# Brancalonia Multi-Agent Orchestration System
## Complete D&D 5e v5.1.9 Compatibility Solution

### 🎯 System Overview

This multi-agent orchestration system provides a comprehensive solution for maintaining Brancalonia's compatibility with D&D 5e v5.1.9 in Foundry VTT. The system consists of 8 specialized agents that work together to validate, fix, and maintain all aspects of the module.

### 🤖 Agent Architecture

#### **Core Philosophy**
- **Separation of Concerns**: Each agent handles a specific domain
- **Dependency Management**: Agents execute in correct order with proper dependencies
- **Fault Tolerance**: Critical vs non-critical agent classification
- **Comprehensive Testing**: Built-in validation at every step
- **Continuous Monitoring**: Ongoing compatibility tracking

#### **Agent Classification**
- 🔴 **Critical Agents**: Must succeed for D&D 5e compatibility
- 🟡 **Optional Agents**: Enhance functionality but not required for core compatibility

---

## 🛠️ Agent Specifications

### 1. Pack Validator Agent 🔴 **CRITICAL**
**File**: `scripts/pack_validator_agent.py`

**Purpose**: Deep validation of all compendium data structures for D&D 5e v5.1.9 compliance

**Key Functions**:
- Validates JSON structure of all compendium items
- Checks D&D 5e v5.1.9 required fields
- Validates advancement structures
- Checks UUID reference formats
- Generates detailed error reports with fix suggestions

**Output**:
- `reports/pack_validation_report.json`
- `reports/pack_validation_summary.md`

**Critical Validations**:
- Class advancement structure compliance
- Item system field requirements
- Spell structure validation
- UUID reference format checking

---

### 2. Item Linker Agent 🔴 **CRITICAL**
**File**: `scripts/item_linker_agent.py`

**Purpose**: Rebuilds connections between items, spells, features, and classes

**Key Functions**:
- Builds comprehensive item registry
- Fixes broken UUID references
- Links class features to advancement
- Rebuilds background equipment connections
- Uses intelligent name matching for missing links

**Dependencies**: Pack Validator Agent

**Output**:
- `reports/item_linking_report.json`
- `reports/item_linking_summary.md`

**Critical Features**:
- UUID repair with confidence scoring
- Class advancement ItemGrant fixing
- Background feature linking
- Cross-compendium reference validation

---

### 3. Class Builder Agent 🔴 **CRITICAL**
**File**: `scripts/class_builder_agent.py`

**Purpose**: Complete reconstruction of D&D 5e class structures with proper advancement

**Key Functions**:
- Rebuilds class advancement chains
- Ensures proper D&D 5e v5.1.9 structure
- Fixes AbilityScoreImprovement entries
- Integrates spellcasting advancement
- Validates level progression

**Dependencies**: Item Linker Agent

**Output**:
- `reports/class_building_report.json`
- `reports/class_building_summary.md`

**Critical Features**:
- Standard D&D 5e class definitions
- Proper advancement type validation
- ASI progression compliance
- Spellcaster integration

---

### 4. RollTable Fixer Agent 🟡 **Optional**
**File**: `scripts/rolltable_fixer_agent.py`

**Purpose**: Restores and fixes RollTable structures for proper functionality

**Key Functions**:
- Fixes empty RollTable structures
- Validates formula consistency
- Restores missing table data
- Optimizes table performance
- Ensures proper result ranges

**Dependencies**: Pack Validator Agent

**Output**:
- `reports/rolltable_fixing_report.json`
- `reports/rolltable_fixing_summary.md`

**Key Features**:
- Automatic formula correction
- Result range validation
- Data restoration from backups
- Performance optimization

---

### 5. Spell System Agent 🔴 **CRITICAL**
**File**: `scripts/spell_system_agent.py`

**Purpose**: Ensures correct spell integration with D&D 5e v5.1.9 system

**Key Functions**:
- Validates spell structure compliance
- Fixes spell components and materials
- Ensures proper spell scaling
- Integrates with class spellcasting
- Validates spell school consistency

**Dependencies**: Item Linker Agent

**Output**:
- `reports/spell_system_report.json`
- `reports/spell_system_summary.md`

**Critical Features**:
- D&D 5e v5.1.9 spell structure compliance
- Component validation (V, S, M)
- Scaling mechanism integration
- Class spell list compatibility

---

### 6. Test Runner Agent 🔴 **CRITICAL**
**File**: `scripts/test_runner_agent.py`

**Purpose**: Comprehensive automated testing of all fixes and modifications

**Key Functions**:
- JSON validation testing
- Pack integrity testing
- UUID reference validation
- Class advancement testing
- Spell system testing
- FVTT CLI integration testing

**Dependencies**: Class Builder, Spell System, RollTable Fixer

**Output**:
- `reports/test_runner_report.json`
- `reports/test_runner_summary.md`

**Critical Tests**:
- Pre/post modification validation
- FVTT pack/unpack cycle testing
- D&D 5e structure compliance
- Cross-reference integrity

---

### 7. UI Validator Agent 🟡 **Optional**
**File**: `scripts/ui_validator_agent.py`

**Purpose**: Validates Foundry VTT UI compatibility and rendering

**Key Functions**:
- CSS validation and compatibility
- Template structure validation
- JavaScript UI component testing
- Theme system validation
- Responsive design checking
- Accessibility validation

**Dependencies**: Test Runner Agent

**Output**:
- `reports/ui_validation_report.json`
- `reports/ui_validation_summary.md`

**Key Features**:
- Foundry VTT specific CSS patterns
- Theme system compliance
- Mobile/responsive compatibility
- Performance optimization checks

---

### 8. Git Monitor Agent 🟡 **Optional**
**File**: `scripts/git_monitor_agent.py`

**Purpose**: Monitors D&D 5e repository for updates and compatibility changes

**Key Functions**:
- Monitors foundryvtt/dnd5e repository
- Detects breaking changes
- Tracks system version updates
- Generates compatibility alerts
- Provides update recommendations

**Dependencies**: None (independent monitoring)

**Output**:
- `reports/git_monitoring_report.json`
- `reports/git_monitoring_summary.md`
- `scripts/monitor_scheduler.sh` (for continuous monitoring)

**Key Features**:
- GitHub API integration
- Breaking change detection
- Continuous monitoring setup
- Automated alert generation

---

## 🎼 Orchestration System

### Master Orchestrator
**File**: `scripts/orchestrator.py`

The orchestrator manages the execution of all agents in the correct order, handling dependencies and coordinating results.

**Execution Pipeline**:
1. **Validation Phase**: Pack Validator → Git Monitor (parallel)
2. **Linking Phase**: Item Linker
3. **Structure Phase**: Class Builder, RollTable Fixer (parallel)
4. **Integration Phase**: Spell System
5. **Testing Phase**: Test Runner
6. **Validation Phase**: UI Validator

**Usage Examples**:
```bash
# Full orchestration (all agents)
python scripts/orchestrator.py

# Critical agents only (faster)
python scripts/orchestrator.py --skip-non-critical

# Specific agents only
python scripts/orchestrator.py --agents "Pack Validator" "Item Linker" "Test Runner"

# List available agents
python scripts/orchestrator.py --list-agents
```

**Return Codes**:
- `0`: Success (all critical agents passed)
- `1`: Critical failure (requires intervention)
- `2`: Partial success (non-critical failures)

---

## 🚀 Quick Start Guide

### Prerequisites
```bash
# Install Python dependencies
pip install requests

# Install Foundry VTT CLI (optional, for enhanced testing)
npm install -g @foundryvtt/foundryvtt-cli

# Set GitHub token for API access (optional, for monitoring)
export GITHUB_TOKEN=your_token_here
```

### Basic Usage

#### 1. Complete System Run
```bash
cd /path/to/brancalonia-bigat-master
python scripts/orchestrator.py
```

#### 2. Quick Compatibility Fix
```bash
# Run only critical agents
python scripts/orchestrator.py --skip-non-critical
```

#### 3. Individual Agent Testing
```bash
# Test specific functionality
python scripts/pack_validator_agent.py
python scripts/item_linker_agent.py
python scripts/test_runner_agent.py
```

### Monitoring Setup
```bash
# Set up continuous monitoring (daily)
python scripts/git_monitor_agent.py
crontab -e
# Add: 0 9 * * * cd /path/to/brancalonia && python scripts/git_monitor_agent.py
```

---

## 📊 Reporting and Logs

### Report Structure
All agents generate standardized reports in `/reports/`:

**JSON Reports** (machine-readable):
- Detailed execution data
- Error descriptions with suggested fixes
- Performance metrics
- Cross-agent coordination data

**Markdown Summaries** (human-readable):
- Executive summaries
- Action items and recommendations
- Next steps guidance
- Status indicators

### Log Management
Centralized logging in `/logs/`:
- `orchestrator.log`: Master coordination log
- `{agent_name}.log`: Individual agent logs
- `monitoring_schedule.log`: Continuous monitoring log

---

## 🔧 Configuration and Customization

### Agent Configuration
Each agent can be configured through:
- Command-line arguments
- Environment variables
- Configuration files (JSON)

### Common Configurations

#### Pack Validator
```bash
# Custom validation rules
python scripts/pack_validator_agent.py --strict-mode
```

#### Git Monitor
```bash
# Custom monitoring frequency
export GITHUB_TOKEN=your_token
export MONITOR_FREQUENCY=daily
python scripts/git_monitor_agent.py
```

#### Test Runner
```bash
# FVTT CLI integration
fvtt configure  # One-time setup
python scripts/test_runner_agent.py
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. "Pack directory not found"
**Solution**: Ensure you're running from the correct project root
```bash
cd /Users/erik/Desktop/brancalonia-bigat-master
python scripts/orchestrator.py
```

#### 2. "FVTT CLI not available"
**Solution**: Install Foundry CLI or skip FVTT tests
```bash
npm install -g @foundryvtt/foundryvtt-cli
# OR run without FVTT integration
python scripts/test_runner_agent.py --skip-fvtt
```

#### 3. "Critical agent failed"
**Solution**: Check specific agent logs
```bash
tail -n 50 logs/pack_validator.log
# Fix issues and re-run
python scripts/orchestrator.py --agents "Pack Validator"
```

#### 4. "GitHub API rate limit"
**Solution**: Set up GitHub token
```bash
export GITHUB_TOKEN=your_personal_access_token
python scripts/git_monitor_agent.py
```

### Debug Mode
```bash
# Enable verbose logging
export DEBUG=1
python scripts/orchestrator.py
```

---

## 🔄 Maintenance and Updates

### Regular Maintenance Tasks

#### Weekly
1. Run Git Monitor Agent to check for D&D 5e updates
2. Review compatibility reports
3. Run quick validation if needed

#### Monthly
1. Full orchestration run
2. Review all reports for trends
3. Update agent configurations if needed

#### After D&D 5e Updates
1. Run Git Monitor immediately
2. If breaking changes detected:
   ```bash
   python scripts/orchestrator.py
   ```
3. Test in Foundry VTT
4. Update documentation

### System Updates
```bash
# Update all agents
git pull origin main

# Re-run after updates
python scripts/orchestrator.py --skip-non-critical
```

---

## 📈 Performance Metrics

### Typical Execution Times
- **Pack Validator**: 30-60 seconds
- **Item Linker**: 45-90 seconds
- **Class Builder**: 60-120 seconds
- **Test Runner**: 120-300 seconds (with FVTT CLI)
- **Full Orchestration**: 5-10 minutes

### System Requirements
- **Python**: 3.7+
- **Memory**: 512MB minimum, 1GB recommended
- **Storage**: 100MB for reports and logs
- **Network**: Required for Git Monitor agent

---

## 🤝 Contributing and Extending

### Adding New Agents

1. **Create Agent Script**:
   ```python
   # scripts/my_new_agent.py
   class MyNewAgent:
       def __init__(self, project_root: str):
           # Initialize agent
           pass

       def run_agent_logic(self) -> Dict[str, Any]:
           # Implement agent functionality
           pass
   ```

2. **Add to Orchestrator**:
   ```python
   # Add to agent_pipeline in orchestrator.py
   {
       "name": "My New Agent",
       "script": "my_new_agent.py",
       "description": "What this agent does",
       "critical": False,
       "dependencies": ["Other Agent"]
   }
   ```

3. **Test Integration**:
   ```bash
   python scripts/orchestrator.py --agents "My New Agent"
   ```

### Agent Development Guidelines

1. **Follow naming convention**: `{purpose}_agent.py`
2. **Implement standard interface**: CLI args, JSON output, error handling
3. **Generate reports**: Both JSON and Markdown formats
4. **Log extensively**: Use consistent logging format
5. **Handle errors gracefully**: Don't crash the orchestration
6. **Document thoroughly**: Update this documentation

---

## 🎯 Success Criteria

### Compatibility Goals
- ✅ **100% JSON Validation**: All compendium files parse correctly
- ✅ **Zero Broken UUIDs**: All references point to valid items
- ✅ **Complete Class Advancement**: All classes have proper D&D 5e progression
- ✅ **Spell System Integration**: Full compatibility with D&D 5e v5.1.9 spells
- ✅ **FVTT Pack/Unpack**: Successful round-trip testing
- ✅ **UI Compatibility**: Proper rendering in Foundry VTT

### Performance Targets
- 🎯 **95%+ Test Pass Rate**: Comprehensive validation
- 🎯 **<10 Minutes**: Full orchestration execution
- 🎯 **Zero Critical Failures**: All critical agents succeed
- 🎯 **Automated Recovery**: Self-healing for common issues

---

## 📞 Support and Resources

### Documentation
- **This File**: Complete system overview
- **Agent Reports**: `/reports/*.md` - Specific agent results
- **Logs**: `/logs/*.log` - Detailed execution traces

### External Resources
- [Foundry VTT CLI Documentation](https://github.com/foundryvtt/foundryvtt-cli)
- [D&D 5e System Repository](https://github.com/foundryvtt/dnd5e)
- [Foundry VTT Documentation](https://foundryvtt.com/article/compendium/)

### Getting Help
1. **Check Logs**: Always start with relevant log files
2. **Review Reports**: Agent reports contain specific guidance
3. **Run Diagnostics**: Use individual agents for targeted testing
4. **Check Dependencies**: Ensure all prerequisites are met

---

## 🏆 Project Status

**Current Status**: ✅ **SYSTEM COMPLETE**

All 8 specialized agents have been implemented with:
- ✅ Complete D&D 5e v5.1.9 compatibility validation
- ✅ Automated fixing and restoration capabilities
- ✅ Comprehensive testing and validation
- ✅ Continuous monitoring for system updates
- ✅ Full orchestration and coordination
- ✅ Detailed reporting and documentation

**Ready for Production**: The multi-agent system is ready to ensure ongoing Brancalonia compatibility with D&D 5e v5.1.9 and future updates.

---

## 📄 License and Credits

This multi-agent orchestration system was developed specifically for the Brancalonia module to ensure ongoing compatibility with D&D 5e v5.1.9 in Foundry VTT.

**System Architecture**: Multi-agent coordination with dependency management
**Compatibility Target**: D&D 5e v5.1.9 + Foundry VTT v13+
**Development Approach**: Test-driven, fault-tolerant, self-documenting

*Generated with advanced AI assistance for optimal D&D 5e compatibility* 🤖