const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'Bienvenido a Nova' });
});

module.exports = router;
