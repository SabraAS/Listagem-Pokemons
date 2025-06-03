#!/usr/bin/env node

import { spawn } from 'child_process';

// URLs base para cada ambiente
const environmentUrls = {
  dev: 'http://localhost:5173',
  build: 'http://localhost:4173',
};

// Configurações por modo
const modeConfigs = {
  dev: {
    description: 'Development Server',
    startServer: true,
    serverCommand: 'yarn dev',
    port: 5173,
  },
  build: {
    description: 'Production Build',
    startServer: true,
    serverCommand: 'yarn preview',
    port: 4173,
  },
};

// Função para aguardar servidor
const waitForServer = async (url) => {
  console.log(`🔍 Verificando servidor em: ${url}`);

  for (let i = 0; i < 60; i++) {
    try {
      await fetch(url);
      console.log('✅ Servidor respondendo!');
      return;
    } catch (error) {
      if (i === 0) console.log('⏳ Aguardando servidor iniciar...');
      if (i === 59) console.error('Error checking server:', error.message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error('❌ Timeout: Servidor não respondeu em 60 segundos');
};

// Execução principal
(async () => {
  try {
    // Parse argumentos da linha de comando
    const args = process.argv.slice(2);
    const mode = args
      .find((arg) => ['--dev', '--build'].includes(arg))
      ?.replace('--', '');

    if (!mode) {
      console.log(`
🚀 Lighthouse CLI - Performance Testing

Uso:
  yarn lighthouse:dev    # Testa servidor de desenvolvimento
  yarn lighthouse:build  # Testa build de produção

Exemplos:
  yarn lighthouse:dev    # http://localhost:5173
  yarn lighthouse:build  # http://localhost:4173
      `);
      process.exit(1);
    }

    const config = modeConfigs[mode];
    const url = environmentUrls[mode];

    if (!config) {
      throw new Error(`❌ Invalid mode: ${mode}. Use: dev or build`);
    }

    console.log('\n🚀 Lighthouse Performance Test');
    console.log(`📊 Mode: ${config.description}`);
    console.log(`🔗 URL: ${url}`);

    let serverProcess;

    if (config.startServer) {
      console.log(`🏗️ Starting server: ${config.serverCommand}`);

      serverProcess = spawn(
        config.serverCommand.split(' ')[0],
        config.serverCommand.split(' ').slice(1),
        {
          stdio: 'pipe',
          shell: true,
          detached: false,
        },
      );

      // Aguarda servidor responder
      await waitForServer(url);
    } else {
      console.log('⏭️  Skipping server start');
    }

    // Executa Lighthouse
    console.log('🔍 Executando Lighthouse...\n');

    const { runLighthouse, formatResults, validateThresholds } = await import(
      './lighthouse-utils.js'
    );

    const result = await runLighthouse(url, {
      lighthouseOptions: {
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
      },
    });

    // Processa e exibe resultados
    const validation = validateThresholds(result);
    formatResults(validation);

    // Cleanup
    if (serverProcess) {
      console.log('\n🔄 Parando servidor...');

      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t']);
      } else {
        process.kill(-serverProcess.pid, 'SIGTERM');
      }
    }

    console.log('✅ Lighthouse concluído!');
    process.exit(validation.passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
})();
