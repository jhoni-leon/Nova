// models/User.js

const mongoose = require('mongoose');

// Definición del esquema de usuario
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Esto crea campos createdAt y updatedAt automáticamente
});

// Crear el modelo basado en el esquema
const User = mongoose.model('User', userSchema);

// Exportar el modelo
module.exports = User;
