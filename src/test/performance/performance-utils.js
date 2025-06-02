// ============================================================================
// 🔧 COMPONENT RENDER TEST THRESHOLDS
// ============================================================================

// Minimal thresholds for component rendering tests in JSDOM environment
// These are NOT Web Vitals - just internal test performance benchmarks
export const testRenderThresholds = {
  singleComponent: 100, // Individual component render time
  pageWithData: 200, // Full page with data
  multipleComponents: 150, // Average of multiple renders
  maxIndividualRender: 250, // Maximum for any single render
  emptyState: 100, // Empty or minimal data state
  loadingState: 80, // Loading state render time
};

// ============================================================================
// 🔧 TEST UTILITIES
// ============================================================================

// Mock Performance API for test environment
export const mockPerformanceAPI = () => {
  const mockPerformance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: (type) => {
      switch (type) {
        case 'navigation':
          return [
            {
              domContentLoadedEventEnd: 1000,
              domContentLoadedEventStart: 800,
              loadEventEnd: 1500,
              loadEventStart: 1200,
              responseStart: 200,
              responseEnd: 500,
            },
          ];
        case 'paint':
          return [
            { name: 'first-paint', startTime: 800 },
            { name: 'first-contentful-paint', startTime: 1000 },
          ];
        default:
          return [];
      }
    },
    getEntriesByName: (name) => {
      if (name === 'largest-contentful-paint') {
        return [{ startTime: 1200, size: 1000 }];
      }
      return [];
    },
  };

  // Replace global Performance API
  Object.defineProperty(global, 'performance', {
    value: mockPerformance,
    writable: true,
  });

  // Mock ResizeObserver if it doesn't exist
  if (!global.ResizeObserver) {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
};

// Measure render time of a component
export const measureRenderTime = async (renderFunction) => {
  const startTime = performance.now();
  await renderFunction();
  const endTime = performance.now();
  return endTime - startTime;
};
