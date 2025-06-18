import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import PokemonCard from './index';

import { mockPokemons } from '@/test/mocks/pokemon';

describe('PokemonCard Component', () => {
  const mockOnClick = vi.fn();
  const mockPokemon = mockPokemons[0];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pokemon information correctly', () => {
      render(
        <PokemonCard
          abilities={mockPokemon.abilities}
          characteristic={mockPokemon.characteristic}
          image={mockPokemon.image}
          name={mockPokemon.name}
          onClick={mockOnClick}
          types={mockPokemon.types}
        />,
      );

      expect(screen.getByText(mockPokemon.name)).toBeInTheDocument();

      expect(
        screen.getByText(`Característica: ${mockPokemon.characteristic}`),
      ).toBeInTheDocument();

      expect(screen.getByText('Tipos: grass, poison')).toBeInTheDocument();

      expect(
        screen.getByText('Habilidades: overgrow, chlorophyll'),
      ).toBeInTheDocument();

      const image = screen.getByAltText(mockPokemon.name);
      expect(image).toHaveAttribute('src', mockPokemon.image);
    });

    it('should show "não possui" when characteristic is not provided', () => {
      render(
        <PokemonCard
          abilities={mockPokemon.abilities}
          image={mockPokemon.image}
          name={mockPokemon.name}
          onClick={mockOnClick}
          types={mockPokemon.types}
        />,
      );

      expect(
        screen.getByText('Característica: não possui'),
      ).toBeInTheDocument();
    });

    it('should handle empty types and abilities arrays', () => {
      render(
        <PokemonCard
          abilities={[]}
          image={mockPokemon.image}
          name={mockPokemon.name}
          onClick={mockOnClick}
          types={[]}
        />,
      );

      expect(screen.getByText('Tipos: não possui')).toBeInTheDocument();
      expect(screen.getByText('Habilidades: não possui')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when add button is clicked', () => {
      render(
        <PokemonCard
          abilities={mockPokemon.abilities}
          characteristic={mockPokemon.characteristic}
          image={mockPokemon.image}
          name={mockPokemon.name}
          onClick={mockOnClick}
          types={mockPokemon.types}
        />,
      );

      const addButton = screen.getByTestId(
        `add-pokemon-${mockPokemon.name.toLowerCase()}`,
      );
      fireEvent.click(addButton);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should disable add button when disabled prop is true', () => {
      render(
        <PokemonCard
          abilities={mockPokemon.abilities}
          characteristic={mockPokemon.characteristic}
          disabled
          image={mockPokemon.image}
          name={mockPokemon.name}
          onClick={mockOnClick}
          types={mockPokemon.types}
        />,
      );

      const addButton = screen.getByTestId(
        `add-pokemon-${mockPokemon.name.toLowerCase()}`,
      );
      expect(addButton).toHaveAttribute('disabled');

      fireEvent.click(addButton);
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <PokemonCard
          abilities={mockPokemon.abilities}
          characteristic={mockPokemon.characteristic}
          image={mockPokemon.image}
          name={mockPokemon.name}
          onClick={mockOnClick}
          types={mockPokemon.types}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when disabled', async () => {
      const { container } = render(
        <PokemonCard
          abilities={mockPokemon.abilities}
          characteristic={mockPokemon.characteristic}
          disabled
          image={mockPokemon.image}
          name={mockPokemon.name}
          onClick={mockOnClick}
          types={mockPokemon.types}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper image alt text', () => {
      render(
        <PokemonCard
          abilities={mockPokemon.abilities}
          characteristic={mockPokemon.characteristic}
          image={mockPokemon.image}
          name={mockPokemon.name}
          onClick={mockOnClick}
          types={mockPokemon.types}
        />,
      );

      const image = screen.getByAltText(mockPokemon.name);
      expect(image).toHaveAttribute('alt', mockPokemon.name);
      expect(image.getAttribute('alt').trim().length).toBeGreaterThan(0);
    });

    it('should have proper button accessibility attributes', () => {
      render(
        <PokemonCard
          abilities={mockPokemon.abilities}
          characteristic={mockPokemon.characteristic}
          image={mockPokemon.image}
          name={mockPokemon.name}
          onClick={mockOnClick}
          types={mockPokemon.types}
        />,
      );

      const addButton = screen.getByTestId(
        `add-pokemon-${mockPokemon.name.toLowerCase()}`,
      );

      // Should be a button element
      expect(addButton.tagName).toBe('BUTTON');

      // Should not have explicit role (implicit button role)
      expect(addButton.getAttribute('role')).toBeNull();

      // Should have accessible text content
      expect(addButton.textContent.trim().length).toBeGreaterThan(0);

      // Should be focusable
      expect(addButton.getAttribute('tabindex')).not.toBe('-1');
    });

    it('should maintain focus management when disabled', () => {
      render(
        <PokemonCard
          abilities={mockPokemon.abilities}
          characteristic={mockPokemon.characteristic}
          disabled
          image={mockPokemon.image}
          name={mockPokemon.name}
          onClick={mockOnClick}
          types={mockPokemon.types}
        />,
      );

      const addButton = screen.getByTestId(
        `add-pokemon-${mockPokemon.name.toLowerCase()}`,
      );

      // Disabled button should still be accessible for screen readers
      expect(addButton).toHaveAttribute('disabled');
      expect(addButton.textContent).toContain('Indisponível');
    });
  });
});
