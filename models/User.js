const mongoose = require('mongoose');
require('mongoose-type-email');
const uniqueValidator = require('mongoose-unique-validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const MongooseErrors = require('mongoose-errors');
mongoose.plugin(mongodbErrorHandler);

/* Schéma utilisateur */
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true, match: [/^([\w-.]+@([\w-]+.)+[\w-]{2,4})?$/,] },
    password: { type: String, required: true }
});

/* Empeche la création de plusieurs comptes avec le même mail */
userSchema.plugin(uniqueValidator);

/* Permet de personnaliser les messages d'erreur générés par Mongoose lors de la validation des données 
et fourni des messages d'erreur mieux détaillés */
userSchema.plugin(MongooseErrors);
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);