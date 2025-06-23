import puppeteer from 'puppeteer';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('CartSidebar UI Tests (Puppeteer)', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();

    // Configurar viewport para desktop
    await page.setViewport({ width: 1200, height: 800 });

    // Navegar para a página (assumindo que o app está rodando em localhost:5173)
    await page.goto('http://localhost:5173');

    // Aguardar o carregamento da página
    await page.waitForSelector('#root', { timeout: 10000 });
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Scroll Behavior Tests', () => {
    it('should not let the list exceed the available space in sidebar', async () => {
      // Aguardar o carregamento dos pokémons
      await page.waitForSelector('.pokemon-card', { timeout: 10000 });

      // Adicionar vários pokémons clicando nos botões
      const addButtons = await page.$$('.pokemon-card__button:not(:disabled)');

      // Adicionar muitos pokémons para forçar o crescimento da lista
      for (let i = 0; i < Math.min(15, addButtons.length); i++) {
        await addButtons[i].click();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await page.waitForSelector('.cart-sidebar__list');

      // Medir as alturas reais
      const sidebarHeight = await page.$eval(
        '.cart-sidebar',
        (el) => el.getBoundingClientRect().height,
      );
      const titleHeight = await page.$eval(
        '.cart-sidebar__title',
        (el) => el.getBoundingClientRect().height,
      );
      const footerHeight = await page.$eval(
        '.cart-sidebar__footer',
        (el) => el.getBoundingClientRect().height,
      );
      const listHeight = await page.$eval(
        '.cart-sidebar__list',
        (el) => el.getBoundingClientRect().height,
      );

      // Calcular a altura máxima disponível para a lista
      // Sidebar tem padding de 24px (top + bottom = 48px)
      const padding = 48;
      const maxListHeight =
        sidebarHeight - titleHeight - footerHeight - padding;

      // A lista nunca pode ser maior que o espaço disponível
      expect(listHeight).toBeLessThanOrEqual(maxListHeight);

      // Verificar que o footer ainda está dentro do sidebar
      const sidebarRect = await page.$eval('.cart-sidebar', (el) => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
      });

      const footerRect = await page.$eval('.cart-sidebar__footer', (el) => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
      });

      // O footer deve estar dentro do sidebar
      expect(footerRect.bottom).toBeLessThanOrEqual(sidebarRect.bottom);
      expect(footerRect.top).toBeGreaterThanOrEqual(sidebarRect.top);
    });
  });
});
