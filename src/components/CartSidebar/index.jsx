import PropTypes from 'prop-types';

import coverPokemon from '@/assets/cover-pokemon.png';

import './index.scss';

const CartSidebar = ({ pokemons = [], onRemovePokemon, onConfirmTeam }) => {
  return (
    <aside className="cart-sidebar" data-testid="cart-sidebar">
      <img
        alt="Imagem de fundo da sidebar"
        className="cart-sidebar__background"
        data-testid="cart-sidebar-background"
        src={coverPokemon}
      />
      <h2 className="cart-sidebar__title" data-testid="cart-sidebar-title">
        Sua equipe
      </h2>
      <div className="cart-sidebar__list" data-testid="cart-sidebar-list">
        {pokemons?.length ? (
          pokemons.map((pokemon) => (
            <div
              className="cart-sidebar__item"
              data-testid={`cart-sidebar-item-${pokemon.id}`}
              key={pokemon.id || `pokemon-${pokemon.name}`}
            >
              <div
                className="cart-sidebar__content"
                data-testid={`cart-sidebar-content-${pokemon.id}`}
              >
                <div className="cart-sidebar__info">
                  <div className="cart-sidebar__x">X</div>
                  <div
                    className="cart-sidebar__name"
                    data-testid={`cart-sidebar-pokemon-name-${pokemon.id}`}
                  >
                    <p>{pokemon.name || 'pokémon sem nome'}</p>
                  </div>
                </div>
                <button
                  aria-label={`Remover ${pokemon.name || 'pokémon sem nome'} da equipe`}
                  className="cart-sidebar__remove-button"
                  data-testid={`cart-sidebar-remove-button-${pokemon.id}`}
                  onClick={() => onRemovePokemon(pokemon.id)}
                >
                  X
                </button>
              </div>
              <p
                className="cart-sidebar__characteristic"
                data-testid={`cart-sidebar-pokemon-characteristic-${pokemon.id}`}
              >
                {pokemon.characteristic || 'Pokémon sem característica'}
              </p>
            </div>
          ))
        ) : (
          <p data-testid="cart-sidebar-empty-message">
            Nenhum Pokémon adicionado
          </p>
        )}
      </div>
      <div className="cart-sidebar__footer" data-testid="cart-sidebar-footer">
        <button
          className="cart-sidebar__footer-button"
          data-testid="cart-sidebar-footer-button"
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
