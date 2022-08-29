//On importe express
const express = require('express');

//la classe express.Router pour créer des gestionnaires de route
const router = express.Router();

//on importe les fonctions créées dans le dossier controllers pour la sécurisation du serveur de connexion des utilisaterus
const userController = require('../controllers/user')

router.post('/signup', userController.signup);
router.post('/login', userController.login);

module.exports = router;
