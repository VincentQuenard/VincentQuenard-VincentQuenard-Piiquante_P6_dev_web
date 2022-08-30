//On vérifie que l'utilisateur est bien connecté

//On importe jsonwebtoken
const jwToken = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // On récupère le token placé en seconde position dans le headers.authorization grace à split et l'espace contenu entre bearers et le token ex Authorization:
    // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzAzODYwMzJlMTI2OWRhZjdiZjNmMDEiLCJpYXQiOjE2NjEyNDc1NTQsImV4cCI6MTY2MTMzMzk1NH0.YYXwuyyHmpwqXJk1RpCwdXbbMuSVv62OI9B-TVDbN-g

    // maintenant que nous avons le token, il faut le décoder avec la méthode verify de jwt et la clé secrète
    const decodedToken = jwToken.verify(token, 'MYSECRETKEYFORMYTOKEN');

    //On récupère le user id que l'on décode
    const userId = decodedToken.userId;

    // On rajoute cette valeur à l'objet request qui est transmis aux routes appelées
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error }); //accès non authorisé
  }
};
