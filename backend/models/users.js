//Modèle utilisateurs

const mongoose = require('mongoose');

//On importe le le package de validateur email unique
const uniqueValidator =require('mongoose-unique-validator')

//La méthode  Schema  de Mongoose  permet de créer un schéma de données pour la base de données MongoDB.
const userSchema = mongoose.Schema({
  email: { type: String, require: true, unique: true }, //adresse e-mail de l'utilisateur [unique]
  password: { type: String, require: true }, //mot de passe de l'utilisateur doit être haché
});

//On applique unique validator au schéma avant d'en faire un modèle avec la méthode plugin
userSchema.plugin(uniqueValidator)

//On exporte le modèle utilisateurs
//La méthode model transforme ce modèle en un modèle utilisable pour l'application express
module.exports = mongoose.model('user', userSchema)