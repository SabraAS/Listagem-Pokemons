import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async ({ offset = 0, limit = 20 } = {}) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`,
    );
    const pokemonList = response.data.results;
    const total = response.data.count;

    const pokemonData = await Promise.all(
      pokemonList.map(async (pokemon) => {
        const pokemonData = await axios.get(pokemon.url);

        const description = await getPokemonSpeciesDescription(
          pokemonData.data.species.url,
        );

        return {
          id: pokemonData.data.id,
          name: pokemonData.data.name,
          image: pokemonData.data.sprites?.other?.dream_world?.front_default,
          abilities: pokemonData.data.abilities,
          types: pokemonData.data.types,
          characteristic: description,
        };
      }),
    );

    return {
      results: pokemonData,
      pagination: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    console.log('Erro ao buscar lista de Pokémon');
    throw error;
  }
};

const getPokemonSpeciesDescription = async (speciesUrl) => {
  try {
    const response = await axios.get(speciesUrl);
    const data = response.data;

    const description = data.flavor_text_entries.find(
      (entry) => entry.language.name === 'en',
    );

    if (description) {
      return description.flavor_text
        .replace(/\f/g, ' ') // Remove form feed
        .replace(/\n/g, ' ') // Remove quebras de linha
        .replace(/\s+/g, ' ') // Remove espaços múltiplos
        .trim();
    }

    return '';
  } catch (error) {
    console.log('Erro ao buscar descrição da espécie:', error);
    return '';
  }
};
