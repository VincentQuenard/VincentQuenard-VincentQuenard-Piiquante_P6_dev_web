const Sauce = require('../models/sauce')

// on exporte les fonctions gérant l'affichage des sauces, la création, l'affichage d'une seule sauce, la modification et la suppression (CreateReadUpdateDelete) 
exports.getAllSauces= (req, res, next)=>{
    console.log(req.auth)
    res.status(200).json([])
}

exports.createSauce = (req, res, next) => {
  console.log(req.auth);
  res.status(200).json([]);
};

exports.getOneSauce = (req, res, next) => {
  console.log(req.auth);
  res.status(200).json([]);
};

exports.modifySauce = (req, res, next) => {
  console.log(req.auth);
  res.status(200).json([]);
};

exports.deleteSauce = (req, res, next) => {
  console.log(req.auth);
  res.status(200).json([]);
};






