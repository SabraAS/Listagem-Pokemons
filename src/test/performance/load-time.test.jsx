import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { measureRenderTime, testRenderThresholds } from './performance-utils';

import Home from '@/app/Home';
import CartSidebar from '@/components/CartSidebar';
import ConfirmationModal from '@/components/ConfirmationModal';
import PokemonCard from '@/components/PokemonCard';
import { mockPokemons } from '@/test/mocks/pokemon';

/*
 * Performance Tests - Component Load Time & Rendering
 *
 * These tests measure component rendering and loading performance.
 * Thresholds are centralized in performance-utils.js and optimized for JSDOM + Vitest.
 */

// Mock queries to control test data
vi.mock('@/queries/pokemon', () => ({
  usePokemons: vi.fn(() => ({
    data: mockPokemons,
    isLoading: false,
  })),
}));

vi.mock('@/store/pokemon', () => ({
  usePokemonStore: vi.fn(() => ({
    pokemons: mockPokemons,
    addPokemon: vi.fn(),
    removePokemon: vi.fn(),
    clearTeam: vi.fn(),
  })),
}));

describe('Component Performance Tests', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  describe('Component Rendering', () => {
    it('should render PokemonCard within acceptable time', async () => {
      const pokemon = mockPokemons[0];

      const renderTime = await measureRenderTime(async () => {
        render(
          <PokemonCard
            abilities={pokemon.abilities.map((ability) => ({
              ability: { name: ability },
            }))}
            characteristic={pokemon.characteristic}
            image={pokemon.image}
            name={pokemon.name}
            onClick={vi.fn()}
            types={pokemon.types.map((type) => ({
              type: { name: type },
            }))}
          />,
        );
      });

      console.log(`⚡ PokemonCard render time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(testRenderThresholds.singleComponent);
    });

    it('should render CartSidebar within acceptable time', async () => {
      const renderTime = await measureRenderTime(async () => {
        render(<CartSidebar />);
      });

      console.log(`🛒 CartSidebar render time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(testRenderThresholds.singleComponent);
    });

    it('should render ConfirmationModal within acceptable time', async () => {
      const mockOnClose = vi.fn();
      const mockOnStartNew = vi.fn();

      const renderTime = await measureRenderTime(async () => {
        render(
          <ConfirmationModal
            items={mockPokemons}
            onClose={mockOnClose}
            onStartNew={mockOnStartNew}
          />,
        );
      });

      console.log(
        `✅ ConfirmationModal render time: ${renderTime.toFixed(2)}ms`,
      );
      expect(renderTime).toBeLessThan(testRenderThresholds.singleComponent);
    });

    it('should render multiple PokemonCard efficiently', async () => {
      const renderTimes = [];

      for (let i = 0; i < mockPokemons.length; i++) {
        const pokemon = mockPokemons[i];
        const renderTime = await measureRenderTime(async () => {
          render(
            <PokemonCard
              abilities={pokemon.abilities.map((ability) => ({
                ability: { name: ability },
              }))}
              characteristic={pokemon.characteristic}
              image={pokemon.image}
              name={pokemon.name}
              onClick={vi.fn()}
              types={pokemon.types.map((type) => ({
                type: { name: type },
              }))}
            />,
          );
        });
        renderTimes.push(renderTime);
      }

      const averageRenderTime =
        renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;

      console.log(`📊 Average render time: ${averageRenderTime.toFixed(2)}ms`);
      console.log(`📈 Total components rendered: ${renderTimes.length}`);

      expect(averageRenderTime).toBeLessThan(
        testRenderThresholds.multipleComponents,
      );
      renderTimes.forEach((time) => {
        expect(time).toBeLessThan(testRenderThresholds.maxIndividualRender);
      });
    });

    it('should render Home page within acceptable time', async () => {
      const renderTime = await measureRenderTime(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <Home />
          </QueryClientProvider>,
        );

        await waitFor(() => {
          expect(screen.getByText('Pokémons')).toBeInTheDocument();
        });
      });

      console.log(`🏠 Home page render time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(testRenderThresholds.pageWithData);
    });
  });

  describe('User Interactions', () => {
    it('should respond to clicks quickly', async () => {
      const mockOnClick = vi.fn();
      const pokemon = mockPokemons[0];

      render(
        <PokemonCard
          abilities={pokemon.abilities.map((ability) => ({
            ability: { name: ability },
          }))}
          characteristic={pokemon.characteristic}
          image={pokemon.image}
          name={pokemon.name}
          onClick={mockOnClick}
          types={pokemon.types.map((type) => ({
            type: { name: type },
          }))}
        />,
      );

      const addButton = screen.getByTestId(
        `add-pokemon-${pokemon.name.toLowerCase()}`,
      );

      const renderTime = await measureRenderTime(async () => {
        addButton.click();
        await waitFor(() => {
          expect(mockOnClick).toHaveBeenCalledTimes(1);
        });
      });

      console.log(`👆 Click response time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(testRenderThresholds.singleComponent);
    });
  });

  describe('Edge Cases & Performance Scenarios', () => {
    it('should handle empty data state gracefully', async () => {
      const { usePokemons } = await import('@/queries/pokemon');
      usePokemons.mockReturnValue({
        data: [],
        isLoading: false,
      });

      const renderTime = await measureRenderTime(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <Home />
          </QueryClientProvider>,
        );
      });

      console.log(`📭 Empty data render time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(testRenderThresholds.emptyState);
    });

    it('should handle loading state efficiently', async () => {
      const { usePokemons } = await import('@/queries/pokemon');
      usePokemons.mockReturnValue({
        data: null,
        isLoading: true,
      });

      const renderTime = await measureRenderTime(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <Home />
          </QueryClientProvider>,
        );
      });

      console.log(`⏳ Loading state render time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(testRenderThresholds.loadingState);
    });

    it('should render CartSidebar with empty state efficiently', async () => {
      const { usePokemonStore } = await import('@/store/pokemon');
      usePokemonStore.mockReturnValue({
        pokemons: [],
        removePokemon: vi.fn(),
        clearTeam: vi.fn(),
      });

      const renderTime = await measureRenderTime(async () => {
        render(<CartSidebar />);
      });

      console.log(
        `🛒 CartSidebar empty state render time: ${renderTime.toFixed(2)}ms`,
      );
      expect(renderTime).toBeLessThan(testRenderThresholds.emptyState);
    });

    it('should render ConfirmationModal with minimal items efficiently', async () => {
      const mockOnClose = vi.fn();
      const mockOnStartNew = vi.fn();
      const singleItem = [mockPokemons[0]];

      const renderTime = await measureRenderTime(async () => {
        render(
          <ConfirmationModal
            items={singleItem}
            onClose={mockOnClose}
            onStartNew={mockOnStartNew}
          />,
        );
      });

      console.log(
        `✅ ConfirmationModal single item render time: ${renderTime.toFixed(2)}ms`,
      );
      expect(renderTime).toBeLessThan(testRenderThresholds.emptyState);
    });
  });
});
