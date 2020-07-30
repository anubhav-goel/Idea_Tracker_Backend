const router = require('express').Router();
const controller = require('../controller/user');

router.get('/', controller.getUsers);

router.get('/:id', controller.getUser);

module.exports = router;