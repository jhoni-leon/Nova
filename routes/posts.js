// /routes/posts.js

const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Modelo de publicaciones

// Ruta para crear una nueva publicación
router.post('/', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');  // Si no está autenticado, redirige a login
    }

    try {
        const { content } = req.body;
        const newPost = new Post({
            content,
            author: req.user.id,  // Se guarda el ID del usuario que hizo la publicación
        });

        await newPost.save();
        res.redirect('/home');  // Redirige al usuario a la página de inicio
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al publicar');
    }
});

// Ruta para mostrar todas las publicaciones
router.get('/home', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        // Obtener las publicaciones más recientes
        const posts = await Post.find().populate('author').sort({ createdAt: -1 });
        res.render('home', { 
            title: 'Bienvenido a Nova', 
            user: req.user,  // Usuario autenticado
            posts: posts     // Lista de publicaciones
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar el inicio');
    }
});

module.exports = router;
