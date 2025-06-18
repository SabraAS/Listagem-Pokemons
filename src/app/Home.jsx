import './Home.scss';

import CartSidebar from '@/components/CartSidebar';
import PokemonCard from '@/components/PokemonCard';
import { usePokemons } from '@/queries/pokemon';
import { usePokemonStore } from '@/store/pokemon';

const Home = () => {
  const { data } = usePokemons(40);
  const { pokemons, addPokemon, removePokemon, clearTeam } = usePokemonStore();

  return (
    <div className="home">
      <h1 className="home__title">Pokémons</h1>
      <div className="home__list">
        {data?.length ? (
          data.map((pokemon) => (
            <PokemonCard
              abilities={pokemon.abilities}
              characteristic={pokemon.characteristic}
              disabled={Boolean(pokemons.find((p) => p.id === pokemon.id))}
              image={pokemon.image}
              key={pokemon.id}
              name={pokemon.name}
              onClick={() => {
                addPokemon(pokemon);
              }}
              types={pokemon.types}
            />
          ))
        ) : (
          <div className="home__list-empty">
            <p>Carregando...</p>
          </div>
        )}
      </div>
      <CartSidebar
        clearTeam={clearTeam}
        pokemons={pokemons}
        removePokemon={removePokemon}
      />
    </div>
  );
};

export default Home;
