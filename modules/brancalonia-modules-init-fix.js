/**
 * BRANCALONIA MODULES INIT FIX v2.0.0
 * Corregge l'ordine di inizializzazione dei moduli e gestisce game.brancalonia
 * Risolve i conflitti di inizializzazione multipla
 * 
 * Features:
 * - Event emitter per monitoraggio inizializzazione
 * - Performance tracking automatico
 * - Statistiche dettagliate
 * - API estesa per diagnostica
 */

import moduleLoader from './brancalonia-module-loader.js';
import { createModuleLogger } from './brancalonia-logger.js';

const MODULE_LABEL = 'ModulesInitFix';
const moduleLogger = createModuleLogger(MODULE_LABEL);
// Classe per gestire l'inizializzazione
class BrancaloniaInitFix {
  static VERSION = '2.0.0';
  static MODULE_NAME = MODULE_LABEL;

  static statistics = {
    modulesRegistered: 0,
    modulesInitialized: 0,
    initTime: 0,
    readyTime: 0,
    errors: [],
    startTime: 0
  };

  /**
   * Inizializzazione centralizzata di game.brancalonia
   */
  static initializeGameBrancalonia() {
    moduleLogger.startPerformance('init-fix-init');
    moduleLogger.info('Ensuring proper initialization');

    this.statistics.startTime = Date.now();

    // Crea l'oggetto principale se non esiste (NON read-only per compatibilità)
    if (!game.brancalonia) {
      game.brancalonia = {
        version: '11.2.9',
        modules: {},
        initialized: false,
        initQueue: [],
        api: {},
        chatCommands: {},
        log: {},
        debug: { enabled: false },
        // Pre-initialize properties that modules will assign
        backgroundPrivileges: null,
        backgroundEffects: null,
        conditions: null,
        cimeliMaledetti: null,
        mechanics: null,
        activationResults: null,
        
        // Helper per permettere ai moduli di registrarsi in modo sicuro
        registerModule: (moduleName, moduleData) => {
          if (!game.brancalonia.modules[moduleName]) {
            game.brancalonia.modules[moduleName] = moduleData;
            
            // Aggiorna statistiche
            BrancaloniaInitFix.statistics.modulesRegistered++;
            
            // Emit event
            moduleLogger.events.emit('init-fix:module-registered', {
              moduleName,
              moduleData,
              timestamp: Date.now()
            });
            
            moduleLogger.debug(`Module registered: ${moduleName}`);
          }
          return game.brancalonia.modules[moduleName];
        },
        
        // API per ottenere statistiche
        getInitStatistics: () => BrancaloniaInitFix.getStatistics(),
        
        // API per diagnostica
        getDiagnostics: () => BrancaloniaInitFix.getDiagnostics()
      };
    }

    const initTime = moduleLogger.endPerformance('init-fix-init');
    this.statistics.initTime = initTime;
    
    moduleLogger.info(`game.brancalonia protected and ready (${initTime?.toFixed(2)}ms)`);
    
    // Emit event
    moduleLogger.events.emit('init-fix:initialized', {
      version: game.brancalonia.version,
      initTime,
      timestamp: Date.now()
    });
  }

