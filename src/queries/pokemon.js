import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getPokemonList } from '@/services/pokemon';

export const usePokemons = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['pokemons', 'list'],
    queryFn: async () => {
      // Inicia o carregamento com callback para atualizar o cache
      return getPokemonList((pokemons) => {
        queryClient.setQueryData(['pokemons', 'list'], pokemons);
      });
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};
