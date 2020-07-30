const router = require('express').Router();
const controller = require('../controller/idea')
const { validate } = require('../validation/idea')

module.exports = router;



router.get('/', controller.getIdeas);

router.get('/:id', controller.getIdea);

router.post('/', validate('create'), controller.createIdea);

router.put('/:id', validate('update'), controller.updateIdea);

router.delete('/:id', controller.deleteIdea);

router.put('/:id/like', controller.likeIdea);

router.put('/:id/unlike', controller.unlikeIdea);