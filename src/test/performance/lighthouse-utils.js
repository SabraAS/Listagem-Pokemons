import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

/**
 * Lighthouse Testing Utilities
 *
 * Configuração padrão do Lighthouse otimizada para testes de performance
 */
export const defaultLighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'speed-index',
      'cumulative-layout-shift',
      'total-blocking-time',
      'interactive',
      'performance-budget',
    ],
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    emulatedUserAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
  },
};

/**
 * Configuração mobile do Lighthouse
 */
export const mobileLighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'speed-index',
      'cumulative-layout-shift',
      'total-blocking-time',
      'interactive',
      'performance-budget',
    ],
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2.625,
      disabled: false,
    },
    emulatedUserAgent:
      'Mozilla/5.0 (Linux; Android 7.0; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Mobile Safari/537.36',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 150 * 3.75,
      downloadThroughputKbps: 1638.4,
      uploadThroughputKbps: 675,
    },
  },
};

/**
 * Thresholds para performance (valores mínimos aceitáveis)
 */
export const performanceThresholds = {
  performance: 80,
  accessibility: 90,
  'best-practices': 80,
  'first-contentful-paint': 2500,
  'largest-contentful-paint': 4000,
  'speed-index': 4000,
  'cumulative-layout-shift': 0.15,
  'total-blocking-time': 500,
  interactive: 5000,
};

/**
 * Cria uma instância do browser para o Lighthouse
 */
export async function createBrowser(options = {}) {
  const defaultOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--disable-features=VizDisplayCompositor',
    ],
  };

  return puppeteer.launch({ ...defaultOptions, ...options });
}

/**
 * Executa o Lighthouse em uma URL
 */
export async function runLighthouse(url, options = {}) {
  const browser = await createBrowser(options.browserOptions);

  try {
    const { port } = new URL(browser.wsEndpoint());

    const lighthouseOptions = {
      port: parseInt(port),
      output: 'json',
      logLevel: 'info',
      ...options.lighthouseOptions,
    };

    const config = options.config || defaultLighthouseConfig;

    console.log(`🔍 Running Lighthouse on: ${url}`);
    const result = await lighthouse(url, lighthouseOptions, config);

    return result;
  } finally {
    await browser.close();
  }
}

/**
 * Mostra relatório do Lighthouse no console
 */
export function displayLighthouseReport(result) {
  const { lhr } = result;

  console.log('\n📊 Lighthouse Report Summary:');
  console.log('='.repeat(50));

  // Mostra categorias principais
  if (lhr.categories) {
    Object.entries(lhr.categories).forEach(([key, category]) => {
      const score = Math.round(category.score * 100);
      const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
      console.log(`${emoji} ${category.title.padEnd(20)}: ${score}%`);
    });
  }

  console.log('\n⚡ Core Web Vitals:');
  console.log('-'.repeat(30));

  // Métricas importantes
  const metrics = {
    'first-contentful-paint': 'First Contentful Paint',
    'largest-contentful-paint': 'Largest Contentful Paint',
    'speed-index': 'Speed Index',
    'total-blocking-time': 'Total Blocking Time',
    'cumulative-layout-shift': 'Cumulative Layout Shift',
    interactive: 'Time to Interactive',
  };

  Object.entries(metrics).forEach(([key, title]) => {
    const audit = lhr.audits[key];
    if (audit && audit.numericValue !== undefined) {
      const value =
        key === 'cumulative-layout-shift'
          ? audit.numericValue.toFixed(3)
          : `${Math.round(audit.numericValue)}ms`;
      console.log(`   ${title}: ${value}`);
    }
  });

  console.log(`\n🔗 URL: ${lhr.finalUrl}`);
  console.log(`⏱️  Tested at: ${new Date(lhr.fetchTime).toLocaleString()}`);
}

/**
 * Valida se as métricas estão dentro dos thresholds
 */
export function validateThresholds(lighthouseResult, customThresholds = {}) {
  const thresholds = { ...performanceThresholds, ...customThresholds };
  const { lhr } = lighthouseResult;
  const failures = [];

  // Verifica categorias principais
  Object.keys(lhr.categories).forEach((categoryKey) => {
    const category = lhr.categories[categoryKey];
    const threshold = thresholds[categoryKey];

    if (threshold && category.score * 100 < threshold) {
      failures.push({
        type: 'category',
        name: category.title,
        score: Math.round(category.score * 100),
        threshold,
        message: `${category.title}: ${Math.round(category.score * 100)} < ${threshold}`,
      });
    }
  });

  // Verifica métricas específicas
  Object.keys(lhr.audits).forEach((auditKey) => {
    const audit = lhr.audits[auditKey];
    const threshold = thresholds[auditKey];

    if (threshold && audit.numericValue && audit.numericValue > threshold) {
      failures.push({
        type: 'metric',
        name: audit.title,
        value: Math.round(audit.numericValue),
        threshold,
        message: `${audit.title}: ${Math.round(audit.numericValue)}ms > ${threshold}ms`,
      });
    }
  });

  return {
    passed: failures.length === 0,
    failures,
    summary: {
      performance: Math.round(lhr.categories.performance?.score * 100 || 0),
      accessibility: Math.round(lhr.categories.accessibility?.score * 100 || 0),
      bestPractices: Math.round(
        lhr.categories['best-practices']?.score * 100 || 0,
      ),
    },
  };
}

/**
 * Formata resultados para output no terminal
 */
export function formatResults(validation) {
  const { summary, failures, passed } = validation;

  console.log('\n🚀 Lighthouse Results:');
  console.log('='.repeat(50));

  // Scores principais
  Object.entries(summary).forEach(([key, score]) => {
    console.log(`${key.padEnd(15)}: ${score}%`);
  });

  if (passed) {
    console.log('\n✅ All thresholds passed!');
  } else {
    console.log(`\n❌ ${failures.length} threshold(s) failed:`);
    failures.forEach((failure) => {
      console.log(`   • ${failure.message}`);
    });
  }

  return passed;
}

/**
 * Aguarda o servidor estar disponível
 */
export async function waitForServer(url, timeout = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Server ready: ${url}`);
        return true;
      }
    } catch (error) {
      // Servidor ainda não está pronto
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`❌ Server not ready after ${timeout}ms: ${url}`);
}
