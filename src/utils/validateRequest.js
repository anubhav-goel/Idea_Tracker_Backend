
const { validationResult } = require('express-validator');

const validateRequest = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return { errors: errors.array() };
    }
    else {
        return null;
    }
}

module.exports = { validateRequest }