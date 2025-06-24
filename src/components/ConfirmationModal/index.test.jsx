import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import ConfirmationModal from './index';

import { mockPokemons } from '@/test/mocks/pokemon';

describe('ConfirmationModal', () => {
  // Props mockadas padrão para os testes
  const defaultProps = {
    pokemons: mockPokemons,
    onClose: vi.fn(),
    onStartNewTeam: vi.fn(),
  };

  const singlePokemonProps = {
    pokemons: [mockPokemons[0]],
    onClose: vi.fn(),
    onStartNewTeam: vi.fn(),
  };

  // Teste de snapshot como primeiro teste
  it('should match snapshot', () => {
    const { container } = render(<ConfirmationModal {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  describe('Rendering', () => {
    it('should render modal title correctly', () => {
      render(<ConfirmationModal {...defaultProps} />);
      expect(screen.getByText('Equipe formada')).toBeInTheDocument();
      expect(screen.getByText('Equipe formada')).toHaveClass(
        'confirmation-modal__title',
      );
    });

    it('should render subtitle correctly', () => {
      render(<ConfirmationModal {...defaultProps} />);
      expect(screen.getByText('Sua equipe está pronta!')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe está pronta!')).toHaveClass(
        'confirmation-modal__subtitle',
      );
    });

    it('should render check icon', () => {
      render(<ConfirmationModal {...defaultProps} />);
      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.getByText('✓')).toHaveClass('confirmation-modal__check');
    });

    it('should render basic modal structure', () => {
      render(<ConfirmationModal {...defaultProps} />);
      expect(
        screen.getByText('Equipe formada').closest('.confirmation-modal'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Equipe formada').closest('.confirmation-modal'),
      ).toHaveClass('confirmation-modal');
    });

    it('should render all team pokemons', () => {
      render(<ConfirmationModal {...defaultProps} />);
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('charmander')).toBeInTheDocument();
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

    it('should render pokemon images with correct alt text', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const bulbasaurImg = screen.getByAltText('Imagem do bulbasaur');
      const charmanderImg = screen.getByAltText('Imagem do charmander');
      expect(bulbasaurImg).toBeInTheDocument();
      expect(charmanderImg).toBeInTheDocument();
      expect(bulbasaurImg).toHaveClass('confirmation-modal__image');
      expect(bulbasaurImg).toHaveAttribute('src', mockPokemons[0].image);
    });

    it('should render pokemon characteristics', () => {
      render(<ConfirmationModal {...defaultProps} />);
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
      expect(
        screen.getByText(
          'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
        ),
      ).toHaveClass('confirmation-modal__characteristic');
    });

    it('should render pokemon names with correct classes', () => {
      render(<ConfirmationModal {...defaultProps} />);
      expect(screen.getByText('bulbasaur')).toHaveClass(
        'confirmation-modal__name',
      );
      expect(screen.getByText('charmander')).toHaveClass(
        'confirmation-modal__name',
      );
    });

    it('should show correct pokemon total', () => {
      render(<ConfirmationModal {...defaultProps} />);
      expect(
        screen.getByText('Total de pokémons na equipe:'),
      ).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should show total 1 when there is only one pokemon', () => {
      render(<ConfirmationModal {...singlePokemonProps} />);
      expect(
        screen.getByText('Total de pokémons na equipe:'),
      ).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render close button with ×', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const closeButton = screen.getByTestId('modal-close-button');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveTextContent('×');
    });

    it('should render "Começar nova equipe" button', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const newTeamButton = screen.getByText('Começar nova equipe');
      expect(newTeamButton).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when × button is clicked', () => {
      const mockOnClose = vi.fn();
      render(<ConfirmationModal {...defaultProps} onClose={mockOnClose} />);
      const closeButton = screen.getByTestId('modal-close-button');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onStartNewTeam when "Começar nova equipe" button is clicked', () => {
      const mockOnStartNewTeam = vi.fn();
      render(
        <ConfirmationModal
          {...defaultProps}
          onStartNewTeam={mockOnStartNewTeam}
        />,
      );
      const newTeamButton = screen.getByText('Começar nova equipe');
      fireEvent.click(newTeamButton);
      expect(mockOnStartNewTeam).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple clicks on buttons', () => {
      const mockOnClose = vi.fn();
      const mockOnStartNewTeam = vi.fn();
      render(
        <ConfirmationModal
          {...defaultProps}
          onClose={mockOnClose}
          onStartNewTeam={mockOnStartNewTeam}
        />,
      );
      const closeButton = screen.getByTestId('modal-close-button');
      const newTeamButton = screen.getByText('Começar nova equipe');
      fireEvent.click(closeButton);
      fireEvent.click(newTeamButton);
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(2);
      expect(mockOnStartNewTeam).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty pokemon array', () => {
      const emptyProps = {
        ...defaultProps,
        pokemons: [],
      };
      render(<ConfirmationModal {...emptyProps} />);
      expect(screen.getByText('Equipe formada')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument();
    });

    it('should handle pokemons with incomplete data', () => {
      const incompletePokemons = [
        { id: 1, name: '', image: '', characteristic: '' },
        { id: 2, name: 'test', image: 'test.jpg', characteristic: 'test char' },
      ];
      const incompleteProps = {
        ...defaultProps,
        pokemons: incompletePokemons,
      };
      render(<ConfirmationModal {...incompleteProps} />);
      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('test char')).toBeInTheDocument();
      expect(screen.getByText('pokémon sem nome')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should handle many pokemons', () => {
      const manyPokemons = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `pokemon${i + 1}`,
        image: `image${i + 1}.jpg`,
        characteristic: `char${i + 1}`,
      }));
      const manyPokemonsProps = {
        ...defaultProps,
        pokemons: manyPokemons,
      };
      render(<ConfirmationModal {...manyPokemonsProps} />);
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('pokemon1')).toBeInTheDocument();
      expect(screen.getByText('pokemon10')).toBeInTheDocument();
    });

    it('should handle null pokemons prop without crashing', () => {
      render(
        <ConfirmationModal
          onClose={vi.fn()}
          onStartNewTeam={vi.fn()}
          pokemons={null}
        />,
      );
      // Componente deve renderizar sem quebrar
      expect(screen.getByText('Equipe formada')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle pokemon with null ID', () => {
      const pokemonWithNullId = {
        ...mockPokemons[0],
        id: null,
        name: 'pokemonSemId',
      };
      render(
        <ConfirmationModal
          onClose={vi.fn()}
          onStartNewTeam={vi.fn()}
          pokemons={[pokemonWithNullId]}
        />,
      );
      // Verificar se o pokemon é renderizado mesmo com ID nulo
      expect(screen.getByText('pokemonSemId')).toBeInTheDocument();
    });

    it('should handle pokemon with empty name', () => {
      const pokemonWithEmptyName = {
        ...mockPokemons[0],
        name: '',
      };
      render(
        <ConfirmationModal
          onClose={vi.fn()}
          onStartNewTeam={vi.fn()}
          pokemons={[pokemonWithEmptyName]}
        />,
      );
      // Verificar se o texto fallback foi usado para o nome
      expect(screen.getByText('pokémon sem nome')).toBeInTheDocument();
      // Verificar se o alt da imagem usa o fallback
      const imgAlt = screen.getByAltText('Imagem do pokémon');
      expect(imgAlt).toBeInTheDocument();
    });

    it('should handle pokemon with empty characteristic', () => {
      const pokemonWithEmptyChar = {
        ...mockPokemons[0],
        characteristic: '',
      };
      render(
        <ConfirmationModal
          onClose={vi.fn()}
          onStartNewTeam={vi.fn()}
          pokemons={[pokemonWithEmptyChar]}
        />,
      );
      // Verificar se o pokemon é renderizado mesmo com característica vazia
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });

    it('should handle pokemon with null image', () => {
      const pokemonWithNullImage = {
        ...mockPokemons[0],
        image: null,
      };
      render(
        <ConfirmationModal
          onClose={vi.fn()}
          onStartNewTeam={vi.fn()}
          pokemons={[pokemonWithNullImage]}
        />,
      );
      // Verificar se a imagem está com src vazia
      const image = screen.getByAltText('Imagem do bulbasaur');
      expect(image.getAttribute('src')).toBe('');
    });
  });

  describe('CSS structure', () => {
    it('should apply correct CSS classes to main elements', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const modal = screen
        .getByText('Equipe formada')
        .closest('.confirmation-modal');
      expect(modal).toHaveClass('confirmation-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');

      const content = screen
        .getByText('Equipe formada')
        .closest('.confirmation-modal__content');
      expect(content).toHaveClass('confirmation-modal__content');

      const check = screen.getByText('✓');
      expect(check).toHaveClass('confirmation-modal__check');
    });

    it('should have correct structure for each list item', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const bulbasaurItem = screen
        .getByText('bulbasaur')
        .closest('.confirmation-modal__item');
      expect(bulbasaurItem).toBeInTheDocument();
      expect(bulbasaurItem).toHaveClass('confirmation-modal__item');

      const info = screen
        .getByText('bulbasaur')
        .closest('.confirmation-modal__info');
      expect(info).toBeInTheDocument();
      expect(info).toHaveClass('confirmation-modal__info');

      const name = screen.getByText('bulbasaur');
      expect(name).toHaveClass('confirmation-modal__name');

      const characteristic = screen.getByText(
        'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
      );
      expect(characteristic).toHaveClass('confirmation-modal__characteristic');

      const image = screen.getByAltText('Imagem do bulbasaur');
      expect(image).toHaveClass('confirmation-modal__image');
    });

    it('should apply correct classes to header', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const header = screen
        .getByText('Equipe formada')
        .closest('.confirmation-modal__header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('confirmation-modal__header');

      const title = screen.getByText('Equipe formada');
      expect(title).toHaveClass('confirmation-modal__title');
      expect(title).toHaveAttribute('id', 'modal-title');

      const subtitle = screen.getByText('Sua equipe está pronta!');
      expect(subtitle).toHaveClass('confirmation-modal__subtitle');
    });

    it('should apply correct classes to footer', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const footer = screen
        .getByText('Total de pokémons na equipe:')
        .closest('.confirmation-modal__footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('confirmation-modal__footer');

      const total = screen
        .getByText('Total de pokémons na equipe:')
        .closest('.confirmation-modal__total');
      expect(total).toHaveClass('confirmation-modal__total');

      const button = screen.getByText('Começar nova equipe');
      expect(button).toHaveClass('confirmation-modal__button');
    });

    it('should have correct close button class', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const closeButton = screen.getByTestId('modal-close-button');
      expect(closeButton).toHaveClass('confirmation-modal__close-button');
    });

    it('should have correct list container class', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const list = screen
        .getByText('bulbasaur')
        .closest('.confirmation-modal__list');
      expect(list).toBeInTheDocument();
      expect(list).toHaveClass('confirmation-modal__list');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ConfirmationModal {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with empty team', async () => {
      const emptyProps = { ...defaultProps, pokemons: [] };
      const { container } = render(<ConfirmationModal {...emptyProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper button accessibility', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const closeButton = screen.getByTestId('modal-close-button');
      const newTeamButton = screen.getByText('Começar nova equipe');
      expect(closeButton.tagName).toBe('BUTTON');
      expect(newTeamButton.tagName).toBe('BUTTON');
      expect(closeButton).not.toHaveAttribute('tabindex', '-1');
      expect(newTeamButton).not.toHaveAttribute('tabindex', '-1');
      expect(closeButton).toHaveAttribute('aria-label', 'Fechar modal');
    });

    it('should have proper image accessibility', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('should have descriptive content for screen readers', () => {
      render(<ConfirmationModal {...defaultProps} />);
      expect(screen.getByText('Equipe formada')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe está pronta!')).toBeInTheDocument();
      expect(
        screen.getByText('Total de pokémons na equipe:'),
      ).toBeInTheDocument();
      expect(screen.getByText('Começar nova equipe')).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      render(<ConfirmationModal {...defaultProps} />);
      // Check for title structure
      const title = screen.getByText('Equipe formada');
      expect(title.tagName).toBe('H2');
      // Check for meaningful button text
      const newTeamButton = screen.getByText('Começar nova equipe');
      expect(newTeamButton.textContent.trim().length).toBeGreaterThan(0);
    });

    it('should handle keyboard navigation properly', () => {
      render(<ConfirmationModal {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
        // Test focus
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });

    it('should have proper modal accessibility attributes', () => {
      render(<ConfirmationModal {...defaultProps} />);
      // Modal should be properly structured
      const modal = screen
        .getByText('Equipe formada')
        .closest('.confirmation-modal');
      expect(modal).toBeInTheDocument();
      // Close button should have proper identification
      const closeButton = screen.getByTestId('modal-close-button');
      expect(closeButton).toHaveAttribute('data-testid', 'modal-close-button');
    });
  });
});
