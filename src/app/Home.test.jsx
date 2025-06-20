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
      data: mockPokemons,
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

  describe('Basic rendering', () => {
    it('should call usePokemons with correct parameter', () => {
      render(<Home />);

      expect(mockUsePokemons).toHaveBeenCalledWith(100);
    });

    it('should render basic structure without errors', () => {
      render(<Home />);

      expect(screen.getByText('Pokémons')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe')).toBeInTheDocument();
    });

    it('should handle undefined data from API', () => {
      mockUsePokemons.mockReturnValue({ data: undefined });

      expect(() => render(<Home />)).not.toThrow();
      expect(screen.getByText('Pokémons')).toBeInTheDocument();
    });

    it('should handle empty array from API', () => {
      mockUsePokemons.mockReturnValue({ data: [] });

      render(<Home />);

      expect(screen.getByText('Pokémons')).toBeInTheDocument();
      expect(screen.getByText('Nenhum Pokémon adicionado')).toBeInTheDocument();
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
        data: mockPokemons,
        isLoading: false,
      });

      rerender(<Home />);
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      expect(screen.getAllByText('bulbasaur')).toHaveLength(1); // Apenas no card
    });
  });

  describe('State management', () => {
    it('should synchronize state between PokemonCard and CartSidebar', () => {
      // Estado inicial vazio
      const { rerender } = render(<Home />);

      expect(screen.getByText('Nenhum Pokémon adicionado')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Adicionar bulbasaur à equipe'),
      ).not.toBeDisabled();

      // Simular pokémon adicionado ao estado
      vi.spyOn(pokemonStoreModule, 'usePokemonStore').mockImplementation(
        (selector) => {
          const state = {
            pokemons: [mockPokemons[0]], // bulbasaur na equipe
            addPokemon: mockAddPokemon,
            removePokemonById: mockRemovePokemonById,
            clearTeam: mockClearTeam,
          };
          return selector(state);
        },
      );

      rerender(<Home />);

      // Verificar sincronização: pokémon aparece no sidebar e fica desabilitado no card
      expect(screen.getAllByText('bulbasaur')).toHaveLength(2); // Card + Sidebar
      expect(screen.getByLabelText('bulbasaur indisponível')).toBeDisabled();
    });

    it('should call addPokemon when add button is clicked', () => {
      render(<Home />);

      const addButton = screen.getByLabelText('Adicionar bulbasaur à equipe');
      fireEvent.click(addButton);

      expect(mockAddPokemon).toHaveBeenCalledTimes(1);
      expect(mockAddPokemon).toHaveBeenCalledWith(mockPokemons[0]);
    });

    it('should call removePokemonById when remove button is clicked', () => {
      // Mock com pokémon na equipe
      vi.spyOn(pokemonStoreModule, 'usePokemonStore').mockImplementation(
        (selector) => {
          const state = {
            pokemons: [mockPokemons[0]],
            addPokemon: mockAddPokemon,
            removePokemonById: mockRemovePokemonById,
            clearTeam: mockClearTeam,
          };
          return selector(state);
        },
      );

      render(<Home />);

      const removeButton = screen.getByLabelText('Remover bulbasaur da equipe');
      fireEvent.click(removeButton);

      expect(mockRemovePokemonById).toHaveBeenCalledTimes(1);
      expect(mockRemovePokemonById).toHaveBeenCalledWith(1);
    });
  });

  describe('Team confirmation flow', () => {
    beforeEach(() => {
      // Mock com pokémons na equipe para testar fluxo completo
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
    });

    it('should complete flow: confirm team → open modal → close modal', () => {
      render(<Home />);

      // 1. Confirmar equipe
      const confirmButton = screen.getByText('Confirmar Equipe');
      fireEvent.click(confirmButton);

      // 2. Modal deve abrir
      expect(screen.getByText('Equipe formada')).toBeInTheDocument();
      expect(screen.getAllByText('bulbasaur')).toHaveLength(3); // Card + Sidebar + Modal

      // 3. Fechar modal
      const closeButton = screen.getByTestId('modal-close-button');
      fireEvent.click(closeButton);

      expect(screen.queryByText('Equipe formada')).not.toBeInTheDocument();
    });

    it('should complete flow: confirm team → new team → clear state', () => {
      render(<Home />);

      // 1. Abrir modal
      const confirmButton = screen.getByText('Confirmar Equipe');
      fireEvent.click(confirmButton);

      // 2. Começar nova equipe
      const newTeamButton = screen.getByText('Começar nova equipe');
      fireEvent.click(newTeamButton);

      // 3. Verificar que clearTeam foi chamado e modal fechou
      expect(mockClearTeam).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Equipe formada')).not.toBeInTheDocument();
    });
  });

  describe('Test with real store', () => {
    beforeEach(() => {
      vi.restoreAllMocks();

      // Just mock the API data
      usePokemons.mockReturnValue({
        data: mockPokemons,
      });

      // Reset the store state between tests
      originalUsePokemonStore.getState().clearTeam();
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
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Home />);

      // Verificar estrutura semântica
      const title = screen.getByText('Pokémons');
      expect(title.tagName).toBe('H1');

      const sidebarTitle = screen.getByText('Sua equipe');
      expect(sidebarTitle.tagName).toBe('H2');

      // Verificar acessibilidade
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
  });
});
