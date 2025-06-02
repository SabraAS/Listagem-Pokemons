import '@/styles/App.scss';
import './Home.scss';

import CartSidebar from '@/components/CartSidebar';
import PokemonCard from '@/components/PokemonCard';
import { usePokemons } from '@/queries/pokemon';
import { usePokemonStore } from '@/store/pokemon';

function App() {
  const { data: pokemons } = usePokemons(30);
  const { pokemons: pokemonsStore, addPokemon } = usePokemonStore();

  return (
    <div className="home">
      <h1 className="home__title">Pokémons</h1>
      <div className="home__list">
        {pokemons &&
          pokemons?.map((pokemon) => (
            <PokemonCard
              abilities={pokemon.abilities}
              characteristic={pokemon.characteristic}
              disabled={Boolean(pokemonsStore.find((p) => p.id === pokemon.id))}
              image={pokemon.image}
              key={pokemon.id}
              name={pokemon.name}
              onClick={() => {
                addPokemon(pokemon);
              }}
              types={pokemon.types}
            />
          ))}
      </div>
      <CartSidebar />
    </div>
  );
}

export default App;
