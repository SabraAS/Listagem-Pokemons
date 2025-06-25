import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getPokemonList } from '@/services/pokemon';

export const usePokemons = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['pokemons', 'list'],
    queryFn: async () => {
      return getPokemonList((pokemons) => {
        queryClient.setQueryData(['pokemons', 'list'], pokemons);
      });
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};
