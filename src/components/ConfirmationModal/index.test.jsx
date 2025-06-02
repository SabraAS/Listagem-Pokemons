import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { axe } from 'vitest-axe';

import ConfirmationModal from './index';

const mockItems = [
  {
    id: 1,
    name: 'Bulbasaur',
    characteristic: 'Takes plenty of siestas',
    image: 'bulbasaur.png',
  },
  {
    id: 2,
    name: 'Charmander',
    characteristic: 'Likes to run',
    image: 'charmander.png',
  },
];

describe('ConfirmationModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnStartNew = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal with correct title and subtitle', () => {
      render(
        <ConfirmationModal
          items={mockItems}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      expect(screen.getByText('Equipe formada')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe está pronta!')).toBeInTheDocument();
    });

    it('should render all pokemon items correctly', () => {
      render(
        <ConfirmationModal
          items={mockItems}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      mockItems.forEach((item) => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
        expect(screen.getByText(item.characteristic)).toBeInTheDocument();
      });
    });

    it('should display correct total of pokemons', () => {
      render(
        <ConfirmationModal
          items={mockItems}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(
        screen.getByText('Total de pokemons na equipe'),
      ).toBeInTheDocument();
    });

    it('should handle empty items array', () => {
      render(
        <ConfirmationModal
          items={[]}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(
        screen.getByText('Total de pokemons na equipe'),
      ).toBeInTheDocument();
    });

    it('should render with single item correctly', () => {
      const singleItem = [mockItems[0]];

      render(
        <ConfirmationModal
          items={singleItem}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('Takes plenty of siestas')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when clicking close button', () => {
      render(
        <ConfirmationModal
          items={mockItems}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      const closeButton = screen.getByTestId('modal-close-button');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onStartNew when clicking start new team button', () => {
      render(
        <ConfirmationModal
          items={mockItems}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      const startNewButton = screen.getByTestId('start-new-team-button');
      fireEvent.click(startNewButton);

      expect(mockOnStartNew).toHaveBeenCalledTimes(1);
    });

    it('should have clickable buttons with proper labels', () => {
      render(
        <ConfirmationModal
          items={mockItems}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      const closeButton = screen.getByTestId('modal-close-button');
      const startNewButton = screen.getByTestId('start-new-team-button');

      expect(closeButton).toBeInTheDocument();
      expect(startNewButton).toBeInTheDocument();

      // Verificar se os botões têm texto/conteúdo
      expect(closeButton).not.toBeDisabled();
      expect(startNewButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ConfirmationModal
          items={mockItems}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with empty items', async () => {
      const { container } = render(
        <ConfirmationModal
          items={[]}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper image alt text for all items', () => {
      render(
        <ConfirmationModal
          items={mockItems}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      mockItems.forEach((item) => {
        const image = screen.getByAltText(item.name);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('alt', item.name);
      });
    });

    it('should have proper button accessibility attributes', () => {
      render(
        <ConfirmationModal
          items={mockItems}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      const closeButton = screen.getByTestId('modal-close-button');
      const startNewButton = screen.getByTestId('start-new-team-button');

      // Botões devem ser elementos button
      expect(closeButton.tagName).toBe('BUTTON');
      expect(startNewButton.tagName).toBe('BUTTON');

      // Botões devem estar habilitados
      expect(closeButton).not.toBeDisabled();
      expect(startNewButton).not.toBeDisabled();
    });

    it('should maintain focus management', () => {
      render(
        <ConfirmationModal
          items={mockItems}
          onClose={mockOnClose}
          onStartNew={mockOnStartNew}
        />,
      );

      const closeButton = screen.getByTestId('modal-close-button');
      const startNewButton = screen.getByTestId('start-new-team-button');

      // Elementos devem estar na ordem de tabulação
      expect(closeButton.getAttribute('tabindex')).not.toBe('-1');
      expect(startNewButton.getAttribute('tabindex')).not.toBe('-1');
    });
  });
});
