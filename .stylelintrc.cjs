module.exports = {
  ignoreFiles: [
    'node_modules/**/*', // Ignora arquivos dentro do diretório node_modules
    'dist/**/*', // Ignora arquivos dentro do diretório dist
  ],
  plugins: [
    'stylelint-order', // Plugin para especificar a ordem das propriedades
  ],
  extends: [
    'stylelint-config-standard-scss', // Configuração padrão para SCSS
    'stylelint-prettier/recommended', // Executa o Prettier como uma regra do Stylelint
  ],
  rules: {
    'at-rule-no-unknown': null, // Desabilita a regra para at-rules desconhecidas
    'scss/at-rule-no-unknown': true, // Habilita a verificação de at-rules do SCSS
    'max-nesting-depth': 5, // Limita a profundidade de aninhamento
    'selector-max-compound-selectors': 5, // Limita o número de seletores compostos
    'order/properties-alphabetical-order': true, // Ordena as propriedades CSS em ordem alfabética
    'no-descending-specificity': null, // Desabilita a regra de especificidade descendente
    'scss/dollar-variable-pattern':
      '^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*(__[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)?(--[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)?$', // Habilita o BEM Two Dashed Style
    'custom-property-pattern':
      '^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*(__[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)?(--[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)?$', // Habilita o BEM Two Dashed Style
    'selector-class-pattern':
      '^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*(__[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)?(--[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)?$', // Habilita o BEM Two Dashed Style
  },
};