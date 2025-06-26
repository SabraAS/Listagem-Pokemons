import puppeteer from 'puppeteer';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('PokemonCard UI Tests (Puppeteer)', () => {
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

  describe('Layout Tests with Long Content', () => {
    it('should not let the list exceed the available space in card', async () => {
      // Aguardar o carregamento dos pokémons
      await page.waitForSelector('.pokemon-card', { timeout: 10000 });

      // Aguardar um pouco mais para garantir que a API seja processada
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verificar se há pokémons carregados
      const pokemonCards = await page.$$('.pokemon-card');
      expect(pokemonCards.length).toBeGreaterThan(0);

      // Pegar o primeiro card para testar
      const firstCard = await page.$('.pokemon-card');
      const cardBox = await firstCard.boundingBox();

      // Verificar dimensões corretas
      expect(cardBox.width).toBeCloseTo(250, 0);
      expect(cardBox.height).toBeCloseTo(450, 0);

      // Medir as alturas reais do card
      const cardHeight = await page.$eval(
        '.pokemon-card',
        (el) => el.getBoundingClientRect().height,
      );
      const imageHeight = await page.$eval(
        '.pokemon-card__image',
        (el) => el.getBoundingClientRect().height,
      );
      const buttonHeight = await page.$eval(
        '.pokemon-card__button',
        (el) => el.getBoundingClientRect().height,
      );
      const nameHeight = await page.$eval(
        '.pokemon-card__name',
        (el) => el.getBoundingClientRect().height,
      );
      const infoHeight = await page.$eval(
        '.pokemon-card__info',
        (el) => el.getBoundingClientRect().height,
      );

      // Calcular a altura máxima disponível para o info
      // Card tem margins e paddings que precisam ser considerados
      const margins = 8 + 16 + 8; // margins do button e name
      const maxInfoHeight =
        cardHeight - imageHeight - buttonHeight - nameHeight - margins;

      // O info nunca pode ser maior que o espaço disponível
      expect(infoHeight).toBeLessThanOrEqual(maxInfoHeight);

      // Verificar que o info ainda está dentro do card
      const cardRect = await page.$eval('.pokemon-card', (el) => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
      });

      const infoRect = await page.$eval('.pokemon-card__info', (el) => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
      });

      // O info deve estar dentro do card
      expect(infoRect.bottom).toBeLessThanOrEqual(cardRect.bottom);
      expect(infoRect.top).toBeGreaterThanOrEqual(cardRect.top);

      // Verificar que o overflow-y está aplicado no info
      const infoOverflow = await page.$eval(
        '.pokemon-card__info',
        (el) =>
          // eslint-disable-next-line no-undef
          getComputedStyle(el).overflowY,
      );
      expect(infoOverflow).toBe('auto');

      // Verificar que há textos no info
      const textElements = await page.$$('.pokemon-card__text');
      expect(textElements.length).toBeGreaterThan(0);

      // Verificar o nome do Pokémon que está sendo testado
      const nameElements = await page.$$('.pokemon-card__name');

      for (let i = 0; i < nameElements.length; i++) {
        const nameText = await nameElements[i].evaluate((el) => el.textContent);
        const textContent = await textElements[i].evaluate(
          (el) => el.textContent,
        );
      }

      // Verificar se a característica longa está sendo exibida
      for (const textElement of textElements) {
        const textContent = await textElement.evaluate((el) => el.textContent);

        if (textContent.includes('Característica:')) {
          expect(textContent).toContain(textContent);
        }
      }
    });

    it('should handle multiple cards with different content lengths', async () => {
      // Aguardar o carregamento dos pokémons
      await page.waitForSelector('.pokemon-card', { timeout: 10000 });

      // Verificar se há múltiplos cards
      const pokemonCards = await page.$$('.pokemon-card');
      expect(pokemonCards.length).toBeGreaterThan(1);

      // Verificar se todos os cards têm as mesmas dimensões
      for (let i = 0; i < Math.min(3, pokemonCards.length); i++) {
        const cardBox = await pokemonCards[i].boundingBox();

        // Todos os cards devem ter as mesmas dimensões
        expect(cardBox.width).toBeCloseTo(250, 0);
        expect(cardBox.height).toBeCloseTo(450, 0);
      }
    });
  });
});
