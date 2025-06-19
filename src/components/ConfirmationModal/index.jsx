import PropTypes from 'prop-types';

import './index.scss';

const ConfirmationModal = ({ pokemons, onClose, onStartNewTeam }) => {
  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="confirmation-modal"
      role="dialog"
    >
      <div className="confirmation-modal__content">
        <button
          aria-label="Fechar modal"
          className="confirmation-modal__close-button"
          data-testid="modal-close-button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="confirmation-modal__header">
          <div className="confirmation-modal__check">✓</div>
          <h2 className="confirmation-modal__title" id="modal-title">
            Equipe formada
          </h2>
          <p className="confirmation-modal__subtitle">
            Sua equipe está pronta!
          </p>
        </div>
        <div className="confirmation-modal__list">
          {pokemons.map((pokemon) => (
            <div className="confirmation-modal__item" key={pokemon.id}>
              <div className="confirmation-modal__info">
                <img
                  alt={`Imagem do ${pokemon.name}`}
                  className="confirmation-modal__image"
                  src={pokemon.image}
                />
                <p className="confirmation-modal__name">{pokemon.name}</p>
              </div>
              <p className="confirmation-modal__characteristic">
                {pokemon.characteristic}
              </p>
            </div>
          ))}
        </div>
        <div className="confirmation-modal__footer">
          <div className="confirmation-modal__total">
            <p>Total de pokémons na equipe:</p>
            <p>{pokemons.length}</p>
          </div>
          <button
            className="confirmation-modal__button"
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
  pokemons: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onStartNewTeam: PropTypes.func.isRequired,
};

export default ConfirmationModal;
