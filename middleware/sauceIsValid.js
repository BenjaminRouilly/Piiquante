const isValid = require('mongoose-validator');

exports.nameValidator = [
  isValid({
    validator: 'isLength',
    arguments: [3, 20],
    message: 'Le nom de la sauce doit contenir entre 3 et 20 caractère ',
  }),

  isValid({
    validator: 'matches',
    arguments: /^[a-z\d-_\s]+$/i,
    message: "Le nom de la sauce ne peut contenir que des chiffres et des lettres",
  }),
];

exports.manufacturerValidator = [
  isValid({
    validator: 'isLength',
    arguments: [3, 20],
    message: 'Le nom de la sauce doit contenir entre 3 et 20 caractère ',
  }),


  isValid({
    validator: 'matches',
    arguments: /^[a-z\d-_\s]+$/i,
    message: "Le nom de la sauce ne peut contenir que des chiffres et des lettres",
  }),
];
exports.descriptionValidator = [
  isValid({
    validator: 'isLength',
    arguments: [10, 200],
    message: 'La description de la sauce doit contenir entre 10 et 200 caractères',
  }),
  isValid({
    validator: 'matches',
    arguments: /^[a-z\d-\s]+$/i,
    message: "La description ne peut contenir que des chiffres et des lettres",
  }),
];

exports.pepperValidator = [
  isValid({
    validator: 'isLength',
    arguments: [3, 20],
    message: 'Le pepper doit contenir entre 3 et 20 caractères',
  }),
  isValid({
    validator: 'matches',
    arguments: /^[a-z\d-\s]+$/i,
    message: "L'ingrédient principal ne peut contenir que des chiffres et des lettres",
  }),
];