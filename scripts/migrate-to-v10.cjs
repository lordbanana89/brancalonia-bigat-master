#!/usr/bin/env node

/**
 * MIGRATION SCRIPT TO BRANCALONIA v10.0.0
 * Automatically updates old modules to use new hooks system
 *
 * Usage: node scripts/migrate-to-v10.js [--dry-run] [--backup]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MODULE_PATH = path.join(__dirname, '..', 'modules');
const BACKUP_PATH = path.join(__dirname, '..', 'backup-pre-v10');
const DRY_RUN = process.argv.includes('--dry-run');
const CREATE_BACKUP = process.argv.includes('--backup');

// Hook mappings - old to new
const HOOK_MAPPINGS = {
  // Actor sheet hooks
  'renderActorSheet5eCharacter': {
    new: 'HooksManager.on(HooksManager.HOOKS.RENDER_ACTOR_SHEET_CHARACTER',
    import: "import { HooksManager } from '../core/HooksManager.js';"
  },
  'renderActorSheet5eNPC': {
    new: 'HooksManager.on(HooksManager.HOOKS.RENDER_ACTOR_SHEET_NPC',
    import: "import { HooksManager } from '../core/HooksManager.js';"
  },
  'preRenderActorSheet5eCharacter': {
    new: 'HooksManager.on(HooksManager.HOOKS.PRE_RENDER_ACTOR_SHEET_CHARACTER',
    import: "import { HooksManager } from '../core/HooksManager.js';"
  },

  // Document hooks
  'createActor': {
    new: 'HooksManager.on(HooksManager.HOOKS.CREATE_ACTOR',
    import: "import { HooksManager } from '../core/HooksManager.js';"
  },
  'updateActor': {
    new: 'HooksManager.on(HooksManager.HOOKS.UPDATE_ACTOR',
    import: "import { HooksManager } from '../core/HooksManager.js';"
  },
  'deleteActor': {
    new: 'HooksManager.on(HooksManager.HOOKS.DELETE_ACTOR',
    import: "import { HooksManager } from '../core/HooksManager.js';"
  }
};

// Files to skip
const SKIP_FILES = [
  'brancalonia-v13-modern.js', // Already updated
  'brancalonia-compatibility-fix.js' // Compatibility layer
];

// Statistics
const stats = {
  filesProcessed: 0,
  hooksReplaced: 0,
  errors: [],
  warnings: []
};

console.log(`
╔════════════════════════════════════════════════╗
║  🔄 BRANCALONIA v10 MIGRATION SCRIPT           ║
║  Updating modules to new hooks system          ║
╚════════════════════════════════════════════════╝
`);

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

// Create backup if requested
if (CREATE_BACKUP && !DRY_RUN) {
  createBackup();
}

// Process all JavaScript files in modules directory
processDirectory(MODULE_PATH);

// Print results
printResults();

/**
 * Create backup of modules directory
 */
function createBackup() {
  console.log('📦 Creating backup...');

  if (!fs.existsSync(BACKUP_PATH)) {
    fs.mkdirSync(BACKUP_PATH, { recursive: true });
  }

  // Copy all JS files to backup
  execSync(`cp -r ${MODULE_PATH}/*.js ${BACKUP_PATH}/`);
  console.log(`✅ Backup created at ${BACKUP_PATH}\n`);
}

/**
 * Process all files in directory
 */
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    if (file.endsWith('.js') && !SKIP_FILES.includes(file)) {
      processFile(path.join(dir, file));
    }
  });
}

/**
 * Process single file
 */
function processFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n📄 Processing: ${fileName}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let hooksInFile = 0;
    const importsNeeded = new Set();

    // Check and replace each old hook pattern
    for (const [oldHook, replacement] of Object.entries(HOOK_MAPPINGS)) {
      // Pattern to match Hooks.on("hookName" ...) or Hooks.on('hookName' ...)
      const patterns = [
        new RegExp(`Hooks\\.on\\(["']${oldHook}["']`, 'g'),
        new RegExp(`Hooks\\.once\\(["']${oldHook}["']`, 'g')
      ];

      patterns.forEach(pattern => {
        const matches = content.match(pattern);

        if (matches) {
          const count = matches.length;
          hooksInFile += count;

          if (!DRY_RUN) {
            // Replace Hooks.on with HooksManager.on
            content = content.replace(pattern, (match) => {
              const isOnce = match.includes('.once');
              const newHook = replacement.new;

              // For .once, we need different handling
              if (isOnce) {
                console.log(`  ⚠️ Found Hooks.once - needs manual review`);
                stats.warnings.push({
                  file: fileName,
                  issue: `Hooks.once('${oldHook}') needs manual review`
                });
                return match; // Don't auto-replace .once
              }

              return newHook;
            });

            // Track import needed
            if (replacement.import) {
              importsNeeded.add(replacement.import);
            }

            modified = true;
          }

          console.log(`  ✓ Found ${count}x: ${oldHook} → ${replacement.new.split('(')[0]}`);
        }
      });
    }

    // Add imports at the top of file if needed
    if (modified && importsNeeded.size > 0) {
      const importStatements = Array.from(importsNeeded).join('\n');

      // Check if import already exists
      if (!content.includes('HooksManager')) {
        // Add after the first comment block or at the top
        const commentEnd = content.indexOf('*/');

        if (commentEnd !== -1) {
          const beforeComment = content.substring(0, commentEnd + 2);
          const afterComment = content.substring(commentEnd + 2);
          content = beforeComment + '\n\n' + importStatements + afterComment;
        } else {
          content = importStatements + '\n\n' + content;
        }

        console.log(`  ✓ Added import statement`);
      }
    }

    // Check for export statements that need updating
    if (content.includes('export default') || content.includes('export class')) {
      // Change to window assignment for non-ESM compatibility
      content = content.replace(/export default (\w+);?$/gm, 'window.$1 = $1;');
      content = content.replace(/export class (\w+)/g, 'class $1');

      if (modified) {
        console.log(`  ✓ Fixed export statements`);
      }
    }

    // Save file
    if (modified && !DRY_RUN) {
      fs.writeFileSync(filePath, content);
      console.log(`  💾 Saved changes`);
    } else if (modified && DRY_RUN) {
      console.log(`  🔍 Would save changes (dry run)`);
    }

    stats.filesProcessed++;
    stats.hooksReplaced += hooksInFile;

  } catch (error) {
    console.error(`  ❌ Error processing ${fileName}:`, error.message);
    stats.errors.push({ file: fileName, error: error.message });
  }
}

/**
 * Print migration results
 */
function printResults() {
  console.log(`
╔════════════════════════════════════════════════╗
║  📊 MIGRATION RESULTS                          ║
╚════════════════════════════════════════════════╝

✅ Files processed: ${stats.filesProcessed}
🔄 Hooks replaced: ${stats.hooksReplaced}
⚠️  Warnings: ${stats.warnings.length}
❌ Errors: ${stats.errors.length}
`);

  if (stats.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    stats.warnings.forEach(w => {
      console.log(`   - ${w.file}: ${w.issue}`);
    });
    console.log('');
  }

  if (stats.errors.length > 0) {
    console.log('❌ ERRORS:');
    stats.errors.forEach(e => {
      console.log(`   - ${e.file}: ${e.error}`);
    });
    console.log('');
  }

  if (DRY_RUN) {
    console.log('ℹ️  This was a DRY RUN - no files were modified');
    console.log('   Run without --dry-run to apply changes\n');
  } else {
    console.log('✅ Migration complete!');

    if (CREATE_BACKUP) {
      console.log(`   Backup saved at: ${BACKUP_PATH}`);
    }

    console.log(`
NEXT STEPS:
1. Test the module in Foundry
2. Check warnings above for manual fixes needed
3. Run 'npm test' to verify
`);
  }
}

// Run migration
console.log('Starting migration...\n');