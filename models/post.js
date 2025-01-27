// /models/Post.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Referencia al modelo de usuario
        required: true,
    },
}, {
    timestamps: true,
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
