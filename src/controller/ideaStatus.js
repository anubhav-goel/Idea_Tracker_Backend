const IdeaStatus = require("../model/IdeaStatus");
const Idea = require("../model/Idea");

const getIdeaStatus = async (req, res) => {
	try {
		const ideaStatus = await IdeaStatus.find({}).sort({ order: 1 });
		return res.json(ideaStatus);
	} catch (error) {
		console.error(error);
		res.status(500).json([{ msg: "Internal Server Error" }]);
	}
}


module.exports = {
	getIdeaStatus
}