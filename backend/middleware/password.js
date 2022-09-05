const schemaPassword= require('../models/password')

//On exporte le schéma
module.exports = (req, res, next) => {
  if (schemaPassword.validate(req.body.password)) {
     next();
  } else {
   return res.status(400).json({ message: 'le mot de passe doit avoir aux moins 5 caractères, une majuscule, 2 minuscules et 2 chiffres' });
  }
};
