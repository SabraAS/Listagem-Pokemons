import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import Home from './Home';

import { usePokemons } from '@/queries/pokemon';
import { usePokemonStore } from '@/store/pokemon';
import { mockPokemons } from '@/test/mocks/pokemon';

// Mock dos hooks
vi.mock('@/queries/pokemon', () => ({
  usePokemons: vi.fn(),
}));

vi.mock('@/store/pokemon', () => ({
  usePokemonStore: vi.fn(),
}));

describe('Home', () => {
  const mockUsePokemons = vi.fn();
  const mockUsePokemonStore = vi.fn();
  const mockAddPokemon = vi.fn();
  const mockRemovePokemonById = vi.fn();
  const mockClearTeam = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock do hook usePokemons
    mockUsePokemons.mockReturnValue({
      data: mockPokemons,
    });

    // Mock do store inicial
    mockUsePokemonStore.mockImplementation((selector) => {
      const state = {
        pokemons: [],
        addPokemon: mockAddPokemon,
        removePokemonById: mockRemovePokemonById,
        clearTeam: mockClearTeam,
      };
      return selector(state);
    });

    usePokemons.mockImplementation(mockUsePokemons);
    usePokemonStore.mockImplementation(mockUsePokemonStore);
  });

  describe('Basic rendering', () => {
    it('should call usePokemons with correct parameter', () => {
      render(<Home />);

      expect(mockUsePokemons).toHaveBeenCalledWith(40);
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
      mockUsePokemonStore.mockImplementation((selector) => {
        const state = {
          pokemons: [mockPokemons[0]], // bulbasaur na equipe
          addPokemon: mockAddPokemon,
          removePokemonById: mockRemovePokemonById,
          clearTeam: mockClearTeam,
        };
        return selector(state);
      });

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
      mockUsePokemonStore.mockImplementation((selector) => {
        const state = {
          pokemons: [mockPokemons[0]],
          addPokemon: mockAddPokemon,
          removePokemonById: mockRemovePokemonById,
          clearTeam: mockClearTeam,
        };
        return selector(state);
      });

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
      mockUsePokemonStore.mockImplementation((selector) => {
        const state = {
          pokemons: mockPokemons,
          addPokemon: mockAddPokemon,
          removePokemonById: mockRemovePokemonById,
          clearTeam: mockClearTeam,
        };
        return selector(state);
      });
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
      mockUsePokemonStore.mockImplementation((selector) => {
        const state = {
          pokemons: mockPokemons,
          addPokemon: mockAddPokemon,
          removePokemonById: mockRemovePokemonById,
          clearTeam: mockClearTeam,
        };
        return selector(state);
      });

      const { container } = render(<Home />);

      // Abrir modal
      fireEvent.click(screen.getByText('Confirmar Equipe'));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
