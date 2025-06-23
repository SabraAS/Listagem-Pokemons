import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import PokemonCard from './index';

import coverPokemon from '@/assets/cover-pokemon.webp';
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

  // Teste de snapshot como primeiro teste
  it('should match snapshot', () => {
    const { container } = render(<PokemonCard {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

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

    it('should use fallback image when image prop is empty', () => {
      render(<PokemonCard {...defaultProps} image="" />);
      const image = screen.getByAltText('Imagem do bulbasaur');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', coverPokemon);
      expect(image).toHaveAttribute('alt', 'Imagem do bulbasaur');
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

    it('should handle empty arrays for abilities and types', () => {
      render(<PokemonCard {...defaultProps} abilities={[]} types={[]} />);
      expect(screen.getByText(/Habilidades: não possui/)).toBeInTheDocument();
      expect(screen.getByText(/Tipos: não possui/)).toBeInTheDocument();
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

  describe('Interactions', () => {
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

    it('should handle empty characteristic', () => {
      render(<PokemonCard {...defaultProps} characteristic="" />);
      expect(
        screen.getByText('Característica: não possui'),
      ).toBeInTheDocument();
    });

    it('should handle empty name', () => {
      render(<PokemonCard {...defaultProps} name={''} />);
      // Verificar se o fallback é usado para o nome
      expect(screen.getByText('pokémon sem nome')).toBeInTheDocument();
      // Verificar se o alt da imagem usa o fallback
      const image = screen.getByAltText('Imagem do pokémon');
      expect(image).toBeInTheDocument();
      // Verificar se o aria-label usa o fallback
      const button = screen.getByLabelText('Adicionar pokémon à equipe');
      expect(button).toBeInTheDocument();
    });

    it('should handle null image', () => {
      render(<PokemonCard {...defaultProps} image={null} />);
      // Verificar se a imagem de fallback é usada
      const image = screen.getByAltText('Imagem do bulbasaur');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', coverPokemon);
    });

    it('should handle null abilities', () => {
      render(<PokemonCard {...defaultProps} abilities={null} />);
      // Verificar se o fallback é usado para habilidades
      expect(screen.getByText('Habilidades: não possui')).toBeInTheDocument();
    });

    it('should handle null types', () => {
      render(<PokemonCard {...defaultProps} types={null} />);
      // Verificar se o fallback é usado para tipos
      expect(screen.getByText('Tipos: não possui')).toBeInTheDocument();
    });

    it('should handle null id by using name instead', () => {
      const mockAddPokemon = vi.fn();
      render(
        <PokemonCard {...defaultProps} addPokemon={mockAddPokemon} id={null} />,
      );
      // Clicar no botão e verificar se o nome foi passado em vez do id
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(mockAddPokemon).toHaveBeenCalledWith('bulbasaur');
    });

    it('should render with minimal props', () => {
      // Renderizar apenas com a prop obrigatória
      render(<PokemonCard addPokemon={vi.fn()} />);
      // Verificar se o componente renderiza corretamente com valores default
      expect(screen.getByText('pokémon sem nome')).toBeInTheDocument();
      expect(
        screen.getByText('Característica: não possui'),
      ).toBeInTheDocument();
      expect(screen.getByText(/Habilidades: não possui/)).toBeInTheDocument();
      expect(screen.getByText(/Tipos: não possui/)).toBeInTheDocument();
      const image = screen.getByAltText('Imagem do pokémon');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', coverPokemon);
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
        .getByText('Característica: Loves to eat')
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
        'Característica: Loves to eat',
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
