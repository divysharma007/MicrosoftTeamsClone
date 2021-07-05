const express = require("express");
const router = express.Router();
const room = require("../models/Room");
const channel = require("../models/Channel");
const User = require("../models/User");
const Room = require("../models/Room");
const builder = require("./builder.js");
module.exports = router;
const { v4: uuidV4 } = require("uuid");
router.get("/", async (req, res) => {
	try {
		console.log(req.session.userdata);
		const user = await User.findOne({
			mail: req.session.userdata.userPrincipalName,
		}).populate("rooms");

		console.log(user, "3535353");

		// console.log(user.rooms, "433434")	;

		res.render("home", { rooms: user.rooms });
	} catch (err) {
		res.send("Error" + err);
	}
});
router.post("/create", async (req, res) => {
	console.log("form received")
	console.log(req.body)
	const usersstr = req.body.users.split(' ')
	usersstr.push(req.session.userdata.userPrincipalName)
	
		
	const newteam = new Room({
		name: req.body.teamname,
		discription: req.body.teamdis,
	});
	
		const newchannel = new channel({
			name:"General",
			discription: "General channel",
		});

	newteam.channels.push(newchannel._id)
	await newteam.save();

    var users = [];
	for (var i = 0; i < usersstr.length; i++) {
		u=await User.findOne({
			mail: usersstr[i],
		});
		console.log(u);
		if (u!=null && !users.includes(u._id)) {
			u.rooms.push(newteam._id)
			await u.save();
			users.push(u._id);
			newchannel.users.push(u._id)
		}
	}
		await newchannel.save();
	
	
	res.redirect("./")
	


})
router.get("/create", (req, res) => {
	res.render("creategrp")
});

router.get("/:id/video/", (req, res) => {
	console.log(req.params.id);

	res.redirect(`./${uuidV4()}`);
});

router.get("/:roomid/channel/:channelid/video/:video", async (req, res) => {
	// console.log(req.params.video);
	// const user = await User.findOne({
	// 		mail: req.session.userdata.userPrincipalName,
	// 	});
	// 	var auth = user.rooms.includes(req.params.id);
	var auth = true;
	if (auth) {
		const builders = builder(req.params.video);
		console.log(builders);
		res.render("vroom", {
			uid: builders.uid,
			agoraappID: builders.agoraappID,
			channelName: builders.channelName,
			token: builders.token,
			screentoken: builders.screentoken,
			screenuid: builders.screenuid,
		});
	} else {
		res.send("not Authorized");
	}
});
router.get("/:roomid/channel/create",  (req, res) => {

	res.render("createchannel")
});
router.post("/:roomid/channel/create", async(req, res) => {

const usersstr = req.body.users.split(" ");
usersstr.push(req.session.userdata.userPrincipalName);

grp = await room.findById(req.params.roomid);

const newchannel = new channel({
	name: req.body.channelname,
	discription:req.body.channeldes,
});


grp.channels.push(newchannel._id);
await grp.save();

var users = [];
for (var i = 0; i < usersstr.length; i++) {
	u = await User.findOne({
		mail: usersstr[i],
	});

	if (u!=null && !users.includes(u._id) && u.rooms.includes(grp._id)) {
		users.push(u._id);
		newchannel.users.push(u._id);
	} else {
		console.log(u,'nooo')
	}
}
await newchannel.save();

res.redirect("./"+newchannel._id+"/");
	
});
router.get("/:roomid/channel/leave", async (req, res) => {
	console.log("here");
	const user = await User.findOne({
		mail: req.session.userdata.userPrincipalName,
	}).populate("rooms");

	grp = await room.findById(req.params.roomid).populate("channels");
	for (var i = 0; i < user.rooms.length; i++) {
		if (user.rooms[i]._id == req.params.roomid) {
			user.rooms.splice(i, 1);
			await user.save();
			
		}
	}

	for (var i = 0; i < grp.channels.length; i++) {
		
		for (var j = 0; j < grp.channels[i].users.length; j++) {
			if (String(grp.channels[i].users[j]._id) == String(user._id)) {
				grp.channels[i].users.splice(j, 1);
				await grp.channels[i].save();
				break;
			} 
		}
	
		
	
		
		
	}
	await grp.save();
	res.redirect("/room/");
});
router.get("/:roomid/channel/add", async (req, res) => {
	single_room = await room.findById(req.params.roomid).populate("channels")
	str =single_room.name +" team"
	res.render("adduser",{str:str});
})
router.post("/:roomid/channel/add", async (req, res) => {
	users = [];
	grp = await room.findById(req.params.roomid).populate("channels");
	const usersstr = req.body.users.split(" ");
	for (var i = 0; i < usersstr.length; i++) {
		u = await User.findOne({
			mail: usersstr[i],
		});

		if (u != null && !users.includes(u._id)) {
			u.rooms.push(grp._id);

			grp.channels[0].users.push(u._id);
			await u.save();
		}
	}
	await grp.channels[0].save()

	res.redirect("../");
});
router.get("/:roomid/", async (req, res) => {

	single_room = await room.findById(req.params.roomid).populate("channels")
	single_channel=single_room.channels[0]
	const user = await User.findOne({
		mail: req.session.userdata.userPrincipalName,
	});
	var auth = single_channel.users.includes(user.id);
	if (auth) {
		res.redirect("./channel/"+single_channel.id+"/")
	} else {
		res.send("not Authorized");
	}
});

router.get("/:roomid/channel/:channelid/", async (req, res) => {
	const func = uuidV4;
	single_channel = await channel.findById(req.params.channelid);
	const user = await User.findOne({
			mail: req.session.userdata.userPrincipalName,
	});
	single_room = await room.findById(req.params.roomid);
	var auth = single_channel.users.includes(user.id);
	
	if (auth) {
		res.render("room", { room: single_room,channel:single_channel, uuidV4: func ,p:single_room.name[0].toUpperCase()});
	} else {
		res.send("not Authorized");
	}
});
router.get("/:roomid/channel/:channelid/leave", async (req, res) => {
	const user = await User.findOne({
		mail: req.session.userdata.userPrincipalName,
	});
   const single_room= await room.findById(req.params.roomid)
	getchannel = await channel.findById(req.params.channelid)
	if (String(single_room.channels[0]) !=String( getchannel._id)) {
		console.log(single_room.channels[0],getchannel)
		for (var i = 0; i < getchannel.users.length; i++) {
			if (String(user._id) == String(getchannel.users[i]._id)) {
				getchannel.users.splice(i, 1);
				await getchannel.save();
			}
		}
		
	}
	str = "/room/" + req.params.roomid + "/";
	res.redirect(str);
});
router.get("/:roomid/channel/:channelid/add", async (req, res) => {
 const single_room= await room.findById(req.params.roomid)
	getchannel = await channel.findById(req.params.channelid)
	if (String(single_room.channels[0]) != String(getchannel._id)) {
		str = getchannel.name + " channel"
		res.render("adduser", { str: str });
	} else {
		res.redirect("./")
	}
	
});
router.post("/:roomid/channel/:channelid/add", async (req, res) => {
	users = []
	getchannel = await channel.findById(req.params.channelid);
	grp = await room.findById(req.params.roomid);
    const usersstr = req.body.users.split(" ");
	for (var i = 0; i < usersstr.length; i++) {
		u=await User.findOne({
			mail: usersstr[i],
		});

		if (u!=null && !users.includes(u._id) &&u.rooms.includes(grp._id)) {
			getchannel.users.push(u._id)
		}
	}

	
	
	await getchannel.save()
	res.redirect("../")

});