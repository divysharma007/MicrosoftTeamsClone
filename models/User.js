const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
	// email of the user
	mail: {
		type: String,
		required: true,
	},
	// name of the user
	username: {
		type: String,
		required: true,
	},
	// All the teams in which user is present/is authorized to access
	rooms: [{ type: mongoose.Schema.Types.ObjectID, ref: "team" }],

});

const UserModel = mongoose.model('user', UserSchema);
module.exports=UserModel
