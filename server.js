require('dotenv').config(); // Cargar las variables de entorno
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir esquema de usuario en MongoDB
const userSchema = new mongoose.Schema({
    googleId: String,
    displayName: String,
    email: String,
    profilePhoto: String,
});
const User = mongoose.model('User', userSchema);

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Configuración de Passport
app.use(passport.initialize());
app.use(passport.session());

// Serializar y deserializar usuarios
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Solución al problema del callback
        done(null, user); // Pasar el usuario si se encuentra
    } catch (err) {
        done(err, null); // Manejar errores si ocurren
    }
});

// Configuración de Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    // Buscar usuario en la base de datos o crearlo
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
        return done(null, existingUser);
    }
    const newUser = new User({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        profilePhoto: profile.photos[0].value,
    });
    await newUser.save();
    done(null, newUser);
}));

// Configuración de EJS
app.set('view engine', 'ejs');

// Archivos estáticos
app.use(express.static('public'));

// Configuración de middleware para procesar los formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas definidas aquí
const Post = require('./models/Post');
const Friend = require('./models/Friend');

// Ruta principal
app.get('/', (req, res) => {
    res.render('index', { title: 'Inicio' });
});

// Ruta para autenticación con Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Ruta de callback de Google
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

// Ruta de dashboard (restringida)
app.get('/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }

    try {
        // Obtener publicaciones y amigos
        const posts = await Post.find().populate('author').sort({ createdAt: -1 });
        const friends = await Friend.find({ user: req.user.id, status: 'accepted' }).populate('friend');

        // Renderizar la vista del dashboard
        res.render('dashboard', { user: req.user, posts, friends });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar el dashboard');
    }
});

// Ruta para crear una nueva publicación
app.post('/posts', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }

    try {
        const newPost = new Post({
            content: req.body.content,
            author: req.user.id,
        });
        await newPost.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al publicar');
    }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Iniciar servidor
app.listen(3001, () => {
    console.log('Servidor corriendo en http://localhost:3001');
});
