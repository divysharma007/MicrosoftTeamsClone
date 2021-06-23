const express = require("express");
const router = express.Router();
const room = require("../models/Room");
const User = require("../models/User");
const server = require("../index.js");
module.exports = router;
const { v4: uuidV4 } = require("uuid");
router.get("/", async (req, res) => {
	try {
		console.log(req.session.userdata);
		const user = await User.findOne({
			mail: req.session.userdata.userPrincipalName
		}).populate('rooms');
		
        console.log(user, "3535353");
     
		// console.log(user.rooms, "433434");

		res.render("home", { rooms: user.rooms });
	} catch (err) {
		res.send("Error" + err);
	}
});

router.get("/:id/video/", (req, res) => {

    console.log(req.params.id);
    
	res.redirect(`./${uuidV4()}`);
});

router.get("/:id/video/:video", async (req, res) => {

    console.log(req.params.video);
    const user = await User.findOne({
			mail: req.session.userdata.userPrincipalName,
		});
		var auth = user.rooms.includes(req.params.id);
		if (auth) {
			console.log(user.rooms, single_room, auth);
			res.render("video-room", { roomId: req.params.video });
		} else {
			res.send("not Authorized");
		}
	
});

router.get("/:id/", async (req, res) => {
	single_room = await room.findById(req.params.id);
	
    const user = await User.findOne({
				mail: req.session.userdata.userPrincipalName,
    })
    var auth =  user.rooms.includes(req.params.id);
    if (auth) {
        console.log(user.rooms, single_room, auth);
        res.render("room", { room: single_room });
    } else {
        res.send('not Authorized')
    }
});
