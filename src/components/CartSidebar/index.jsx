import PropTypes from 'prop-types';

import coverPokemon from '@/assets/cover-pokemon.png';

import './index.scss';

const CartSidebar = ({ pokemons = [], onRemovePokemon, onConfirmTeam }) => {
  return (
    <aside className="cart-sidebar">
      <img
        alt="Imagem de fundo da sidebar"
        className="cart-sidebar__background"
        src={coverPokemon}
      />
      <h2 className="cart-sidebar__title">Sua equipe</h2>
      <div className="cart-sidebar__list">
        {pokemons?.length ? (
          pokemons.map((pokemon) => (
            <div
              className="cart-sidebar__item"
              key={pokemon.id || `pokemon-${pokemon.name}`}
            >
              <div className="cart-sidebar__content">
                <div className="cart-sidebar__info">
                  <div className="cart-sidebar__x">X</div>
                  <div className="cart-sidebar__name">
                    <p>{pokemon.name || 'pokémon sem nome'}</p>
                  </div>
                </div>
                <button
                  aria-label={`Remover ${pokemon.name || 'pokémon sem nome'} da equipe`}
                  className="cart-sidebar__remove-button"
                  onClick={() => onRemovePokemon(pokemon.id)}
                >
                  X
                </button>
              </div>
              <p className="cart-sidebar__characteristic">
                {pokemon.characteristic || 'Pokémon sem característica'}
              </p>
            </div>
          ))
        ) : (
          <p>Nenhum Pokémon adicionado</p>
        )}
      </div>
      <div className="cart-sidebar__footer">
        <button
          className="cart-sidebar__footer-button"
          disabled={!pokemons?.length}
          onClick={onConfirmTeam}
        >
          Confirmar Equipe
        </button>
      </div>
    </aside>
  );
};

CartSidebar.propTypes = {
  pokemons: PropTypes.array,
  onRemovePokemon: PropTypes.func.isRequired,
  onConfirmTeam: PropTypes.func.isRequired,
};

export default CartSidebar;
