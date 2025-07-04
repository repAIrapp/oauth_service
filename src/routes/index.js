const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

router.use('/auth', authRoutes);
//router.use('/profile',authRoutes);

module.exports = router;