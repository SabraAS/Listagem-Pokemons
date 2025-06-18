import PropTypes from 'prop-types';
import './index.scss';

const PokemonCard = ({
  abilities,
  addPokemon,
  characteristic,
  disabled,
  id,
  image,
  name,
  types,
}) => {
  const getValues = (values) =>
    values
      .map((item) => item.type?.name || item.ability?.name)
      .filter(Boolean)
      .join(', ');

  return (
    <div className="pokemon-card">
      <img alt={name} className="pokemon-card__image" src={image} />
      <button
        className="pokemon-card__button"
        disabled={disabled}
        onClick={() => addPokemon(id)}
      >
        {disabled ? 'Indisponível' : 'Adicionar à equipe'}
      </button>
      <p className="pokemon-card__name">{name}</p>
      <div className="pokemon-card__info">
        <p className="pokemon-card__text">Característica: {characteristic}</p>
        <p className="pokemon-card__text">
          Habilidades: {getValues(abilities)}
        </p>
        <p className="pokemon-card__text">Tipos: {getValues(types)}</p>
      </div>
    </div>
  );
};

PokemonCard.propTypes = {
  addPokemon: PropTypes.func.isRequired,
  abilities: PropTypes.array.isRequired,
  characteristic: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  id: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  types: PropTypes.array.isRequired,
};

export default PokemonCard;
