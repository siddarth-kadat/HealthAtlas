import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const isNativePayload = (data) => (
  (typeof FormData !== 'undefined' && data instanceof FormData)
  || (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams)
  || (typeof Blob !== 'undefined' && data instanceof Blob)
  || (typeof File !== 'undefined' && data instanceof File)
);

// Deep clean function to remove React internals
const cleanData = (data) => {
  try {
    // Use JSON stringify/parse with replacer to strip React/Fiber references
    const cleaned = JSON.parse(
      JSON.stringify(data, (key, value) => {
        // Remove React internals, functions, and non-serializable values
        if (typeof value === 'function' || typeof value === 'symbol') {
          return undefined;
        }
        if (value && typeof value === 'object') {
          // Remove React Fiber nodes, DOM nodes, and other non-serializable objects
          if (
            value._owner || 
            value._reactFiber || 
            value._reactInternal || 
            value.nodeType ||
            value._reactFiber$ ||
            value._reactInternalFiber ||
            value.__reactInternalInstance
          ) {
            return undefined;
          }
        }
        return value;
      })
    );
    return cleaned;
  } catch (e) {
    console.warn('Failed to clean data, returning original:', e);
    return data;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  
  // Clean request data to remove React internals
  if (config.data && typeof config.data === 'object' && !isNativePayload(config.data)) {
    config.data = cleanData(config.data);
  }
  
  return config;
});

export default api;
