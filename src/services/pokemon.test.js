import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { getPokemonCharacteristic, getPokemonList } from './pokemon';

// Mock do axios
vi.mock('axios');

describe('Pokemon Service', () => {
  // Mock do console.error
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPokemonList', () => {
    const mockPokemonListResponse = {
      data: {
        results: [
          { url: 'https://pokeapi.co/api/v2/pokemon/1' },
          { url: 'https://pokeapi.co/api/v2/pokemon/2' },
        ],
      },
    };

    const mockPokemonData = {
      data: {
        id: 1,
        name: 'bulbasaur',
        abilities: [{ ability: { name: 'overgrow' } }],
        types: [{ type: { name: 'grass' } }],
        sprites: {
          back_default:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
          front_default:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
          other: {
            'official-artwork': {
              front_default:
                'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
              front_shiny:
                'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/1.png',
            },
          },
        },
      },
    };

    const mockCharacteristic = {
      descriptions: [
        {
          description: 'Takes plenty of siestas',
          language: { name: 'en' },
        },
      ],
    };

    test('should fetch pokemon list with correct data', async () => {
      // Mock das chamadas de API
      axios.get.mockImplementation((url) => {
        if (url.includes('pokemon?limit=')) {
          return Promise.resolve(mockPokemonListResponse);
        }
        if (url.includes('pokemon/')) {
          return Promise.resolve(mockPokemonData);
        }
        return Promise.reject(new Error('Invalid URL'));
      });

      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockCharacteristic),
        }),
      );

      const result = await getPokemonList(2);

      // Verifica se a lista tem o tamanho correto
      expect(result).toHaveLength(2);

      // Verifica se os dados do pokémon estão corretos
      expect(result[0]).toEqual({
        id: 1,
        name: 'bulbasaur',
        image:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
        abilities: [{ ability: { name: 'overgrow' } }],
        types: [{ type: { name: 'grass' } }],
        characteristic: 'Takes plenty of siestas',
      });

      // Verifica se as chamadas foram feitas corretamente
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon?limit=2',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/1',
      );
    });

    it('should handle error when fetching pokemon list', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      await expect(getPokemonList()).rejects.toThrow('API Error');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getPokemonCharacteristic', () => {
    it('should fetch pokemon characteristic correctly', async () => {
      const mockResponse = {
        descriptions: [
          {
            description: 'Takes plenty of siestas',
            language: { name: 'en' },
          },
          {
            description: 'Dorme bastante',
            language: { name: 'pt' },
          },
        ],
      };

      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        }),
      );

      const result = await getPokemonCharacteristic(1);
      expect(result).toBe('Takes plenty of siestas');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/characteristic/1',
      );
    });

    it('should return empty string when characteristic is not found', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Not found'));

      const result = await getPokemonCharacteristic(999);
      expect(result).toBe('');
    });

    it('should return null when english description is not found', async () => {
      const mockResponse = {
        descriptions: [
          {
            description: 'Dorme bastante',
            language: { name: 'pt' },
          },
        ],
      };

      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockResponse),
        }),
      );

      const result = await getPokemonCharacteristic(1);
      expect(result).toBeNull();
    });
  });
});
