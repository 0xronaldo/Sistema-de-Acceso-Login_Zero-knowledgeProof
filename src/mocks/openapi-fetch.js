// Comprehensive mock for openapi-fetch to resolve MetaMask SDK compatibility issue

// Default function that MetaMask SDK expects
function createClient(options = {}) {
  return {
    GET: async (path, params = {}) => ({ 
      data: null, 
      error: null,
      response: { status: 200, ok: true }
    }),
    POST: async (path, params = {}) => ({ 
      data: null, 
      error: null,
      response: { status: 200, ok: true }
    }),
    PUT: async (path, params = {}) => ({ 
      data: null, 
      error: null,
      response: { status: 200, ok: true }
    }),
    DELETE: async (path, params = {}) => ({ 
      data: null, 
      error: null,
      response: { status: 200, ok: true }
    }),
    PATCH: async (path, params = {}) => ({ 
      data: null, 
      error: null,
      response: { status: 200, ok: true }
    }),
  };
}

// The main export that MetaMask SDK is looking for
const openapiMock = createClient;

// Additional properties that might be needed
openapiMock.createClient = createClient;
openapiMock.default = createClient;

// Make it available globally with different formats
if (typeof window !== 'undefined') {
  window['openapi-fetch'] = openapiMock;
  // For CommonJS-style requires
  window.__openapi_fetch_mock = {
    default: createClient,
    createClient: createClient
  };
}

if (typeof global !== 'undefined') {
  global['openapi-fetch'] = openapiMock;
  global.__openapi_fetch_mock = {
    default: createClient,
    createClient: createClient
  };
}

export default createClient;
export { createClient };