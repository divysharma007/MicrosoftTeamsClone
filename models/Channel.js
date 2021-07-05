const mongoose = require("mongoose");
const ChannelSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	discription: {
		type: String,
		required: true,
	},
	users: [{ type: mongoose.Schema.Types.ObjectID, ref: "user" }],
	messages: [{ type: mongoose.Schema.Types.ObjectID, ref: "message" }],
});
const ChannelModel = mongoose.model("channel", ChannelSchema);

module.exports = ChannelModel;
