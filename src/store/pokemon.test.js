import { describe, expect, it } from 'vitest';

import { usePokemonStore } from './pokemon';

import { mockPokemons } from '@/test/mocks/pokemon';

describe('Pokemon Store', () => {
  const mockPokemon = mockPokemons[0];

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
    const { addPokemon, removePokemonById } = usePokemonStore.getState();

    // Adiciona dois pokémons
    addPokemon(mockPokemon);
    addPokemon(mockPokemons[1]);

    // Remove um pokémon
    removePokemonById(1);

    const state = usePokemonStore.getState();
    expect(state.pokemons).toHaveLength(1);
    expect(state.pokemons[0].id).toBe(4);
  });

  it('should clear the team', () => {
    const { addPokemon, clearTeam } = usePokemonStore.getState();

    // Adiciona pokémons
    addPokemon(mockPokemon);
    addPokemon(mockPokemons[1]);

    // Limpa o time
    clearTeam();

    const state = usePokemonStore.getState();
    expect(state.pokemons).toEqual([]);
  });
});
