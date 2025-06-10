import { useQuery } from '@tanstack/react-query';

import { getPokemonList } from '@/services/pokemon';

export const usePokemons = (limit = 20) => {
  return useQuery({
    queryKey: ['pokemons', 'list', limit],
    queryFn: () => getPokemonList(limit),
    retry: false,
    refetchOnWindowFocus: false,
    select: (response) => response,
  });
};
