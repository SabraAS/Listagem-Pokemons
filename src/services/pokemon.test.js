import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { getPokemonList } from './pokemon';

import {
  mockPokemonListResponse,
  mockPokemonResponse,
  mockPokemonResponse1,
  mockPokemonResponseFormatted,
  mockSpeciesNoResponse,
  mockSpeciesResponse,
} from '@/test/mocks/services';

vi.mock('axios');

describe('Pokemon Service', () => {
  const originalConsoleError = console.log;
  beforeAll(() => {
    console.log = vi.fn();
  });

  afterAll(() => {
    console.log = originalConsoleError;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPokemonList', () => {
    test('should fetch pokemon list with correct data', async () => {
      axios.get.mockImplementation((url) => {
        if (url === 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=1') {
          return Promise.resolve(mockPokemonListResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon/1') {
          return Promise.resolve(mockPokemonResponse1);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon-species/1/') {
          return Promise.resolve(mockSpeciesResponse);
        }
        return Promise.reject(new Error('Invalid URL'));
      });

      const result = await getPokemonList({ limit: 1 });

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('pagination');

      expect(result.results).toHaveLength(1);

      expect(result.results[0]).toEqual(mockPokemonResponseFormatted);

      expect(result.pagination).toEqual({
        total: 1000,
        offset: 0,
        limit: 1,
        hasMore: true,
      });

      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon?offset=0&limit=1',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/1',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon-species/1/',
      );
    });

    it('should handle error when fetching pokemon list', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      await expect(getPokemonList()).rejects.toThrow('API Error');
      expect(console.log).toHaveBeenCalledWith(
        'Erro ao buscar lista de Pokémon',
      );
    });

    it('should handle error when fetching species description', async () => {
      axios.get.mockImplementation((url) => {
        if (url === 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=20') {
          return Promise.resolve(mockPokemonListResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon/1') {
          return Promise.resolve(mockPokemonResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon-species/1/') {
          return Promise.reject(new Error('Species API Error'));
        }
        return Promise.reject(new Error('Invalid URL'));
      });

      const result = await getPokemonList();

      expect(result.results).toHaveLength(1);
      expect(result.results[0].characteristic).toBe('');
      expect(console.log).toHaveBeenCalledWith(
        'Erro ao buscar descrição da espécie:',
        expect.any(Error),
      );
    });

    it('should return empty description when no english flavor text is found', async () => {
      axios.get.mockImplementation((url) => {
        if (url === 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=20') {
          return Promise.resolve(mockPokemonListResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon/1') {
          return Promise.resolve(mockPokemonResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon-species/1/') {
          return Promise.resolve(mockSpeciesNoResponse);
        }
        return Promise.reject(new Error('Invalid URL'));
      });

      const result = await getPokemonList();

      expect(result.results).toHaveLength(1);
      expect(result.results[0].characteristic).toBe('');
    });
  });
});
