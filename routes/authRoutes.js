const express = require('express');
const passport = require('passport');
const router = express.Router();

// Ruta para iniciar sesión con Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

// Ruta de callback de Google
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login', // Redirige a la página de inicio de sesión en caso de error
}), (req, res) => {
    res.redirect('/profile'); // Redirige al perfil del usuario si tiene éxito
});

module.exports = router;
