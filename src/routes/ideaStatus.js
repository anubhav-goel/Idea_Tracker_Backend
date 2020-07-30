const router = require('express').Router();
const controller = require('../controller/ideaStatus')

module.exports = router;

router.get('/', controller.getIdeaStatus);

