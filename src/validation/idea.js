const { check } = require('express-validator');

const validate = method => {
    switch (method) {
        case 'create':
            return [
                check('name', 'name is required.')
                    .not()
                    .isEmpty(),
                check('description', 'Please mention description for your idea.')
                    .not()
                    .isEmpty()
            ];
        case 'update':
            return [
                check('name', 'name is required.')
                    .not()
                    .isEmpty(),
                check('description', 'Please mention description for your idea.')
                    .not()
                    .isEmpty(),
                check('ideaStatus', 'Please mention current status of idea.')
                    .not()
                    .isEmpty(),
            ];
        default:
            return [];
    }
}

module.exports = { validate }