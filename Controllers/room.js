const express = require("express");
const router = express.Router();
const room = require("../models/Room");
const User = require("../models/User");
const server = require("../index.js");
const builder = require("./builder.js");
module.exports = router;
const { v4: uuidV4 } = require("uuid");
router.get("/", async (req, res) => {
	try {
		console.log(req.session.userdata);
		const user = await User.findOne({
			mail: req.session.userdata.userPrincipalName
		}).populate('rooms');
		
        console.log(user, "3535353");
     
		// console.log(user.rooms, "433434")	;

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

    // console.log(req.params.video);
    // const user = await User.findOne({
	// 		mail: req.session.userdata.userPrincipalName,
	// 	});
	// 	var auth = user.rooms.includes(req.params.id);
	     var auth = true;
		if (auth) {
			 
			const builders = builder(req.params.video);
			console.log(builders)
				res.render("vroom", {
					uid: builders.uid,
					agoraappID: builders.agoraappID,
					channelName: builders.channelName,
					token: builders.token,
					screentoken: builders.screentoken,
					screenuid: builders.screenuid
				});
		} else {
			res.send("not Authorized");
		}
	
});

router.get("/:id/", async (req, res) => {
	single_room = await room.findById(req.params.id).populate('messages');
	// var messages = single_room.messages;
	// console.log(messages);
	
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
