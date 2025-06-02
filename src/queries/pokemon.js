import { useQuery } from '@tanstack/react-query';

import { getPokemonList } from '@/services/pokemon';

export const POKEMON_KEYS = {
  all: ['pokemons'],
  list: (limit) => [...POKEMON_KEYS.all, 'list', limit],
};

export const usePokemons = (limit = 20) => {
  return useQuery({
    queryKey: POKEMON_KEYS.list(limit),
    queryFn: () => getPokemonList(limit),
    retry: false,
    refetchOnWindowFocus: false,
    select: (response) => response,
  });
};
