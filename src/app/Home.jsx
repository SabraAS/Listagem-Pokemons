/* global IntersectionObserver */
/* global performance */
import { useEffect, useMemo, useRef, useState } from 'react';

import CartSidebar from '@/components/CartSidebar';
import ConfirmationModal from '@/components/ConfirmationModal';
import PokemonCard from '@/components/PokemonCard';
import { usePokemons } from '@/queries/pokemon';
import { usePokemonStore } from '@/store/pokemon';

import './Home.scss';

const Home = () => {
  const pokemonsPerPage = useMemo(() => {
    const width = window.innerWidth;

    if (width > 3000) {
      return 44;
    } else if (width > 2200 && width <= 3000) {
      return 28;
    } else if (width > 1420 && width <= 1700) {
      return 16;
    } else if (width < 1420) {
      return 8;
    }
    return 20;
  }, []);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    usePokemons(pokemonsPerPage);
  const [showModal, setShowModal] = useState(false);
  const pokemons = usePokemonStore((state) => state.pokemons);
  const addPokemon = usePokemonStore((state) => state.addPokemon);
  const removePokemonById = usePokemonStore((state) => state.removePokemonById);
  const clearTeam = usePokemonStore((state) => state.clearTeam);

  const flattenedPokemons = data?.pages?.flatMap((page) => page.results) || [];

  const observerRef = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver não suportado neste navegador');
      return;
    }

    // Configurar o Intersection Observer para detectar quando o usuário chega ao final da lista
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    // Observar o elemento de carregamento
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleAddPokemonToTeam = (id) => {
    const pokemon = flattenedPokemons.find((pokemon) => pokemon.id === id);
    if (pokemon) {
      addPokemon(pokemon);
    }
  };

  const handleRemovePokemonFromTeam = (id) => {
    removePokemonById(id);
  };

  const handleStartNewTeam = () => {
    clearTeam();
    setShowModal(false);
  };

  useEffect(() => {
    performance.mark('page-load-start');
  }, []);

  useEffect(() => {
    if (!isLoading && data?.pages?.[0]) {
      performance.mark('page-load-end');
      performance.measure('page-load-time', 'page-load-start', 'page-load-end');
    }
  }, [isLoading, data]);

  return (
    <div className="home">
      <h1 className="home__title" data-testid="home-title">
        Pokémons
      </h1>
      <div className="home__content">
        <ul className="home__list">
          {flattenedPokemons?.length > 0 ? (
            <>
              {flattenedPokemons.map((pokemon) => (
                <li key={pokemon.id}>
                  <PokemonCard
                    abilities={pokemon.abilities}
                    addPokemon={(id) => handleAddPokemonToTeam(id)}
                    characteristic={pokemon.characteristic}
                    disabled={
                      pokemons.find((p) => p.id === pokemon.id) ? true : false
                    }
                    id={pokemon.id}
                    image={pokemon.image}
                    name={pokemon.name}
                    types={pokemon.types}
                  />
                </li>
              ))}

              {/* Elemento observado para carregar mais itens */}
              <li key="loader">
                <div
                  className="home__loader"
                  data-testid="loader"
                  ref={observerRef}
                >
                  {isFetchingNextPage && 'Carregando mais Pokémons...'}
                </div>
              </li>
            </>
          ) : (
            <div className="home__loading">
              {isLoading ? 'Carregando...' : 'Nenhum Pokémon encontrado'}
            </div>
          )}
        </ul>
        <CartSidebar
          onConfirmTeam={() => setShowModal(true)}
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
