import PropTypes from 'prop-types';
import './index.scss';

const ConfirmationModal = ({ items, onClose, onStartNew }) => {
  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <button
          className="confirmation-modal__close-button"
          data-testid="modal-close-button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="confirmation-modal__header">
          <div className="confirmation-modal__check">✓</div>
          <h2 className="confirmation-modal__title">Equipe formada</h2>
          <p className="confirmation-modal__subtitle">
            Sua equipe está pronta!
          </p>
        </div>

        <div className="confirmation-modal__content">
          <div className="confirmation-modal__items">
            {items.map((item) => (
              <div className="confirmation-modal__item" key={item.id}>
                <img
                  alt={item.name}
                  className="confirmation-modal__item-image"
                  src={item.image}
                />
                <h3 className="confirmation-modal__item-name">{item.name}</h3>
                <span className="confirmation-modal__item-info">
                  {item.characteristic}
                </span>
              </div>
            ))}
          </div>

          <div className="confirmation-modal__total">
            <span>Total de pokemons na equipe</span>
            <span>{items.length}</span>
          </div>
        </div>

        <button
          className="confirmation-modal__button"
          data-testid="start-new-team-button"
          onClick={onStartNew}
        >
          Começar nova equipe
        </button>
      </div>
    </div>
  );
};

ConfirmationModal.propTypes = {
  items: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onStartNew: PropTypes.func.isRequired,
};

export default ConfirmationModal;
