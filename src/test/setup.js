import '@testing-library/jest-dom';
import { expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// Import and configure custom axe setup
import axe from './axe-config.js';

// Extend Vitest matchers with axe matchers
expect.extend(axeMatchers);

// Make the custom axe configuration globally available
global.axe = axe;

// Mock do ResizeObserver que pode ser necessário em alguns testes
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

/**
 * Mock HTMLCanvasElement.getContext para resolver warnings do axe-core
 *
 * O axe-core (biblioteca de testes de acessibilidade) usa HTMLCanvasElement.getContext('2d')
 * internamente para análises visuais como:
 * - Verificação de contraste de cores entre texto e fundo
 * - Detecção de ligaduras de ícones (icon ligatures)
 * - Análise de propriedades visuais que não podem ser determinadas apenas pelo CSS/DOM
 *
 * O jsdom (ambiente DOM usado pelo Vitest) não implementa HTMLCanvasElement.getContext,
 * causando erros "Not implemented: HTMLCanvasElement.prototype.getContext" quando o
 * axe-core tenta fazer essas análises visuais.
 *
 * Este mock fornece uma implementação básica que permite ao axe-core executar
 * seus testes de acessibilidade sem erros, mesmo que a análise visual não seja
 * tão precisa quanto em um navegador real.
 */
HTMLCanvasElement.prototype.getContext = function (contextType) {
  if (contextType === '2d') {
    return {
      fillText: () => {},
      measureText: () => ({ width: 0 }),
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => ({ data: [] }),
      setTransform: () => {},
      transform: () => {},
      scale: () => {},
      rotate: () => {},
      translate: () => {},
      drawImage: () => {},
      fillRect: () => {},
      clearRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      canvas: this,
    };
  }
  return null;
};
