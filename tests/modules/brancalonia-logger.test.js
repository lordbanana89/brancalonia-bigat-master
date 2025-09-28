/**
 * Test suite per BrancaloniaLogger
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrancaloniaLogger } from '../../modules/brancalonia-logger.js';

describe('BrancaloniaLogger', () => {
  let logger;

  beforeEach(() => {
    logger = new BrancaloniaLogger();
    vi.clearAllMocks();
    localStorage.clear();
  });

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

    it('should limit history to 100 entries', () => {
      // Create mock history with 100 entries
      const mockHistory = new Array(100).fill({
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

      // Mock time passing
      const startTime = performance.now();
      performance.now.mockReturnValueOnce(startTime + 100);

      const duration = logger.endPerformance('test-operation');
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(logger.performanceMarks.has('test-operation')).toBe(false);
    });

    it('should warn when ending non-existent performance mark', () => {
      logger.endPerformance('non-existent');
      expect(console.log).toHaveBeenCalled();
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
});