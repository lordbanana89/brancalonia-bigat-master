# AGENT_MONITOR_CONTINUO - Continuous D&D 5e Monitoring System

This directory contains the continuous monitoring system for maintaining Brancalonia compatibility with D&D 5e updates.

## 🎯 Purpose

The monitoring system automatically:
- Tracks D&D 5e repository changes
- Detects compatibility issues
- Generates automatic patches
- Creates backups before changes
- Notifies about breaking changes
- Maintains version compatibility matrix

## 📁 Directory Structure

```
monitoring/
├── README.md                    # This file
├── VERSION_TRACKING.json        # Version tracking data
├── MONITOR_LOG.md              # Complete monitoring log
├── COMPATIBILITY_MATRIX.md     # D&D 5e compatibility status
├── CHANGES_DETECTED.md         # Latest changes notification
├── backups/                    # Automatic backups
├── patches/                    # Generated patch files
└── logs/                       # Detailed execution logs
```

## 🚀 Quick Start

### Initial Setup

```bash
# Run initial monitoring check
python scripts/agent-monitor-continuo.py --run

# Check current status
python scripts/agent-monitor-continuo.py --check-status

# Setup automated daily checks
python scripts/agent-monitor-continuo.py --setup-cron
```

### Manual Operations

```bash
# Force immediate check
python scripts/agent-monitor-continuo.py --force

# Dry run (no changes applied)
python scripts/agent-monitor-continuo.py --dry-run

# Custom check interval
python scripts/agent-monitor-continuo.py --run --interval 12
```

## 📊 Monitoring Features

### 1. **Git Monitoring**
- Clones/pulls D&D 5e repository daily
- Tracks multiple release branches
- Detects new commits and changes
- Compares versions automatically

### 2. **Change Detection**
- **Advancement Structure Changes**: New types, modified properties
- **UUID Format Changes**: Pattern updates, reference modifications
- **Schema Changes**: New fields, deprecated properties
- **Breaking Changes**: API modifications, incompatible updates

### 3. **Automatic Patches**
- Generates Python scripts for fixes
- Applies safe changes automatically
- Creates backups before modifications
- Validates changes after application

### 4. **Notification System**
- **CHANGES_DETECTED.md**: Immediate change notifications
- **MONITOR_LOG.md**: Historical change tracking
- **COMPATIBILITY_MATRIX.md**: Version compatibility status
- Severity classification (Critical/Major/Minor)

### 5. **Version Tracking**
- **VERSION_TRACKING.json**: Complete tracking data
- Branch-by-branch monitoring
- Commit hash comparison
- Timestamp tracking

## 🔧 Configuration

### Monitoring Settings

Edit `VERSION_TRACKING.json` to configure:

```json
{
  "monitoring_config": {
    "check_interval_hours": 24,
    "auto_apply_safe_patches": true,
    "create_backups": true,
    "notification_enabled": true,
    "critical_paths": [
      "packs/**/*.json",
      "templates/**/*.json",
      "lang/**/*.json"
    ]
  }
}
```

### Tracked Branches

Default branches monitored:
- `release-5.1.9` (current verified)
- `release-5.2.0` (next release)
- `main` (development)

## 📈 Change Severity Levels

### 🔴 Critical Changes
- Breaking API changes requiring immediate attention
- Required property modifications
- Incompatible structure changes
- **Action**: Manual review and intervention required

### 🟡 Major Changes
- New advancement types
- UUID format updates
- Schema modifications
- **Action**: Automatic patches with validation

### 🟢 Minor Changes
- Property additions
- Non-breaking improvements
- Documentation updates
- **Action**: Automatic application

## 🛠️ Patch System

### Automatic Patch Generation

The system generates Python scripts for detected changes:

```python
# Example patch structure
def apply_patch():
    """Apply advancement type changes"""
    # Implementation specific to change type
    pass
```

### Patch Application Process

1. **Backup Creation**: Full backup of critical files
2. **Patch Generation**: Custom scripts for each change type
3. **Safe Application**: Only auto-fixable changes applied
4. **Validation**: Run compatibility tests
5. **Rollback**: Restore from backup if validation fails

