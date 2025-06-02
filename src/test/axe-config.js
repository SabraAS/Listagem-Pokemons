import { configureAxe } from 'vitest-axe';

/**
 * Configuração customizada do axe-core para ambiente de teste JSDOM
 *
 * Esta configuração otimiza os testes de acessibilidade para o ambiente JSDOM,
 * desabilitando regras que não funcionam corretamente em ambiente simulado
 * e habilitando as principais verificações de WCAG.
 */
export const axe = configureAxe({
  // Configurações globais
  globalOptions: {
    // Timeout aumentado para componentes complexos
    timeout: 10000,
  },

  // Regras customizadas para ambiente JSDOM
  rules: {
    // ❌ Contraste de cor: Não funciona corretamente no JSDOM
    // O JSDOM não renderiza cores reais, causando falsos positivos
    'color-contrast': { enabled: false },

    // ❌ Landmarks: Desnecessário para testes de componentes isolados
    // Componentes individuais não precisam ter landmarks completos
    region: { enabled: false },

    // ❌ Page-level rules: Não aplicáveis para componentes isolados
    'page-has-heading-one': { enabled: false },
    'landmark-one-main': { enabled: false },
    'landmark-complementary-is-top-level': { enabled: false },

    // ✅ Manter regras importantes para componentes
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    'image-alt': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    label: { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'keyboard-navigation': { enabled: true },
  },

  // Tags WCAG para cobertura abrangente
  tags: [
    'wcag2a', // WCAG 2.0 Level A
    'wcag2aa', // WCAG 2.0 Level AA
    'wcag21aa', // WCAG 2.1 Level AA
    'best-practice', // Melhores práticas adicionais
  ],

  // Configurações de performance
  options: {
    // Executar regras em paralelo para melhor performance
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
    },

    // Configurações específicas para ambiente de teste
    environment: {
      // Simular interações de teclado
      orientationLock: false,
    },
  },
});

export default axe;
