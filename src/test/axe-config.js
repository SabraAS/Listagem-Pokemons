import { configureAxe } from 'vitest-axe';

/**
 * Configuração customizada do axe-core para ambiente de teste JSDOM
 *
 */
export const axe = configureAxe({
  // Configurações globais
  globalOptions: {
    // Timeout aumentado para componentes complexos
    timeout: 10000,
  },

  // Regras customizadas para ambiente JSDOM
  rules: {
    'color-contrast': { enabled: true },

    region: { enabled: true },

    'landmark-complementary-is-top-level': { enabled: true },

    // ✅ Manter regras importantes para componentes
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    'image-alt': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    label: { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'keyboard-navigation': { enabled: true },

    'landmark-one-main': { enabled: true },
    'heading-order': { enabled: true },
    list: { enabled: true },
    listitem: { enabled: true },

    // Regras adicionais importantes
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'duplicate-id': { enabled: true },
    'duplicate-id-active': { enabled: true },
    'duplicate-id-aria': { enabled: true },
    'frame-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    label: { enabled: true },
    'meta-viewport': { enabled: true },
    'object-alt': { enabled: true },
    'page-has-heading-one': { enabled: true },
    region: { enabled: true },
    'scope-attr-valid': { enabled: true },
    'skip-link': { enabled: true },
    tabindex: { enabled: true },
    'table-duplicate-name': { enabled: true },
    'table-fake-caption': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'valid-lang': { enabled: true },
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
