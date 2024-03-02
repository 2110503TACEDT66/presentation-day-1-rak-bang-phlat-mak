const express = require('express');
const {register, login, getUsers, getMe, logout} = require('../controllers/auth.js');
const router = express.Router();

const {protect} = require('../middleware/auth.js');

router.post('/register',  register);

router.post('/login', login);

router.get('/me', protect, getMe);

//for testing
router.get('/register', getUsers);

router.get('/logout', logout);

module.exports = router;