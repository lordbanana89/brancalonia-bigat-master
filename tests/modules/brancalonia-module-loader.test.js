/**
 * Test suite per BrancaloniaModuleLoader
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrancaloniaModuleLoader } from '../../modules/brancalonia-module-loader.js';

// Mock del logger
vi.mock('../../modules/brancalonia-logger.js', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
    startPerformance: vi.fn(),
    endPerformance: vi.fn(() => 100),
    group: vi.fn(),
    groupEnd: vi.fn(),
    table: vi.fn()
  }
}));

describe('BrancaloniaModuleLoader', () => {
  let moduleLoader;

  beforeEach(() => {
    moduleLoader = new BrancaloniaModuleLoader();
    vi.clearAllMocks();
  });

  describe('Module Registration', () => {
    it('should register a module with function loader', () => {
      const mockLoader = vi.fn();
      moduleLoader.registerModule('test-module', mockLoader);

      expect(moduleLoader.modules.has('test-module')).toBe(true);
      const module = moduleLoader.modules.get('test-module');
      expect(module.loader).toBe(mockLoader);
    });

    it('should register a module with string loader', () => {
      moduleLoader.registerModule('test-module', './test-module.js');

      expect(moduleLoader.modules.has('test-module')).toBe(true);
      const module = moduleLoader.modules.get('test-module');
      expect(module.loader).toBe('./test-module.js');
    });

    it('should merge config with defaults', () => {
      moduleLoader.registerModule('test-module', vi.fn(), {
        priority: 5,
        critical: true
      });

      const module = moduleLoader.modules.get('test-module');
      expect(module.priority).toBe(5);
      expect(module.critical).toBe(true);
    });

    it('should use predefined config if available', () => {
      moduleLoader.registerModule('brancalonia-logger', vi.fn());

      const module = moduleLoader.modules.get('brancalonia-logger');
      expect(module.priority).toBe(0);
      expect(module.critical).toBe(true);
    });
  });

  describe('Module Loading', () => {
    it('should load a module successfully', async () => {
      const mockLoader = vi.fn().mockResolvedValue(true);
      moduleLoader.registerModule('test-module', mockLoader);

      const result = await moduleLoader.loadModule('test-module');

      expect(result).toBe(true);
      expect(mockLoader).toHaveBeenCalled();
      expect(moduleLoader.loadedModules.has('test-module')).toBe(true);
    });

    it('should not reload already loaded modules', async () => {
      const mockLoader = vi.fn();
      moduleLoader.registerModule('test-module', mockLoader);

      await moduleLoader.loadModule('test-module');
      await moduleLoader.loadModule('test-module');

      expect(mockLoader).toHaveBeenCalledTimes(1);
    });

    it('should handle module loading errors for non-critical modules', async () => {
      const mockLoader = vi.fn().mockRejectedValue(new Error('Load failed'));
      moduleLoader.registerModule('test-module', mockLoader, { critical: false });

      const result = await moduleLoader.loadModule('test-module');

      expect(result).toBe(false);
      expect(moduleLoader.moduleErrors.has('test-module')).toBe(true);
    });

    it('should throw error for critical module failures', async () => {
      const mockLoader = vi.fn().mockRejectedValue(new Error('Critical failure'));
      moduleLoader.registerModule('test-module', mockLoader, { critical: true });

      await expect(moduleLoader.loadModule('test-module')).rejects.toThrow('Critical failure');
      expect(moduleLoader.moduleErrors.has('test-module')).toBe(true);
    });

    it('should warn when module not found', async () => {
      const result = await moduleLoader.loadModule('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Dependencies', () => {
    it('should load dependencies before module', async () => {
      const loadOrder = [];

      const depLoader = vi.fn().mockImplementation(() => {
        loadOrder.push('dependency');
      });

      const mainLoader = vi.fn().mockImplementation(() => {
        loadOrder.push('main');
      });

      moduleLoader.registerModule('dependency', depLoader);
      moduleLoader.registerModule('main-module', mainLoader, {
        dependencies: ['dependency']
      });

      await moduleLoader.loadModule('main-module');

      expect(loadOrder).toEqual(['dependency', 'main']);
    });

    it('should fail if dependency fails', async () => {
      const depLoader = vi.fn().mockRejectedValue(new Error('Dep failed'));
      const mainLoader = vi.fn();

      moduleLoader.registerModule('dependency', depLoader, { critical: false });
      moduleLoader.registerModule('main-module', mainLoader, {
        dependencies: ['dependency'],
        critical: false
      });

      const result = await moduleLoader.loadModule('main-module');

      expect(result).toBe(false);
      expect(mainLoader).not.toHaveBeenCalled();
    });
  });

  describe('Batch Loading', () => {
    it('should load modules by priority', async () => {
      const loadOrder = [];

      moduleLoader.registerModule('priority-0', () => loadOrder.push('p0'), { priority: 0 });
      moduleLoader.registerModule('priority-10', () => loadOrder.push('p10'), { priority: 10 });
      moduleLoader.registerModule('priority-5', () => loadOrder.push('p5'), { priority: 5 });

      await moduleLoader.loadAll();

      expect(loadOrder).toEqual(['p0', 'p5', 'p10']);
    });

    it('should skip lazy modules in loadAll', async () => {
      const lazyLoader = vi.fn();
      const normalLoader = vi.fn();

      moduleLoader.registerModule('lazy-module', lazyLoader, { lazy: true });
      moduleLoader.registerModule('normal-module', normalLoader, { lazy: false });

      await moduleLoader.loadAll();

      expect(normalLoader).toHaveBeenCalled();
      expect(lazyLoader).not.toHaveBeenCalled();
    });

    it('should load modules with same priority in parallel', async () => {
      const startTimes = [];

      const createLoader = (name) => async () => {
        startTimes.push({ name, time: Date.now() });
        await new Promise(resolve => setTimeout(resolve, 10));
      };

      moduleLoader.registerModule('module-1', createLoader('m1'), { priority: 10 });
      moduleLoader.registerModule('module-2', createLoader('m2'), { priority: 10 });
      moduleLoader.registerModule('module-3', createLoader('m3'), { priority: 10 });

      await moduleLoader.loadAll();

      // Check that all modules with same priority started roughly at the same time
      const timeDiff = Math.max(...startTimes.map(s => s.time)) -
                       Math.min(...startTimes.map(s => s.time));
      expect(timeDiff).toBeLessThan(50); // Allow 50ms tolerance
    });
  });

  describe('Lazy Loading', () => {
    it('should load lazy modules on demand', async () => {
      const lazyLoader = vi.fn();
      moduleLoader.registerModule('lazy-module', lazyLoader, { lazy: true });

      const result = await moduleLoader.loadLazy('lazy-module');

      expect(result).toBe(true);
      expect(lazyLoader).toHaveBeenCalled();
    });

    it('should warn when loading non-lazy module lazily', async () => {
      moduleLoader.registerModule('normal-module', vi.fn(), { lazy: false });

      const result = await moduleLoader.loadLazy('normal-module');
      expect(result).toBe(false);
    });
  });

  describe('Module Status', () => {
    it('should return module status', async () => {
      const mockLoader = vi.fn();
      moduleLoader.registerModule('test-module', mockLoader);

      await moduleLoader.loadModule('test-module');

      const status = moduleLoader.getModuleStatus('test-module');
      expect(status.loaded).toBe(true);
      expect(status.error).toBeUndefined();
      expect(status.loadTime).toBeDefined();
    });

    it('should return error in status for failed modules', async () => {
      const error = new Error('Failed');
      const mockLoader = vi.fn().mockRejectedValue(error);
      moduleLoader.registerModule('test-module', mockLoader, { critical: false });

      await moduleLoader.loadModule('test-module');

      const status = moduleLoader.getModuleStatus('test-module');
      expect(status.loaded).toBe(false);
      expect(status.error).toBe(error);
    });
  });

  describe('Module Reloading', () => {
    it('should reload a module', async () => {
      const mockLoader = vi.fn();
      moduleLoader.registerModule('test-module', mockLoader);

      await moduleLoader.loadModule('test-module');
      await moduleLoader.reloadModule('test-module');

      expect(mockLoader).toHaveBeenCalledTimes(2);
    });

    it('should clear errors on reload', async () => {
      const mockLoader = vi.fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce(true);

      moduleLoader.registerModule('test-module', mockLoader, { critical: false });

      await moduleLoader.loadModule('test-module');
      expect(moduleLoader.moduleErrors.has('test-module')).toBe(true);

      await moduleLoader.reloadModule('test-module');
      expect(moduleLoader.moduleErrors.has('test-module')).toBe(false);
    });
  });

  describe('Reporting', () => {
    it('should export loading report', async () => {
      moduleLoader.registerModule('success-module', vi.fn(), { critical: false });
      moduleLoader.registerModule('fail-module', vi.fn().mockRejectedValue(new Error('Failed')), { critical: false });

      await moduleLoader.loadModule('success-module');
      await moduleLoader.loadModule('fail-module');

      const report = moduleLoader.exportLoadingReport();

      expect(report.loaded).toContain('success-module');
      expect(report.errors).toHaveLength(1);
      expect(report.errors[0].module).toBe('fail-module');
      expect(report.totalModules).toBe(2);
      expect(report.successRate).toBeDefined();
    });
  });
});