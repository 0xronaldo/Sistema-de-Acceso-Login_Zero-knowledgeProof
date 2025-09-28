// Polyfills for Web3 compatibility
import { Buffer } from 'buffer';
import createClient from './mocks/openapi-fetch';

// Make Buffer global
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window.global || window;
}

if (typeof global !== 'undefined') {
  global.Buffer = Buffer;
}

// Process polyfill
const processPolyfill = {
  env: { 
    NODE_ENV: process?.env?.NODE_ENV || 'development',
    REACT_APP_ENVIRONMENT: 'browser'
  },
  browser: true,
  version: '',
  platform: 'browser',
  nextTick: function(fn) {
    setTimeout(fn, 0);
  }
};

if (typeof window !== 'undefined') {
  window.process = window.process || processPolyfill;
}

if (typeof global !== 'undefined' && !global.process) {
  global.process = processPolyfill;
}

// Additional crypto polyfill
if (typeof window !== 'undefined' && !window.crypto) {
  window.crypto = window.crypto || {};
}

// Comprehensive openapi-fetch mock setup
try {
  // Mock for webpack module resolution
  if (typeof window !== 'undefined') {
    // Define module for webpack
    window.__webpack_require__ = window.__webpack_require__ || function(moduleId) {
      if (moduleId.includes('openapi-fetch')) {
        return {
          default: createClient,
          createClient: createClient,
          __esModule: true
        };
      }
      throw new Error(`Module ${moduleId} not found`);
    };

    // Mock for dynamic imports
    const originalImport = window.import || (() => {});
    window.import = function(moduleName) {
      if (typeof moduleName === 'string' && moduleName.includes('openapi-fetch')) {
        return Promise.resolve({
          default: createClient,
          createClient: createClient,
          __esModule: true
        });
      }
      return originalImport.apply(this, arguments);
    };
  }

  // Mock for Node.js-style require (for SSR or mixed environments)
  if (typeof global !== 'undefined') {
    const originalRequire = global.require;
    global.require = function(moduleName) {
      if (typeof moduleName === 'string' && moduleName.includes('openapi-fetch')) {
        return {
          default: createClient,
          createClient: createClient,
          __esModule: true
        };
      }
      if (originalRequire) {
        return originalRequire.apply(this, arguments);
      }
      throw new Error(`Module ${moduleName} not found`);
    };
  }
} catch (error) {
  console.warn('Failed to setup comprehensive openapi-fetch mock:', error);
}

export default {};