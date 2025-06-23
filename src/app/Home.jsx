import { useState } from 'react';

import CartSidebar from '@/components/CartSidebar';
import ConfirmationModal from '@/components/ConfirmationModal';
import PokemonCard from '@/components/PokemonCard';
import { usePokemons } from '@/queries/pokemon';
import { usePokemonStore } from '@/store/pokemon';
import './Home.scss';

const Home = () => {
  const { data } = usePokemons();
  const [showModal, setShowModal] = useState(false);
  const pokemons = usePokemonStore((state) => state.pokemons);
  const addPokemon = usePokemonStore((state) => state.addPokemon);
  const removePokemonById = usePokemonStore((state) => state.removePokemonById);
  const clearTeam = usePokemonStore((state) => state.clearTeam);

  const handleAddPokemonToTeam = (id) => {
    addPokemon(data.find((pokemon) => pokemon.id === id));
  };

  const handleRemovePokemonFromTeam = (id) => {
    removePokemonById(id);
  };

  const handleConfirmTeam = () => {
    setShowModal(true);
  };

  const handleStartNewTeam = () => {
    clearTeam();
    setShowModal(false);
  };

  return (
    <div className="home">
      <h1 className="home__title">Pokémons</h1>
      <div className="home__content">
        <ul className="home__list">
          {data?.map((pokemon) => (
            <PokemonCard
              abilities={pokemon.abilities}
              addPokemon={(id) => handleAddPokemonToTeam(id)}
              characteristic={pokemon.characteristic}
              disabled={
                pokemons.find((p) => p.id === pokemon.id) ? true : false
              }
              id={pokemon.id}
              image={pokemon.image}
              key={pokemon.id}
              name={pokemon.name}
              types={pokemon.types}
            />
          ))}
        </ul>
        <CartSidebar
          onConfirmTeam={handleConfirmTeam}
          onRemovePokemon={(id) => handleRemovePokemonFromTeam(id)}
          pokemons={pokemons}
        />
      </div>
      {showModal && (
        <ConfirmationModal
          onClose={() => setShowModal(false)}
          onStartNewTeam={handleStartNewTeam}
          pokemons={pokemons}
        />
      )}
    </div>
  );
};

export default Home;
