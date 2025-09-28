/**
 * Sistema di monitoraggio performance per Brancalonia
 * Traccia metriche, identifica bottlenecks e suggerisce ottimizzazioni
 */

import logger from './brancalonia-logger.js';

class BrancaloniaPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      hookExecution: 50,     // ms
      renderTime: 100,       // ms
      dataOperation: 30,     // ms
      networkRequest: 1000   // ms
    };
    this.observers = new Map();
    this.memorySnapshots = [];
    this.enabled = true;
  }

  /**
   * Inizializza il monitoraggio
   */
  init() {
    if (!this.enabled) return;

    // Monitor hooks performance
    this.monitorHooks();

    // Monitor render operations
    this.monitorRenders();

    // Monitor memory usage
    this.startMemoryMonitoring();

    // Monitor network requests
    this.monitorNetwork();

    logger.info('PerformanceMonitor', 'Performance monitoring initialized');
  }

  /**
   * Monitor Foundry hooks
   */
  monitorHooks() {
    const originalCall = Hooks.call;
    const originalCallAll = Hooks.callAll;

    Hooks.call = (hookName, ...args) => {
      const start = performance.now();
      const result = originalCall.call(Hooks, hookName, ...args);
      const duration = performance.now() - start;

      this.recordMetric('hook', hookName, duration);

      if (duration > this.thresholds.hookExecution) {
        logger.warn('PerformanceMonitor',
          `Slow hook execution: ${hookName} took ${duration.toFixed(2)}ms`
        );
      }

      return result;
    };

    Hooks.callAll = (hookName, ...args) => {
      const start = performance.now();
      const result = originalCallAll.call(Hooks, hookName, ...args);
      const duration = performance.now() - start;

      this.recordMetric('hook', hookName, duration);

      if (duration > this.thresholds.hookExecution) {
        logger.warn('PerformanceMonitor',
          `Slow hook execution: ${hookName} took ${duration.toFixed(2)}ms`
        );
      }

      return result;
    };
  }

  /**
   * Monitor render operations
   */
  monitorRenders() {
    // Use PerformanceObserver for render monitoring
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure' && entry.name.includes('render')) {
              this.recordMetric('render', entry.name, entry.duration);

              if (entry.duration > this.thresholds.renderTime) {
                logger.warn('PerformanceMonitor',
                  `Slow render: ${entry.name} took ${entry.duration.toFixed(2)}ms`
                );
              }
            }
          }
        });

        observer.observe({ entryTypes: ['measure'] });
        this.observers.set('render', observer);
      } catch (e) {
        logger.debug('PerformanceMonitor', 'PerformanceObserver not available');
      }
    }
  }

  /**
   * Monitor memory usage
   */
  startMemoryMonitoring() {
    if (!performance.memory) {
      logger.debug('PerformanceMonitor', 'Memory monitoring not available');
      return;
    }

    // Take memory snapshots every 30 seconds
    setInterval(() => {
      const snapshot = {
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };

      this.memorySnapshots.push(snapshot);

      // Keep only last 100 snapshots
      if (this.memorySnapshots.length > 100) {
        this.memorySnapshots.shift();
      }

      // Check for memory leaks
      this.checkMemoryLeaks();
    }, 30000);
  }

  /**
   * Check for potential memory leaks
   */
  checkMemoryLeaks() {
    if (this.memorySnapshots.length < 10) return;

    const recent = this.memorySnapshots.slice(-10);
    const avgGrowth = recent.reduce((acc, snap, i) => {
      if (i === 0) return acc;
      return acc + (snap.usedJSHeapSize - recent[i - 1].usedJSHeapSize);
    }, 0) / (recent.length - 1);

    // Alert if consistent memory growth
    if (avgGrowth > 1024 * 1024) { // 1MB average growth
      logger.warn('PerformanceMonitor',
        `Potential memory leak detected: Average growth ${(avgGrowth / 1024 / 1024).toFixed(2)}MB`
      );
    }
  }

  /**
   * Monitor network requests
   */
  monitorNetwork() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const start = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;

      try {
        const response = await originalFetch.apply(window, args);
        const duration = performance.now() - start;

        this.recordMetric('network', url, duration);

        if (duration > this.thresholds.networkRequest) {
          logger.warn('PerformanceMonitor',
            `Slow network request: ${url} took ${duration.toFixed(2)}ms`
          );
        }

        return response;
      } catch (error) {
        const duration = performance.now() - start;
        this.recordMetric('network-error', url, duration);
        throw error;
      }
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(type, name, value) {
    const key = `${type}:${name}`;

    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        type,
        name,
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        values: []
      });
    }

    const metric = this.metrics.get(key);
    metric.count++;
    metric.total += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.values.push(value);

    // Keep only last 100 values
    if (metric.values.length > 100) {
      metric.values.shift();
    }
  }

  /**
   * Get performance report
   */
  getReport(type = null) {
    const report = {};

    for (const [key, metric] of this.metrics) {
      if (type && metric.type !== type) continue;

      const avg = metric.total / metric.count;
      const sorted = [...metric.values].sort((a, b) => a - b);
      const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
      const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0;
      const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

      report[key] = {
        type: metric.type,
        name: metric.name,
        count: metric.count,
        average: avg.toFixed(2),
        min: metric.min.toFixed(2),
        max: metric.max.toFixed(2),
        p50: p50.toFixed(2),
        p90: p90.toFixed(2),
        p99: p99.toFixed(2)
      };
    }

    return report;
  }

  /**
   * Get slow operations
   */
  getSlowOperations(threshold = null) {
    const slow = [];

    for (const [key, metric] of this.metrics) {
      const avg = metric.total / metric.count;
      const typeThreshold = threshold || this.thresholds[metric.type] || 100;

      if (avg > typeThreshold) {
        slow.push({
          type: metric.type,
          name: metric.name,
          averageTime: avg.toFixed(2),
          exceedsBy: ((avg / typeThreshold - 1) * 100).toFixed(1) + '%'
        });
      }
    }

    return slow.sort((a, b) => parseFloat(b.averageTime) - parseFloat(a.averageTime));
  }

  /**
   * Get memory usage
   */
  getMemoryUsage() {
    if (!performance.memory) {
      return { available: false };
    }

    const current = this.memorySnapshots[this.memorySnapshots.length - 1];
    const initial = this.memorySnapshots[0];

    return {
      current: {
        used: (current?.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
        total: (current?.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
        limit: (current?.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + ' MB'
      },
      growth: initial ? {
        absolute: ((current?.usedJSHeapSize - initial.usedJSHeapSize) / 1024 / 1024).toFixed(2) + ' MB',
        percentage: (((current?.usedJSHeapSize / initial.usedJSHeapSize) - 1) * 100).toFixed(1) + '%'
      } : null
    };
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics.clear();
    this.memorySnapshots = [];
    logger.info('PerformanceMonitor', 'Metrics cleared');
  }

  /**
   * Export performance data
   */
  exportData() {
    const data = {
      timestamp: new Date().toISOString(),
      report: this.getReport(),
      slowOperations: this.getSlowOperations(),
      memory: this.getMemoryUsage(),
      memoryHistory: this.memorySnapshots
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brancalonia-performance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logger.info('PerformanceMonitor', 'Performance data exported');
  }

  /**
   * Log performance summary
   */
  logSummary() {
    logger.group('Performance Summary');

    // Top slow operations
    const slow = this.getSlowOperations().slice(0, 10);
    if (slow.length > 0) {
      logger.warn('PerformanceMonitor', 'Top slow operations:');
      logger.table(slow);
    }

    // Memory usage
    const memory = this.getMemoryUsage();
    if (memory.available !== false) {
      logger.info('PerformanceMonitor', 'Memory usage:', memory);
    }

    // General stats
    const hookMetrics = this.getReport('hook');
    const renderMetrics = this.getReport('render');
    const networkMetrics = this.getReport('network');

    logger.info('PerformanceMonitor', 'Metrics summary:', {
      hooks: Object.keys(hookMetrics).length,
      renders: Object.keys(renderMetrics).length,
      network: Object.keys(networkMetrics).length
    });

    logger.groupEnd();
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info('PerformanceMonitor', `Monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Singleton instance
const performanceMonitor = new BrancaloniaPerformanceMonitor();

// Auto-initialize when ready
Hooks.once('ready', () => {
  performanceMonitor.init();

  // Add console commands for easy access
  window.brancaloniaPerf = {
    report: () => performanceMonitor.getReport(),
    slow: () => performanceMonitor.getSlowOperations(),
    memory: () => performanceMonitor.getMemoryUsage(),
    summary: () => performanceMonitor.logSummary(),
    clear: () => performanceMonitor.clearMetrics(),
    export: () => performanceMonitor.exportData()
  };

  logger.info('PerformanceMonitor', 'Console commands available: window.brancaloniaPerf');
});

export { performanceMonitor as default, BrancaloniaPerformanceMonitor };