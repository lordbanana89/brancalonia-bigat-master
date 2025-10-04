/**
 * Test setup per Brancalonia
 * Configura l'ambiente di test con mock di Foundry VTT
 */

import { vi } from 'vitest';

// Mock globali di Foundry VTT
global.game = {
  settings: {
    get: vi.fn(),
    set: vi.fn(),
    register: vi.fn()
  },
  modules: new Map(),
  system: {
    id: 'dnd5e',
    version: '5.1.9'
  },
  ready: false,
  user: {
    isGM: false
  },
  i18n: {
    localize: vi.fn((key) => key),
    format: vi.fn((key, data) => key)
  }
};

global.Hooks = {
  once: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  call: vi.fn(),
  callAll: vi.fn()
};

global.ui = {
  notifications: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
  }
};

global.CONFIG = {
  DND5E: {
    abilities: {},
    skills: {},
    conditions: {}
  }
};

global.foundry = {
  utils: {
    mergeObject: vi.fn((original, update) => ({ ...original, ...update })),
    deepClone: vi.fn((obj) => JSON.parse(JSON.stringify(obj))),
    randomID: vi.fn(() => Math.random().toString(36).substring(2, 15))
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock performance
global.performance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 100,
    totalJSHeapSize: 1024 * 1024 * 200,
    jsHeapSizeLimit: 1024 * 1024 * 500
  }
};

// Mock console methods for testing
const originalConsole = { ...console };
global.console = {
  ...originalConsole,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
  table: vi.fn()
};