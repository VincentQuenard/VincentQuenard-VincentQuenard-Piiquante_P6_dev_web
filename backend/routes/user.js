//On importe express
const express = require('express');

//la classe express.Router pour créer des gestionnaires de route
const router = express.Router();

//on importe les fonctions créées dans le dossier controllers pour la sécurisation du serveur de connexion des utilisateurs
const userController = require('../controllers/user');

//on importe le middleware de complexité demandée du mdp au signup
const complexPassword = require('../middleware/password');

//On ajoute le middleware de la compléxité requise de mdp sur la route signup 
router.post('/signup',complexPassword, userController.signup);
router.post('/login', userController.login);

module.exports = router;
