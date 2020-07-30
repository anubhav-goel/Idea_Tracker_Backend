const { check } = require('express-validator');

const validate = method => {
	switch (method) {
		case 'register':
			return [
				check('name', 'name is required.')
					.not()
					.isEmpty(),
				check('email', 'Please include a valid email.')
					.isEmail(),
				check('password', 'Please enter a password with 6 or more characters.')
					.isLength({ min: 6 }),
				check('confirmPassword', 'Passwords do not match.')
					.custom((value, { req }) => {
						return value === req.body.password
					})
			];
		case 'login':
			return [
				check('email', 'Please include a valid email.')
					.isEmail(),
				check('password', 'Please enter a password.')
					.not()
					.isEmpty()
			];
		default:
			return [];
	}
}

module.exports = { validate }