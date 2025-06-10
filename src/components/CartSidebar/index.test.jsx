import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import CartSidebar from './index';

import { usePokemonStore } from '@/store/pokemon';
import { mockPokemons } from '@/test/mocks/pokemon';

// Mock do store
vi.mock('@/store/pokemon', () => ({
  usePokemonStore: vi.fn(),
}));

describe('CartSidebar Component', () => {
  const mockRemovePokemon = vi.fn();
  const mockClearTeam = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render empty state when no pokemons', () => {
      render(
        <CartSidebar
          clearTeam={mockClearTeam}
          pokemons={[]}
          removePokemon={mockRemovePokemon}
        />,
      );

      expect(
        screen.getByText('Nenhum Pokémon selecionado'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('confirm-team-button')).toBeDisabled();
    });

    it('should render pokemon list correctly', () => {
      render(
        <CartSidebar
          clearTeam={mockClearTeam}
          pokemons={mockPokemons}
          removePokemon={mockRemovePokemon}
        />,
      );

      mockPokemons.forEach((pokemon) => {
        expect(screen.getByText(pokemon.name)).toBeInTheDocument();
        expect(screen.getByText(pokemon.characteristic)).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('should call removePokemon when clicking remove button', () => {
      render(
        <CartSidebar
          clearTeam={mockClearTeam}
          pokemons={mockPokemons}
          removePokemon={mockRemovePokemon}
        />,
      );

      const removeButtons = screen.getAllByTestId('remove-pokemon-button');
      fireEvent.click(removeButtons[0]);

      expect(mockRemovePokemon).toHaveBeenCalledWith(mockPokemons[0].id);
    });

    it('should show confirmation modal when clicking confirm team', () => {
      render(
        <CartSidebar
          clearTeam={mockClearTeam}
          pokemons={mockPokemons}
          removePokemon={mockRemovePokemon}
        />,
      );

      const confirmButton = screen.getByTestId('confirm-team-button');
      fireEvent.click(confirmButton);

      expect(screen.getByText('Equipe formada')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe está pronta!')).toBeInTheDocument();
    });

    it('should clear team when starting new team from modal', () => {
      render(
        <CartSidebar
          clearTeam={mockClearTeam}
          pokemons={mockPokemons}
          removePokemon={mockRemovePokemon}
        />,
      );

      // Abrir modal
      const confirmButton = screen.getByTestId('confirm-team-button');
      fireEvent.click(confirmButton);

      // Clicar em começar nova equipe
      const startNewButton = screen.getByTestId('start-new-team-button');
      fireEvent.click(startNewButton);

      expect(mockClearTeam).toHaveBeenCalledTimes(1);
    });

    it('should close modal without clearing team', () => {
      render(
        <CartSidebar
          clearTeam={mockClearTeam}
          pokemons={mockPokemons}
          removePokemon={mockRemovePokemon}
        />,
      );

      // Abrir modal
      const confirmButton = screen.getByTestId('confirm-team-button');
      fireEvent.click(confirmButton);

      // Fechar modal
      const closeButton = screen.getByTestId('modal-close-button');
      fireEvent.click(closeButton);

      expect(mockClearTeam).not.toHaveBeenCalled();
      expect(screen.queryByText('Equipe formada')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations when empty', async () => {
      usePokemonStore.mockImplementation((selector) => {
        const store = {
          pokemons: [],
          removePokemon: mockRemovePokemon,
          clearTeam: mockClearTeam,
        };
        return selector(store);
      });

      const { container } = render(
        <CartSidebar
          clearTeam={mockClearTeam}
          pokemons={mockPokemons}
          removePokemon={mockRemovePokemon}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with items', async () => {
      const { container } = render(
        <CartSidebar
          clearTeam={mockClearTeam}
          pokemons={mockPokemons}
          removePokemon={mockRemovePokemon}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper button accessibility attributes', () => {
      render(
        <CartSidebar
          clearTeam={mockClearTeam}
          pokemons={mockPokemons}
          removePokemon={mockRemovePokemon}
        />,
      );

      const confirmButton = screen.getByTestId('confirm-team-button');
      expect(confirmButton.tagName).toBe('BUTTON');
      expect(confirmButton.getAttribute('role')).toBeNull();
      expect(confirmButton.textContent.trim().length).toBeGreaterThan(0);

      const removeButtons = screen.getAllByTestId('remove-pokemon-button');
      removeButtons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
        expect(button.getAttribute('role')).toBeNull();
        expect(button.textContent.trim().length).toBeGreaterThan(0);
      });
    });

    it('should maintain proper focus management', () => {
      render(
        <CartSidebar
          clearTeam={mockClearTeam}
          pokemons={mockPokemons}
          removePokemon={mockRemovePokemon}
        />,
      );

      // All interactive elements should be focusable
      const confirmButton = screen.getByTestId('confirm-team-button');
      expect(confirmButton.getAttribute('tabindex')).not.toBe('-1');

      const removeButtons = screen.getAllByTestId('remove-pokemon-button');
      removeButtons.forEach((button) => {
        expect(button.getAttribute('tabindex')).not.toBe('-1');
      });
    });
  });
});
