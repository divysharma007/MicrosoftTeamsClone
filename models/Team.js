const mongoose = require("mongoose");
const RoomSchema = new mongoose.Schema({
	// name of the Team
	name: {
		type: String,
		required: true,
	},
	// Description of the Team
	description: {
		type: String,
	},
	// Users wihich will be allowed / present in the Team
	users: [{ type: mongoose.Schema.Types.ObjectID, ref: "user" }],

   // All channels of a Team
	channels: [{ type: mongoose.Schema.Types.ObjectID, ref: "channel" }],
   // Color of the pic to be shown 
	color: {
		type:String
	}
});
const RoomModel = mongoose.model("team", RoomSchema);

module.exports = RoomModel;
