import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import PokemonCard from './index';

import { mockPokemons } from '@/test/mocks/pokemon';

describe('PokemonCard', () => {
  // Usar o primeiro Pokémon do mock como base para os testes
  const mockPokemon = mockPokemons[0];

  // Props mockadas padrão para os testes usando o mock
  const defaultProps = {
    id: mockPokemon.id,
    name: mockPokemon.name,
    image: mockPokemon.image,
    characteristic: mockPokemon.characteristic,
    abilities: mockPokemon.abilities,
    types: mockPokemon.types,
    disabled: false,
    addPokemon: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render pokemon name correctly', () => {
      render(<PokemonCard {...defaultProps} />);

      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });

    it('should render pokemon image with correct alt text', () => {
      render(<PokemonCard {...defaultProps} />);

      const image = screen.getByAltText('Imagem do bulbasaur');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockPokemon.image);
    });

    it('should render characteristic correctly', () => {
      render(<PokemonCard {...defaultProps} />);

      expect(
        screen.getByText('Característica: Loves to eat'),
      ).toBeInTheDocument();
    });

    it('should render abilities correctly', () => {
      render(<PokemonCard {...defaultProps} />);

      expect(
        screen.getByText('Habilidades: overgrow, chlorophyll'),
      ).toBeInTheDocument();
    });

    it('should render types correctly', () => {
      render(<PokemonCard {...defaultProps} />);

      expect(screen.getByText('Tipos: grass, poison')).toBeInTheDocument();
    });

    it('should render add button when not disabled', () => {
      render(<PokemonCard {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Adicionar à equipe');
      expect(button).not.toBeDisabled();
    });

    it('should render disabled button when disabled', () => {
      render(<PokemonCard {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Indisponível');
      expect(button).toBeDisabled();
    });
  });

  describe('getValues function', () => {
    it('should extract ability names correctly', () => {
      render(<PokemonCard {...defaultProps} />);

      expect(
        screen.getByText('Habilidades: overgrow, chlorophyll'),
      ).toBeInTheDocument();
    });

    it('should extract type names correctly', () => {
      render(<PokemonCard {...defaultProps} />);

      expect(screen.getByText('Tipos: grass, poison')).toBeInTheDocument();
    });

    it('should handle empty arrays', () => {
      render(<PokemonCard {...defaultProps} abilities={[]} types={[]} />);

      expect(screen.getByText('Habilidades:')).toBeInTheDocument();
      expect(screen.getByText('Tipos:')).toBeInTheDocument();
    });

    it('should handle null values in arrays', () => {
      const abilitiesWithNull = [
        { ability: { name: 'overgrow' } },
        null,
        { ability: { name: 'chlorophyll' } },
      ];

      render(<PokemonCard {...defaultProps} abilities={abilitiesWithNull} />);

      expect(
        screen.getByText('Habilidades: overgrow, chlorophyll'),
      ).toBeInTheDocument();
    });

    it('should handle undefined nested properties', () => {
      const typesWithUndefined = [
        { type: { name: 'grass' } },
        { type: undefined },
        { type: { name: 'poison' } },
      ];

      render(<PokemonCard {...defaultProps} types={typesWithUndefined} />);

      expect(screen.getByText('Tipos: grass, poison')).toBeInTheDocument();
    });
  });

  describe('Button states', () => {
    it('should have correct aria-label when enabled', () => {
      render(<PokemonCard {...defaultProps} />);

      const button = screen.getByLabelText('Adicionar bulbasaur à equipe');
      expect(button).toBeInTheDocument();
    });

    it('should have correct aria-label when disabled', () => {
      render(<PokemonCard {...defaultProps} disabled={true} />);

      const button = screen.getByLabelText('bulbasaur indisponível');
      expect(button).toBeInTheDocument();
    });

    it('should have correct CSS classes when enabled', () => {
      render(<PokemonCard {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('pokemon-card__button');
    });

    it('should have correct CSS classes when disabled', () => {
      render(<PokemonCard {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('pokemon-card__button');
      expect(button).toBeDisabled();
    });
  });

  describe('User interactions', () => {
    it('should call addPokemon when button is clicked', () => {
      const mockAddPokemon = vi.fn();
      render(<PokemonCard {...defaultProps} addPokemon={mockAddPokemon} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockAddPokemon).toHaveBeenCalledTimes(1);
      expect(mockAddPokemon).toHaveBeenCalledWith(defaultProps.id);
    });

    it('should not call addPokemon when disabled button is clicked', () => {
      const mockAddPokemon = vi.fn();
      render(
        <PokemonCard
          {...defaultProps}
          addPokemon={mockAddPokemon}
          disabled={true}
        />,
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockAddPokemon).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks correctly', () => {
      const mockAddPokemon = vi.fn();
      render(<PokemonCard {...defaultProps} addPokemon={mockAddPokemon} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockAddPokemon).toHaveBeenCalledTimes(3);
    });

    it('should pass correct id on each call', () => {
      const mockAddPokemon = vi.fn();
      render(<PokemonCard {...defaultProps} addPokemon={mockAddPokemon} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockAddPokemon).toHaveBeenCalledWith(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long pokemon names', () => {
      const longName = 'a'.repeat(100);
      render(<PokemonCard {...defaultProps} name={longName} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle special characters in names', () => {
      const specialName = 'Pokémon-Ñiño_123';
      render(<PokemonCard {...defaultProps} name={specialName} />);

      expect(screen.getByText(specialName)).toBeInTheDocument();
    });

    it('should handle empty characteristic', () => {
      render(<PokemonCard {...defaultProps} characteristic="" />);

      expect(screen.getByText('Característica:')).toBeInTheDocument();
    });
  });

  describe('CSS structure', () => {
    it('should have correct main container class', () => {
      render(<PokemonCard {...defaultProps} />);

      const container = screen.getByText('bulbasaur').closest('.pokemon-card');
      expect(container).toBeInTheDocument();
    });

    it('should have correct image class', () => {
      render(<PokemonCard {...defaultProps} />);

      const image = screen.getByAltText('Imagem do bulbasaur');
      expect(image).toHaveClass('pokemon-card__image');
    });

    it('should have correct name class', () => {
      render(<PokemonCard {...defaultProps} />);

      const name = screen.getByText('bulbasaur');
      expect(name).toHaveClass('pokemon-card__name');
    });

    it('should have correct info container class', () => {
      render(<PokemonCard {...defaultProps} />);

      const infoContainer = screen
        .getByText('Característica: Loves to eat')
        .closest('.pokemon-card__info');
      expect(infoContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<PokemonCard {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when disabled', async () => {
      const { container } = render(
        <PokemonCard {...defaultProps} disabled={true} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper button accessibility', () => {
      render(<PokemonCard {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Adicionar bulbasaur à equipe',
      );
    });

    it('should have proper image accessibility', () => {
      render(<PokemonCard {...defaultProps} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Imagem do bulbasaur');
    });

    it('should have proper heading structure', () => {
      render(<PokemonCard {...defaultProps} />);

      const heading = screen.getByText('bulbasaur');
      expect(heading.tagName).toBe('H2');
    });

    it('should be keyboard accessible', () => {
      render(<PokemonCard {...defaultProps} />);

      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should have proper focus management when disabled', () => {
      render(<PokemonCard {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should have descriptive text content', () => {
      render(<PokemonCard {...defaultProps} />);

      expect(screen.getByText(/Característica:/)).toBeInTheDocument();
      expect(screen.getByText(/Habilidades:/)).toBeInTheDocument();
      expect(screen.getByText(/Tipos:/)).toBeInTheDocument();
    });
  });
});
