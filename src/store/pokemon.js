import { create } from 'zustand';

export const usePokemonStore = create((set) => ({
  pokemons: [],
  setPokemons: (pokemons) => set({ pokemons }),
  addPokemon: (pokemon) =>
    set((state) => ({ pokemons: [...state.pokemons, pokemon] })),
  removePokemon: (pokemonId) =>
    set((state) => ({
      pokemons: state.pokemons.filter((pokemon) => pokemon.id !== pokemonId),
    })),
  clearTeam: () => set({ pokemons: [] }),
}));
