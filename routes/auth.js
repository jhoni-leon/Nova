// routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Asegúrate de que la ruta sea correcta
const passport = require('passport');
const bcrypt = require('bcryptjs');  // Requerir bcrypt para encriptar contraseñas

// Ruta para registrar al usuario
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verificar si el correo ya está registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('El correo electrónico ya está registrado');
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lógica para registrar al usuario
        const newUser = new User({
            username,
            email,
            password: hashedPassword,  // Almacenar la contraseña encriptada
        });

        await newUser.save();

        // Aquí se autentica automáticamente al usuario después del registro
        req.login(newUser, (err) => {
            if (err) {
                return res.status(500).send('Error en la autenticación');
            }
            // Redirige al usuario a la página principal después de registrarse
            res.redirect('/home');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el registro');
    }
});

// Ruta para el login (si no tienes aún una)
router.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}));

module.exports = router;
