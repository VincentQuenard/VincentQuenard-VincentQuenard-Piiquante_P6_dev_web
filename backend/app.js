//On importe le module express
const express = require('express');

//On importe dotenv dépendance permettant de déporter dans un fichier.env des variables d'environnement (ex: url connexion mongoDB)
require('dotenv').config();

//on importe helmet
//Helmet vous aide à protéger votre application de certaines des vulnérabilités bien connues du Web en configurant de manière appropriée des en-têtes HTTP.
const helmet = require('helmet');

//On importe express rate limit afin de limiter le nombre de requêtes des utilisateurs(contre force brute)

const rateLimit = require('express-rate-limit');

//On importe mongo sanitize pour empêcher les injections dans la bd
const mongoSanitize = require('express-mongo-sanitize');

//On importe mongoose, package qui facilite les interactions entre notre application Express et notre base de données MongoDB.
const mongoose = require('mongoose');

//On importe les routes utilisateurs
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// On importe path pour accéder au path de notre serveur
const path = require('path');

//On définit une constante app pour créer une application express
const app = express();
//on connecte notre application à notre base de données en ajoutant des messages de réussite ou d'échec
mongoose
  .connect(
    `mongodb+srv://${process.env.ADMIN_DB}:${process.env.PASSWORD_DB}@${process.env.URL_DB}retryWrites=true&w=majority`
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//On définit la limite des requêtes utilisateur par exemple 100 toutes les 10 minutes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //  10 minutes
  max: 100, // Le client pourra donc faire 100 requêtes max
  message: 'Too many request from this IP',
});

//  Cette limite de 100 requêtes toutes les 10 minutes sera effective sur toutes les routes.
app.use(limiter);

//On utilise sanitize pour éliminer entièrement toutes les entrées avec des caractères interdits dans MongoDB comme le signe '$'.
app.use(mongoSanitize());

//Pour gérer la requête POST venant de l'application front-end, on a besoin d'en extraire le corps JSON donc avoir accès à req.body(cela remplace body parcer)
app.use(express.json());

//On utilise helmet avant de gérer le CORS
app.use(helmet());

//L'en-tête de réponse HTTP Cross-Origin-Embedder-Policy(COEP) empêche un document de charger des ressources d'origine croisée qui n'accordent pas explicitement l'autorisation de document
//Helmet bloque l'affichage des images on ajoute donc :
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

//CORS bloque les requêtes http entre des serveurs différents, le back tourne sur le port 3000, le front sur 4200
//Des headers spécifiques de contrôle d'accès doivent être précisés pour tous nos objets de réponse.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

// la route attendue par le frontend est /api/auth pour les utilisateurs et /api/sauces pour le contenu, on dit à l'application d'utiliser ces routes
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

//A DEMANDER ECLAIRCISSEMENTS A THOMAS POUR PATH.JOIN
//Cela indique à Express qu'il faut gérer la ressource images de manière statique (un sous-répertoire de notre répertoire de base, __dirname(variable d'environnement qui indique le chemin absolu du répertoire contenant le fichier en cours d'exécution.)) à chaque fois qu'elle reçoit une requête vers la route /images
app.use('/images', express.static(path.join(__dirname, 'images')));

//On exporte app pour pouvoir l'utiliser dans les autres fichiers
module.exports = app;
