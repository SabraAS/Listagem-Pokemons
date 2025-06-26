import { mockPokemons } from './pokemon';

export const mockPokemonResponse = {
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

export const mockPokemonListResponse = {
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

export const mockPokemonResponse1 = {
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

export const mockSpeciesResponse = {
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

export const mockSpeciesNoResponse = {
  data: {
    flavor_text_entries: [
      {
        flavor_text: 'Texto',
        language: { name: 'pt' },
        version: {
          name: 'red',
          url: 'https://pokeapi.co/api/v2/version/1/',
        },
      },
    ],
  },
};

export const mockPokemonResponseFormatted = {
  id: mockPokemons[0].id,
  name: mockPokemons[0].name,
  image: mockPokemons[0].image,
  abilities: mockPokemons[0].abilities,
  types: mockPokemons[0].types,
  characteristic:
    "Capable of copying an enemy's genetic code to instantly transform itself into a duplicate of the enemy.",
};
