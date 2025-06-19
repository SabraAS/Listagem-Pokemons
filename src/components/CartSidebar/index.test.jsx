import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import CartSidebar from './index';

import { mockPokemons } from '@/test/mocks/pokemon';

describe('CartSidebar', () => {
  // Props mockadas padrão para os testes
  const defaultProps = {
    pokemons: mockPokemons,
    onRemovePokemon: vi.fn(),
    onConfirmTeam: vi.fn(),
  };

  const emptyProps = {
    pokemons: [],
    onRemovePokemon: vi.fn(),
    onConfirmTeam: vi.fn(),
  };

  describe('Basic rendering', () => {
    it('should render title correctly', () => {
      render(<CartSidebar {...defaultProps} />);

      expect(screen.getByText('Sua equipe')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe')).toHaveClass('cart-sidebar__title');
    });

    it('should render empty message when no pokemons', () => {
      render(<CartSidebar {...emptyProps} />);

      expect(screen.getByText('Nenhum Pokémon adicionado')).toBeInTheDocument();
    });
  });

  describe('Pokemon list', () => {
    it('should render pokemon list when pokemons exist', () => {
      render(<CartSidebar {...defaultProps} />);

      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('charmander')).toBeInTheDocument();
    });

    it('should render pokemon characteristics', () => {
      render(<CartSidebar {...defaultProps} />);

      expect(screen.getByText('Loves to eat')).toBeInTheDocument();
      expect(screen.getByText('Highly curious')).toBeInTheDocument();
    });

    it('should render remove buttons for each pokemon', () => {
      render(<CartSidebar {...defaultProps} />);

      expect(
        screen.getByLabelText('Remover bulbasaur da equipe'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Remover charmander da equipe'),
      ).toBeInTheDocument();
    });

    it('should render pokemon names with correct structure', () => {
      render(<CartSidebar {...defaultProps} />);

      const bulbasaurName = screen.getByText('bulbasaur');
      const charmanderName = screen.getByText('charmander');

      expect(bulbasaurName.closest('.cart-sidebar__name')).toBeInTheDocument();
      expect(charmanderName.closest('.cart-sidebar__name')).toBeInTheDocument();
    });
  });

  describe('Confirm button', () => {
    it('should be disabled when no pokemons', () => {
      render(<CartSidebar {...emptyProps} />);

      const confirmButton = screen.getByText('Confirmar Equipe');
      expect(confirmButton).toBeDisabled();
    });

    it('should be enabled when pokemons exist', () => {
      render(<CartSidebar {...defaultProps} />);

      const confirmButton = screen.getByText('Confirmar Equipe');
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('should call onRemovePokemon when remove button is clicked', () => {
      const mockOnRemovePokemon = vi.fn();
      render(
        <CartSidebar
          {...defaultProps}
          onRemovePokemon={mockOnRemovePokemon}
          pokemons={mockPokemons}
        />,
      );

      const removeButton = screen.getByLabelText('Remover bulbasaur da equipe');
      fireEvent.click(removeButton);

      expect(mockOnRemovePokemon).toHaveBeenCalledTimes(1);
      expect(mockOnRemovePokemon).toHaveBeenCalledWith(1);
    });

    it('should call onConfirmTeam when confirm button is clicked', () => {
      const mockOnConfirmTeam = vi.fn();
      render(
        <CartSidebar
          {...defaultProps}
          onConfirmTeam={mockOnConfirmTeam}
          pokemons={mockPokemons}
        />,
      );

      const confirmButton = screen.getByText('Confirmar Equipe');
      fireEvent.click(confirmButton);

      expect(mockOnConfirmTeam).toHaveBeenCalledTimes(1);
    });

    it('should call onRemovePokemon with correct ID for each pokemon', () => {
      const mockOnRemovePokemon = vi.fn();
      render(
        <CartSidebar
          {...defaultProps}
          onRemovePokemon={mockOnRemovePokemon}
          pokemons={mockPokemons}
        />,
      );

      fireEvent.click(screen.getByLabelText('Remover bulbasaur da equipe'));
      fireEvent.click(screen.getByLabelText('Remover charmander da equipe'));

      expect(mockOnRemovePokemon).toHaveBeenCalledTimes(2);
      expect(mockOnRemovePokemon).toHaveBeenNthCalledWith(1, 1);
      expect(mockOnRemovePokemon).toHaveBeenNthCalledWith(2, 4);
    });

    it('should not call onConfirmTeam when button is disabled', () => {
      const mockOnConfirmTeam = vi.fn();
      render(
        <CartSidebar
          {...defaultProps}
          onConfirmTeam={mockOnConfirmTeam}
          pokemons={[]}
        />,
      );

      const confirmButton = screen.getByText('Confirmar Equipe');
      fireEvent.click(confirmButton);

      expect(mockOnConfirmTeam).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle single pokemon correctly', () => {
      render(<CartSidebar {...defaultProps} pokemons={[mockPokemons[0]]} />);

      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.queryByText('charmander')).not.toBeInTheDocument();
      expect(screen.getByText('Confirmar Equipe')).not.toBeDisabled();
    });

    it('should handle pokemon with empty characteristic', () => {
      const pokemonWithEmptyChar = {
        ...mockPokemons[0],
        characteristic: '',
      };

      render(
        <CartSidebar {...defaultProps} pokemons={[pokemonWithEmptyChar]} />,
      );

      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      // Characteristic should still render, even if empty
      const characteristicElement = screen
        .getByText('bulbasaur')
        .closest('.cart-sidebar__item')
        .querySelector('.cart-sidebar__characteristic');
      expect(characteristicElement).toBeInTheDocument();
      expect(characteristicElement).toHaveTextContent('');
    });

    it('should handle pokemon with special characters in name', () => {
      const pokemonWithSpecialName = {
        ...mockPokemons[0],
        name: 'Pokémon-Ñiño_123',
      };

      render(
        <CartSidebar {...defaultProps} pokemons={[pokemonWithSpecialName]} />,
      );

      expect(screen.getByText('Pokémon-Ñiño_123')).toBeInTheDocument();
    });
  });

  describe('CSS structure', () => {
    it('should have correct main container class', () => {
      render(<CartSidebar {...defaultProps} />);

      const sidebar = screen.getByText('Sua equipe').closest('.cart-sidebar');
      expect(sidebar).toBeInTheDocument();
    });

    it('should have correct list structure', () => {
      render(<CartSidebar {...defaultProps} />);

      const listContainer = screen
        .getByText('bulbasaur')
        .closest('.cart-sidebar__list');
      expect(listContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations with empty list', async () => {
      const { container } = render(<CartSidebar {...emptyProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with pokemon list', async () => {
      const { container } = render(<CartSidebar {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should use semantic aside element', () => {
      render(<CartSidebar {...defaultProps} />);

      const aside = screen.getByRole('complementary');
      expect(aside).toBeInTheDocument();
      expect(aside).toHaveClass('cart-sidebar');
    });

    it('should have proper heading structure', () => {
      render(<CartSidebar {...defaultProps} />);

      const heading = screen.getByText('Sua equipe');
      expect(heading.tagName).toBe('H2');
      expect(heading).toHaveClass('cart-sidebar__title');
    });

    it('should have proper button accessibility', () => {
      render(<CartSidebar {...defaultProps} />);

      const removeButtons = screen.getAllByLabelText(/Remover .* da equipe/);
      removeButtons.forEach((button) => {
        expect(button).toHaveAttribute('aria-label');
        expect(button.getAttribute('aria-label')).toMatch(
          /Remover .* da equipe/,
        );
      });
    });

    it('should have keyboard accessible buttons', () => {
      render(<CartSidebar {...defaultProps} />);

      const confirmButton = screen.getByText('Confirmar Equipe');
      confirmButton.focus();
      expect(document.activeElement).toBe(confirmButton);

      const removeButton = screen.getByLabelText('Remover bulbasaur da equipe');
      removeButton.focus();
      expect(document.activeElement).toBe(removeButton);
    });

    it('should maintain focus order', () => {
      render(<CartSidebar {...defaultProps} />);

      const focusableElements = screen.getAllByRole('button');
      expect(focusableElements).toHaveLength(3); // 2 remove buttons + 1 confirm button

      focusableElements.forEach((element) => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });
});
