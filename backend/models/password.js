//On importe passwordvalidator
const passwordValidator = require('password-validator');

//On crée un schéma pour les requis création mdp utilisateur
const schemaPassword = new passwordValidator();
//Schéma que doit respecter le mdp au signup
schemaPassword
  .is().min(5) // Minimum length 5
  .is().max(100) // Maximum length 100
  .has().uppercase(1) // Must have uppercase letters
  .has().lowercase(2) // Must have lowercase letters
  .has().digits(2) // Must have at least 2 digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values


module.exports = schemaPassword;