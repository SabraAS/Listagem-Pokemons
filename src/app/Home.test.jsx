import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import Home from './Home';

import { usePokemons } from '@/queries/pokemon';
import * as pokemonStoreModule from '@/store/pokemon';
import { mockPokemons } from '@/test/mocks/pokemon';

vi.mock('@/queries/pokemon', () => ({
  usePokemons: vi.fn(),
}));

describe('Home', () => {
  const mockUsePokemons = vi.fn();
  const mockAddPokemon = vi.fn();
  const mockRemovePokemonById = vi.fn();
  const mockClearTeam = vi.fn();

  const originalUsePokemonStore = pokemonStoreModule.usePokemonStore;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUsePokemons.mockReturnValue({
      data: {
        pages: [
          {
            results: mockPokemons,
            pagination: {
              total: 1000,
              offset: 0,
              limit: 21,
              hasMore: true,
            },
          },
        ],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: true,
      fetchNextPage: vi.fn(),
    });

    vi.spyOn(pokemonStoreModule, 'usePokemonStore').mockImplementation(
      (selector) => {
        const state = {
          pokemons: [],
          addPokemon: mockAddPokemon,
          removePokemonById: mockRemovePokemonById,
          clearTeam: mockClearTeam,
        };
        return selector(state);
      },
    );

    usePokemons.mockImplementation(mockUsePokemons);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should match snapshot', () => {
      const { container } = render(<Home />);
      expect(container).toMatchSnapshot();
    });

    it('should render basic structure without errors', () => {
      render(<Home />);
      expect(screen.getByText('Pokémons')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe')).toBeInTheDocument();
    });

    it('should handle empty pages array from API', () => {
      mockUsePokemons.mockReturnValue({
        data: {
          pages: [],
        },
        isLoading: false,
      });

      render(<Home />);
      expect(screen.getByText('Pokémons')).toBeInTheDocument();

      expect(screen.getByText('Nenhum Pokémon encontrado')).toBeInTheDocument();
    });

    it('should handle data without pages property', () => {
      mockUsePokemons.mockReturnValue({
        data: { pages: null },
        isLoading: false,
      });

      render(<Home />);

      expect(screen.getByText('Nenhum Pokémon encontrado')).toBeInTheDocument();
    });

    it('should show loading state while fetching data', () => {
      mockUsePokemons.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<Home />);
      expect(screen.getByText('Carregando...')).toBeInTheDocument();
      expect(
        screen.queryByText('Nenhum Pokémon encontrado'),
      ).not.toBeInTheDocument();
    });

    it('should show "Nenhum Pokémon encontrado" when API returns no results', () => {
      mockUsePokemons.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<Home />);
      expect(screen.getByText('Nenhum Pokémon encontrado')).toBeInTheDocument();
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    it('should handle error state from API', () => {
      mockUsePokemons.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('API Error'),
      });

      render(<Home />);
      expect(screen.getByText('Nenhum Pokémon encontrado')).toBeInTheDocument();
    });

    it('should show loading message when fetching next page', () => {
      mockUsePokemons.mockReturnValue({
        data: {
          pages: [
            {
              results: mockPokemons,
              pagination: {
                total: 1000,
                offset: 0,
                limit: 21,
                hasMore: true,
              },
            },
          ],
        },
        isLoading: false,
        isFetchingNextPage: true,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
      });

      render(<Home />);
      expect(
        screen.getByText('Carregando mais Pokémons...'),
      ).toBeInTheDocument();
    });

    it('should not show loading message when not fetching next page', () => {
      mockUsePokemons.mockReturnValue({
        data: {
          pages: [
            {
              results: mockPokemons,
              pagination: {
                total: 1000,
                offset: 0,
                limit: 21,
                hasMore: true,
              },
            },
          ],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
      });

      render(<Home />);
      expect(
        screen.queryByText('Carregando mais Pokémons...'),
      ).not.toBeInTheDocument();
    });

    it('should transition from loading to loaded state correctly', () => {
      mockUsePokemons.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const { rerender } = render(<Home />);
      expect(screen.getByText('Carregando...')).toBeInTheDocument();

      mockUsePokemons.mockReturnValue({
        data: {
          pages: [
            {
              results: mockPokemons,
              pagination: {
                total: 1000,
                offset: 0,
                limit: 21,
                hasMore: true,
              },
            },
          ],
        },
        isLoading: false,
      });

      rerender(<Home />);
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      expect(screen.getAllByText('bulbasaur')).toHaveLength(1);
    });
  });

  describe('Interactions', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.restoreAllMocks();

      usePokemons.mockReturnValue({
        data: {
          pages: [
            {
              results: mockPokemons,
              pagination: {
                total: 1000,
                offset: 0,
                limit: 21,
                hasMore: true,
              },
            },
          ],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
      });

      originalUsePokemonStore.getState().clearTeam();
    });

    it('should not add pokemon that does not exist in the list', () => {
      const mockAddPokemon = vi.fn();

      vi.spyOn(pokemonStoreModule, 'usePokemonStore').mockImplementation(
        (selector) => {
          const state = {
            pokemons: [],
            addPokemon: mockAddPokemon,
            removePokemonById: mockRemovePokemonById,
            clearTeam: mockClearTeam,
          };
          return selector(state);
        },
      );

      mockUsePokemons.mockReturnValue({
        data: {
          pages: [
            {
              results: [
                { id: 1, name: 'bulbasaur' },
                { id: 2, name: 'charmander' },
              ],
              pagination: {
                total: 2,
                offset: 0,
                limit: 21,
                hasMore: false,
              },
            },
          ],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      });

      const { container } = render(<Home />);

      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('charmander')).toBeInTheDocument();

      const addPokemonProp = container.querySelector(
        '.pokemon-card__button',
      ).onclick;

      const nonExistingId = 999;

      mockAddPokemon.mockClear();

      const mockEvent = { preventDefault: vi.fn() };
      addPokemonProp.call({ props: { id: nonExistingId } }, mockEvent);

      expect(mockAddPokemon).not.toHaveBeenCalled();
    });

    it('should add and remove pokemon using real store', () => {
      render(<Home />);

      expect(screen.getByText('Nenhum Pokémon adicionado')).toBeInTheDocument();

      const addButton = screen.getByLabelText('Adicionar bulbasaur à equipe');
      fireEvent.click(addButton);

      expect(screen.getAllByText('bulbasaur')).toHaveLength(2); // Card + Sidebar
      expect(screen.getByLabelText('bulbasaur indisponível')).toBeDisabled();

      expect(
        screen.getByText(
          'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
        ),
      ).toBeInTheDocument();

      const addCharmanderButton = screen.getByLabelText(
        'Adicionar charmander à equipe',
      );
      fireEvent.click(addCharmanderButton);

      expect(screen.getAllByText('bulbasaur')).toHaveLength(2);
      expect(screen.getAllByText('charmander')).toHaveLength(2);

      const removeButton = screen.getByLabelText('Remover bulbasaur da equipe');
      fireEvent.click(removeButton);

      expect(
        screen.queryByText(
          'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.getByLabelText('Adicionar bulbasaur à equipe'),
      ).not.toBeDisabled();

      expect(screen.getAllByText('charmander')).toHaveLength(2);
      expect(
        screen.getByText(
          'Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.',
        ),
      ).toBeInTheDocument();
    });

    it('should hide modal when is called via onClose', () => {
      vi.spyOn(pokemonStoreModule, 'usePokemonStore').mockImplementation(
        (selector) => {
          const state = {
            pokemons: [
              { id: 1, name: 'bulbasaur' },
              { id: 2, name: 'charmander' },
            ],
            addPokemon: mockAddPokemon,
            removePokemonById: mockRemovePokemonById,
            clearTeam: mockClearTeam,
          };
          return selector(state);
        },
      );

      render(<Home />);

      fireEvent.click(screen.getByText('Confirmar Equipe'));
      expect(screen.getByText('Equipe formada')).toBeInTheDocument();

      const closeButton = screen.getByLabelText('Fechar modal');
      fireEvent.click(closeButton);

      expect(screen.queryByText('Equipe formada')).not.toBeInTheDocument();
    });

    it('should complete full team flow with real store', () => {
      render(<Home />);

      const addPokemon1 = screen.getByTestId('pokemon-card-button-1');
      const addPokemon2 = screen.getByTestId('pokemon-card-button-4');
      fireEvent.click(addPokemon1);
      fireEvent.click(addPokemon2);

      const button = screen.getByTestId('cart-sidebar-footer-button');
      fireEvent.click(button);

      const modal = screen.getByTestId('confirmation-modal');
      expect(modal).toBeInTheDocument();

      const closeButton = screen.getByTestId('confirmation-modal-button');
      fireEvent.click(closeButton);

      expect(modal).not.toBeInTheDocument();

      expect(screen.getByText('Nenhum Pokémon adicionado')).toBeInTheDocument();
      expect(addPokemon1).not.toBeDisabled();
      expect(addPokemon2).not.toBeDisabled();
    });

    it('should calculate correct pokemonsPerPage based on screen width', () => {
      vi.restoreAllMocks();

      const mockFn = vi.fn();
      usePokemons.mockImplementation((value) => {
        mockFn(value);
        return {
          data: {
            pages: [{ results: mockPokemons }],
          },
          isLoading: false,
          isFetchingNextPage: false,
          hasNextPage: true,
          fetchNextPage: vi.fn(),
        };
      });

      // (> 3000px)
      const originalWidth = window.innerWidth;
      Object.defineProperty(window, 'innerWidth', {
        value: 3840,
        configurable: true,
      });
      render(<Home />);
      expect(mockFn).toHaveBeenCalledWith(44);

      vi.clearAllMocks();

      // (> 1900px e <= 3000px)
      Object.defineProperty(window, 'innerWidth', {
        value: 2560,
        configurable: true,
      });
      render(<Home />);
      expect(mockFn).toHaveBeenCalledWith(28);

      vi.clearAllMocks();

      // (> 1700px e <= 1900px)
      Object.defineProperty(window, 'innerWidth', {
        value: 1800,
        configurable: true,
      });
      render(<Home />);
      expect(mockFn).toHaveBeenCalledWith(20);

      vi.clearAllMocks();

      // (> 1420px && width <= 1700px)
      Object.defineProperty(window, 'innerWidth', {
        value: 1600,
        configurable: true,
      });
      render(<Home />);
      expect(mockFn).toHaveBeenCalledWith(16);

      vi.clearAllMocks();

      // Test tablet/mobile screen (< 1420px)
      Object.defineProperty(window, 'innerWidth', {
        value: 680,
        configurable: true,
      });
      render(<Home />);
      expect(mockFn).toHaveBeenCalledWith(8);

      Object.defineProperty(window, 'innerWidth', {
        value: originalWidth,
        configurable: true,
      });
    });

    it('should handle browser without IntersectionObserver support', () => {
      const originalIntersectionObserver = global.IntersectionObserver;

      delete global.IntersectionObserver;

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<Home />);

      expect(warnSpy).toHaveBeenCalledWith(
        'IntersectionObserver não suportado neste navegador',
      );

      // Restaurar a implementação original
      global.IntersectionObserver = originalIntersectionObserver;
      warnSpy.mockRestore();
    });

    it('should handle IntersectionObserver callback correctly', async () => {
      const mockFetchNextPage = vi.fn();

      mockUsePokemons.mockReturnValue({
        data: {
          pages: [
            {
              results: mockPokemons,
              pagination: {
                total: 1000,
                offset: 0,
                limit: 21,
                hasMore: true,
              },
            },
          ],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
      });

      class TestIntersectionObserver {
        constructor(callback) {
          this.callback = callback;
        }

        observe = vi.fn(() => {
          // Simular que o elemento está visível
          this.callback([{ isIntersecting: true }]);
        });

        unobserve = vi.fn();
        disconnect = vi.fn();
      }

      global.IntersectionObserver = TestIntersectionObserver;

      render(<Home />);

      return new Promise((resolve) => {
        setTimeout(() => {
          try {
            expect(mockFetchNextPage).toHaveBeenCalled();
            resolve();
          } catch (error) {
            resolve(error);
          }
        }, 100);
      });
    });

    it('should not trigger fetchNextPage when element is not intersecting', () => {
      const mockFetchNextPage = vi.fn();

      mockUsePokemons.mockReturnValue({
        data: {
          pages: [
            {
              results: mockPokemons,
              pagination: {
                total: 1000,
                offset: 0,
                limit: 21,
                hasMore: true,
              },
            },
          ],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
      });

      class TestIntersectionObserver {
        constructor(callback) {
          this.callback = callback;
        }

        observe = vi.fn(() => {
          setTimeout(() => {
            this.callback([{ isIntersecting: false }]);
          }, 0);
        });

        unobserve = vi.fn();
        disconnect = vi.fn();
      }

      global.IntersectionObserver = TestIntersectionObserver;

      render(<Home />);

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockFetchNextPage).not.toHaveBeenCalled();
          resolve();
        }, 50);
      });
    });

    it('should not trigger fetchNextPage when hasNextPage is false', () => {
      const mockFetchNextPage = vi.fn();

      mockUsePokemons.mockReturnValue({
        data: {
          pages: [
            {
              results: mockPokemons,
              pagination: {
                total: 1000,
                offset: 0,
                limit: 21,
                hasMore: false,
              },
            },
          ],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
      });

      class TestIntersectionObserver {
        constructor(callback) {
          this.callback = callback;
        }

        observe = vi.fn(() => {
          setTimeout(() => {
            this.callback([{ isIntersecting: true }]);
          }, 0);
        });

        unobserve = vi.fn();
        disconnect = vi.fn();
      }

      global.IntersectionObserver = TestIntersectionObserver;

      render(<Home />);

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockFetchNextPage).not.toHaveBeenCalled();
          resolve();
        }, 50);
      });
    });

    it('should not trigger fetchNextPage when already fetching next page', () => {
      const mockFetchNextPage = vi.fn();

      mockUsePokemons.mockReturnValue({
        data: {
          pages: [
            {
              results: mockPokemons,
              pagination: {
                total: 1000,
                offset: 0,
                limit: 21,
                hasMore: true,
              },
            },
          ],
        },
        isLoading: false,
        isFetchingNextPage: true,
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
      });

      class TestIntersectionObserver {
        constructor(callback) {
          this.callback = callback;
        }

        observe = vi.fn(() => {
          setTimeout(() => {
            this.callback([{ isIntersecting: true }]);
          }, 0);
        });

        unobserve = vi.fn();
        disconnect = vi.fn();
      }

      global.IntersectionObserver = TestIntersectionObserver;

      render(<Home />);

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockFetchNextPage).not.toHaveBeenCalled();
          resolve();
        }, 50);
      });
    });

    it('should call observer.unobserve when fetchNextPage changes', async () => {
      const unobserveSpy = vi.fn();
      const observeSpy = vi.fn();

      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor() {}
          observe = observeSpy;
          unobserve = unobserveSpy;
          disconnect = vi.fn();
        },
      );

      const initialFetchNextPage = vi.fn();
      usePokemons.mockReturnValue({
        data: { pages: [{ results: mockPokemons }] },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: initialFetchNextPage,
      });

      const { rerender } = render(<Home />);

      await vi.waitFor(() => {
        expect(observeSpy).toHaveBeenCalled();
      });

      unobserveSpy.mockClear();
      observeSpy.mockClear();

      const newFetchNextPage = vi.fn();
      usePokemons.mockReturnValue({
        data: { pages: [{ results: mockPokemons }] },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: newFetchNextPage,
      });

      rerender(<Home />);

      expect(unobserveSpy).toHaveBeenCalled();

      expect(observeSpy).toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });

  describe('CSS structure', () => {
    it('should have correct main container class', () => {
      render(<Home />);
      const container = screen.getByText('Pokémons').closest('.home');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('home');
    });

    it('should have correct title class', () => {
      render(<Home />);
      const title = screen.getByText('Pokémons');
      expect(title).toHaveClass('home__title');
      expect(title.tagName).toBe('H1');
    });

    it('should have correct content structure', () => {
      render(<Home />);
      const content = screen
        .getByText('Pokémons')
        .closest('.home')
        .querySelector('.home__content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('home__content');
    });

    it('should have correct list class', () => {
      render(<Home />);
      const list = screen.getByText('bulbasaur').closest('.home__list');
      expect(list).toBeInTheDocument();
      expect(list).toHaveClass('home__list');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Home />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with modal open', async () => {
      vi.spyOn(pokemonStoreModule, 'usePokemonStore').mockImplementation(
        (selector) => {
          const state = {
            pokemons: mockPokemons,
            addPokemon: mockAddPokemon,
            removePokemonById: mockRemovePokemonById,
            clearTeam: mockClearTeam,
          };
          return selector(state);
        },
      );

      const { container } = render(<Home />);

      // Clica no botão de confirmar equipe da sidebar pra abrir o modal
      const button = screen.getByTestId('cart-sidebar-footer-button');
      fireEvent.click(button);

      const modal = screen.getByTestId('confirmation-modal');
      expect(modal).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', () => {
      render(<Home />);
      const title = screen.getByTestId('home-title');
      expect(title.tagName).toBe('H1');

      const sidebarTitle = screen.getByTestId('cart-sidebar-title');
      expect(sidebarTitle.tagName).toBe('H2');
    });
  });
});
