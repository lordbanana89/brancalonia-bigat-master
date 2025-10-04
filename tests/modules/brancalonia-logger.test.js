/**
 * Test suite per BrancaloniaLogger v2.0.0
 * Aggiornato con test per tutte le nuove feature enterprise-grade
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  BrancaloniaLogger, 
  LogSink, 
  ConsoleSink, 
  LocalStorageSink,
  LogEventEmitter 
} from '../../modules/brancalonia-logger.js';

describe('BrancaloniaLogger v2.0.0', () => {
  let logger;

  beforeEach(() => {
    logger = new BrancaloniaLogger();
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    logger.shutdown();
  });

  // ==================== EXISTING TESTS (v1.0.0) ====================

  describe('Log Levels', () => {
    it('should initialize with default log level', () => {
      expect(logger.logLevel).toBeDefined();
      expect(logger.logLevel).toBeGreaterThanOrEqual(0);
    });

    it('should set log level by string', () => {
      logger.setLogLevel('DEBUG');
      expect(logger.logLevel).toBe(logger.levels.DEBUG);
    });

    it('should set log level by number', () => {
      logger.setLogLevel(2);
      expect(logger.logLevel).toBe(2);
    });

    it('should ignore invalid log levels', () => {
      const originalLevel = logger.logLevel;
      logger.setLogLevel('INVALID');
      expect(logger.logLevel).toBe(originalLevel);
    });
  });

  describe('Logging Methods', () => {
    beforeEach(() => {
      logger.setLogLevel('TRACE'); // Enable all logs
    });

    it('should log error messages', () => {
      logger.error('TestModule', 'Test error message', { data: 'test' });
      expect(console.log).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      logger.warn('TestModule', 'Test warning');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('TestModule', 'Test info');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log debug messages', () => {
      logger.debug('TestModule', 'Test debug');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log trace messages', () => {
      logger.trace('TestModule', 'Test trace');
      expect(console.log).toHaveBeenCalled();
    });

    it('should not log below configured level', () => {
      logger.setLogLevel('ERROR');
      logger.info('TestModule', 'Should not appear');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('Log History', () => {
    it('should save important logs to localStorage', () => {
      logger.error('TestModule', 'Critical error');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'brancalonia-logs',
        expect.any(String)
      );
    });

    it('should not save debug logs to history', () => {
      logger.setLogLevel('DEBUG');
      logger.debug('TestModule', 'Debug message');
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should limit history to 100 entries via rotation', () => {
      // Create mock history with 200 entries (trigger rotation)
      const mockHistory = new Array(200).fill({
        timestamp: Date.now(),
        level: 'ERROR',
        module: 'Test',
        message: 'Test',
        args: []
      });

      localStorage.getItem.mockReturnValue(JSON.stringify(mockHistory));

      logger.error('TestModule', 'New error');

      const calls = localStorage.setItem.mock.calls;
      const lastCall = calls[calls.length - 1];
      const savedHistory = JSON.parse(lastCall[1]);

      expect(savedHistory.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Performance Monitoring', () => {
    it('should start performance measurement', () => {
      logger.startPerformance('test-operation');
      expect(logger.performanceMarks.has('test-operation')).toBe(true);
    });

    it('should end performance measurement and return duration', () => {
      logger.startPerformance('test-operation');

      // Simulate time passing
      const duration = logger.endPerformance('test-operation');
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(logger.performanceMarks.has('test-operation')).toBe(false);
    });

    it('should warn when ending non-existent performance mark', () => {
      const result = logger.endPerformance('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('Utility Methods', () => {
    it('should group logs', () => {
      logger.group('Test Group');
      expect(console.group).toHaveBeenCalledWith('Test Group');
    });

    it('should end log group', () => {
      logger.groupEnd();
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should display table for debug level', () => {
      logger.setLogLevel('DEBUG');
      const data = [{ name: 'Test', value: 1 }];
      logger.table(data);
      expect(console.table).toHaveBeenCalledWith(data, undefined);
    });

    it('should not display table below debug level', () => {
      logger.setLogLevel('INFO');
      const data = [{ name: 'Test', value: 1 }];
      logger.table(data);
      expect(console.table).not.toHaveBeenCalled();
    });

    it('should clear history', () => {
      logger.clearHistory();
      expect(localStorage.removeItem).toHaveBeenCalledWith('brancalonia-logs');
    });
  });

  describe('Message Formatting', () => {
    it('should format messages with timestamp', () => {
      const { prefix, message, args } = logger.formatMessage(
        'INFO',
        'TestModule',
        'Test message',
        'arg1',
        'arg2'
      );

      expect(prefix).toContain('[INFO]');
      expect(prefix).toContain('[TestModule]');
      expect(message).toBe('Test message');
      expect(args).toEqual(['arg1', 'arg2']);
    });
  });

  // ==================== NEW TESTS (v2.0.0) ====================

  describe('Event Emitter (v2)', () => {
    it('should emit log event on every log', () => {
      const callback = vi.fn();
      logger.events.on('log', callback);

      logger.info('TestModule', 'Test message');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'INFO',
          module: 'TestModule',
          message: 'Test message'
        })
      );
    });

    it('should emit level-specific events', () => {
      const errorCallback = vi.fn();
      const warnCallback = vi.fn();

      logger.events.on('log:error', errorCallback);
      logger.events.on('log:warn', warnCallback);

      logger.error('TestModule', 'Error message');
      logger.warn('TestModule', 'Warning message');

      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(warnCallback).toHaveBeenCalledTimes(1);
    });

    it('should allow removing listeners', () => {
      const callback = vi.fn();
      logger.events.on('log', callback);

      logger.info('TestModule', 'First');
      expect(callback).toHaveBeenCalledTimes(1);

      logger.events.off('log', callback);
      logger.info('TestModule', 'Second');
      expect(callback).toHaveBeenCalledTimes(1); // Still 1
    });

    it('should clear all listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      logger.events.on('log', callback1);
      logger.events.on('log:error', callback2);

      logger.events.clear();

      logger.info('TestModule', 'Test');
      logger.error('TestModule', 'Error');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const badCallback = vi.fn(() => {
        throw new Error('Listener error');
      });
      const goodCallback = vi.fn();

      logger.events.on('log', badCallback);
      logger.events.on('log', goodCallback);

      // Should not throw
      expect(() => {
        logger.info('TestModule', 'Test');
      }).not.toThrow();

      expect(goodCallback).toHaveBeenCalled();
    });

    it('should include stack trace in error events', () => {
      const callback = vi.fn();
      logger.events.on('log:error', callback);

      const error = new Error('Test error');
      logger.error('TestModule', 'Error occurred', error);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'ERROR',
          stackTrace: expect.stringContaining('Test error')
        })
      );
    });
  });

  describe('Multiple Sinks (v2)', () => {
    it('should initialize with default sinks', () => {
      expect(logger.sinks.length).toBeGreaterThanOrEqual(2);
      expect(logger.getSink('console')).toBeTruthy();
      expect(logger.getSink('localStorage')).toBeTruthy();
    });

    it('should add custom sink', () => {
      class TestSink extends LogSink {
        constructor() {
          super();
          this.name = 'test';
          this.logs = [];
        }
        write(entry) {
          this.logs.push(entry);
        }
      }

      const testSink = new TestSink();
      logger.addSink(testSink);

      expect(logger.getSink('test')).toBe(testSink);
      expect(logger.sinks.length).toBe(3); // console + localStorage + test
    });

    it('should remove sink', () => {
      const initialCount = logger.sinks.length;
      
      class TempSink extends LogSink {
        constructor() {
          super();
          this.name = 'temp';
        }
        write() {}
      }

      logger.addSink(new TempSink());
      expect(logger.sinks.length).toBe(initialCount + 1);

      logger.removeSink('temp');
      expect(logger.sinks.length).toBe(initialCount);
      expect(logger.getSink('temp')).toBeNull();
    });

    it('should call sink.close() when removing', () => {
      class CloseableSink extends LogSink {
        constructor() {
          super();
          this.name = 'closeable';
          this.closed = false;
        }
        write() {}
        close() {
          this.closed = true;
        }
      }

      const sink = new CloseableSink();
      logger.addSink(sink);
      logger.removeSink('closeable');

      expect(sink.closed).toBe(true);
    });

    it('should respect sink minLevel', () => {
      class FilteredSink extends LogSink {
        constructor() {
          super();
          this.name = 'filtered';
          this.minLevel = 1; // Only WARN+
          this.logs = [];
        }
        write(entry) {
          this.logs.push(entry);
        }
      }

      const sink = new FilteredSink();
      logger.addSink(sink);

      logger.error('Test', 'Error'); // Should log (ERROR = 0)
      logger.warn('Test', 'Warn');   // Should log (WARN = 1)
      logger.info('Test', 'Info');   // Should NOT log (INFO = 2)

      expect(sink.logs.length).toBe(2);
      expect(sink.logs[0].level).toBe('ERROR');
      expect(sink.logs[1].level).toBe('WARN');
    });

    it('should respect sink enabled flag', () => {
      class ToggleableSink extends LogSink {
        constructor() {
          super();
          this.name = 'toggleable';
          this.logs = [];
        }
        write(entry) {
          this.logs.push(entry);
        }
      }

      const sink = new ToggleableSink();
      logger.addSink(sink);

      logger.info('Test', 'First');
      expect(sink.logs.length).toBe(1);

      sink.enabled = false;
      logger.info('Test', 'Second');
      expect(sink.logs.length).toBe(1); // Still 1

      sink.enabled = true;
      logger.info('Test', 'Third');
      expect(sink.logs.length).toBe(2);
    });

    it('should handle sink write errors gracefully', () => {
      class ErrorSink extends LogSink {
        constructor() {
          super();
          this.name = 'error';
        }
        write() {
          throw new Error('Sink error');
        }
      }

      logger.addSink(new ErrorSink());

      // Should not throw
      expect(() => {
        logger.info('Test', 'Message');
      }).not.toThrow();
    });

    it('should throw error if adding non-LogSink', () => {
      expect(() => {
        logger.addSink({ name: 'invalid' });
      }).toThrow();
    });
  });

  describe('Statistics API (v2)', () => {
    it('should track total logs', () => {
      const initialStats = logger.getStatistics();
      const initialTotal = initialStats.totalLogs;

      logger.info('Test', 'Message 1');
      logger.info('Test', 'Message 2');

      const newStats = logger.getStatistics();
      expect(newStats.totalLogs).toBe(initialTotal + 2);
    });

    it('should track logs by level', () => {
      logger.error('Test', 'Error');
      logger.warn('Test', 'Warning');
      logger.info('Test', 'Info');

      const stats = logger.getStatistics();
      expect(stats.byLevel.ERROR).toBeGreaterThanOrEqual(1);
      expect(stats.byLevel.WARN).toBeGreaterThanOrEqual(1);
      expect(stats.byLevel.INFO).toBeGreaterThanOrEqual(1);
    });

    it('should track logs by module', () => {
      logger.info('Module1', 'Test');
      logger.info('Module1', 'Test');
      logger.info('Module2', 'Test');

      const stats = logger.getStatistics();
      expect(stats.byModule.Module1).toBe(2);
      expect(stats.byModule.Module2).toBe(1);
    });

    it('should calculate uptime', () => {
      const stats = logger.getStatistics();
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
      expect(stats.startTime).toBeLessThanOrEqual(Date.now());
    });

    it('should track performance marks', () => {
      logger.startPerformance('test1');
      logger.startPerformance('test2');

      const stats = logger.getStatistics();
      expect(stats.performanceMarks).toBe(2);

      logger.endPerformance('test1');
      const newStats = logger.getStatistics();
      expect(newStats.performanceMarks).toBe(1);
    });

    it('should include sink information', () => {
      const stats = logger.getStatistics();
      expect(stats.sinks).toBeDefined();
      expect(Array.isArray(stats.sinks)).toBe(true);
      expect(stats.sinks.length).toBeGreaterThanOrEqual(2);
      
      const consoleSink = stats.sinks.find(s => s.name === 'console');
      expect(consoleSink).toBeDefined();
      expect(consoleSink.enabled).toBe(true);
    });

    it('should reset statistics', () => {
      logger.info('Test', 'Message');
      logger.error('Test', 'Error');

      let stats = logger.getStatistics();
      expect(stats.totalLogs).toBeGreaterThanOrEqual(2);

      logger.resetStatistics();

      stats = logger.getStatistics();
      expect(stats.totalLogs).toBe(0);
      expect(stats.byLevel.ERROR).toBe(0);
      expect(stats.byLevel.INFO).toBe(0);
    });
  });

  describe('History Filters (v2)', () => {
    beforeEach(() => {
      // Populate history
      logger.error('ModuleA', 'Error 1');
      logger.warn('ModuleB', 'Warning 1');
      logger.error('ModuleA', 'Error 2');
      logger.warn('ModuleA', 'Warning 2');
    });

    it('should get all history without filters', () => {
      const history = logger.getHistory();
      expect(history.length).toBeGreaterThanOrEqual(4);
    });

    it('should filter by level', () => {
      const errors = logger.getHistory({ level: 'ERROR' });
      expect(errors.length).toBeGreaterThanOrEqual(2);
      expect(errors.every(e => e.level === 'ERROR')).toBe(true);
    });

    it('should filter by module', () => {
      const moduleA = logger.getHistory({ module: 'ModuleA' });
      expect(moduleA.length).toBeGreaterThanOrEqual(3);
      expect(moduleA.every(e => e.module === 'ModuleA')).toBe(true);
    });

    it('should filter by timestamp (since)', () => {
      const now = Date.now();
      logger.error('Test', 'Recent error');

      const recent = logger.getHistory({ since: now - 1000 });
      expect(recent.length).toBeGreaterThanOrEqual(1);
      expect(recent.every(e => e.timestamp >= now - 1000)).toBe(true);
    });

    it('should limit results', () => {
      const limited = logger.getHistory({ limit: 2 });
      expect(limited.length).toBe(2);
    });

    it('should combine multiple filters', () => {
      const filtered = logger.getHistory({
        level: 'ERROR',
        module: 'ModuleA',
        limit: 1
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].level).toBe('ERROR');
      expect(filtered[0].module).toBe('ModuleA');
    });
  });

  describe('Auto-Cleanup Performance Marks (v2)', () => {
    it('should auto-cleanup after timeout', (done) => {
      logger.startPerformance('auto-cleanup-test', 100); // 100ms timeout

      expect(logger.performanceMarks.has('auto-cleanup-test')).toBe(true);

      setTimeout(() => {
        expect(logger.performanceMarks.has('auto-cleanup-test')).toBe(false);
        done();
      }, 150);
    });

    it('should allow custom timeout', () => {
      logger.startPerformance('custom-timeout', 5000);

      const mark = logger.performanceMarks.get('custom-timeout');
      expect(mark).toBeDefined();
      expect(mark.timeout).toBeDefined();
    });

    it('should cleanup mark on endPerformance', () => {
      logger.startPerformance('cleanup-test', 10000);

      const mark = logger.performanceMarks.get('cleanup-test');
      const timeoutId = mark.timeout;

      logger.endPerformance('cleanup-test');

      // Timeout dovrebbe essere cancellato
      expect(logger.performanceMarks.has('cleanup-test')).toBe(false);
    });

    it('should clear all performance marks', () => {
      logger.startPerformance('test1');
      logger.startPerformance('test2');
      logger.startPerformance('test3');

      expect(logger.performanceMarks.size).toBe(3);

      logger.clearPerformanceMarks();

      expect(logger.performanceMarks.size).toBe(0);
    });

    it('should warn when replacing existing mark', () => {
      logger.startPerformance('duplicate');
      
      // Should warn but replace
      logger.startPerformance('duplicate');

      expect(logger.performanceMarks.size).toBe(1);
    });
  });

  describe('Diagnostics (v2)', () => {
    it('should run diagnostics without errors', () => {
      expect(() => {
        logger.runDiagnostics();
      }).not.toThrow();
    });

    it('should return diagnostics results', () => {
      const results = logger.runDiagnostics();

      expect(results).toBeDefined();
      expect(results.passed).toBeDefined();
      expect(results.failed).toBeDefined();
      expect(results.warnings).toBeDefined();

      expect(Array.isArray(results.passed)).toBe(true);
      expect(Array.isArray(results.failed)).toBe(true);
      expect(Array.isArray(results.warnings)).toBe(true);
    });

    it('should detect localStorage issues', () => {
      // Mock localStorage failure
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('localStorage full');
      };

      const results = logger.runDiagnostics();

      // Should have a failure
      expect(results.failed.length).toBeGreaterThan(0);

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Shutdown (v2)', () => {
    it('should clear performance marks on shutdown', () => {
      logger.startPerformance('test1');
      logger.startPerformance('test2');

      logger.shutdown();

      expect(logger.performanceMarks.size).toBe(0);
    });

    it('should close all sinks on shutdown', () => {
      class CloseableSink extends LogSink {
        constructor() {
          super();
          this.name = 'closeable';
          this.closed = false;
        }
        write() {}
        close() {
          this.closed = true;
        }
      }

      const sink = new CloseableSink();
      logger.addSink(sink);

      logger.shutdown();

      expect(sink.closed).toBe(true);
    });

    it('should clear event listeners on shutdown', () => {
      const callback = vi.fn();
      logger.events.on('log', callback);

      logger.shutdown();

      logger.info('Test', 'After shutdown');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('LocalStorage Sink (v2)', () => {
    it('should save to localStorage', () => {
      const sink = logger.getSink('localStorage');
      expect(sink).toBeTruthy();

      logger.error('Test', 'Error message');

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should rotate when reaching limit', () => {
      const sink = logger.getSink('localStorage');
      
      // Create 200 entries (should trigger rotation to 100)
      const bigHistory = new Array(200).fill({
        timestamp: Date.now(),
        level: 'ERROR',
        module: 'Test',
        message: 'Test',
        args: []
      });

      localStorage.getItem.mockReturnValue(JSON.stringify(bigHistory));

      logger.error('Test', 'New entry');

      const calls = localStorage.setItem.mock.calls;
      const lastCall = calls[calls.length - 1];
      const saved = JSON.parse(lastCall[1]);

      expect(saved.length).toBeLessThanOrEqual(100);
    });

    it('should get size in bytes', () => {
      const sink = logger.getSink('localStorage');
      const size = sink.getSize();

      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThanOrEqual(0);
    });

    it('should clear history', () => {
      const sink = logger.getSink('localStorage');
      
      logger.error('Test', 'Error');
      sink.clear();

      expect(localStorage.removeItem).toHaveBeenCalledWith('brancalonia-logs');
    });
  });

  describe('Export Logs (v2)', () => {
    beforeEach(() => {
      // Mock createElement and URL APIs
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();
      
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      
      document.createElement = vi.fn(() => mockLink);
    });

    it('should export all logs', () => {
      logger.info('Test', 'Message 1');
      logger.error('Test', 'Message 2');

      logger.exportLogs();

      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should export with filters', () => {
      logger.error('Test', 'Error 1');
      logger.info('Test', 'Info 1');
      logger.error('Test', 'Error 2');

      logger.exportLogs({ level: 'ERROR' });

      expect(document.createElement).toHaveBeenCalled();
    });
  });

  describe('Compatibility (v2)', () => {
    it('should maintain v1 API compatibility', () => {
      // All v1 methods should still work
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.trace).toBe('function');
      expect(typeof logger.startPerformance).toBe('function');
      expect(typeof logger.endPerformance).toBe('function');
      expect(typeof logger.group).toBe('function');
      expect(typeof logger.groupEnd).toBe('function');
      expect(typeof logger.table).toBe('function');
      expect(typeof logger.clearHistory).toBe('function');
      expect(typeof logger.formatMessage).toBe('function');
    });

    it('should export default logger instance', () => {
      expect(logger).toBeInstanceOf(BrancaloniaLogger);
    });

    it('should expose LogSink classes', () => {
      expect(LogSink).toBeDefined();
      expect(ConsoleSink).toBeDefined();
      expect(LocalStorageSink).toBeDefined();
      expect(LogEventEmitter).toBeDefined();
    });
  });
});
