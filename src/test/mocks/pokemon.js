export const mockPokemons = [
  {
    id: 1,
    name: 'bulbasaur',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/1.svg',
    abilities: [
      {
        ability: {
          name: 'overgrow',
          url: 'https://pokeapi.co/api/v2/ability/65/',
        },
        is_hidden: false,
        slot: 1,
      },
      {
        ability: {
          name: 'chlorophyll',
          url: 'https://pokeapi.co/api/v2/ability/34/',
        },
        is_hidden: true,
        slot: 3,
      },
    ],
    types: [
      {
        slot: 1,
        type: {
          name: 'grass',
          url: 'https://pokeapi.co/api/v2/type/12/',
        },
      },
      {
        slot: 2,
        type: {
          name: 'poison',
          url: 'https://pokeapi.co/api/v2/type/4/',
        },
      },
    ],
    characteristic:
      'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
  },
  {
    id: 4,
    name: 'charmander',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/4.svg',
    abilities: [
      {
        ability: {
          name: 'blaze',
          url: 'https://pokeapi.co/api/v2/ability/66/',
        },
        is_hidden: false,
        slot: 1,
      },
      {
        ability: {
          name: 'solar-power',
          url: 'https://pokeapi.co/api/v2/ability/94/',
        },
        is_hidden: true,
        slot: 3,
      },
    ],
    types: [
      {
        slot: 1,
        type: {
          name: 'fire',
          url: 'https://pokeapi.co/api/v2/type/10/',
        },
      },
    ],
    characteristic:
      'Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.',
  },
];

export const mockSinglePokemon = mockPokemons[0];
