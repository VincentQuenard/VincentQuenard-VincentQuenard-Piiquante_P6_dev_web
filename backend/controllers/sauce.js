//id de la sauce = req.params.id
//id utilisateur = req.body.userId

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
  Sauce.findOne({ _id: req.params.id }) //On récupère la sauce dans la BD par son ID
    .then((sauce) => res.status(200).json(sauce)) // on renvoie la sauce
    .catch((error) => res.status(404).json({ error })); //404 objet non trouvé
};

// On veut pouvoir modifier et mettre à jour une sauce
exports.modifySauce = (req, res, next) => {
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
    .catch((error) => res.status(404).json({ error })); //pas trouvée
};

// On veut pouvoir supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) //On récupère la sauce dans la BD par son ID
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
            .catch((error) => res.status(401).json({ error })); //non authorisé
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeOrDislikeSauce = (req, res, next) => {
  console.log('je suis sur la bonne route', req.params, req.body);
  Sauce.findOne({ _id: req.params.id }) //On récupère la sauce dans la BD par son ID
    .then((sauce) => {
      console.log(req.body.like);
      //L'instruction switch évalue une expression et, selon le résultat obtenu et le cas associé, exécute les instructions correspondantes.
      switch (req.body.like) {
        case 1:
          //---------------Si l'utilisateur clique sur like--------------------------

          //Si l'utilisateur n'est pas dans le tableau des utilisateurs ayant liké et qu'il a aimé la sauce donc like =1
          if (!sauce.usersLiked.includes(req.body.userId)) {
            //Mise à jour de la sauce dans la BD
            Sauce.updateOne(
              { _id: req.params.id },
              {
                //On incrémente le champ like
                $inc: { likes: 1 }, //L'opérateur $inc incrémente un champ d'une valeur spécifiée et a la forme suivante :{ $inc: { <field1>: <amount1>, <field2>: <amount2>, ... } }
                //on met l'utilisateur dans le tableau des userLiked
                $push: { usersLiked: req.body.userId }, //L'opérateur  $push ajoute une valeur spécifiée à un tableau et a la forme :{ $push: { <field1>: <value1>, ... } }
              }
            ) //$inc L'opérateur incrémente un champ d'une valeur spécifiée
              .then(() => {
                res.status(201).json({ message: ' Vous aimez cette sauce' });
              })
              .catch((error) => res.status(400).json({ error })); // mauvaise requête
          }
          break;
        //---------------Si l'utilisateur clique sur dislike-----------------------
        case -1:
          //Si l'utilisateur n'est pas dans le tableau des utilisateurs ayant disliké et qu'il n'a pas aimé la sauce donc like =-1 car pas dislike dans req.body
          if (!sauce.usersDisliked.includes(req.body.userId)) {
            //Mise à jour de la sauce dans la BD
            Sauce.updateOne(
              { _id: req.params.id },
              {
                //On incrémente le champ dislike
                $inc: { dislikes: 1 }, //L'opérateur $inc incrémente un champ d'une valeur spécifiée et a la forme suivante :{ $inc: { <field1>: <amount1>, <field2>: <amount2>, ... } }
                //on met l'utilisateur dans le tableau des userLiked
                $push: { usersDisliked: req.body.userId }, //L'opérateur  $push ajoute une valeur spécifiée à un tableau et a la forme :{ $push: { <field1>: <value1>, ... } }
              }
            )
              .then(() => {
                res
                  .status(201)
                  .json({ message: ' vous n aimez pas cette sauce' });
              })
              .catch((error) => res.status(400).json({ error })); // mauvaise requête
          }
          break;
        //---------------Si l'utilisateur change d'avis-----------------------
        case 0:
          //Si c'est un like
          //Si l'utilisateur est dans le tableau des utilisateurs ayant liké et que le like est à 0, donc s'il n'aime plus la sauce
          if (sauce.usersLiked.includes(req.body.userId)) {
            //Mise à jour de la sauce dans la BD
            Sauce.updateOne(
              { _id: req.params.id },
              {
                //On décrémente le champ like
                $inc: { likes: -1 }, //L'opérateur $inc incrémente un champ d'une valeur spécifiée et a la forme suivante :{ $inc: { <field1>: <amount1>, <field2>: <amount2>, ... } }
                //on met l'utilisateur dans le tableau des userLiked
                $pull: { usersLiked: req.body.userId }, //L'opérateur $pull supprime d'un tableau existant toutes les instances d'une valeur ou de valeurs qui correspondent à une condition spécifiée.
              }
            )
              .then(() => {
                res
                  .status(201)
                  .json({ message: ' vous avez retiré votre vote like' });
              })
              .catch((error) => res.status(400).json({ error })); // mauvaise requête
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            //Si c'est un unlike

            Sauce.updateOne(
              { _id: req.params.id },
              {
                //On décrémente le champ like
                $inc: { dislikes: -1 }, //L'opérateur $inc incrémente un champ d'une valeur spécifiée et a la forme suivante :{ $inc: { <field1>: <amount1>, <field2>: <amount2>, ... } }
                //on met l'utilisateur dans le tableau des userLiked
                $pull: { usersDisliked: req.body.userId }, //L'opérateur $pull supprime d'un tableau existant toutes les instances d'une valeur ou de valeurs qui correspondent à une condition spécifiée.
              }
            )
              .then(() => {
                res
                  .status(201)
                  .json({ message: ' vous avez retiré votre vote dislike' });
              })
              .catch((error) => res.status(400).json({ error })); // mauvaise requête
          }
      }
    })
    .catch((error) => res.status(404).json({ error })); //404 objet non trouvé
};
