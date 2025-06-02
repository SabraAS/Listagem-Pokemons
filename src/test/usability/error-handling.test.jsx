import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';

import {
  createTestQueryClient,
  createUsabilityTestSetup,
} from './usability-utils';

import Home from '@/app/Home';
import { usePokemons } from '@/queries/pokemon';

describe('Error Handling and Edge Cases', () => {
  let queryClient;
  let testSetup;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    testSetup = createUsabilityTestSetup();
    testSetup.resetMocks();
    queryClient.clear();
  });

  describe('Loading States', () => {
    it('should handle loading state gracefully', () => {
      usePokemons.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      // User sees consistent interface even during loading
      expect(screen.getByText('Pokémons')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-team-button')).toBeInTheDocument();
    });

    it('should maintain usability during loading states', () => {
      usePokemons.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      // User can still see the interface structure
      expect(screen.getByText('Pokémons')).toBeInTheDocument();
      expect(screen.getByText('Sua equipe')).toBeInTheDocument();

      // Core functionality remains accessible
      expect(screen.getByTestId('confirm-team-button')).toBeInTheDocument();
    });
  });

  describe('Empty Data States', () => {
    it('should handle empty data state appropriately', () => {
      usePokemons.mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      // User sees the interface structure even with no pokémons
      expect(screen.getByText('Pokémons')).toBeInTheDocument();
      expect(
        screen.getByText('Nenhum Pokémon selecionado'),
      ).toBeInTheDocument();
    });

    it('should provide clear guidance for empty states', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      // User gets clear feedback about empty team
      expect(
        screen.getByText('Nenhum Pokémon selecionado'),
      ).toBeInTheDocument();

      // User understands what action is needed
      const confirmButton = screen.getByTestId('confirm-team-button');
      expect(confirmButton).toBeDisabled();
    });
  });

  describe('User Interaction Consistency', () => {
    it('should maintain user interaction consistency', () => {
      // Setup with some available pokémons
      usePokemons.mockReturnValue({
        data: [
          { id: 1, name: 'Pikachu' },
          { id: 2, name: 'Charmander' },
        ],
        isLoading: false,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>,
      );

      // User can see and interact with available pokémons
      const addButtons = screen.getAllByText(/Adicionar/);
      expect(addButtons.length).toBe(2);

      // User interactions work consistently
      // Note: fireEvent is not imported here as we're only testing presence
      expect(addButtons[0]).toBeInTheDocument();
      expect(addButtons[1]).toBeInTheDocument();
    });
  });
});
