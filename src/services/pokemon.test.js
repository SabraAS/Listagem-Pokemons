import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { getPokemonList } from './pokemon';

import { mockPokemons } from '@/test/mocks/pokemon';

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
          count: 1000,
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
          species: {
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
          },
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
          species: {
            name: 'charmander',
            url: 'https://pokeapi.co/api/v2/pokemon-species/4/',
          },
        },
      };

      const mockSpeciesResponse1 = {
        data: {
          flavor_text_entries: [
            {
              flavor_text: mockPokemons[0].characteristic,
              language: { name: 'en' },
              version: {
                name: 'red',
                url: 'https://pokeapi.co/api/v2/version/1/',
              },
            },
            {
              flavor_text:
                'Une étrange graine a été plantée sur son dos à la naissance.',
              language: { name: 'fr' },
              version: {
                name: 'red',
                url: 'https://pokeapi.co/api/v2/version/1/',
              },
            },
          ],
        },
      };

      const mockSpeciesResponse2 = {
        data: {
          flavor_text_entries: [
            {
              flavor_text: mockPokemons[1].characteristic,
              language: { name: 'en' },
              version: {
                name: 'red',
                url: 'https://pokeapi.co/api/v2/version/1/',
              },
            },
            {
              flavor_text: 'Préfère évidemment les endroits chauds.',
              language: { name: 'fr' },
              version: {
                name: 'red',
                url: 'https://pokeapi.co/api/v2/version/1/',
              },
            },
          ],
        },
      };

      axios.get.mockImplementation((url) => {
        if (url === 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=2') {
          return Promise.resolve(mockPokemonListResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon/1') {
          return Promise.resolve(mockPokemon1Response);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon/4') {
          return Promise.resolve(mockPokemon2Response);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon-species/1/') {
          return Promise.resolve(mockSpeciesResponse1);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon-species/4/') {
          return Promise.resolve(mockSpeciesResponse2);
        }
        return Promise.reject(new Error('Invalid URL'));
      });

      const result = await getPokemonList({ limit: 2 });

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('pagination');

      expect(result.results).toHaveLength(2);

      expect(result.results[0]).toEqual(mockPokemons[0]);
      expect(result.results[1]).toEqual(mockPokemons[1]);

      expect(result.pagination).toEqual({
        total: 1000,
        offset: 0,
        limit: 2,
        hasMore: true,
      });

      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon?offset=0&limit=2',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/1',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon/4',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon-species/1/',
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://pokeapi.co/api/v2/pokemon-species/4/',
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
      const mockPokemonListResponse = {
        data: {
          results: [
            {
              name: 'bulbasaur',
              url: 'https://pokeapi.co/api/v2/pokemon/1',
            },
          ],
          count: 1000,
        },
      };

      const mockPokemonResponse = {
        data: {
          id: 1,
          name: 'bulbasaur',
          sprites: {
            other: {
              dream_world: {
                front_default: 'test-image.svg',
              },
            },
          },
          abilities: [],
          types: [],
          species: {
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
          },
        },
      };

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
      const mockPokemonListResponse = {
        data: {
          results: [
            {
              name: 'bulbasaur',
              url: 'https://pokeapi.co/api/v2/pokemon/1',
            },
          ],
          count: 1000,
        },
      };

      const mockPokemonResponse = {
        data: {
          id: 1,
          name: 'bulbasaur',
          sprites: {
            other: {
              dream_world: {
                front_default: 'test-image.svg',
              },
            },
          },
          abilities: [],
          types: [],
          species: {
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon-species/1/',
          },
        },
      };

      const mockSpeciesResponse = {
        data: {
          flavor_text_entries: [
            {
              flavor_text:
                'Une étrange graine a été plantée sur son dos à la naissance.',
              language: { name: 'fr' },
              version: {
                name: 'red',
                url: 'https://pokeapi.co/api/v2/version/1/',
              },
            },
          ],
        },
      };

      axios.get.mockImplementation((url) => {
        if (url === 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=20') {
          return Promise.resolve(mockPokemonListResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon/1') {
          return Promise.resolve(mockPokemonResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon-species/1/') {
          return Promise.resolve(mockSpeciesResponse);
        }
        return Promise.reject(new Error('Invalid URL'));
      });

      const result = await getPokemonList();

      expect(result.results).toHaveLength(1);
      expect(result.results[0].characteristic).toBe('');
    });

    it('should format flavor text correctly by removing line breaks and special characters', async () => {
      const mockPokemonListResponse = {
        data: {
          results: [
            {
              name: 'ditto',
              url: 'https://pokeapi.co/api/v2/pokemon/132',
            },
          ],
          count: 1000,
        },
      };

      const mockPokemonResponse = {
        data: {
          id: 132,
          name: 'ditto',
          sprites: {
            other: {
              dream_world: {
                front_default: 'test-image.svg',
              },
            },
          },
          abilities: [],
          types: [],
          species: {
            name: 'ditto',
            url: 'https://pokeapi.co/api/v2/pokemon-species/132/',
          },
        },
      };

      const mockSpeciesResponse = {
        data: {
          flavor_text_entries: [
            {
              flavor_text:
                "Capable of copying\nan enemy's genetic\ncode to instantly\ftransform itself\ninto a duplicate\nof the enemy.",
              language: { name: 'en' },
              version: {
                name: 'red',
                url: 'https://pokeapi.co/api/v2/version/1/',
              },
            },
          ],
        },
      };

      axios.get.mockImplementation((url) => {
        if (url === 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=20') {
          return Promise.resolve(mockPokemonListResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon/132') {
          return Promise.resolve(mockPokemonResponse);
        } else if (url === 'https://pokeapi.co/api/v2/pokemon-species/132/') {
          return Promise.resolve(mockSpeciesResponse);
        }
        return Promise.reject(new Error('Invalid URL'));
      });

      const result = await getPokemonList();

      expect(result.results).toHaveLength(1);
      expect(result.results[0].characteristic).toBe(
        "Capable of copying an enemy's genetic code to instantly transform itself into a duplicate of the enemy.",
      );
    });
  });
});
