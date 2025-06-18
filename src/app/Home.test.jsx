import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import Home from './Home';

import { usePokemons } from '@/queries/pokemon';
import { usePokemonStore } from '@/store/pokemon';
import { mockPokemons } from '@/test/mocks/pokemon';

// Mock dos módulos
vi.mock('@/queries/pokemon', () => ({
  usePokemons: vi.fn(),
}));

vi.mock('@/store/pokemon', () => ({
  usePokemonStore: vi.fn(),
}));

describe('Home Component', () => {
  const queryClient = new QueryClient();
  const mockAddPokemon = vi.fn();
  const mockRemovePokemon = vi.fn();
  const mockClearTeam = vi.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup default mock implementations
    usePokemons.mockReturnValue({
      data: mockPokemons,
      isLoading: false,
    });

    usePokemonStore.mockReturnValue({
      pokemons: [],
      addPokemon: mockAddPokemon,
      removePokemon: mockRemovePokemon,
      clearTeam: mockClearTeam,
    });
  });

  describe('Rendering', () => {
    it('should render the title correctly', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      expect(screen.getByText('Pokémons')).toBeInTheDocument();
    });

    it('should render pokemon cards when data is loaded', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('charmander')).toBeInTheDocument();
    });

    it('should render loading message when data is not loaded', () => {
      usePokemons.mockReturnValue({
        data: [],
        isLoading: true,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call addPokemon when clicking on a pokemon card', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      const firstPokemonCard = screen.getByTestId('add-pokemon-bulbasaur');
      fireEvent.click(firstPokemonCard);

      expect(mockAddPokemon).toHaveBeenCalledWith(mockPokemons[0]);
    });

    it('should disable pokemon card if pokemon is already in store', () => {
      usePokemonStore.mockReturnValue({
        pokemons: [mockPokemons[0]],
        addPokemon: mockAddPokemon,
        removePokemon: mockRemovePokemon,
        clearTeam: mockClearTeam,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      const firstPokemonCard = screen.getByTestId('add-pokemon-bulbasaur');
      expect(firstPokemonCard).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations on home page', async () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with disabled pokemon cards', async () => {
      usePokemonStore.mockReturnValue({
        pokemons: [mockPokemons[0]], // First pokemon already selected
        addPokemon: mockAddPokemon,
        removePokemon: mockRemovePokemon,
        clearTeam: mockClearTeam,
      });

      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper keyboard navigation', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      const firstPokemonButton = document.querySelector(
        '[data-testid="add-pokemon-bulbasaur"]',
      );
      expect(firstPokemonButton).not.toBeNull();
      expect(firstPokemonButton.tagName).toBe('BUTTON');
      expect(firstPokemonButton.getAttribute('tabindex')).not.toBe('-1');
    });

    it('should have proper ARIA labels and roles', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      const buttons = document.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button.getAttribute('role')).toBeNull(); // Buttons should not need explicit role
        expect(button.textContent.trim().length).toBeGreaterThan(0); // Should have text content
      });
    });

    it('should have proper alt text for images', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        expect(img.getAttribute('alt')).not.toBeNull();
        expect(img.getAttribute('alt').trim().length).toBeGreaterThan(0);
      });
    });
  });
});
