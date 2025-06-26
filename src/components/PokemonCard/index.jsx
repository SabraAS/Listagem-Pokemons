import PropTypes from 'prop-types';

import coverPokemon from '@/assets/cover-pokemon.png';
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
    values?.length
      ? values
          .map((item) => item?.type?.name || item?.ability?.name)
          .filter(Boolean)
          .join(', ')
      : 'não possui';

  return (
    <div className="pokemon-card" data-testid="pokemon-card">
      <img
        alt={`Imagem do ${name || 'pokémon'}`}
        className="pokemon-card__image"
        data-testid="pokemon-card-image"
        src={image || coverPokemon}
      />
      <button
        aria-label={
          disabled
            ? `${name || 'pokémon'} indisponível`
            : `Adicionar ${name || 'pokémon'} à equipe`
        }
        className="pokemon-card__button"
        data-testid={`pokemon-card-button-${id}`}
        disabled={disabled}
        onClick={() => addPokemon(id || name)}
      >
        {disabled ? 'Indisponível' : 'Adicionar à equipe'}
      </button>
      <h2 className="pokemon-card__name" data-testid="pokemon-card-name">
        {name || 'pokémon sem nome'}
      </h2>
      <div className="pokemon-card__info">
        <p
          className="pokemon-card__text"
          data-testid="pokemon-card-characteristic"
        >
          Característica: {characteristic || 'não possui'}
        </p>
        <p className="pokemon-card__text" data-testid="pokemon-card-abilities">
          Habilidades: {getValues(abilities)}
        </p>
        <p className="pokemon-card__text" data-testid="pokemon-card-types">
          Tipos: {getValues(types)}
        </p>
      </div>
    </div>
  );
};

PokemonCard.propTypes = {
  addPokemon: PropTypes.func.isRequired,
  abilities: PropTypes.array,
  characteristic: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.number,
  image: PropTypes.string,
  name: PropTypes.string,
  types: PropTypes.array,
};

export default PokemonCard;
