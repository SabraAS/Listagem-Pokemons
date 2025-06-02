import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

// ============================================================================
// 📊 OFFICIAL GOOGLE WEB VITALS THRESHOLDS
// ============================================================================

// Official Web Vitals thresholds based on Google's Core Web Vitals recommendations
// https://web.dev/vitals/
const webVitalsThresholds = {
  // Core Web Vitals (most important)
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint (ms)
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  INP: { good: 200, needsImprovement: 500 }, // Interaction to Next Paint (ms)

  // Other Web Vitals
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte (ms)

  // Legacy (replaced by INP)
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay (ms)
};

// ============================================================================
// 🎯 WEB VITALS RATING & CLASSIFICATION
// ============================================================================

// Rate a Web Vitals metric according to Google's standards
const getWebVitalRating = (metric) => {
  const threshold = webVitalsThresholds[metric.name];
  if (!threshold) return 'unknown';

  if (metric.value <= threshold.good) return 'good';
  if (metric.value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

// ============================================================================
// 🚀 WEB VITALS MONITORING (PRODUCTION)
// ============================================================================

// Send Web Vitals metrics to analytics service
const sendToAnalytics = (metric) => {
  // In a real application, you would send this data to your analytics service
  // For example: Google Analytics, DataDog, or custom analytics endpoint

  console.log('📊 Web Vitals Metric:', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    rating: getWebVitalRating(metric),
  });

  // Check if metric exceeds good threshold
  const threshold = webVitalsThresholds[metric.name];
  if (threshold && metric.value > threshold.good) {
    console.warn(
      `⚠️ Performance Alert: ${metric.name} (${metric.value}) exceeds good threshold (${threshold.good})`,
    );
  }
};

// Initialize Web Vitals monitoring
export const initWebVitals = () => {
  console.log('🚀 Initializing Web Vitals monitoring...');

  try {
    // Core Web Vitals
    console.log('🔍 Core Web Vitals');
    onLCP(sendToAnalytics); // Largest Contentful Paint
    onCLS(sendToAnalytics); // Cumulative Layout Shift
    onINP(sendToAnalytics); // Interaction to Next Paint

    // Other Web Vitals
    console.log('🔍 Other Web Vitals');
    onFCP(sendToAnalytics); // First Contentful Paint
    onTTFB(sendToAnalytics); // Time to First Byte

    console.log('✅ Web Vitals monitoring initialized successfully');
  } catch (error) {
    console.warn('❌ Failed to initialize Web Vitals:', error);
  }
};

// Export Web Vitals functions for testing
export { onCLS, onINP, onFCP, onLCP, onTTFB };

export default initWebVitals;
