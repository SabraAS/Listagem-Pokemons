import PropTypes from 'prop-types';

import './index.scss';

const ConfirmationModal = ({ pokemons = [], onClose, onStartNewTeam }) => {
  return (
    <div
      aria-label="Modal de confirmação de equipe"
      aria-modal="true"
      className="confirmation-modal"
      data-testid="confirmation-modal"
      role="dialog"
    >
      <div className="confirmation-modal__content">
        <button
          aria-label="Fechar modal"
          className="confirmation-modal__close-button"
          data-testid="confirmation-modal-close-button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="confirmation-modal__header">
          <div
            className="confirmation-modal__check"
            data-testid="confirmation-modal-check"
          >
            ✓
          </div>
          <h2
            className="confirmation-modal__title"
            data-testid="confirmation-modal-title"
          >
            Equipe formada
          </h2>
          <p
            className="confirmation-modal__subtitle"
            data-testid="confirmation-modal-subtitle"
          >
            Sua equipe está pronta!
          </p>
        </div>
        <div
          className="confirmation-modal__list"
          data-testid="confirmation-modal-list"
        >
          {pokemons?.map((pokemon) => (
            <div className="confirmation-modal__item" key={pokemon.id}>
              <div className="confirmation-modal__info">
                <img
                  alt={`Imagem do ${pokemon?.name || 'pokémon'}`}
                  className="confirmation-modal__image"
                  data-testid={`confirmation-modal-pokemon-image-${pokemon?.id}`}
                  src={pokemon?.image || ''}
                />
                <p
                  className="confirmation-modal__name"
                  data-testid={`confirmation-modal-pokemon-name-${pokemon?.id}`}
                >
                  {pokemon?.name || 'pokémon sem nome'}
                </p>
              </div>
              <p
                className="confirmation-modal__characteristic"
                data-testid={`confirmation-modal-pokemon-characteristic-${pokemon?.id}`}
              >
                {pokemon?.characteristic || 'não possui característica'}
              </p>
            </div>
          ))}
        </div>
        <div className="confirmation-modal__footer">
          <div className="confirmation-modal__total">
            <p>Total de pokémons na equipe:</p>
            <p data-testid="confirmation-modal-total">
              {pokemons?.length || 0}
            </p>
          </div>
          <button
            className="confirmation-modal__button"
            data-testid="confirmation-modal-button"
            onClick={onStartNewTeam}
          >
            Começar nova equipe
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmationModal.propTypes = {
  pokemons: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onStartNewTeam: PropTypes.func.isRequired,
};

export default ConfirmationModal;
