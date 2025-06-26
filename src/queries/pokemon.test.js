import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { usePokemons } from './pokemon';

import { getPokemonList } from '@/services/pokemon';
import { mockPokemons } from '@/test/mocks/pokemon';

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
      const mockResponse = {
        results: mockPokemons,
        pagination: {
          total: 1000,
          offset: 0,
          limit: 20,
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

      expect(result.current.data.pages[0]).toEqual(mockResponse);
      expect(getPokemonList).toHaveBeenCalledWith({
        offset: 0,
        limit: 20,
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

      expect(result.current.error.message).toBe(errorMessage);
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should use custom pageSize when provided', async () => {
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

      expect(getPokemonList).toHaveBeenCalledWith({
        offset: 0,
        limit: customPageSize,
      });
    });
  });

  it('should return hasNextPage as false when pagination.hasMore is false', async () => {
    const mockResponse = {
      results: mockPokemons.slice(0, 5),
      pagination: {
        total: 1000,
        offset: 980,
        limit: 20,
        hasMore: false,
      },
    };

    getPokemonList.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePokemons(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasNextPage).toBe(false);

    const initialCallCount = getPokemonList.mock.calls.length;
    result.current.fetchNextPage();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(getPokemonList.mock.calls.length).toBe(initialCallCount);
  });
});
