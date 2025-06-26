import { mockPokemons } from './pokemon';

export const mockUsePokemonsResponse = {
  results: mockPokemons,
  pagination: {
    total: 1000,
    offset: 0,
    limit: 20,
    hasMore: true,
  },
};

export const mockUsePokemonsResponseCustomValue = {
  results: mockPokemons,
  pagination: {
    total: 1000,
    offset: 0,
    limit: 10,
    hasMore: true,
  },
};

export const mockResponseNoMorePokemons = {
  results: mockPokemons.slice(0, 5),
  pagination: {
    total: 1000,
    offset: 980,
    limit: 20,
    hasMore: false,
  },
};
