import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async (onUpdate) => {
  try {
    // Primeiro, descobre quantos Pokémon existem na API
    const countResponse = await axios.get(`${BASE_URL}/pokemon`);
    const totalPokemon = countResponse.data.count; /* 100 */

    const results = [];

    for (let i = 1; i <= totalPokemon; i++) {
      const data = await axios.get(`${BASE_URL}/pokemon/${i}`);
      const description = await getPokemonCharacteristic(data.data.id);

      const pokemonData = {
        id: data.data.id,
        name: data.data.name,
        image: data.data.sprites.other['official-artwork'].front_default,
        abilities: data.data.abilities,
        types: data.data.types,
        characteristic: description,
      };

      results.push(pokemonData);

      // Chama o callback com os dados atualizados
      if (onUpdate) {
        onUpdate([...results]);
      }
    }
    return results;
  } catch (error) {
    console.error('Erro ao buscar lista de Pokémon:', error);
    throw error;
  }
};

export const getPokemonCharacteristic = async (id) => {
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/characteristic/${id}`,
    );
    const data = response?.data;
    const englishDescription = data?.descriptions?.find(
      (desc) => desc?.language?.name === 'en',
    );
    return englishDescription?.description || '';
  } catch (error) {
    console.error('Erro ao buscar característica do Pokémon:', error);
    return '';
  }
};
