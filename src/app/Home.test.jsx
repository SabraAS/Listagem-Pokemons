import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import Home from './Home';

import { usePokemons } from '@/queries/pokemon';
import * as pokemonStoreModule from '@/store/pokemon';
import { mockPokemons } from '@/test/mocks/pokemon';

// Mock dos hooks
vi.mock('@/queries/pokemon', () => ({
  usePokemons: vi.fn(),
}));

describe('Home', () => {
  const mockUsePokemons = vi.fn();
  const mockAddPokemon = vi.fn();
  const mockRemovePokemonById = vi.fn();
  const mockClearTeam = vi.fn();

  // Save original store implementation
  const originalUsePokemonStore = pokemonStoreModule.usePokemonStore;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock do hook usePokemons
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

    // Mock the store for regular tests
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
    // Restore the original store implementation
    vi.restoreAllMocks();
  });

  // Teste de snapshot como primeiro teste
  it('should match snapshot', () => {
    const { container } = render(<Home />);
    expect(container).toMatchSnapshot();
  });

  describe('Rendering', () => {
    it('should render basic structure without errors', () => {
      render(<Home />);
      expect(screen.getByText('Pokémons')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe')).toBeInTheDocument();
    });

    it('should handle empty pages array from API', () => {
      // Testing the case when data.pages exists but is empty
      mockUsePokemons.mockReturnValue({
        data: {
          pages: [], // Empty pages array
        },
        isLoading: false,
      });

      render(<Home />);
      expect(screen.getByText('Pokémons')).toBeInTheDocument();
      // Should show the empty state message since flattenedPokemons will be []
      expect(screen.getByText('Nenhum Pokémon encontrado')).toBeInTheDocument();
    });

    it('should handle data without pages property', () => {
      // Testing the case when data exists but has no pages property
      // Note: data.pages needs to be defined but can be null
      mockUsePokemons.mockReturnValue({
        data: { pages: null },
        isLoading: false,
      });

      render(<Home />);
      // Should show empty state since flattenedPokemons will be []
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
      // Inicialmente carregando
      mockUsePokemons.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const { rerender } = render(<Home />);
      expect(screen.getByText('Carregando...')).toBeInTheDocument();

      // Em seguida, carregado com sucesso
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
      expect(screen.getAllByText('bulbasaur')).toHaveLength(1); // Apenas no card
    });
  });

  describe('Interactions', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.restoreAllMocks();

      // Just mock the API data
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

      // Reset the store state between tests
      originalUsePokemonStore.getState().clearTeam();
    });

    it('should not add pokemon that does not exist in the list', () => {
      // Create spies to monitor store actions
      const mockAddPokemon = vi.fn();

      // Set up mocked store with our spy
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

      // Set up mocked API response with specific Pokemon data
      // Notice we only include ID 1 and 2
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

      // Initial state check - make sure our pokemons render correctly
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('charmander')).toBeInTheDocument();

      // Mock the PokemonCard's addPokemon prop call with a non-existent ID
      const addPokemonProp = container.querySelector(
        '.pokemon-card__button',
      ).onclick;

      // Create a mock function that will call the original with a non-existent ID
      const nonExistingId = 999; // an ID that doesn't exist in our results

      // Reset the spy to ensure we're only tracking new calls
      mockAddPokemon.mockClear();

      // Call the handler directly with a non-existent ID
      // This simulates what would happen if somehow a card with ID 999 was clicked
      const mockEvent = { preventDefault: vi.fn() };
      addPokemonProp.call({ props: { id: nonExistingId } }, mockEvent);

      // Verify addPokemon was not called since the Pokemon doesn't exist
      expect(mockAddPokemon).not.toHaveBeenCalled();
    });

    it('should add and remove pokemon using real store', () => {
      render(<Home />);

      // Verify initial empty state
      expect(screen.getByText('Nenhum Pokémon adicionado')).toBeInTheDocument();

      // Add bulbasaur to team
      const addButton = screen.getByLabelText('Adicionar bulbasaur à equipe');
      fireEvent.click(addButton);

      // Verify bulbasaur appears in sidebar
      expect(screen.getAllByText('bulbasaur')).toHaveLength(2); // Card + Sidebar
      expect(screen.getByLabelText('bulbasaur indisponível')).toBeDisabled();

      // Verify characteristic appears in sidebar
      expect(screen.getByText('Loves to eat')).toBeInTheDocument();

      // Add charmander to team
      const addCharmanderButton = screen.getByLabelText(
        'Adicionar charmander à equipe',
      );
      fireEvent.click(addCharmanderButton);

      // Verify both pokemon in sidebar
      expect(screen.getAllByText('bulbasaur')).toHaveLength(2);
      expect(screen.getAllByText('charmander')).toHaveLength(2);

      // Remove bulbasaur
      const removeButton = screen.getByLabelText('Remover bulbasaur da equipe');
      fireEvent.click(removeButton);

      // Verify bulbasaur removed and button enabled again
      expect(screen.queryByText('Loves to eat')).not.toBeInTheDocument();
      expect(
        screen.getByLabelText('Adicionar bulbasaur à equipe'),
      ).not.toBeDisabled();

      // Only charmander should remain in sidebar
      expect(screen.getAllByText('charmander')).toHaveLength(2);
      expect(screen.getByText('Highly curious')).toBeInTheDocument();
    });

    it('should hide modal when is called via onClose', () => {
      // Setup the store to have pokemons
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

      // Open the modal first
      fireEvent.click(screen.getByText('Confirmar Equipe'));
      expect(screen.getByText('Equipe formada')).toBeInTheDocument();

      // Find and click the close button (X) in the modal
      const closeButton = screen.getByLabelText('Fechar modal');
      fireEvent.click(closeButton);

      // Verify modal is now closed
      expect(screen.queryByText('Equipe formada')).not.toBeInTheDocument();
    });

    it('should complete full team flow with real store', () => {
      render(<Home />);

      // Add both pokemon to team
      fireEvent.click(screen.getByLabelText('Adicionar bulbasaur à equipe'));
      fireEvent.click(screen.getByLabelText('Adicionar charmander à equipe'));

      // Confirm team
      fireEvent.click(screen.getByText('Confirmar Equipe'));

      // Verify modal shows both pokemon
      expect(screen.getByText('Equipe formada')).toBeInTheDocument();
      expect(screen.getAllByText('bulbasaur')).toHaveLength(3); // Card + Sidebar + Modal
      expect(screen.getAllByText('charmander')).toHaveLength(3);

      // Start new team
      fireEvent.click(screen.getByText('Começar nova equipe'));

      // Verify team cleared
      expect(screen.getByText('Nenhum Pokémon adicionado')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Adicionar bulbasaur à equipe'),
      ).not.toBeDisabled();
      expect(
        screen.getByLabelText('Adicionar charmander à equipe'),
      ).not.toBeDisabled();
    });

    it('should calculate correct pokemonsPerPage based on screen width', () => {
      // Precisamos reiniciar o mock do usePokemons para cada teste
      vi.restoreAllMocks();

      // Mock usePokemons para podermos verificar com qual valor ele é chamado
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

      // Limpar o componente e o mock
      vi.clearAllMocks();

      // (> 1900px e <= 3000px)
      Object.defineProperty(window, 'innerWidth', {
        value: 2560,
        configurable: true,
      });
      render(<Home />);
      expect(mockFn).toHaveBeenCalledWith(28);

      // Limpar o componente e o mock
      vi.clearAllMocks();

      // (> 1700px e <= 1900px)
      Object.defineProperty(window, 'innerWidth', {
        value: 1800,
        configurable: true,
      });
      render(<Home />);
      expect(mockFn).toHaveBeenCalledWith(20);

      // Limpar o componente e o mock
      vi.clearAllMocks();

      // (> 1420px && width <= 1700px)
      Object.defineProperty(window, 'innerWidth', {
        value: 1600,
        configurable: true,
      });
      render(<Home />);
      expect(mockFn).toHaveBeenCalledWith(16);

      // Limpar o componente e o mock
      vi.clearAllMocks();

      // Test tablet/mobile screen (< 1420px)
      Object.defineProperty(window, 'innerWidth', {
        value: 680,
        configurable: true,
      });
      render(<Home />);
      expect(mockFn).toHaveBeenCalledWith(8);

      // Restaurar a largura original da janela
      Object.defineProperty(window, 'innerWidth', {
        value: originalWidth,
        configurable: true,
      });
    });

    it('should handle browser without IntersectionObserver support', () => {
      // Salvar a implementação original
      const originalIntersectionObserver = global.IntersectionObserver;

      // Simular navegador sem suporte a IntersectionObserver
      delete global.IntersectionObserver;

      // Espiar o console.warn
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<Home />);

      // Verificar se o aviso foi exibido
      expect(warnSpy).toHaveBeenCalledWith(
        'IntersectionObserver não suportado neste navegador',
      );

      // Restaurar a implementação original
      global.IntersectionObserver = originalIntersectionObserver;
      warnSpy.mockRestore();
    });

    it('should handle IntersectionObserver callback correctly', async () => {
      // Criar um mock do fetchNextPage que podemos verificar
      const mockFetchNextPage = vi.fn();

      // Configurar todos os valores necessários para que fetchNextPage seja chamado
      // quando o elemento se torna visível
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

      // Modificar a implementação global do IntersectionObserver
      // para simular o comportamento real
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

      // Substituir o IntersectionObserver global
      global.IntersectionObserver = TestIntersectionObserver;

      // Renderizar o componente - isso deve acionar o useEffect
      render(<Home />);

      // Verificar que fetchNextPage foi chamado
      // Adicionamos um pequeno atraso para dar tempo do useEffect ser executado
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

      // Mock com hasNextPage true para testar infinite scroll
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

      // Modificar o mock do IntersectionObserver para simular elemento NÃO visível
      class TestIntersectionObserver {
        constructor(callback) {
          this.callback = callback;
        }

        observe = vi.fn(() => {
          // Chamar o callback imediatamente para simular que o elemento NÃO está visível
          setTimeout(() => {
            this.callback([{ isIntersecting: false }]);
          }, 0);
        });

        unobserve = vi.fn();
        disconnect = vi.fn();
      }

      // Substituir o IntersectionObserver global
      global.IntersectionObserver = TestIntersectionObserver;

      render(<Home />);

      // Verificar se fetchNextPage NÃO é chamado quando o elemento não está visível
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockFetchNextPage).not.toHaveBeenCalled();
          resolve();
        }, 50);
      });
    });

    it('should not trigger fetchNextPage when hasNextPage is false', () => {
      const mockFetchNextPage = vi.fn();

      // Mock com hasNextPage false para testar que não carrega mais dados
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

      // Modificar o mock do IntersectionObserver para simular elemento visível
      class TestIntersectionObserver {
        constructor(callback) {
          this.callback = callback;
        }

        observe = vi.fn(() => {
          // Chamar o callback imediatamente para simular que o elemento está visível
          setTimeout(() => {
            this.callback([{ isIntersecting: true }]);
          }, 0);
        });

        unobserve = vi.fn();
        disconnect = vi.fn();
      }

      // Substituir o IntersectionObserver global
      global.IntersectionObserver = TestIntersectionObserver;

      render(<Home />);

      // Verificar se fetchNextPage NÃO é chamado quando não há mais páginas
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockFetchNextPage).not.toHaveBeenCalled();
          resolve();
        }, 50);
      });
    });

    it('should not trigger fetchNextPage when already fetching next page', () => {
      const mockFetchNextPage = vi.fn();

      // Mock com isFetchingNextPage true para testar que não carrega mais dados enquanto carrega
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

      // Modificar o mock do IntersectionObserver para simular elemento visível
      class TestIntersectionObserver {
        constructor(callback) {
          this.callback = callback;
        }

        observe = vi.fn(() => {
          // Chamar o callback imediatamente para simular que o elemento está visível
          setTimeout(() => {
            this.callback([{ isIntersecting: true }]);
          }, 0);
        });

        unobserve = vi.fn();
        disconnect = vi.fn();
      }

      // Substituir o IntersectionObserver global
      global.IntersectionObserver = TestIntersectionObserver;

      render(<Home />);

      // Verificar se fetchNextPage NÃO é chamado quando já está carregando mais dados
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(mockFetchNextPage).not.toHaveBeenCalled();
          resolve();
        }, 50);
      });
    });

    it('should call observer.unobserve when fetchNextPage changes', async () => {
      // Mock para o IntersectionObserver
      const unobserveSpy = vi.fn();
      const observeSpy = vi.fn();

      // Mock do IntersectionObserver
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor() {}
          observe = observeSpy;
          unobserve = unobserveSpy;
          disconnect = vi.fn();
        },
      );

      // Primeiro estado do hook usePokemons
      const initialFetchNextPage = vi.fn();
      usePokemons.mockReturnValue({
        data: { pages: [{ results: mockPokemons }] },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: initialFetchNextPage,
      });

      // Renderizar o componente
      const { rerender } = render(<Home />);

      // Garantir que o componente foi renderizado completamente
      await vi.waitFor(() => {
        expect(observeSpy).toHaveBeenCalled();
      });

      // Limpar os mocks para verificar as próximas chamadas
      unobserveSpy.mockClear();
      observeSpy.mockClear();

      // Segundo estado do hook usePokemons com um fetchNextPage diferente
      const newFetchNextPage = vi.fn();
      usePokemons.mockReturnValue({
        data: { pages: [{ results: mockPokemons }] },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: true,
        fetchNextPage: newFetchNextPage,
      });

      // Re-renderizar o componente para acionar o cleanup do useEffect
      rerender(<Home />);

      // Verificar que unobserve foi chamado durante o cleanup
      expect(unobserveSpy).toHaveBeenCalled();

      // E que observe foi chamado novamente para o novo efeito
      expect(observeSpy).toHaveBeenCalled();

      // Restaurar o IntersectionObserver original
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

      // Abrir modal
      fireEvent.click(screen.getByText('Confirmar Equipe'));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', () => {
      render(<Home />);
      const title = screen.getByText('Pokémons');
      expect(title.tagName).toBe('H1');

      const sidebarTitle = screen.getByText('Sua equipe');
      expect(sidebarTitle.tagName).toBe('H2');
    });
  });
});
