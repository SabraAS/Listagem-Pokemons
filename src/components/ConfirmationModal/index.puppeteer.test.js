import puppeteer from 'puppeteer';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('ConfirmationModal UI Tests (Puppeteer)', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();

    // Configurar viewport para desktop
    await page.setViewport({ width: 1200, height: 800 });

    // Navegar para a página
    await page.goto('http://localhost:5173');

    // Aguardar o carregamento da página
    await page.waitForSelector('#root', { timeout: 10000 });
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Modal Layout Tests', () => {
    it('should not let the list exceed the available space in modal', async () => {
      // Aguardar o carregamento dos pokémons
      await page.waitForSelector('.pokemon-card', { timeout: 10000 });

      // Adicionar vários pokémons clicando nos botões
      const addButtons = await page.$$('.pokemon-card__button:not(:disabled)');

      // Adicionar muitos pokémons para forçar o crescimento da lista
      for (let i = 0; i < Math.min(15, addButtons.length); i++) {
        await addButtons[i].click();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Aguardar o sidebar renderizar
      await page.waitForSelector('.cart-sidebar__list');

      // Clicar no botão "Confirmar Equipe" para abrir o modal
      const confirmButton = await page.$(
        '.cart-sidebar__footer-button:not(:disabled)',
      );
      if (confirmButton) {
        await confirmButton.click();
        await page.waitForSelector('.confirmation-modal', { timeout: 5000 });
      }

      // Aguardar o modal renderizar completamente
      await page.waitForSelector('.confirmation-modal__list');

      // Medir as alturas reais do modal
      const modalHeight = await page.$eval(
        '.confirmation-modal__content',
        (el) => el.getBoundingClientRect().height,
      );
      const headerHeight = await page.$eval(
        '.confirmation-modal__header',
        (el) => el.getBoundingClientRect().height,
      );
      const footerHeight = await page.$eval(
        '.confirmation-modal__footer',
        (el) => el.getBoundingClientRect().height,
      );
      const listHeight = await page.$eval(
        '.confirmation-modal__list',
        (el) => el.getBoundingClientRect().height,
      );

      // Calcular a altura máxima disponível para a lista
      // Modal tem padding de 24px (top + bottom = 48px)
      const padding = 48;
      const maxListHeight = modalHeight - headerHeight - footerHeight - padding;

      // A lista nunca pode ser maior que o espaço disponível
      expect(listHeight).toBeLessThanOrEqual(maxListHeight);

      // Verificar que o footer ainda está dentro do modal
      const modalRect = await page.$eval(
        '.confirmation-modal__content',
        (el) => {
          const rect = el.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom };
        },
      );

      const footerRect = await page.$eval(
        '.confirmation-modal__footer',
        (el) => {
          const rect = el.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom };
        },
      );

      // O footer deve estar dentro do modal
      expect(footerRect.bottom).toBeLessThanOrEqual(modalRect.bottom);
      expect(footerRect.top).toBeGreaterThanOrEqual(modalRect.top);

      // Verificar que o overflow-y está aplicado na lista
      const listOverflow = await page.$eval(
        '.confirmation-modal__list',
        (el) =>
          // eslint-disable-next-line no-undef
          getComputedStyle(el).overflowY,
      );
      expect(listOverflow).toBe('auto');

      // Verificar que há pokémons na lista do modal
      const pokemonItems = await page.$$('.confirmation-modal__item');
      expect(pokemonItems.length).toBeGreaterThan(0);
    });
  });
});
