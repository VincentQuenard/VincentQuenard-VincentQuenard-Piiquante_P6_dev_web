//On importe express
const express = require('express');

//la classe express.Router pour créer des gestionnaires de route
const router = express.Router();

// On importe le middleware chargé de la sécurité des connexions utilisateur
const authorize = require('../middleware/authorize');

// On importe l'objet de configuration créé avec multer pour gérer les fichiers (img dans notre cas)
const multerConfig = require('../middleware/multer_config');

//On importe les fonctions servant au routage
const sauceController = require('../controllers/sauce');

//routes CRUD
router.get('/', authorize, sauceController.getAllSauces); //route avec utilisateur autorisé pour voir toutes les sauces du site
router.post('/', authorize, multerConfig, sauceController.createSauce); //route avec utilisateur autorisé pour ajouter une sauce avec multer pour gérer les photos du site
router.get('/:id', authorize, sauceController.getOneSauce); //route avec utilisateur autorisé pour voir une sauce du site
router.put('/:id', authorize, multerConfig, sauceController.modifySauce); //route avec utilisateur autorisé pour modifier une de ses sauces avec multer pour gérer les photos du site
router.delete('/:id', authorize, sauceController.deleteSauce); //route avec utilisateur autorisé pour supprimer une de ses sauces du site

module.exports = router;
