const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	date: {
		type: String,
	
	},
});

const MessageModel = mongoose.model("message", MessageSchema);

module.exports = MessageModel;
