import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { usePokemons } from './pokemon';

import { getPokemonList } from '@/services/pokemon';
import { mockPokemons } from '@/test/mocks/pokemon';

// Mock do serviço
vi.mock('@/services/pokemon', () => ({
  getPokemonList: vi.fn(),
}));

describe('Pokemon Queries', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('usePokemons', () => {
    it('should fetch pokemons successfully', async () => {
      getPokemonList.mockResolvedValue(mockPokemons);

      const { result } = renderHook(() => usePokemons(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      // Aguarda a resolução da query
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verifica se os dados foram carregados corretamente
      expect(result.current.data).toEqual(mockPokemons);
      expect(getPokemonList).toHaveBeenCalledWith(40);
    });

    it('should return error when fetch fails', async () => {
      const errorMessage = 'Fetch failed';
      const mockError = new Error(errorMessage);
      getPokemonList.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePokemons(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Verify error properties
      expect(result.current.error.message).toBe(errorMessage);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
