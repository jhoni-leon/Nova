// routes/users.js
const express = require('express');
const router = express.Router();

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router;
