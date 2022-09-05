//Pour la sécurité d'authentification par mot de passe on a besoin de les crypter, on importe bcrypt qui va hacher le mdp
const bcrypt = require('bcrypt')
//JWT est un jeton permettant d'échanger des informations de manière sécurisée après authentification un jeton est généré
const jwToken = require('jsonwebtoken')

//On importe crypto afin de crypter l'adresse mail après inscription
const cryptojs = require('crypto-js')
require('dotenv').config();

//On importe notre modèle d'utilisateurs
const User = require('../models/User')


exports.signup = (req, res, next) => {
//On chiffre l'email 

const encryptedEmail = cryptojs
  .HmacSHA256(req.body.email, process.env.CRYPTO_SECRET_KEY_EMAIL)
  .toString();

  //On hache le mot de passe
  bcrypt
    .hash(req.body.password, 10) // on lui passe le corps de la requête passée par le frontend et combien de fois on va faire des tours pour 'hasher le mdp
    .then((hash) => {
      //on récupère le hash du mdp qu'on va enregistrer pour un nouvel utilisateur et que l'on va enregistrer dans la BD
      const user = new User({
        email: encryptedEmail, //l'adresse email est celle fournie dans le corps de la requête
        password: hash, //le mdp est celui qu l'on a hashé
      });
      user
        .save() //On utilise la méthode save() pour enregistrer le nouvel utilisateur dans la BD
        .then(()=> res.status(201).json({message : 'Nouvel utilisateur créé'})) // 201 = creation de ressources
        .catch(error => res.status(400).json({ error })); // le serveur n'a pas pu comprendre la requête à cause d'une syntaxe invalide.
    })
    .catch(error => res.status(500).json({ error })); //Le serveur a rencontré une situation qu'il ne sait pas traiter.
};

exports.login = (req, res, next) => {
  const encryptedEmail = cryptojs
    .HmacSHA256(req.body.email, process.env.CRYPTO_SECRET_KEY_EMAIL)
    .toString();
  User.findOne({ email: encryptedEmail }) //On filtre avec l'email entré par l'utilisateur dans le front
    .then((user) => {
      if (!user) {
        //l'utilisateur n'existe pas dans la BD
        return res
          .status(401)
          .json({ message: 'identifiant / mot de passe incorrect' }); //Pour la sécurité on ne dit pas que l'utilisateur n'éxiste pas, 401 = non authorisé, la requête nécessite que le client soit identifié.
      } else {
        bcrypt
          .compare(req.body.password, user.password) //on compare le mot de passe entré par l'utilisateur et celui stocké par la BD
          .then((valid) => {
            //si correspondance
            if (!valid) {
              return res
                .status(401)
                .json({ message: 'identifiant / mot de passe incorrect' });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwToken.sign(
                  // pour chiffrer un nouveau token de données
                  { userId: user._id },
                  process.env.SECRET_TOKEN, //clé secrète pour l'encodage
                  { expiresIn: '24h' } //le token expire dans 24h
                ),
              });
            }
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
