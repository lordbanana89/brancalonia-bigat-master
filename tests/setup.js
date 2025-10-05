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

// Mock localStorage con storage in memoria
const storage = new Map();
const defaultGetItem = (key) => (storage.has(key) ? storage.get(key) : null);
const defaultSetItem = (key, value) => {
  storage.set(key, String(value));
};
const defaultRemoveItem = (key) => {
  storage.delete(key);
};
const defaultClear = () => {
  storage.clear();
};

const localStorageMock = {
  getItem: vi.fn(defaultGetItem),
  setItem: vi.fn(defaultSetItem),
  removeItem: vi.fn(defaultRemoveItem),
  clear: vi.fn(defaultClear),
  __storage: storage,
  __resetMocks() {
    this.getItem.mockImplementation(defaultGetItem);
    this.setItem.mockImplementation(defaultSetItem);
    this.removeItem.mockImplementation(defaultRemoveItem);
    this.clear.mockImplementation(defaultClear);
  }
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

// Mock window oggetto minimale
global.window = {
  location: {
    hostname: 'localhost'
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  localStorage: localStorageMock
};

// Mock document basilare
global.document = {
  createElement: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
};

// Mock URL API
global.URL = {
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn()
};

// Mock console methods per tracciare tutte le uscite
const originalConsole = { ...console };
const logSpy = vi.fn();
global.console = {
  ...originalConsole,
  log: logSpy,
  error: vi.fn((...args) => logSpy(...args)),
  warn: vi.fn((...args) => logSpy(...args)),
  info: vi.fn((...args) => logSpy(...args)),
  debug: vi.fn((...args) => logSpy(...args)),
  group: vi.fn(),
  groupEnd: vi.fn(),
  table: vi.fn()
};
