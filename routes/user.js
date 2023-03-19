const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const passwordIsValid = require('../middleware/passwordIsValid');

router.post('/signup', passwordIsValid, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;