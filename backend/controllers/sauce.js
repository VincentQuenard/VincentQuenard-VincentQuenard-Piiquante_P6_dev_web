const Sauce = require('../models/sauce');

// on exporte les fonctions gérant l'affichage des sauces, la création, l'affichage d'une seule sauce, la modification et la suppression (CreateReadUpdateDelete)
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    //On récupère toutes les sauces créées présentes dans la BD
    .then((sauces) => res.status(200).json(sauces)) // on renvoie le tableau des sauces
    .catch((error) => res.status(400).json({ error: error }));
};

exports.createSauce = (req, res, next) => {
  // LE FRONT RENVOIT IL UN ID ????????
  //L'id est généré directement par mongoDB donc on retire celui du front
  delete req.body._id;

  //On récupère le modèle de sauce et on s'en sert pour créer la nouvelle sauce
  const sauce = new Sauce({
    //On utilise l'opérateur spread qui va copier les champs du body de la requête au lieu que nous ayons à les réécrire ex : req.body.name
    ...req.body,
  });
  // on enregistre cette nouvelle sauce dans la BD qui retourne une promesse
  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Nouvelle sauce enregistrée' }))
    .catch((error) => res.status(400).json({ error: error }));
};
// On récupère une sauce dans la BD (ex : l'utilisateur affiche toutes les sauces et clique une pour afficher sa page)
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // l'id de l'objet en vente est le même que celui contenu dans l'url donc que le paramètre de requête
    .then((sauce) => res.status(200).json(sauce)) // on renvoie la sauce
    .catch((error) => res.status(404).json({ error: error })); //404 objet non trouvé
};

// On veut pouvoir modifier et mettre à jour une sauce
exports.modifySauce = (req, res, next) => {
  Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({message : 'Sauce modifiée'}))
    .catch((error) => res.status(400).json({ error: error }));
};

// On veut pouvoir supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.deleteOne({ _id: req.params.id })
    .then(()=> res.status(200).json({message : 'Sauce supprimée'}))
    .catch((error) => res.status(400).json({ error: error }));
};