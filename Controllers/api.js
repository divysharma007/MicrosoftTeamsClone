const express = require("express");
const router = express.Router();
const channel = require("../models/Channel");
const User = require("../models/User");
// Renders all the messages of the channel  
router.get("/channel/:id", async (req, res) => {
	single_channel = await channel.findById(req.params.id).populate("messages").select("messages");
	res.json(single_channel);
});

//Renders all the users of the channel
router.get("/channel/:id/users", async (req, res) => {
	single_channel = await channel.findById(req.params.id).populate("users").select("users");
	res.json(single_channel);
});
// Renders all the users using this webapp
router.get("/users", async (req, res) => {
	const users = await User.find();
	return res.json(users);
});
// Creates a new channel
router.post("/channel", async (req, res) => {
	const newchannel = new channel({
	name:req.body.name
	})
	await newchannel.save();
	res.json(newchannel);
});

module.exports = router;
