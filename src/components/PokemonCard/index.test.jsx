import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import PokemonCard from './index';

import coverPokemon from '@/assets/cover-pokemon.png';
import { mockSinglePokemon } from '@/test/mocks/pokemon';

describe('PokemonCard', () => {
  const defaultProps = {
    id: mockSinglePokemon.id,
    name: mockSinglePokemon.name,
    image: mockSinglePokemon.image,
    characteristic: mockSinglePokemon.characteristic,
    abilities: mockSinglePokemon.abilities,
    types: mockSinglePokemon.types,
    disabled: false,
    addPokemon: vi.fn(),
  };

  describe('Rendering', () => {
    it('should match snapshot', () => {
      const { container } = render(<PokemonCard {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });

    it('should render pokemon name correctly', () => {
      render(<PokemonCard {...defaultProps} />);
      const name = screen.getByTestId('pokemon-card-name');
      expect(name).toHaveTextContent('bulbasaur');
    });

    it('should render pokemon image with correct alt text', () => {
      render(<PokemonCard {...defaultProps} />);
      const image = screen.getByTestId('pokemon-card-image');
      expect(image).toHaveAttribute('src', mockSinglePokemon.image);
    });

    it('should render characteristic correctly', () => {
      render(<PokemonCard {...defaultProps} />);
      const characteristic = screen.getByTestId('pokemon-card-characteristic');
      expect(characteristic).toHaveTextContent(
        'Característica: A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
      );
    });

    it('should render abilities correctly', () => {
      render(<PokemonCard {...defaultProps} />);
      const abilities = screen.getByTestId('pokemon-card-abilities');
      expect(abilities).toHaveTextContent('Habilidades: overgrow, chlorophyll');
    });

    it('should render types correctly', () => {
      render(<PokemonCard {...defaultProps} />);
      const types = screen.getByTestId('pokemon-card-types');
      expect(types).toHaveTextContent('Tipos: grass, poison');
    });

    it('should render add button when not disabled', () => {
      render(<PokemonCard {...defaultProps} />);
      const button = screen.getByTestId('pokemon-card-button-1');
      expect(button).toHaveTextContent('Adicionar à equipe');
      expect(button).not.toBeDisabled();
    });

    it('should render disabled button when disabled', () => {
      render(<PokemonCard {...defaultProps} disabled={true} />);
      const button = screen.getByTestId('pokemon-card-button-1');
      expect(button).toHaveTextContent('Indisponível');
      expect(button).toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('should call addPokemon when button is clicked', () => {
      const mockAddPokemon = vi.fn();
      render(<PokemonCard {...defaultProps} addPokemon={mockAddPokemon} />);
      const button = screen.getByTestId('pokemon-card-button-1');
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
      const button = screen.getByTestId('pokemon-card-button-1');
      fireEvent.click(button);
      expect(mockAddPokemon).not.toHaveBeenCalled();
    });

    it('should pass correct id on each call', () => {
      const mockAddPokemon = vi.fn();
      render(<PokemonCard {...defaultProps} addPokemon={mockAddPokemon} />);
      const button = screen.getByTestId('pokemon-card-button-1');
      fireEvent.click(button);
      expect(mockAddPokemon).toHaveBeenCalledWith(1); // id do bulbasauro
    });
  });

  describe('Edge cases', () => {
    it('should handle empty characteristic', () => {
      render(<PokemonCard {...defaultProps} characteristic="" />);
      const characteristic = screen.getByTestId('pokemon-card-characteristic');
      expect(characteristic).toHaveTextContent('Característica: não possui');
    });

    it('should handle empty name', () => {
      render(<PokemonCard {...defaultProps} name={''} />);
      const name = screen.getByTestId('pokemon-card-name');
      expect(name).toHaveTextContent('pokémon sem nome');

      const image = screen.getByTestId('pokemon-card-image');
      expect(image).toHaveAttribute('src', mockSinglePokemon.image);
      expect(image).toHaveAttribute('alt', 'Imagem do pokémon');

      const button = screen.getByTestId('pokemon-card-button-1');
      expect(button).toHaveTextContent('Adicionar à equipe');
    });

    it('should handle null image', () => {
      render(<PokemonCard {...defaultProps} image={null} />);
      const image = screen.getByTestId('pokemon-card-image');
      expect(image).toHaveAttribute('src', coverPokemon);
      expect(image).toHaveAttribute('alt', 'Imagem do bulbasaur');
    });

    it('should handle null abilities and types', () => {
      render(<PokemonCard {...defaultProps} abilities={null} types={null} />);
      const abilities = screen.getByTestId('pokemon-card-abilities');
      expect(abilities).toHaveTextContent('Habilidades: não possui');

      const types = screen.getByTestId('pokemon-card-types');
      expect(types).toHaveTextContent('Tipos: não possui');
    });

    it('should handle null id by using name instead', () => {
      const mockAddPokemon = vi.fn();
      render(
        <PokemonCard {...defaultProps} addPokemon={mockAddPokemon} id={null} />,
      );
      const button = screen.getByTestId('pokemon-card-button-null');
      fireEvent.click(button);
      expect(mockAddPokemon).toHaveBeenCalledWith('bulbasaur');
    });
  });

  describe('CSS structure', () => {
    it('should have correct main container class', () => {
      render(<PokemonCard {...defaultProps} />);
      const container = screen.getByText('bulbasaur').closest('.pokemon-card');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('pokemon-card');
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
        .getByText(
          'Característica: A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
        )
        .closest('.pokemon-card__info');
      expect(infoContainer).toBeInTheDocument();
      expect(infoContainer).toHaveClass('pokemon-card__info');
    });

    it('should have correct button class', () => {
      render(<PokemonCard {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('pokemon-card__button');
    });

    it('should have correct text classes for all text elements', () => {
      render(<PokemonCard {...defaultProps} />);
      const characteristicText = screen.getByText(
        'Característica: A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
      );
      const abilitiesText = screen.getByText(
        'Habilidades: overgrow, chlorophyll',
      );
      const typesText = screen.getByText('Tipos: grass, poison');
      expect(characteristicText).toHaveClass('pokemon-card__text');
      expect(abilitiesText).toHaveClass('pokemon-card__text');
      expect(typesText).toHaveClass('pokemon-card__text');
    });

    it('should apply disabled styles to button when disabled', () => {
      render(<PokemonCard {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('pokemon-card__button');
      expect(button).toHaveTextContent('Indisponível');
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

    it('should have proper button accessibility when disabled', () => {
      render(<PokemonCard {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'bulbasaur indisponível');
    });

    it('should have proper button accessibility with null name', () => {
      render(<PokemonCard {...defaultProps} name={null} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Adicionar pokémon à equipe',
      );
    });

    it('should have proper button accessibility when disabled with null name', () => {
      render(<PokemonCard {...defaultProps} disabled={true} name={null} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'pokémon indisponível');
    });

    it('should have proper button accessibility with undefined name', () => {
      render(<PokemonCard {...defaultProps} name={undefined} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Adicionar pokémon à equipe',
      );
    });

    it('should have proper button accessibility when disabled with undefined name', () => {
      render(
        <PokemonCard {...defaultProps} disabled={true} name={undefined} />,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'pokémon indisponível');
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
