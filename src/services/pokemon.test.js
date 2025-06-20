import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { getPokemonCharacteristic, getPokemonList } from './pokemon';

import { mockPokemons } from '@/test/mocks/pokemon';

// Mock do axios
vi.mock('axios');

describe('Pokemon Service', () => {
  // Mock do console.log
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
      // Mock das chamadas de API
      const mockPokemonListResponse = {
        data: {
          results: [
            {
              name: 'bulbasaur',
              url: 'https://pokeapi.co/api/v2/pokemon/1',
            },
            {
              name: 'charmander',
              url: 'https://pokeapi.co/api/v2/pokemon/4',
            },
          ],
        },
      };

      const mockPokemon1Response = {
        data: {
          id: mockPokemons[0].id,
          name: mockPokemons[0].name,
          sprites: {
            other: {
              dream_world: {
                front_default: mockPokemons[0].image,
              },
            },
          },
          abilities: mockPokemons[0].abilities,
          types: mockPokemons[0].types,
        },
      };

      const mockPokemon2Response = {
        data: {
          id: mockPokemons[1].id,
          name: mockPokemons[1].name,
          sprites: {
            other: {
              dream_world: {
                front_default: mockPokemons[1].image,
              },
            },
          },
          abilities: mockPokemons[1].abilities,
          types: mockPokemons[1].types,
        },
      };

      // Mock characteristic for bulbasaur
      const mockCharacteristicResponse1 = {
        data: {
          descriptions: [
            {
              description: mockPokemons[0].characteristic,
              language: { name: 'en' },
            },
          ],
        },
      };

      // Mock characteristic for charmander
      const mockCharacteristicResponse2 = {
        data: {
          descriptions: [
            {
              description: mockPokemons[1].characteristic,
              language: { name: 'en' },
            },
          ],
        },
      };

      axios.get.mockImplementation((url) => {
        if (url === 'https://pokeapi.co/api/v2/pokemon?limit=2') {
          return Promise.resolve(mockPokemonListResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon/1') {
          return Promise.resolve(mockPokemon1Response);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon/4') {
          return Promise.resolve(mockPokemon2Response);
        } else if (url === 'https://pokeapi.co/api/v2/characteristic/1') {
          return Promise.resolve(mockCharacteristicResponse1);
        } else if (url === 'https://pokeapi.co/api/v2/characteristic/4') {
          return Promise.resolve(mockCharacteristicResponse2);
        }
        return Promise.reject(new Error('Invalid URL'));
      });

      const result = await getPokemonList(2);

      // Verifica se a lista tem o tamanho correto
      expect(result).toHaveLength(2);

      // Verifica se os dados do pokémon estão corretos
      expect(result[0]).toEqual(mockPokemons[0]);
      expect(result[1]).toEqual(mockPokemons[1]);

      // Verifica se as chamadas foram feitas corretamente
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon?limit=2',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/1',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/4',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/characteristic/1',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/characteristic/4',
      );
    });

    it('should handle error when fetching pokemon list', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      await expect(getPokemonList()).rejects.toThrow('API Error');
      expect(console.log).toHaveBeenCalledWith(
        'Erro ao buscar lista de Pokémon',
      );
    });
  });

  describe('getPokemonCharacteristic', () => {
    it('should fetch pokemon characteristic correctly', async () => {
      const mockResponse = {
        data: {
          descriptions: [
            {
              description: mockPokemons[0].characteristic,
              language: { name: 'en' },
            },
            {
              description: 'Dorme bastante',
              language: { name: 'pt' },
            },
          ],
        },
      };

      axios.get.mockImplementation(() => Promise.resolve(mockResponse));

      const result = await getPokemonCharacteristic(1);
      expect(result).toBe(mockPokemons[0].characteristic);

      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/characteristic/1',
      );
    });

    it('should return text não possui when characteristic is not found', async () => {
      axios.get.mockRejectedValue(new Error('Not found'));

      const result = await getPokemonCharacteristic(999);
      expect(console.log).toHaveBeenCalledWith(
        'Erro ao buscar característica do Pokémon',
      );
      expect(result).toBe('não possui');
    });

    it('should return text não possui when english description is not found', async () => {
      const mockResponse = {
        data: {
          descriptions: [
            {
              description: 'Dorme bastante',
              language: { name: 'pt' },
            },
          ],
        },
      };

      axios.get.mockImplementation(() => Promise.resolve(mockResponse));

      const result = await getPokemonCharacteristic(1);
      expect(result).toBe('não possui');
    });
  });
});
