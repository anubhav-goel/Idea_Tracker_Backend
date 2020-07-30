const User = require("../model/User");

const getUser = async (req, res) => {
	try {
		const userId = req.params.id || req.user.id;
		const user = await User.findById(userId)
			.select({
				password: 0
			});

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json([{ msg: "Internal Server Error" }]);
	}
}

const getUsers = async (req, res) => {
	try {
		const user = await User.find().select("-password");
		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json([{ msg: "Internal Server Error" }]);
	}
}

module.exports = {
	getUser,
	getUsers
}