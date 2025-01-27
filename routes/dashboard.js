// routes/dashboard.js

const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Asegúrate de tener este modelo
const Friend = require('../models/Friend'); // Asegúrate de tener este modelo

// Ruta del dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login'); // Redirige al login si no está autenticado
    }

    try {
        // Obtener las publicaciones
        const posts = await Post.find().populate('author').sort({ createdAt: -1 });

        // Obtener los amigos del usuario autenticado
        const friends = await Friend.find({ user: req.user.id, status: 'accepted' }).populate('friend');

        // Renderizar el dashboard pasando los datos
        res.render('dashboard', { user: req.user, posts, friends });
    } catch (error) {
        console.error('Error al cargar el dashboard:', error);
        res.status(500).send('Error al cargar el dashboard');
    }
});

module.exports = router;
