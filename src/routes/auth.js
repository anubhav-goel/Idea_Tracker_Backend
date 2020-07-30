const router = require('express').Router();
const controller = require('../controller/auth');
const { validate } = require('../validation/auth')

router.post('/register', validate('register'), controller.register);

router.post('/login', validate('login'), controller.login);

router.post('/logout', controller.logout);

module.exports = router;