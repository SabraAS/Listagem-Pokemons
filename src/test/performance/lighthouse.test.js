import { describe, expect, it } from 'vitest';

import {
  formatResults,
  performanceThresholds,
  runLighthouse,
  validateThresholds,
} from './lighthouse-utils.js';

import { webVitalsThresholds, getWebVitalRating } from '@/utils/webVitals.js';

// URL base para testes (pode ser configurada via ENV)
const BASE_URL = process.env.LIGHTHOUSE_TEST_URL || 'http://localhost:5173';

// Core Web Vitals mapping
const CORE_WEB_VITALS = {
  'first-contentful-paint': { name: 'FCP', unit: 'ms' },
  'largest-contentful-paint': { name: 'LCP', unit: 'ms' },
  'cumulative-layout-shift': { name: 'CLS', unit: '' },
};

describe('🚀 Lighthouse Performance Tests', () => {
  it('should pass all performance thresholds', async () => {
    console.log(`🔍 Testing: ${BASE_URL}`);

    const result = await runLighthouse(BASE_URL, {
      lighthouseOptions: {
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
      },
    });

    expect(result).toBeDefined();
    expect(result.lhr).toBeDefined();

    // Valida todos os thresholds de uma vez
    const validation = validateThresholds(result);
    formatResults(validation);

    // Assertions principais
    expect(validation.passed).toBe(true);
    expect(validation.summary.performance).toBeGreaterThanOrEqual(
      performanceThresholds.performance,
    );
    expect(validation.summary.accessibility).toBeGreaterThanOrEqual(
      performanceThresholds.accessibility,
    );
    expect(validation.summary.bestPractices).toBeGreaterThanOrEqual(
      performanceThresholds['best-practices'],
    );
  }, 60000);

  it('should have acceptable Core Web Vitals', async () => {
    const result = await runLighthouse(BASE_URL, {
      lighthouseOptions: {
        onlyCategories: ['performance'],
      },
    });

    const { lhr } = result;

    console.log('\n📊 Core Web Vitals:');
    console.log('='.repeat(50));

    Object.entries(CORE_WEB_VITALS).forEach(
      ([auditKey, { name: vitalName, unit }]) => {
        const audit = lhr.audits[auditKey];

        if (audit && audit.numericValue !== undefined) {
          const webVitalThreshold = webVitalsThresholds[vitalName];

          if (webVitalThreshold) {
            const value = audit.numericValue;

            // Use the official rating function from webVitals.js
            const metric = { name: vitalName, value };
            const rating = getWebVitalRating(metric);

            // Format value
            const displayValue =
              vitalName === 'CLS'
                ? value.toFixed(3)
                : `${Math.round(value)}${unit}`;

            console.log(`${audit.title}: ${displayValue} (${rating})`);
            console.log(
              `   Thresholds - Good: ≤${webVitalThreshold.good}${unit} | Needs improvement: ≤${webVitalThreshold.needsImprovement}${unit}`,
            );

            // Assert against "needs improvement" threshold (more realistic for testing)
            expect(value).toBeLessThanOrEqual(
              webVitalThreshold.needsImprovement,
            );
          }
        }
      },
    );

    // Total Blocking Time (not in official Web Vitals but important)
    const tbt = lhr.audits['total-blocking-time'];
    if (tbt && tbt.numericValue !== undefined) {
      const value = Math.round(tbt.numericValue);
      const isGood = value <= 200;
      const rating = isGood
        ? 'good'
        : value <= 600
          ? 'needs-improvement'
          : 'poor';

      console.log(`${tbt.title}: ${value}ms (${rating})`);
      console.log('   Thresholds - Good: ≤200ms | Needs improvement: ≤600ms');

      expect(value).toBeLessThanOrEqual(600);
    }
  }, 60000);

  it('should validate threshold function correctly', () => {
    // Test unitário das utilities
    const mockResult = {
      lhr: {
        categories: {
          performance: { score: 0.85, title: 'Performance' },
          accessibility: { score: 0.95, title: 'Accessibility' },
        },
        audits: {
          'first-contentful-paint': {
            title: 'First Contentful Paint',
            numericValue: 1500,
          },
          'largest-contentful-paint': {
            title: 'Largest Contentful Paint',
            numericValue: 2500,
          },
        },
      },
    };

    const validation = validateThresholds(mockResult);

    expect(validation).toHaveProperty('passed');
    expect(validation).toHaveProperty('failures');
    expect(validation).toHaveProperty('summary');
    expect(validation.summary.performance).toBe(85);
    expect(validation.summary.accessibility).toBe(95);
  });
});
