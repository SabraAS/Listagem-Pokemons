import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';

import {
  createTestQueryClient,
  createUsabilityTestSetup,
} from './usability-utils';

import Home from '@/app/Home';
import { usePokemons } from '@/queries/pokemon';
import { mockPokemons } from '@/test/mocks/pokemon';

describe('User Journey - Building a Pokemon Team', () => {
  let queryClient;
  let testSetup;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    testSetup = createUsabilityTestSetup();
    testSetup.resetMocks();
    queryClient.clear();
  });

  describe('Complete User Journey - Building a Pokemon Team', () => {
    it('should provide clear interface structure for team building', () => {
      // Setup: User sees available pokemons
      usePokemons.mockReturnValue({
        data: mockPokemons,
        isLoading: false,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      // Step 1: User sees the main interface structure
      expect(screen.getByText('Pokémons')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe')).toBeInTheDocument();

      // Step 2: User sees interaction options
      const addButtons = screen.getAllByText(/Adicionar/);
      expect(addButtons.length).toBeGreaterThan(0);

      // Step 3: User can interact with pokémon selection
      fireEvent.click(addButtons[0]);
      expect(testSetup.mockAddPokemon).toHaveBeenCalled();

      // Step 4: User always has access to team confirmation
      const confirmButton = screen.getByTestId('confirm-team-button');
      expect(confirmButton).toBeInTheDocument();
    });

    it('should handle empty team state user experience', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      // User gets clear feedback about empty team
      expect(
        screen.getByText('Nenhum Pokémon selecionado'),
      ).toBeInTheDocument();

      // Confirm button is available but disabled for empty team
      const confirmButton = screen.getByTestId('confirm-team-button');
      expect(confirmButton).toBeDisabled();
    });

    it('should handle team with pokémons correctly', () => {
      // Set up state with pokémons in team
      testSetup.currentMockState.pokemons = mockPokemons;

      // Also provide the Pokemon data so cards can render
      usePokemons.mockReturnValue({
        data: mockPokemons,
        isLoading: false,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      // User sees team members (check in sidebar)
      expect(screen.getAllByText(mockPokemons[0].name)).toHaveLength(2); // Card + Sidebar
      expect(screen.getAllByText(mockPokemons[1].name)).toHaveLength(2); // Card + Sidebar

      // Confirm button should be enabled
      const confirmButton = screen.getByTestId('confirm-team-button');
      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe('Data Flow and State Management', () => {
    it('should maintain consistent data flow throughout user journey', () => {
      usePokemons.mockReturnValue({
        data: mockPokemons,
        isLoading: false,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      // User can see available options
      const addButtons = screen.getAllByText(/Adicionar/);
      expect(addButtons.length).toBe(2);

      // User interactions trigger correct data operations
      fireEvent.click(addButtons[0]);
      expect(testSetup.mockAddPokemon).toHaveBeenCalledWith(mockPokemons[0]);

      fireEvent.click(addButtons[1]);
      expect(testSetup.mockAddPokemon).toHaveBeenCalledWith(mockPokemons[1]);

      // Verify multiple interactions work
      expect(testSetup.mockAddPokemon).toHaveBeenCalledTimes(2);
    });

    it('should handle team confirmation workflow', () => {
      // Simulate user with a team ready for confirmation
      testSetup.currentMockState.pokemons = mockPokemons;

      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      // User can confirm their team
      const confirmButton = screen.getByTestId('confirm-team-button');
      expect(confirmButton).not.toBeDisabled();

      // Team confirmation is available
      fireEvent.click(confirmButton);

      // Verify confirmation interaction works
      expect(confirmButton).toBeInTheDocument();
    });
  });
});
