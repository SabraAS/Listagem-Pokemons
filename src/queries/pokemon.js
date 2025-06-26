import { useInfiniteQuery } from '@tanstack/react-query';

import { getPokemonList } from '@/services/pokemon';

export const usePokemons = (pageSize = 20) => {
  return useInfiniteQuery({
    queryKey: ['pokemons', 'infinite', pageSize],
    queryFn: ({ pageParam = 0 }) =>
      getPokemonList({
        offset: pageParam,
        limit: pageSize,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasMore) return undefined;
      return lastPage.pagination.offset + lastPage.pagination.limit;
    },
    initialPageParam: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
