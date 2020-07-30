const mongoose = require("mongoose");

const IdeaStatusSchema = new mongoose.Schema({
    /* _id: {
        type: String,
        required: true
    }, */
	status: {
		type: String,
		required: true
	},
	order: {
		type: Number,
		required: true
	}
});

const IdeaStatus = mongoose.model('idea_statuses', IdeaStatusSchema);
module.exports = IdeaStatus;
