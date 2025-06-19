import PropTypes from 'prop-types';
import './index.scss';

const CartSidebar = ({ pokemons, onRemovePokemon, onConfirmTeam }) => {
  return (
    <aside className="cart-sidebar">
      <div className="cart-sidebar__background" />
      <h2 className="cart-sidebar__title">Sua equipe</h2>
      <div className="cart-sidebar__list">
        {pokemons.length > 0 ? (
          pokemons.map((pokemon) => (
            <div className="cart-sidebar__item" key={pokemon.id}>
              <div className="cart-sidebar__content">
                <div className="cart-sidebar__info">
                  <div className="cart-sidebar__x">X</div>
                  <div className="cart-sidebar__name">
                    <p>{pokemon.name}</p>
                  </div>
                </div>
                <button
                  aria-label={`Remover ${pokemon.name} da equipe`}
                  className="cart-sidebar__remove-button"
                  onClick={() => onRemovePokemon(pokemon.id)}
                >
                  X
                </button>
              </div>
              <p className="cart-sidebar__characteristic">
                {pokemon.characteristic}
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
          disabled={pokemons.length === 0}
          onClick={onConfirmTeam}
        >
          Confirmar Equipe
        </button>
      </div>
    </aside>
  );
};

CartSidebar.propTypes = {
  pokemons: PropTypes.array.isRequired,
  onRemovePokemon: PropTypes.func.isRequired,
  onConfirmTeam: PropTypes.func.isRequired,
};

export default CartSidebar;
