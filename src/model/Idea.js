const mongoose = require("mongoose");

const IdeaSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		required: true
	},
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	ideaStatus: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'idea_statuses',
		required: true
	},
	deleted: {
		type: Boolean,
		required: true,
		default: false
	},
	date: {
		type: Date,
		default: Date.now
	},
	likes: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'users'
			}
		}
	]
});

const Idea = mongoose.model('ideas', IdeaSchema);
module.exports = Idea;
