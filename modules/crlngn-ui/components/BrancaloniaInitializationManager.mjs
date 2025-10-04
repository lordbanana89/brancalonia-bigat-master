/**
 * BRANCALONIA INITIALIZATION MANAGER
 * Gestisce l'inizializzazione coordinata di tutti i componenti Brancalonia
 */

import logger from '../../brancalonia-logger.js';
import moduleLoader from '../../brancalonia-module-loader.js';

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
    
    logger.debug('InitManager', `Registered initialization step: ${name}`, { priority, critical });
  }
  
  /**
   * Esegue tutti i passi di inizializzazione
   */
  static async initialize() {
    if (this.initialized) {
      logger.warn('InitManager', 'Already initialized');
      return;
    }
    
    logger.info('InitManager', 'Starting Brancalonia initialization');
    logger.startPerformance('brancalonia-full-init');
    
    try {
      // Esegui tutti i passi in ordine di priorità
      for (const step of this.initializationSteps) {
        await this.executeStep(step);
      }
      
      this.initialized = true;
      const totalTime = logger.endPerformance('brancalonia-full-init');
      
      this.logInitializationSummary(totalTime);
      
    } catch (error) {
      logger.error('InitManager', 'Initialization failed', error);
      this.errors.push(error);
      throw error;
    }
  }
  
  /**
   * Esegue un singolo passo di inizializzazione
   */
  static async executeStep(step) {
    logger.debug('InitManager', `Executing step: ${step.name}`);
    logger.startPerformance(`init-step-${step.name}`);
    
    try {
      if (typeof step.step === 'function') {
        await step.step();
      } else if (typeof step.step === 'string') {
        await import(step.step);
      }
      
      step.completed = true;
      const duration = logger.endPerformance(`init-step-${step.name}`);
      
      logger.info('InitManager', `Completed step: ${step.name}`, { duration: `${duration.toFixed(2)}ms` });
      
    } catch (error) {
      step.error = error;
      this.errors.push(error);
      
      const duration = logger.endPerformance(`init-step-${step.name}`);
      
      if (step.critical) {
        logger.error('InitManager', `Critical step failed: ${step.name}`, error);
        throw error;
      } else {
        logger.warn('InitManager', `Non-critical step failed: ${step.name}`, error);
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
    
    logger.info(
      'InitManager',
      `Initialization complete: ${completed}/${total} steps completed, ${failed} failed (${totalTime?.toFixed(2)}ms total)`
    );
    
    if (failed > 0) {
      logger.group('Failed Initialization Steps');
      for (const step of this.initializationSteps.filter(s => s.error)) {
        logger.error('InitManager', `${step.name}: ${step.error.message}`);
      }
      logger.groupEnd();
    }
    
    // Log performance dei passi più lenti
    const slowSteps = this.initializationSteps
      .filter(s => s.completed)
      .map(s => ({ name: s.name, duration: s.duration || 0 }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    if (slowSteps.length > 0) {
      logger.debug('InitManager', 'Slowest initialization steps:');
      logger.table(slowSteps);
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
      logger.warn('InitManager', `Step not found: ${stepName}`);
      return false;
    }
    
    logger.info('InitManager', `Re-initializing step: ${stepName}`);
    
    // Reset dello stato
    step.completed = false;
    step.error = null;
    
    // Rimuovi errori precedenti
    this.errors = this.errors.filter(e => !e.message.includes(stepName));
    
    try {
      await this.executeStep(step);
      return true;
    } catch (error) {
      logger.error('InitManager', `Re-initialization failed for step: ${stepName}`, error);
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
    logger.info('InitManager', 'Logger initialized');
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
    logger.debug('InitManager', 'CSS optimization step registered');
  },
  10,
  false
);
