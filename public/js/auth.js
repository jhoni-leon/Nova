// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Ruta para redirigir a Google para la autenticación
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'] // Pide acceso al perfil y correo del usuario
}));

// Ruta de callback de Google
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }), 
    (req, res) => {
        // Si la autenticación fue exitosa, redirige a la página principal
        res.redirect('/'); // Puedes cambiar esta ruta según tu necesidad
    }
);

// Si la autenticación con Google falla
router.get('/fail', (req, res) => {
    res.send('Autenticación fallida. Intenta nuevamente.');
});

module.exports = router;
