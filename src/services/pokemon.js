import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async (limit = 40) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon?limit=${limit}`);
    const pokemonList = response.data.results;

    return await Promise.all(
      pokemonList.map(async (pokemon) => {
        const pokemonData = await axios.get(pokemon.url);
        const description = await getPokemonCharacteristic(pokemonData.data.id);
        return {
          id: pokemonData.data.id,
          name: pokemonData.data.name,
          image: pokemonData.data.sprites.front_default,
          abilities: pokemonData.data.abilities,
          types: pokemonData.data.types,
          characteristic: description,
        };
      }),
    );
  } catch (error) {
    console.error('Erro ao buscar lista de Pokémon:', error);
    throw error;
  }
};

export const getPokemonCharacteristic = async (id) => {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/characteristic/${id}`,
    );
    const data = await response.json();
    const englishDescription = data.descriptions.find(
      (desc) => desc.language.name === 'en',
    );
    return englishDescription?.description || '';
  } catch (e) {
    console.error('Erro ao buscar característica do Pokémon:', e);
    return '';
  }
};