  /**
   * Ottiene statistiche dettagliate
   */
  static getStatistics() {
    return {
      ...this.statistics,
      uptime: Date.now() - this.statistics.startTime,
      modulesInGame: Object.keys(game.brancalonia?.modules || {}).length,
      successRate: this.statistics.modulesRegistered > 0
        ? ((this.statistics.modulesInitialized / this.statistics.modulesRegistered) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Ottiene diagnostica completa
   */
  static getDiagnostics() {
    const modules = game.brancalonia?.modules || {};
    const loaderStatus = moduleLoader.exportLoadingReport();
    
    return {
      version: game.brancalonia?.version,
      initialized: game.brancalonia?.initialized,
      statistics: this.getStatistics(),
      modules: {
        registered: Object.keys(modules).map(name => ({
          name,
          initialized: modules[name]?.initialized,
          data: modules[name]
        })),
        loader: loaderStatus
      },
      errors: this.statistics.errors,
      uptime: Date.now() - this.statistics.startTime
    };
  }
}

// Inizializzazione centralizzata di game.brancalonia
Hooks.once('init', () => {
  BrancaloniaInitFix.initializeGameBrancalonia();
});

// Hook per inizializzazione moduli con gestione errori robusta
Hooks.once('ready', async () => {
  moduleLogger.startPerformance('init-fix-ready');
  moduleLogger.info('Coordinating Brancalonia module initialization');

  const loaderStatus = moduleLoader.exportLoadingReport();
  if (loaderStatus.errors.length > 0) {
    moduleLogger.warn('Some modules reported errors during loading', loaderStatus.errors);
    BrancaloniaInitFix.statistics.errors.push(...loaderStatus.errors.map(e => e.module));
  }

  let loadedCount = 0;
  const totalToLoad = Array.from(moduleLoader.getConfiguredModules())
    .filter(([name, config]) => !moduleLoader.getModuleStatus(name).loaded && !config.lazy)
    .length;

  moduleLogger.info(`Loading ${totalToLoad} remaining modules...`);

  for (const [name, config] of moduleLoader.getConfiguredModules()) {
    const status = moduleLoader.getModuleStatus(name);
    if (status.loaded) {
      BrancaloniaInitFix.statistics.modulesInitialized++;
      continue;
    }
    if (config.lazy) continue;

    try {
      await moduleLoader.loadModule(name);
      loadedCount++;
      BrancaloniaInitFix.statistics.modulesInitialized++;
      
      moduleLogger.debug(`Progress: ${loadedCount}/${totalToLoad} modules loaded`);
    } catch (error) {
      moduleLogger.error(`Unable to load module ${name} during ready phase`, error);
      BrancaloniaInitFix.statistics.errors.push(name);
    }
  }

  // Marca come inizializzato
  game.brancalonia.initialized = true;

  const readyTime = moduleLogger.endPerformance('init-fix-ready');
  BrancaloniaInitFix.statistics.readyTime = readyTime;

  const stats = BrancaloniaInitFix.getStatistics();
  
  moduleLogger.info(
    BrancaloniaInitFix.MODULE_NAME,
    `Initialization complete in ${readyTime?.toFixed(2)}ms`,
    {
      modulesRegistered: stats.modulesRegistered,
      modulesInitialized: stats.modulesInitialized,
      successRate: stats.successRate,
      errors: stats.errors.length
    }
  );

  // Emit event
  moduleLogger.events.emit('init-fix:ready', {
    version: game.brancalonia.version,
    modulesCount: stats.modulesInGame,
    readyTime,
    statistics: stats,
    timestamp: Date.now()
  });

  Hooks.callAll('brancaloniaReady', {
    version: game.brancalonia?.version,
    modules: moduleLoader.exportLoadingReport(),
    statistics: stats
  });
});

// Fixed: Use SheetCoordinator
const SheetCoordinator = window.SheetCoordinator || game.brancalonia?.SheetCoordinator;

if (SheetCoordinator) {
  SheetCoordinator.registerModule('ModulesInitFix', async (app, html, data) => {
    const element = html[0] || html;

    if (app.actor?.type === 'character') {
      element.classList?.add('brancalonia-sheet');
    }
  }, {
    priority: 5,
    types: ['character']
  });
} else {
  Hooks.on('renderActorSheet', (app, html, data) => {
    const element = html[0] || html;

    if (app.actor?.type === 'character') {
      element.classList.add('brancalonia-sheet');
    }
  });
}

// Fix per chat commands
Hooks.on('chatMessage', (html, content, msg) => {
  // Intercetta comandi Brancalonia
  if (content.startsWith('/brancalonia')) {
    const parts = content.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    // Gestisci comandi
    switch (command) {
      case '/brancalonia-status':
        showBrancaloniaStatus();
        return false;
      case '/brancalonia-reset':
        if (game.user.isGM) {
          resetBrancaloniaModules();
        }
        return false;
    }
  }
});

// Funzione per mostrare lo stato dei moduli
function showBrancaloniaStatus() {
  moduleLogger.info('Generating status report');
  
  const modules = game.brancalonia?.modules || {};
  const stats = BrancaloniaInitFix.getStatistics();
  const loaderStats = moduleLoader.getAdvancedStatistics();
  
  const content = `
    <div class="brancalonia-status" style="
      border: 2px solid #8b4513;
      padding: 15px;
      background: linear-gradient(135deg, #f5deb3 0%, #daa520 100%);
      border-radius: 8px;
      font-family: 'EB Garamond', serif;
    ">
      <h3 style="color: #8b4513; margin-top: 0;">🎭 Stato Moduli Brancalonia</h3>
      
      <div style="background: rgba(255,255,255,0.7); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
        <p><strong>Versione:</strong> ${game.brancalonia?.version || 'N/A'}</p>
        <p><strong>Inizializzato:</strong> ${game.brancalonia?.initialized ? '✅ Sì' : '❌ No'}</p>
        <p><strong>Uptime:</strong> ${(stats.uptime / 1000).toFixed(2)}s</p>
      </div>
      
      <hr style="border-color: #8b4513;">
      
      <h4 style="color: #8b4513;">📊 Statistiche Inizializzazione</h4>
      <div style="background: rgba(255,255,255,0.7); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
        <p><strong>Moduli Registrati:</strong> ${stats.modulesRegistered}</p>
        <p><strong>Moduli Inizializzati:</strong> ${stats.modulesInitialized}</p>
        <p><strong>Tasso di Successo:</strong> ${stats.successRate}</p>
        <p><strong>Tempo Init:</strong> ${stats.initTime?.toFixed(2) || 0}ms</p>
        <p><strong>Tempo Ready:</strong> ${stats.readyTime?.toFixed(2) || 0}ms</p>
        <p><strong>Errori:</strong> ${stats.errors.length}</p>
      </div>
      
      <h4 style="color: #8b4513;">📦 Loader Statistiche</h4>
      <div style="background: rgba(255,255,255,0.7); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
        <p><strong>Moduli Caricati:</strong> ${loaderStats.loadedModules}/${loaderStats.totalModules}</p>
        <p><strong>Tasso Successo:</strong> ${loaderStats.successRate}</p>
        <p><strong>Tempo Medio:</strong> ${loaderStats.avgLoadTime}</p>
        <p><strong>Più Lento:</strong> ${loaderStats.slowestModule?.name || 'N/A'} (${loaderStats.slowestModule?.time || 'N/A'})</p>
      </div>
      
      <h4 style="color: #8b4513;">🔧 Moduli Registrati (${Object.keys(modules).length}):</h4>
      <div style="background: rgba(255,255,255,0.7); padding: 10px; border-radius: 5px; max-height: 200px; overflow-y: auto;">
        <ul style="margin: 0; padding-left: 20px;">
          ${Object.entries(modules).map(([name, data]) =>
            `<li><strong>${name}:</strong> ${data.initialized ? '✅' : '⏳'}</li>`
          ).join('')}
        </ul>
      </div>
      
      ${stats.errors.length > 0 ? `
        <h4 style="color: #d32f2f;">⚠️ Errori (${stats.errors.length}):</h4>
        <div style="background: rgba(255,0,0,0.1); padding: 10px; border-radius: 5px;">
          <ul style="margin: 0; padding-left: 20px; color: #d32f2f;">
            ${stats.errors.map(err => `<li>${err}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <p style="text-align: center; margin-top: 15px; font-size: 0.9em; color: #666;">
        <em>Usa <code>game.brancalonia.getDiagnostics()</code> per diagnostica completa</em>
      </p>
    </div>
  `;

  ChatMessage.create({
    content,
    whisper: [game.user.id]
  });
  
  moduleLogger.debug('Status report sent', stats);
}

// Funzione per reset moduli (solo GM)
async function resetBrancaloniaModules() {
  if (!game.user.isGM) {
    ui.notifications.warn('Solo il GM può resettare i moduli Brancalonia');
    moduleLogger.warn('Non-GM user attempted reset');
    return;
  }

  moduleLogger.info('Reset requested by GM');

  try {
    const stats = BrancaloniaInitFix.getStatistics();
    
    const confirm = await foundry.appv1.sheets.Dialog.confirm({
      title: "Reset Moduli Brancalonia",
      content: `
        <div style="padding: 10px;">
          <p><strong>⚠️ Attenzione!</strong></p>
          <p>Vuoi davvero resettare tutti i moduli Brancalonia?</p>
          <hr>
          <p><strong>Stato Attuale:</strong></p>
          <ul>
            <li>Moduli Registrati: ${stats.modulesRegistered}</li>
            <li>Moduli Inizializzati: ${stats.modulesInitialized}</li>
            <li>Errori: ${stats.errors.length}</li>
          </ul>
          <p><em>La pagina verrà ricaricata dopo il reset.</em></p>
        </div>
      `,
      yes: () => true,
      no: () => false
    });

    if (confirm) {
      moduleLogger.warn('Resetting all Brancalonia modules');
      
      // Emit event
      moduleLogger.events.emit('init-fix:reset', {
        timestamp: Date.now(),
        statistics: stats
      });

      // Reset stato
      game.brancalonia.initialized = false;
      game.brancalonia.modules = {};
      
      // Reset statistiche
      BrancaloniaInitFix.statistics = {
        modulesRegistered: 0,
        modulesInitialized: 0,
        initTime: 0,
        readyTime: 0,
        errors: [],
        startTime: Date.now()
      };

      ui.notifications.info('Resetting Brancalonia modules...');

      // Ricarica dopo un breve delay
      setTimeout(() => {
        location.reload();
      }, 500);
    } else {
      moduleLogger.debug('Reset cancelled by user');
    }
  } catch (err) {
    // Dialog chiuso senza scelta - ignora
    moduleLogger.debug('Reset cancelled (dialog closed)');
  }
}

// Esponi API globale
Hooks.once('ready', () => {
  if (typeof window !== 'undefined') {
    window.BrancaloniaInitFix = BrancaloniaInitFix;
    moduleLogger.debug('API exposed globally as window.BrancaloniaInitFix');
  }
});

// Export per compatibilità
export { 
  BrancaloniaInitFix,
  showBrancaloniaStatus, 
  resetBrancaloniaModules 
};