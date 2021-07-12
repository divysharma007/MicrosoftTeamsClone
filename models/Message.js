const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
	// name of sender 
	name: {
		type: String,
		required: true,
	},
	// msg content
	content: {
		type: String,
	},
	// Date and time when the message was sent 
	date: {
		type: String,
	},
	// email of the sender 
	mail: {
		type: String,
	},
});

const MessageModel = mongoose.model("message", MessageSchema);

module.exports = MessageModel;
