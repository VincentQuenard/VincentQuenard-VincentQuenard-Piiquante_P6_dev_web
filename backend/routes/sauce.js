//On importe express
const express = require('express');

// On importe le middleware chargé de la sécurité des connexions utilisateur
const auth = require('../middleware/auth');

// On importe l'objet de configuration créé avec multer pour gérer les fichiers (img dans notre cas)
const multerConfig = require('../middleware/multer_config');

//la classe express.Router pour créer des gestionnaires de route
const router = express.Router();

//On importe les fonctions servant au routage
const sauceController = require('../controllers/sauce');

//routes CRUD
router.post('/', auth, multerConfig, sauceController.createSauce); //route avec utilisateur autorisé pour ajouter une sauce avec multer pour gérer les photos du site
router.put('/:id', auth, multerConfig, sauceController.modifySauce); //route avec utilisateur autorisé pour modifier une de ses sauces avec multer pour gérer les photos du site
router.delete('/:id', auth, sauceController.deleteSauce); //route avec utilisateur autorisé pour supprimer une de ses sauces du site
router.get('/:id', auth, sauceController.getOneSauce); //route avec utilisateur autorisé pour voir une sauce du site
router.get('/', auth, sauceController.getAllSauces); //route avec utilisateur autorisé pour voir toutes les sauces du site
router.post('/:id/like',auth, sauceController.likeOrDislikeSauce); // route avec utilisateur autorisé aimer ou ne pas aimer une sauce
module.exports = router;
