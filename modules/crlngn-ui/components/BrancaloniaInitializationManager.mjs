/**
 * BRANCALONIA INITIALIZATION MANAGER
 * Gestisce l'inizializzazione coordinata di tutti i componenti Brancalonia
 */

import { createModuleLogger } from '../../brancalonia-logger.js';
import moduleLoader from '../../brancalonia-module-loader.js';

const MODULE_LABEL = 'Brancalonia Initialization Manager';
const moduleLogger = createModuleLogger(MODULE_LABEL);

export class BrancaloniaInitializationManager {
  static initialized = false;
  static initializationSteps = [];
  static errors = [];
  
  /**
   * Registra un passo di inizializzazione
   */
  static registerStep(name, step, priority = 100, critical = false) {
    this.initializationSteps.push({
      name,
      step,
      priority,
      critical,
      completed: false,
      error: null
    });
    
    // Ordina per priorità
    this.initializationSteps.sort((a, b) => a.priority - b.priority);
    
    moduleLogger.debug(`Registered initialization step: ${name}`, { priority, critical });
  }
  
  /**
   * Esegue tutti i passi di inizializzazione
   */
  static async initialize() {
    if (this.initialized) {
      moduleLogger.warn('Already initialized');
      return;
    }

    moduleLogger.info('Starting Brancalonia initialization');
    moduleLogger.startPerformance('brancalonia-full-init');
    
    try {
      // Esegui tutti i passi in ordine di priorità
      for (const step of this.initializationSteps) {
        await this.executeStep(step);
      }
      
      this.initialized = true;
      const totalTime = moduleLogger.endPerformance('brancalonia-full-init');
      
      this.logInitializationSummary(totalTime);
      
    } catch (error) {
      moduleLogger.error('Initialization failed', error);
      this.errors.push(error);
      throw error;
    }
  }
  
  /**
   * Esegue un singolo passo di inizializzazione
   */
  static async executeStep(step) {
    moduleLogger.debug(`Executing step: ${step.name}`);
    moduleLogger.startPerformance(`init-step-${step.name}`);

    try {
      if (typeof step.step === 'function') {
        await step.step();
      } else if (typeof step.step === 'string') {
        await import(step.step);
      }

      step.completed = true;
      const duration = moduleLogger.endPerformance(`init-step-${step.name}`);
      step.duration = duration;

      moduleLogger.info(`Completed step: ${step.name}`, { duration: `${duration.toFixed(2)}ms` });

    } catch (error) {
      step.error = error;
      this.errors.push(error);

      const duration = moduleLogger.endPerformance(`init-step-${step.name}`);
      step.duration = duration;

      if (step.critical) {
        moduleLogger.error(`Critical step failed: ${step.name}`, error);
        throw error;
      } else {
        moduleLogger.warn(`Non-critical step failed: ${step.name}`, error);
      }
    }
  }
  
  /**
   * Logga il riepilogo dell'inizializzazione
   */
  static logInitializationSummary(totalTime) {
    const completed = this.initializationSteps.filter(s => s.completed).length;
    const failed = this.initializationSteps.filter(s => s.error).length;
    const total = this.initializationSteps.length;
    
    moduleLogger.info(
      `Initialization complete: ${completed}/${total} steps completed, ${failed} failed (${totalTime?.toFixed(2)}ms total)`
    );
    
    if (failed > 0) {
      moduleLogger.group('Failed Initialization Steps');
      for (const step of this.initializationSteps.filter(s => s.error)) {
        moduleLogger.error(`${step.name}: ${step.error.message}`);
      }
      moduleLogger.groupEnd();
    }
    
    // Log performance dei passi più lenti
    const slowSteps = this.initializationSteps
      .filter(s => s.completed)
      .map(s => ({ name: s.name, duration: s.duration || 0 }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    if (slowSteps.length > 0) {
      moduleLogger.debug('Slowest initialization steps:');
      moduleLogger.table(slowSteps);
    }
  }
  
  /**
   * Ottiene lo stato dell'inizializzazione
   */
  static getStatus() {
    return {
      initialized: this.initialized,
      steps: this.initializationSteps.map(s => ({
        name: s.name,
        priority: s.priority,
        critical: s.critical,
        completed: s.completed,
        error: s.error?.message || null
      })),
      errors: this.errors.map(e => e.message),
      successRate: this.initializationSteps.length > 0
        ? `${((this.initializationSteps.filter(s => s.completed).length / this.initializationSteps.length) * 100).toFixed(2)}%`
        : '0%'
    };
  }
  
  /**
   * Re-inizializza un passo specifico
   */
  static async reinitializeStep(stepName) {
    const step = this.initializationSteps.find(s => s.name === stepName);
    if (!step) {
      moduleLogger.warn(`Step not found: ${stepName}`);
      return false;
    }
    
    moduleLogger.info(`Re-initializing step: ${stepName}`);
    
    // Reset dello stato
    step.completed = false;
    step.error = null;
    
    // Rimuovi errori precedenti
    this.errors = this.errors.filter(e => !e.message.includes(stepName));
    
    try {
      await this.executeStep(step);
      return true;
    } catch (error) {
      moduleLogger.error(`Re-initialization failed for step: ${stepName}`, error);
      return false;
    }
  }
  
  /**
   * Esporta report di inizializzazione
   */
  static exportReport() {
    return {
      timestamp: new Date().toISOString(),
      initialized: this.initialized,
      status: this.getStatus(),
      environment: {
        foundryVersion: game.data.version,
        systemVersion: game.system.data.version,
        moduleVersion: '12.0.5'
      }
    };
  }
}

// Registra passi di inizializzazione predefiniti
BrancaloniaInitializationManager.registerStep(
  'logger-init',
  () => {
    moduleLogger.info('Logger initialized');
  },
  0,
  true
);

BrancaloniaInitializationManager.registerStep(
  'module-loader-init',
  async () => {
    await moduleLoader.loadAll();
  },
  1,
  true
);

BrancaloniaInitializationManager.registerStep(
  'css-optimization',
  () => {
    // CSS optimization will be handled by BrancaloniaCSSOptimizer
    moduleLogger.debug('CSS optimization step registered');
  },
  10,
  false
);
