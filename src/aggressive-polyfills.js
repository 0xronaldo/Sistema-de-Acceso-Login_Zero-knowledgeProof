// Aggressive polyfill that runs before any other imports
// This needs to be imported FIRST to intercept all module resolution

// Create a comprehensive mock implementation
const createClientMock = function(options = {}) {
  return {
    GET: async (path, params = {}) => ({
      data: null,
      error: null,
      response: { 
        status: 200, 
        ok: true,
        headers: new Headers(),
        json: async () => ({}),
        text: async () => ''
      }
    }),
    POST: async (path, params = {}) => ({
      data: null,
      error: null,
      response: { 
        status: 200, 
        ok: true,
        headers: new Headers(),
        json: async () => ({}),
        text: async () => ''
      }
    }),
    PUT: async (path, params = {}) => ({
      data: null,
      error: null,
      response: { 
        status: 200, 
        ok: true,
        headers: new Headers(),
        json: async () => ({}),
        text: async () => ''
      }
    }),
    DELETE: async (path, params = {}) => ({
      data: null,
      error: null,
      response: { 
        status: 200, 
        ok: true,
        headers: new Headers(),
        json: async () => ({}),
        text: async () => ''
      }
    }),
    PATCH: async (path, params = {}) => ({
      data: null,
      error: null,
      response: { 
        status: 200, 
        ok: true,
        headers: new Headers(),
        json: async () => ({}),
        text: async () => ''
      }
    })
  };
};

// Enhanced global setup
if (typeof window !== 'undefined') {
  // Override module resolution at the browser level
  const originalDefine = window.define;
  const originalRequire = window.require;

  // AMD/RequireJS support
  window.define = function(name, deps, factory) {
    if (typeof name === 'string' && name.includes('openapi-fetch')) {
      return createClientMock;
    }
    if (originalDefine) {
      return originalDefine.apply(this, arguments);
    }
  };

  // CommonJS support
  window.require = function(moduleName) {
    if (typeof moduleName === 'string' && moduleName.includes('openapi-fetch')) {
      return {
        default: createClientMock,
        createClient: createClientMock,
        __esModule: true
      };
    }
    if (originalRequire) {
      return originalRequire.apply(this, arguments);
    }
    throw new Error(`Module ${moduleName} not found`);
  };

  // Module registry for webpack
  if (!window.__webpack_modules__) {
    window.__webpack_modules__ = {};
  }
  
  // Register our mock in various possible module formats
  window.__webpack_modules__['openapi-fetch'] = createClientMock;
  window.__webpack_modules__['./node_modules/openapi-fetch/dist/index.js'] = createClientMock;
  window.__webpack_modules__['node_modules/openapi-fetch/dist/index.js'] = createClientMock;
  
  // Override webpack require if it exists
  if (window.__webpack_require__) {
    const originalWebpackRequire = window.__webpack_require__;
    window.__webpack_require__ = function(moduleId) {
      if (typeof moduleId === 'string' && moduleId.includes('openapi-fetch')) {
        return {
          default: createClientMock,
          createClient: createClientMock,
          __esModule: true
        };
      }
      return originalWebpackRequire.apply(this, arguments);
    };
  }

  // Override dynamic imports
  const originalImport = window.import;
  window.import = function(moduleName) {
    if (typeof moduleName === 'string' && moduleName.includes('openapi-fetch')) {
      return Promise.resolve({
        default: createClientMock,
        createClient: createClientMock,
        __esModule: true
      });
    }
    if (originalImport) {
      return originalImport.apply(this, arguments);
    }
    return Promise.reject(new Error(`Module ${moduleName} not found`));
  };
}

// Node.js environment setup
if (typeof global !== 'undefined') {
  // Mock require.resolve
  if (global.require && global.require.resolve) {
    const originalResolve = global.require.resolve;
    global.require.resolve = function(id) {
      if (id.includes('openapi-fetch')) {
        return '/mock/openapi-fetch.js';
      }
      return originalResolve.apply(this, arguments);
    };
  }

  // Mock require
  const originalRequire = global.require;
  global.require = function(moduleName) {
    if (typeof moduleName === 'string' && moduleName.includes('openapi-fetch')) {
      return {
        default: createClientMock,
        createClient: createClientMock,
        __esModule: true
      };
    }
    if (originalRequire) {
      return originalRequire.apply(this, arguments);
    }
    throw new Error(`Module ${moduleName} not found`);
  };

  // Register in global module cache
  if (global.require && global.require.cache) {
    global.require.cache['openapi-fetch'] = {
      exports: {
        default: createClientMock,
        createClient: createClientMock,
        __esModule: true
      }
    };
  }
}

// ES6 Module exports
export default createClientMock;
export { createClientMock as createClient };

console.log('🔧 Aggressive openapi-fetch polyfill loaded successfully');