const express = require("express");
const router = express.Router();
const channel = require("../models/Channel");
const User = require("../models/User");
const room = require("../models/Room");
router.get("/channel/:id", async (req, res) => {
	single_channel = await channel.findById(req.params.id).populate("messages");
	res.json(single_channel);
});
router.get("/room/:id", async (req, res) => {
	single_room = await room.findById(req.params.id).populate("channels").select("channels");
	const user = await User.findOne({
		mail: req.session.userdata.userPrincipalName,
	});
	all_channels = []
	for (var i = 0; i < single_room.channels.length; i++) {
		if (single_room.channels[i].users.includes(user.id)) {
all_channels.push(single_room.channels[i])
		 }
	}
		

	// var messages = single_room.messages;r
	res.json(all_channels);
});
router.get("/rooms/", async (req, res) => {
	const user = await User.findOne({
		mail: req.session.userdata.userPrincipalName,
	})
		.populate("rooms")
		.select("rooms");
	return res.json(user);
});
router.get("/users", async (req, res) => {
	const users = await User.find();

	console.log(users);
	return res.json(users);
});

module.exports = router;
