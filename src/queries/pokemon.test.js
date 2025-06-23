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
      // Mock do retorno com o formato correto (results e pagination)
      const mockResponse = {
        results: mockPokemons,
        pagination: {
          total: 1000,
          offset: 0,
          limit: 21,
          hasMore: true,
        },
      };

      getPokemonList.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePokemons(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      // Aguarda a resolução da query
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verifica se os dados foram carregados corretamente
      expect(result.current.data.pages[0]).toEqual(mockResponse);
      expect(getPokemonList).toHaveBeenCalledWith({
        offset: 0,
        limit: 21,
      });
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

    it('should use custom pageSize when provided', async () => {
      // Mock do retorno com o formato correto (results e pagination)
      const mockResponse = {
        results: mockPokemons,
        pagination: {
          total: 1000,
          offset: 0,
          limit: 10,
          hasMore: true,
        },
      };

      getPokemonList.mockResolvedValue(mockResponse);

      const customPageSize = 10;
      const { result } = renderHook(() => usePokemons(customPageSize), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verifica se os parâmetros corretos foram passados
      expect(getPokemonList).toHaveBeenCalledWith({
        offset: 0,
        limit: customPageSize,
      });
    });
  });

  it('should return hasNextPage as false when pagination.hasMore is false', async () => {
    // Mock response with hasMore set to false
    const mockResponse = {
      results: mockPokemons.slice(0, 5), // Simulating last few items
      pagination: {
        total: 1000,
        offset: 980,
        limit: 21,
        hasMore: false, // This is the key property we're testing
      },
    };

    getPokemonList.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePokemons(), { wrapper });

    // Wait for query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify that hasNextPage is false when hasMore is false
    expect(result.current.hasNextPage).toBe(false);

    // Test the fetchNextPage function - it should not call getPokemonList again
    const initialCallCount = getPokemonList.mock.calls.length;
    result.current.fetchNextPage();

    // Wait a moment and verify getPokemonList wasn't called again
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(getPokemonList.mock.calls.length).toBe(initialCallCount);
  });
});
