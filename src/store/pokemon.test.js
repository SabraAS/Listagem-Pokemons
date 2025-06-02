import { describe, expect, it } from 'vitest';

import { usePokemonStore } from './pokemon';

describe('Pokemon Store', () => {
  const mockPokemon = {
    id: 1,
    name: 'Bulbasaur',
    image: 'bulbasaur.png',
    abilities: [{ ability: { name: 'overgrow' } }],
    types: [{ type: { name: 'grass' } }],
    characteristic: 'Takes plenty of siestas',
  };

  beforeEach(() => {
    usePokemonStore.setState({ pokemons: [] });
  });

  it('should initialize with empty pokemons array', () => {
    const state = usePokemonStore.getState();
    expect(state.pokemons).toEqual([]);
  });

  it('should add pokemon to the team', () => {
    const { addPokemon } = usePokemonStore.getState();
    addPokemon(mockPokemon);

    const state = usePokemonStore.getState();
    expect(state.pokemons).toHaveLength(1);
    expect(state.pokemons[0]).toEqual(mockPokemon);
  });

  it('should remove pokemon from the team', () => {
    const { addPokemon, removePokemon } = usePokemonStore.getState();

    // Adiciona dois pokémons
    addPokemon(mockPokemon);
    addPokemon({ ...mockPokemon, id: 2, name: 'Charmander' });

    // Remove um pokémon
    removePokemon(1);

    const state = usePokemonStore.getState();
    expect(state.pokemons).toHaveLength(1);
    expect(state.pokemons[0].id).toBe(2);
  });

  it('should clear the team', () => {
    const { addPokemon, clearTeam } = usePokemonStore.getState();

    // Adiciona pokémons
    addPokemon(mockPokemon);
    addPokemon({ ...mockPokemon, id: 2, name: 'Charmander' });

    // Limpa o time
    clearTeam();

    const state = usePokemonStore.getState();
    expect(state.pokemons).toEqual([]);
  });

  it('should set pokemons directly', () => {
    const { setPokemons } = usePokemonStore.getState();
    const newPokemons = [
      mockPokemon,
      { ...mockPokemon, id: 2, name: 'Charmander' },
    ];

    setPokemons(newPokemons);

    const state = usePokemonStore.getState();
    expect(state.pokemons).toEqual(newPokemons);
  });
});
