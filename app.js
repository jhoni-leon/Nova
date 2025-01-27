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

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
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

// Ruta principal
app.get('/', (req, res) => {
    res.render('index', { title: 'Inicio' });
});

// Ruta para autenticación con Google
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback de Google
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

// Ruta de dashboard (restringida)
app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`
        <h1>Bienvenido, ${req.user.displayName}</h1>
        <p>Email: ${req.user.email}</p>
        <img src="${req.user.profilePhoto}" alt="Foto de perfil" style="border-radius: 50%; width: 100px;">
        <br><br>
        <a href="/logout">Cerrar sesión</a>
    `);
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Configuración de EJS
app.set('view engine', 'ejs');

// Archivos estáticos
app.use(express.static('public'));

// Iniciar servidor
app.listen(3001, () => {
    console.log('Servidor corriendo en http://localhost:3001');
});
app.get('/', (req, res) => {
    res.render('index', { title: 'Mi Aplicación' }); // Asegúrate de definir "title"
});
