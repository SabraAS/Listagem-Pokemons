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

  // Teste de snapshot como primeiro teste
  it('should match snapshot', () => {
    const { container } = render(<CartSidebar {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  describe('Rendering', () => {
    it('should render title correctly', () => {
      render(<CartSidebar {...defaultProps} />);
      expect(screen.getByText('Sua equipe')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe')).toHaveClass('cart-sidebar__title');
    });

    it('should render empty message when no pokemons', () => {
      render(<CartSidebar {...emptyProps} />);
      expect(screen.getByText('Nenhum Pokémon adicionado')).toBeInTheDocument();
    });

    it('should render pokemon list when pokemons exist', () => {
      render(<CartSidebar {...defaultProps} />);
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('charmander')).toBeInTheDocument();
    });

    it('should render pokemon characteristics', () => {
      render(<CartSidebar {...defaultProps} />);
      expect(
        screen.getByText(
          'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.',
        ),
      ).toBeInTheDocument();
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

    it('should render confirm button enabled when pokemons exist', () => {
      render(<CartSidebar {...defaultProps} />);
      const confirmButton = screen.getByText('Confirmar Equipe');
      expect(confirmButton).not.toBeDisabled();
    });

    it('should render confirm button disabled when no pokemons', () => {
      render(<CartSidebar {...emptyProps} />);
      const confirmButton = screen.getByText('Confirmar Equipe');
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
      // Characteristic should show "Pokémon sem característica" when empty
      const characteristicElement = screen
        .getByText('bulbasaur')
        .closest('.cart-sidebar__item')
        .querySelector('.cart-sidebar__characteristic');
      expect(characteristicElement).toBeInTheDocument();
      expect(characteristicElement).toHaveTextContent(
        'Pokémon sem característica',
      );
    });

    it('should handle null pokemons prop without crashing', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      render(
        <CartSidebar
          onConfirmTeam={vi.fn()}
          onRemovePokemon={vi.fn()}
          pokemons={null}
        />,
      );
      // Verificar se a mensagem de "Nenhum Pokémon adicionado" é exibida
      expect(screen.getByText('Nenhum Pokémon adicionado')).toBeInTheDocument();
      // Verificar se o botão está desabilitado
      const confirmButton = screen.getByText('Confirmar Equipe');
      expect(confirmButton).toBeDisabled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle undefined pokemons prop without crashing', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      render(
        <CartSidebar
          onConfirmTeam={vi.fn()}
          onRemovePokemon={vi.fn()}
          pokemons={undefined}
        />,
      );
      // Verificar se a mensagem de "Nenhum Pokémon adicionado" é exibida
      expect(screen.getByText('Nenhum Pokémon adicionado')).toBeInTheDocument();
      // Verificar se o botão está desabilitado
      const confirmButton = screen.getByText('Confirmar Equipe');
      expect(confirmButton).toBeDisabled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle pokemon with null ID', () => {
      const pokemonWithNullId = {
        ...mockPokemons[0],
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
      // Verificar se o pokemon é renderizado mesmo com ID nulo
      expect(screen.getByText('pokemonSemId')).toBeInTheDocument();
      // Verificar se o item foi renderizado corretamente
      const itemElement = screen
        .getByText('pokemonSemId')
        .closest('.cart-sidebar__item');
      expect(itemElement).toBeInTheDocument();
      // Verificar interação do botão de remover
      const removeButton = screen.getByLabelText(
        'Remover pokemonSemId da equipe',
      );
      fireEvent.click(removeButton);
      expect(mockRemove).toHaveBeenCalledWith(null);
    });

    it('should handle pokemon without name property', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
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
      // Verificar se o texto de fallback "pokémon sem nome" é exibido
      expect(screen.getByText('pokémon sem nome')).toBeInTheDocument();
      consoleErrorSpy.mockRestore();
    });

    it('should handle pokemon with null name', () => {
      const pokemonWithNullName = {
        ...mockPokemons[0],
        name: null,
        id: 888,
      };
      render(
        <CartSidebar
          onConfirmTeam={vi.fn()}
          onRemovePokemon={vi.fn()}
          pokemons={[pokemonWithNullName]}
        />,
      );
      // Verificar se o texto de fallback "pokémon sem nome" é exibido
      expect(screen.getByText('pokémon sem nome')).toBeInTheDocument();
      // Verificar se o botão de remoção ainda tem um aria-label acessível
      const removeButtons = screen
        .getAllByText('X')
        .filter((el) => el.classList.contains('cart-sidebar__remove-button'));
      expect(removeButtons[0]).toHaveAttribute('aria-label');
      expect(removeButtons[0].getAttribute('aria-label')).toContain('Remover');
    });
  });

  describe('CSS structure', () => {
    it('should have correct main container class', () => {
      render(<CartSidebar {...defaultProps} />);
      const sidebar = screen.getByText('Sua equipe').closest('.cart-sidebar');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('cart-sidebar');
      expect(sidebar.tagName).toBe('ASIDE');
    });

    it('should have correct list structure', () => {
      render(<CartSidebar {...defaultProps} />);
      const listContainer = screen
        .getByText('bulbasaur')
        .closest('.cart-sidebar__list');
      expect(listContainer).toBeInTheDocument();
      expect(listContainer).toHaveClass('cart-sidebar__list');
    });

    it('should have correct title class', () => {
      render(<CartSidebar {...defaultProps} />);
      const title = screen.getByText('Sua equipe');
      expect(title).toHaveClass('cart-sidebar__title');
    });

    it('should have correct item structure and classes', () => {
      render(<CartSidebar {...defaultProps} />);
      const item = screen.getByText('bulbasaur').closest('.cart-sidebar__item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveClass('cart-sidebar__item');

      const content = screen
        .getByText('bulbasaur')
        .closest('.cart-sidebar__content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('cart-sidebar__content');

      const info = screen.getByText('bulbasaur').closest('.cart-sidebar__info');
      expect(info).toBeInTheDocument();
      expect(info).toHaveClass('cart-sidebar__info');

      const name = screen.getByText('bulbasaur').closest('.cart-sidebar__name');
      expect(name).toBeInTheDocument();
      expect(name).toHaveClass('cart-sidebar__name');

      const characteristic = screen.getByText(
        'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
      );
      expect(characteristic).toHaveClass('cart-sidebar__characteristic');
    });

    it('should have correct footer structure', () => {
      render(<CartSidebar {...defaultProps} />);
      const footer = screen
        .getByText('Confirmar Equipe')
        .closest('.cart-sidebar__footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('cart-sidebar__footer');

      const button = screen.getByText('Confirmar Equipe');
      expect(button).toHaveClass('cart-sidebar__footer-button');
    });

    it('should have correct remove button class', () => {
      render(<CartSidebar {...defaultProps} />);
      const removeButton = screen.getByLabelText('Remover bulbasaur da equipe');
      expect(removeButton).toHaveClass('cart-sidebar__remove-button');
    });

    it('should have correct background element', () => {
      render(<CartSidebar {...defaultProps} />);
      const background = document.querySelector('.cart-sidebar__background');
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
      const heading = screen.getByText('Sua equipe');
      expect(heading.tagName).toBe('H2');
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
