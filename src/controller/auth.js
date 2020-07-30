const { validateRequest } = require("../utils/validateRequest");
const User = require("../model/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const util = require('util');

const register = async (req, res) => {
	try {
		const validationErrors = validateRequest(req, res);
		if (validationErrors) {
			return res.status(400).json({ errors: validationErrors.errors });
		}
		const { name, email, password } = req.body;

		const userExists = await User.findOne({ email });
		if (userExists) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'User already Exists' }] });
		}

		let newUser = new User({
			name, email, password
		});
		const salt = await bcrypt.genSalt(10);
		newUser.password = await bcrypt.hash(password, salt);
		await newUser.save();

		const token = await createToken(newUser);
		res.json({
			id: newUser.id,
			name: newUser.name,
			email: newUser.email,
			token
		});
	} catch (error) {
		console.error(error);
		res.status(500).json([{ msg: "Internal Server Error" }]);
	}
}

const login = async (req, res) => {
	try {
		const validationErrors = validateRequest(req, res);
		if (validationErrors) {
			return res.status(400).json({ errors: validationErrors.errors });
		}
		const { email, password } = req.body;
		let user = await User.findOne({ email });
		if (!user) {
			return res
				.status(400)
				.json({ errors: [{ msg: 'Invalid Credentials' }] });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({
				errors: [
					{
						msg: 'Invalid Credentials'
					}
				]
			});
		}
		const token = await createToken(user);
		res.json({
			id: user.id,
			name: user.name,
			email: user.email,
			token
		});
	} catch (error) {
		console.error(error);
		res.status(500).json([{ msg: "Internal Server Error" }]);
	}
}

const logout = async (req, res) => {
	console.log("logout");
}

const createToken = async (user) => {
	try {
		const payload = {
			user: {
				id: user.id
			}
		};
		const jwtSign = util.promisify(jwt.sign)
		const token = await jwtSign(payload, process.env.JWT_SECRET, {
			expiresIn: parseInt(process.env.TOKEN_EXPIRY_SECONDS)
		})
		return token;
	} catch (error) {
		throw error;
	}
}

module.exports = {
	login,
	register,
	logout
}