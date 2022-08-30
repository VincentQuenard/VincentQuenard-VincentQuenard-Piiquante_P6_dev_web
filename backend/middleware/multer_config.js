// multer est un package de gestion de fichiers. Sa méthode diskStorage() configure le chemin et le nom de fichier pour les fichiers entrants

// on importe multer qu'on a installé
const multer = require('multer');

// mime types utilisés pour générer une extension à notre fichier généré dans l'objet de configuration, notre "dictionnaire"
const MIME_TYPES = {
  'image/jpg': 'jpg', //on traduit image/jpg en jpg
  'image/jpeg': 'jpg',
  'image/png': 'png'
  };

// On crée un objet de configuration pour multer
const storage = multer.diskStorage({
  //pour dire qu'on l'enregistre sur le DD
  //2 arguments : la destination et filename(pour expliquer à multer quel nom de fichier utiliser)
  destination: (req, file, callback) => {
    callback(null, 'images'); // null pour dire qu'il n'y a pas eu d'erreur et ensuite le nom du dossier images
  },
  filename: (req, file, callback) => {
    //On génère le nouveau nom du fichier
    const name = file.originalname.split(' ').join('_'); // on récupère le nom d'origine, on remplace les espaces possibles à cause de certains OS par _
    //On crée l'extension du fichier, il s'agit de l'élément de notre dictionnaire qui correspond au mimetype du fichier envoyé par le frontend
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension); // on crée le filename entier avec le nom généré auquel un ajoute un horodateur pour le rendre unique, un . et l'extension
}
});

// On exporte le middleware qu'on a configuré
module.exports = multer({ storage : storage}).single('image'); //single pour dire qu'il s'agit d'un fichier unique et pas un groupe de fichiers, et on dit à multer qu'il s'agit de fichiers image