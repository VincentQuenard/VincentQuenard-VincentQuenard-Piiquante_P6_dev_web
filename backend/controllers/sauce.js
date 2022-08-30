const Sauce = require('../models/Sauce');
// On importe fs : Le module de système de fichiers Node.js vous permet de travailler avec le système de fichiers de votre ordinateur.
const fs = require('fs');

// on exporte les fonctions gérant l'affichage des sauces, la création, l'affichage d'une seule sauce, la modification et la suppression (CreateReadUpdateDelete)
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    //On récupère toutes les sauces créées présentes dans la BD
    .then((sauces) => res.status(200).json(sauces)) // on renvoie le tableau des sauces
    .catch((error) => res.status(400).json({ error }));
};
// on exporte les fonctions pour créer des sauces
exports.createSauce = (req, res, next) => {
  /*// LE FRONT RENVOIT IL UN ID ????????
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
    .catch((error) => res.status(400).json({ error }));*/

  const sauceObject = JSON.parse(req.body.sauce); //on parse la requête qui est une chaine de caractère pour en faire un objet js
  delete sauceObject._id; // on supprime l'id car il est généré automatiquement par a BD
  delete sauceObject._userId; // on supprime le userId par sécurité d'usurpation d'identité
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId, //on utilise le userID contenu dans le token pour être sur qu'il s'agit bien de la personne connectée
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
  });

  sauce
    .save()
    .then((error, result) => {
      res.status(201).json({ message: 'Nouvelle sauce enregistrée' });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// On récupère une sauce dans la BD (ex : l'utilisateur affiche toutes les sauces et clique une pour afficher sa page)
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // l'id de l'objet en vente est le même que celui contenu dans l'url donc que le paramètre de requête
    .then((sauce) => res.status(200).json(sauce)) // on renvoie la sauce
    .catch((error) => res.status(404).json({ error })); //404 objet non trouvé
};

// On veut pouvoir modifier et mettre à jour une sauce
exports.modifySauce = (req, res, next) => {
  /* Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
    .catch((error) => res.status(400).json({ error }));*/
  const sauceObject = req.file
    ? {
        //nous regardons dans notre requête s'il y a un champ file donc une image
        ...JSON.parse(req.body.sauce), // on parse la reqête et on ajoute le chemin de l'image comme pour la création d'une sauce
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body }; // sinon on recupère le corps de la requête

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id }) //on récupère la sauce dans la BD
    .then((sauce) => {
      // on va vérifier si la sauce appartient bien à l'utilisateur qui veut la modifier
      if (sauce.userId != req.auth.userId) {
        // si le userId est différent de celui contenu dans le token d'authentification l'utilisateur veut modifier une sauce qui ne lui appartient pas
        res.status(401).json({ message: 'modification non autorisée' }); //pb authentification
      } else {
        //Si c'est le bon utilisateur on met à jour
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(404).json({ error }));
};

// On veut pouvoir supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  /*Sauce.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce supprimée' }))
    .catch((error) => res.status(400).json({ error }));*/

  Sauce.findOne({ _id: req.params.id }) //On récupère la sauce dans la BD
    .then((sauce) => {
      // on va vérifier si la sauce appartient bien à l'utilisateur qui veut la modifier
      if (sauce.userId != req.auth.userId) {
        // si le userId est différent de celui contenu dans le token d'authentification l'utilisateur veut modifier une sauce qui ne lui appartient pas
        res.status(401).json({ message: 'utilisateur non autorisé' }); //pb authentification
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        //La méthode fs.unlink() est utilisée pour supprimer un fichier ou un lien symbolique du système de fichiers
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: ' Sauce supprimée' });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
