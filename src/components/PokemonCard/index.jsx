import PropTypes from 'prop-types';
import './index.scss';

const PokemonCard = ({
  image,
  name,
  types,
  onClick,
  abilities,
  characteristic,
  disabled = false,
}) => {
  const getAbilities = () => {
    return abilities?.length > 0
      ? abilities?.map((item) => item.ability?.name).join(', ')
      : ' não possui';
  };

  const getTypes = () => {
    return types?.length > 0
      ? types?.map((item) => item.type?.name).join(', ')
      : ' não possui';
  };

  return (
    <div className="pokemon-card">
      <img
        alt={name}
        className="pokemon-card__image"
        loading="lazy"
        src={image}
      />
      <button
        className="pokemon-card__button"
        data-testid={`add-pokemon-${name.toLowerCase()}`}
        disabled={Boolean(disabled)}
        onClick={onClick}
      >
        {disabled ? 'Indisponível' : 'Adicionar à equipe'}
      </button>
      <div className="pokemon-card__content">
        <p className="pokemon-card__name">{name}</p>
        <p className="pokemon-card__info">
          Característica: {characteristic || 'não possui'}
        </p>
        <p className="pokemon-card__info">Tipos: {getTypes()}</p>
        <p className="pokemon-card__info">Habilidades: {getAbilities()}</p>
      </div>
    </div>
  );
};

PokemonCard.propTypes = {
  characteristic: PropTypes.string,
  abilities: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  types: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default PokemonCard;
