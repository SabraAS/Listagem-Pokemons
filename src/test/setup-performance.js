import { mockPerformanceAPI } from './performance/performance-utils';

// Configurar mocks de performance antes de cada teste
mockPerformanceAPI();

// Mock do navigator.connection para testes de rede
Object.defineProperty(navigator, 'connection', {
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
  },
  writable: true,
});

// Mock do document.visibilityState
Object.defineProperty(document, 'visibilityState', {
  value: 'visible',
  writable: true,
});

// Mock do requestIdleCallback se não existir
if (!global.requestIdleCallback) {
  global.requestIdleCallback = (callback) => {
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 50,
      });
    }, 16);
  };
}

if (!global.cancelIdleCallback) {
  global.cancelIdleCallback = (id) => {
    clearTimeout(id);
  };
}

// Mock do PerformanceObserver
if (!global.PerformanceObserver) {
  global.PerformanceObserver = class PerformanceObserver {
    constructor(callback) {
      this.callback = callback;
    }

    observe() {}

    disconnect() {}

    takeRecords() {
      return [];
    }
  };
}