## 📅 Scheduled Execution

### Cron Job Setup

```bash
# Daily at 2 AM
0 2 * * * /usr/bin/python3 /path/to/scripts/agent-monitor-continuo.py --run

# Every 12 hours
0 */12 * * * /usr/bin/python3 /path/to/scripts/agent-monitor-continuo.py --run
```

### CI/CD Integration

For GitHub Actions integration:

```yaml
name: D&D 5e Compatibility Check
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:     # Manual trigger

jobs:
  compatibility-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install PyYAML croniter
      - name: Run compatibility check
        run: python scripts/agent-monitor-continuo.py --run
```

## 📋 Monitoring Workflow

### Daily Cycle

1. **Repository Update**: Pull latest D&D 5e changes
2. **Change Detection**: Analyze structural modifications
3. **Impact Assessment**: Classify change severity
4. **Patch Generation**: Create fix scripts
5. **Backup Creation**: Save current state
6. **Safe Application**: Apply compatible patches
7. **Validation**: Run compatibility tests
8. **Notification**: Update status files

### Manual Review Process

When critical changes are detected:

1. Check `CHANGES_DETECTED.md` for details
2. Review affected files and suggested fixes
3. Test changes in development environment
4. Apply manual fixes if needed
5. Update compatibility status

## 🚨 Troubleshooting

### Common Issues

**Repository Clone Failures**
```bash
# Check network connectivity
git clone https://github.com/foundryvtt/dnd5e.git /tmp/test-clone

# Verify access permissions
ls -la /tmp/dnd5e-monitor/
```

**Patch Application Failures**
```bash
# Check backup availability
ls -la monitoring/backups/

# Restore from backup if needed
cp -r monitoring/backups/latest/* ./
```

**Validation Test Failures**
```bash
# Run validator manually
python scripts/agent-validator.py

# Check specific pack integrity
python scripts/check-all-packs.cjs
```

## 📊 Monitoring Reports

### Daily Status Check

```bash
# View latest compatibility status
cat monitoring/COMPATIBILITY_MATRIX.md

# Check recent changes
cat monitoring/CHANGES_DETECTED.md

# Review monitoring history
tail -n 50 monitoring/MONITOR_LOG.md
```

### Performance Metrics

Track monitoring performance:
- Check execution time
- Patch success rate
- Validation pass rate
- Change detection accuracy

## 🔒 Security Considerations

### Backup Safety
- Backups are created before any changes
- Multiple backup retention (last 10 runs)
- Verification of backup integrity

### Patch Validation
- Only safe, auto-fixable changes applied automatically
- Critical changes require manual review
- Validation tests run after all changes

### Access Control
- Monitoring runs with limited permissions
- No external network access during patch application
- Secure handling of repository credentials

## 📚 Integration with Existing Tools

### With Agent Validator
```bash
# Combined validation and monitoring
python scripts/agent-monitor-continuo.py --run && python scripts/agent-validator.py
```

### With Database Tools
```bash
# Monitor and validate database integrity
python scripts/agent-monitor-continuo.py --run && python scripts/agent-database.py
```

### With Build System
```bash
# Full CI/CD pipeline
python scripts/agent-monitor-continuo.py --run && \
python scripts/compile-all-packs.sh && \
python scripts/agent-validator.py
```

## 🎯 Best Practices

### Regular Maintenance
- Review monitoring logs weekly
- Update tracking configuration as needed
- Test patch application in development
- Maintain clean backup rotation

### Change Management
- Always review critical changes manually
- Test compatibility thoroughly
- Document manual fixes
- Update monitoring patterns

### Performance Optimization
- Run monitoring during low-usage periods
- Optimize repository update frequency
- Minimize backup storage requirements
- Monitor execution performance

---

## 📞 Support

For issues with the monitoring system:
1. Check monitoring logs in `monitoring/logs/`
2. Review recent changes in `MONITOR_LOG.md`
3. Verify system status with `--check-status`
4. Test with `--dry-run` for debugging

*This monitoring system is designed to maintain seamless Brancalonia compatibility with D&D 5e evolution.*