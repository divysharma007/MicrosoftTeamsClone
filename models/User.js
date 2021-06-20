const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
	mail: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	rooms: [{ type: mongoose.Schema.Types.ObjectID, ref: "room" }],
});

const UserModel = mongoose.model('user', UserSchema);
module.exports=UserModel
