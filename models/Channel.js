const mongoose = require("mongoose");
const ChannelSchema = new mongoose.Schema({
	// name of the channel
	name: {
		type: String,
		
	},
	//description of the channel
	description: {
		type: String,
	},
	// users which will be allowed to/present in the channel
	users: [{ type: mongoose.Schema.Types.ObjectID, ref: "user" }],
	// Messages of the channel
	messages: [{ type: mongoose.Schema.Types.ObjectID, ref: "message" }],
	// All the meets that will take place
	meets: [{ type: mongoose.Schema.Types.ObjectID, ref: "channel" }],
	// color of the pic to be shown 
	color: {
		type:String,
	}
});
const ChannelModel = mongoose.model("channel", ChannelSchema);

module.exports = ChannelModel;
