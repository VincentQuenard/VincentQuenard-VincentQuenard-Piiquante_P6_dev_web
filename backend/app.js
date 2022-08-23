//On importe le module express
const express = require('express');

//On importe mongoose, package qui facilite les interactions entre notre application Express et notre base de données MongoDB.
const mongoose = require('mongoose');

//On importe les routes utilisateurs
const userRoutes = require('./routes/users')

//On définit une constante app pour créer une application express
const app = express();
//on connecte notre application à notre base de données en ajoutant des messages de réussite ou d'échec
mongoose
  .connect(
    'mongodb+srv://VincentQND:Vinsof3008@cluster0.5zedb.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//Pour gérer la requête POST venant de l'application front-end, on a besoin d'en extraire le corps JSON donc avoir accès à req.body(cela remplace body parcer)
app.use(express.json());


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

// la route attendue par le frontend est /api/auth, on dit à l'application d'utiliser ces routes
app.use('/api/auth', userRoutes);

//On exporte app pour pouvoir l'utiliser dans les autres fichiers
module.exports = app;
