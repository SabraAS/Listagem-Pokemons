import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import CartSidebar from './index';

import { mockPokemons, mockSinglePokemon } from '@/test/mocks/pokemon';

describe('CartSidebar', () => {
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

  describe('Rendering', () => {
    it('should match snapshot', () => {
      const { container } = render(<CartSidebar {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });

    it('should render title correctly', () => {
      render(<CartSidebar {...defaultProps} />);
      const title = screen.getByTestId('cart-sidebar-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('cart-sidebar__title');
    });

    it('should render empty message when no pokemons', () => {
      render(<CartSidebar {...emptyProps} />);
      const emptyMessage = screen.getByTestId('cart-sidebar-empty-message');
      expect(emptyMessage).toBeInTheDocument();
      expect(emptyMessage).toHaveTextContent('Nenhum Pokémon adicionado');
    });

    it('should render pokemon list when pokemons exist', () => {
      render(<CartSidebar {...defaultProps} />);
      const bulbasaur = screen.getByTestId('cart-sidebar-item-1');
      expect(bulbasaur).toHaveTextContent('bulbasaur');

      const charmander = screen.getByTestId('cart-sidebar-item-4');
      expect(charmander).toHaveTextContent('charmander');
    });

    it('should render pokemon characteristics', () => {
      render(<CartSidebar {...defaultProps} />);
      const characteristic1 = screen.getByTestId(
        'cart-sidebar-pokemon-characteristic-1',
      );
      expect(characteristic1).toHaveTextContent(
        'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
      );
    });

    it('should render remove buttons for each pokemon', () => {
      render(<CartSidebar {...defaultProps} />);
      const removeButton1 = screen.getByTestId('cart-sidebar-remove-button-1');
      expect(removeButton1).toHaveTextContent('X');
      const removeButton2 = screen.getByTestId('cart-sidebar-remove-button-4');
      expect(removeButton2).toHaveTextContent('X');
    });

    it('should render pokemon names', () => {
      render(<CartSidebar {...defaultProps} />);
      const bulbasaurName = screen.getByTestId('cart-sidebar-pokemon-name-1');
      expect(bulbasaurName).toHaveTextContent('bulbasaur');
      const charmanderName = screen.getByTestId('cart-sidebar-pokemon-name-4');
      expect(charmanderName).toHaveTextContent('charmander');
    });

    it('should render confirm button enabled when pokemons exist', () => {
      render(<CartSidebar {...defaultProps} />);
      const confirmButton = screen.getByTestId('cart-sidebar-footer-button');
      expect(confirmButton).not.toBeDisabled();
    });

    it('should render confirm button disabled when no pokemons', () => {
      render(<CartSidebar {...emptyProps} />);
      const confirmButton = screen.getByTestId('cart-sidebar-footer-button');
      expect(confirmButton).toBeDisabled();
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
      const removeButton = screen.getByTestId('cart-sidebar-remove-button-1');
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
      const confirmButton = screen.getByTestId('cart-sidebar-footer-button');
      fireEvent.click(confirmButton);
      expect(mockOnConfirmTeam).toHaveBeenCalledTimes(1);
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
      const confirmButton = screen.getByTestId('cart-sidebar-footer-button');
      fireEvent.click(confirmButton);
      expect(mockOnConfirmTeam).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle pokemon with empty characteristic', () => {
      const pokemonWithEmptyChar = {
        ...mockSinglePokemon,
        characteristic: '',
      };
      render(
        <CartSidebar {...defaultProps} pokemons={[pokemonWithEmptyChar]} />,
      );
      const characteristicElement = screen.getByTestId(
        'cart-sidebar-pokemon-characteristic-1',
      );
      expect(characteristicElement).toHaveTextContent(
        'Pokémon sem característica',
      );
    });

    it('should handle null pokemons prop without crashing', () => {
      render(
        <CartSidebar
          onConfirmTeam={vi.fn()}
          onRemovePokemon={vi.fn()}
          pokemons={null}
        />,
      );
      const emptyMessage = screen.getByTestId('cart-sidebar-empty-message');
      expect(emptyMessage).toBeInTheDocument();
      const confirmButton = screen.getByTestId('cart-sidebar-footer-button');
      expect(confirmButton).toBeDisabled();
    });

    it('should handle pokemon with null ID', () => {
      const pokemonWithNullId = {
        ...mockSinglePokemon,
        id: null,
        name: 'pokemonSemId',
      };
      const mockRemove = vi.fn();
      render(
        <CartSidebar
          onConfirmTeam={vi.fn()}
          onRemovePokemon={mockRemove}
          pokemons={[pokemonWithNullId]}
        />,
      );
      const itemElement = screen.getByText('pokemonSemId');
      expect(itemElement).toBeInTheDocument();
      const removeButton = screen.getByTestId(
        'cart-sidebar-remove-button-null',
      );
      fireEvent.click(removeButton);
      expect(mockRemove).toHaveBeenCalledWith(null);
    });

    it('should handle pokemon without name property', () => {
      const pokemonWithoutName = {
        ...mockPokemons[0],
        name: undefined,
        id: 999,
      };
      render(
        <CartSidebar
          onConfirmTeam={vi.fn()}
          onRemovePokemon={vi.fn()}
          pokemons={[pokemonWithoutName]}
        />,
      );
      const name = screen.getByTestId('cart-sidebar-pokemon-name-999');
      expect(name).toHaveTextContent('pokémon sem nome');
    });
  });

  describe('CSS structure', () => {
    it('should have correct main container class', () => {
      render(<CartSidebar {...defaultProps} />);
      const sidebar = screen.getByTestId('cart-sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('cart-sidebar');
      expect(sidebar.tagName).toBe('ASIDE');
    });

    it('should have correct list structure', () => {
      render(<CartSidebar {...defaultProps} />);
      const listContainer = screen.getByTestId('cart-sidebar-list');
      expect(listContainer).toBeInTheDocument();
      expect(listContainer).toHaveClass('cart-sidebar__list');
    });

    it('should have correct title class', () => {
      render(<CartSidebar {...defaultProps} />);
      const title = screen.getByTestId('cart-sidebar-title');
      expect(title).toHaveClass('cart-sidebar__title');
    });

    it('should have correct item structure and classes', () => {
      render(<CartSidebar {...defaultProps} />);
      const item = screen.getByTestId('cart-sidebar-item-1');
      expect(item).toBeInTheDocument();
      expect(item).toHaveClass('cart-sidebar__item');

      const content = screen.getByTestId('cart-sidebar-content-1');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('cart-sidebar__content');

      const name = screen.getByTestId('cart-sidebar-pokemon-name-1');
      expect(name).toBeInTheDocument();
      expect(name).toHaveClass('cart-sidebar__name');

      const characteristic = screen.getByTestId(
        'cart-sidebar-pokemon-characteristic-1',
      );
      expect(characteristic).toHaveClass('cart-sidebar__characteristic');
    });

    it('should have correct footer structure', () => {
      render(<CartSidebar {...defaultProps} />);
      const footer = screen.getByTestId('cart-sidebar-footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('cart-sidebar__footer');

      const button = screen.getByTestId('cart-sidebar-footer-button');
      expect(button).toHaveClass('cart-sidebar__footer-button');
    });

    it('should have correct remove button class', () => {
      render(<CartSidebar {...defaultProps} />);
      const removeButton = screen.getByTestId('cart-sidebar-remove-button-1');
      expect(removeButton).toHaveClass('cart-sidebar__remove-button');
    });

    it('should have correct background element', () => {
      render(<CartSidebar {...defaultProps} />);
      const background = screen.getByTestId('cart-sidebar-background');
      expect(background).toBeInTheDocument();
      expect(background).toHaveClass('cart-sidebar__background');
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
      const heading = screen.getByTestId('cart-sidebar-title');
      expect(heading.tagName).toBe('H2');
    });

    it('should have proper button accessibility', () => {
      render(<CartSidebar {...defaultProps} />);
      const removeButton1 = screen.getByTestId('cart-sidebar-remove-button-1');
      const removeButton2 = screen.getByTestId('cart-sidebar-remove-button-4'); //id do charmander é 4
      expect(removeButton1).toHaveAttribute(
        'aria-label',
        'Remover bulbasaur da equipe',
      );
      expect(removeButton2).toHaveAttribute(
        'aria-label',
        'Remover charmander da equipe',
      );
    });

    it('should have keyboard accessible buttons', () => {
      render(<CartSidebar {...defaultProps} />);
      const confirmButton = screen.getByTestId('cart-sidebar-footer-button');
      confirmButton.focus();
      expect(document.activeElement).toBe(confirmButton);

      const removeButton = screen.getByTestId('cart-sidebar-remove-button-1');
      removeButton.focus();
      expect(document.activeElement).toBe(removeButton);
    });
  });
});
