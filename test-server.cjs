#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 30001;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════╗
║   🎭 BRANCALONIA TEST SERVER                     ║
║   Testing module for errors and compatibility    ║
╚══════════════════════════════════════════════════╝
${colors.reset}`);

// Validate module structure
function validateModule() {
  console.log(`${colors.yellow}📋 Validating module structure...${colors.reset}`);

  const requiredFiles = [
    'module.json',
    'styles/brancalonia.css',
    'modules/brancalonia-init.js'
  ];

  const errors = [];
  const warnings = [];

  // Check required files
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      errors.push(`Missing required file: ${file}`);
    } else {
      console.log(`${colors.green}✓${colors.reset} Found: ${file}`);
    }
  });

  // Check module.json
  if (fs.existsSync('module.json')) {
    try {
      const moduleData = JSON.parse(fs.readFileSync('module.json', 'utf8'));
      console.log(`${colors.green}✓${colors.reset} module.json is valid JSON`);
      console.log(`  Version: ${moduleData.version}`);
      console.log(`  ID: ${moduleData.id}`);

      // Check packs
      if (moduleData.packs) {
        moduleData.packs.forEach(pack => {
          const packPath = pack.path;
          if (!fs.existsSync(packPath)) {
            warnings.push(`Pack directory missing: ${packPath}`);
          }
        });
      }

      // Check esmodules
      if (moduleData.esmodules) {
        moduleData.esmodules.forEach(module => {
          if (!fs.existsSync(module)) {
            errors.push(`ES Module missing: ${module}`);
          }
        });
      }

      // Check styles
      if (moduleData.styles) {
        moduleData.styles.forEach(style => {
          if (!fs.existsSync(style)) {
            errors.push(`Style missing: ${style}`);
          }
        });
      }
    } catch (e) {
      errors.push(`module.json parse error: ${e.message}`);
    }
  }

  // Check CSS files
  console.log(`\n${colors.yellow}📋 Checking CSS files...${colors.reset}`);
  const cssDir = 'styles';
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
    cssFiles.forEach(file => {
      const content = fs.readFileSync(path.join(cssDir, file), 'utf8');

      // Check for common issues
      const importantCount = (content.match(/!important/g) || []).length;
      if (importantCount > 20) {
        warnings.push(`${file}: High !important usage (${importantCount})`);
      }

      // Check for missing imports
      const imports = content.match(/@import\s+url\(['"]?([^'"]+)['"]?\)/g);
      if (imports) {
        imports.forEach(imp => {
          const match = imp.match(/@import\s+url\(['"]?([^'"]+)['"]?\)/);
          if (match) {
            const importPath = match[1].replace('./', 'styles/');
            if (!fs.existsSync(importPath)) {
              errors.push(`CSS import not found: ${importPath} in ${file}`);
            }
          }
        });
      }

      console.log(`${colors.green}✓${colors.reset} Analyzed: ${file}`);
    });
  }

  // Check JavaScript modules
  console.log(`\n${colors.yellow}📋 Checking JavaScript modules...${colors.reset}`);
  const jsDir = 'modules';
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
    jsFiles.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(jsDir, file), 'utf8');

        // Basic syntax check
        new Function(content.replace(/import\s+.*?from\s+['"].*?['"]/g, '').replace(/export\s+/g, ''));
        console.log(`${colors.green}✓${colors.reset} Valid syntax: ${file}`);
      } catch (e) {
        errors.push(`JS syntax error in ${file}: ${e.message.split('\n')[0]}`);
      }
    });
  }

  // Report results
  console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);

  if (errors.length > 0) {
    console.log(`${colors.red}${colors.bright}❌ ERRORS FOUND:${colors.reset}`);
    errors.forEach(err => console.log(`   ${colors.red}• ${err}${colors.reset}`));
  }

  if (warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bright}⚠️  WARNINGS:${colors.reset}`);
    warnings.forEach(warn => console.log(`   ${colors.yellow}• ${warn}${colors.reset}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${colors.green}${colors.bright}✅ All checks passed!${colors.reset}`);
  }

  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

  return { errors, warnings };
}

// Create server
const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './test-ui.html';
  }

  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        console.log(`${colors.red}404:${colors.reset} ${req.url}`);
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(content, 'utf-8');

      // Log with color coding
      const statusColor = contentType.includes('css') ? colors.blue :
                         contentType.includes('javascript') ? colors.yellow :
                         contentType.includes('html') ? colors.magenta :
                         colors.reset;

      console.log(`${statusColor}200:${colors.reset} ${req.url}`);
    }
  });
});

// Run validation
const validation = validateModule();

// Start server
server.listen(PORT, () => {
  console.log(`\n${colors.green}${colors.bright}🚀 Server running at http://localhost:${PORT}${colors.reset}`);
  console.log(`${colors.cyan}📱 Test UI: http://localhost:${PORT}/test-ui.html${colors.reset}`);
  console.log(`${colors.yellow}Press Ctrl+C to stop${colors.reset}\n`);

  // Auto-open browser if no errors
  if (validation.errors.length === 0) {
    const url = `http://localhost:${PORT}/test-ui.html`;
    const start = process.platform === 'darwin' ? 'open' :
                  process.platform === 'win32' ? 'start' :
                  'xdg-open';

    exec(`${start} ${url}`, (err) => {
      if (!err) {
        console.log(`${colors.green}Browser opened automatically${colors.reset}`);
      }
    });
  }
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down server...${colors.reset}`);
  server.close(() => {
    console.log(`${colors.green}Server stopped${colors.reset}`);
    process.exit(0);
  });
});