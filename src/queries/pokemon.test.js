import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { POKEMON_KEYS, usePokemons } from './pokemon';

import { getPokemonList } from '@/services/pokemon';

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

  describe('POKEMON_KEYS', () => {
    it('should generate correct query keys', () => {
      expect(POKEMON_KEYS.all).toEqual(['pokemons']);
      expect(POKEMON_KEYS.list(20)).toEqual(['pokemons', 'list', 20]);
    });
  });

  describe('usePokemons', () => {
    const mockPokemonData = [
      {
        id: 1,
        name: 'bulbasaur',
        image: 'bulbasaur.png',
        abilities: [{ ability: { name: 'overgrow' } }],
        types: [{ type: { name: 'grass' } }],
        characteristic: 'Takes plenty of siestas',
      },
    ];

    it('should fetch pokemons successfully', async () => {
      getPokemonList.mockResolvedValue(mockPokemonData);

      const { result } = renderHook(() => usePokemons(), { wrapper });

      // Inicialmente está carregando
      expect(result.current.isLoading).toBe(true);

      // Aguarda a resolução da query
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verifica se os dados foram carregados corretamente
      expect(result.current.data).toEqual(mockPokemonData);
      expect(getPokemonList).toHaveBeenCalledWith(20); // valor default
    });
  });
});
