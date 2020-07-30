const router = require('express').Router();
const authenticationMiddleware = require("../middleware/authenticate")
const userController = require('../controller/user')
module.exports = router;

router.use('/', authenticationMiddleware.middleware);

router.get('/validateToken', userController.getUser);

