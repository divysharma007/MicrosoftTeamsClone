const express = require("express");
const router = express.Router();
const ChannelRepository = require("../Repository/ChannelRepository.js");
const UserRepository = require("../Repository/UserRepository.js");
const TeamRepository = require("../Repository/TeamRepository.js");
const builder = require("./TokenBuilder.js");
module.exports = router;
// Renders all Teams in which user is present 
router.get("/", async (req, res) => {
	try {
	const user =await  UserRepository.getuserwithrooms(req.session.userdata.userPrincipalName);

		res.render("home", { rooms: user.rooms });
	} catch (err) {
		res.send("Error" + err);
	}
});
// Creates new Team and adds default channel General
router.post("/create", async (req, res) => {

	const usersstr = req.body.users.split(" ");
	usersstr.push(req.session.userdata.userPrincipalName);
	const newchannel =await  ChannelRepository.createchannel("General", "General Channel");
	const newteam = await TeamRepository.createteam(
		req.body.teamname,
		req.body.teamdis
	); 
	newteam.channels.push(newchannel._id);


	let users = [];

	for (let i = 0; i < usersstr.length; i++) {
	
		u = await UserRepository.getuser(usersstr[i]);
		if (u != null && !users.includes(u._id) &&!newteam.users.includes(u._id)) {
			u.rooms.push(newteam._id);
			await u.save();
			users.push(u._id);
			newchannel.users.push(u._id);
			newteam.users.push(u._id);
		}
	}
	

	await newteam.save();
	await newchannel.save();

	res.redirect("./");
});
//Renders Team creation form
router.get("/create", async(req, res) => {
	const users = await UserRepository.getallusers();
	res.render("creategrp",{users:users});
});

//Renders channel creation form
router.get("/:roomid/channel/create", async (req, res) => {
	let single_team = await TeamRepository.getTeamwithusers(req.params.roomid);
		if (!single_team) {
			res.render("notfound");
		}
	res.render("createchannel",{room: single_team});
});
// Creates a new channel and adds it to the Team from which it was called
router.post("/:roomid/channel/create", async (req, res) => {
	const usersstr = req.body.users.split(" ");
	usersstr.push(req.session.userdata.userPrincipalName);

	let team = await TeamRepository.getTeam(req.params.roomid);
		if (!team) {
			res.render("notfound");
		}
	const newchannel = await ChannelRepository.createchannel(req.body.channelname, req.body.channeldes);
	
	team.channels.push(newchannel._id);
	await team.save();

	let users = [];
	for (let i = 0; i < usersstr.length; i++) {
		u = await UserRepository.getuser(usersstr[i]);

		if (u != null && !users.includes(u._id) && u.rooms.includes(team._id)) {
			users.push(u._id);
			newchannel.users.push(u._id);
		} 
	}
	await newchannel.save();

	res.redirect("./" + newchannel._id + "/");
});
// User leaves Team
router.get("/:roomid/channel/leave", async (req, res) => {
	
	const user = await UserRepository.getuser(
		req.session.userdata.userPrincipalName
	);

	let team = await TeamRepository.getTeamwithchannels(req.params.roomid);
		if (!team) {
			res.render("notfound");
		}
	for (let i = 0; i < user.rooms.length; i++) {
		if (String(user.rooms[i]) == String(req.params.roomid)) {
			user.rooms.splice(i, 1);
			await user.save();
			break;
		
		}
	}
	for (let i = 0; i < team.users.length; i++) {
		if (String(team.users[i]) == String(user._id)) {
			team.users.splice(i, 1);
			break;
		}
	}
	for (let i = 0; i < team.channels.length; i++) {
		for (let j = 0; j < team.channels[i].users.length; j++) {
			if (String(team.channels[i].users[j]._id) == String(user._id)) {
				team.channels[i].users.splice(j, 1);
				await team.channels[i].save();
				break;
			}
		}
	}
	await team.save();
	res.redirect("/room/");
});
//Renders form which will add other users to this Team
router.get("/:roomid/channel/add", async (req, res) => {
	const users = await UserRepository.getallusers();
	let team = await TeamRepository.getTeamwithchannels(req.params.roomid);
		if (!team) {
			res.render("notfound");
		}
	let str = team.name + " team";
	res.render("addgrpuser", { str: str ,room: team,users:users});
});
//Form contains emails of the users  to be added
router.post("/:roomid/channel/add", async (req, res) => {
	let users = [];
	let team = await TeamRepository.getTeamwithchannels(req.params.roomid);
		if (!team) {
			res.render("notfound");
		}
	const usersstr = req.body.users.split(" ");
	if (usersstr.length > 0) {
		for (let i = 0; i < usersstr.length; i++) {
			let u = await UserRepository.getuser(usersstr[i]);
// If the user is present in Team otherwise nothing will happen .Also if the user already exists nothing will happen
			if (u != null && !users.includes(u._id) && !team.channels[0].users.includes(u._id)) {
				u.rooms.push(team._id);
				team.users.push(u._id);

				team.channels[0].users.push(u._id);
				await u.save();
			}
		}
		await team.channels[0].save();
		await team.save()
	}
//Redirects back to general channel
	res.redirect("/room/"+req.params.roomid+"/channel/"+team.channels[0].id+"/");
});
//Renders channel with id channelid
router.get("/:roomid/channel/:channelid/", async (req, res) => {
	let single_channel =await  ChannelRepository.getchannelusermeets(
		req.params.channelid
	);
	if (!single_channel) {
		res.render("notfound")
	}
	const user = await UserRepository.getuser(
		req.session.userdata.userPrincipalName
	);
	let team = await TeamRepository.getTeamwithchannelsusers(req.params.roomid)
		if (!team) {
			res.render("notfound");
		}
	let auth = false;
	//Checks if the Channel consists of this user else renders not authorized page which tells that user is not present in this channel
	for (let i = 0; i < single_channel.users.length; i++) {
		if (String(single_channel.users[i]._id) ==String(user._id)) { auth = true; break;}

	}

	let all_channels = [];
	for (let i = 0; i < team.channels.length; i++) {
		if (team.channels[i].users.includes(user.id)) {
			all_channels.push(team.channels[i]);
		}
	}
	if (auth) {
		res.render("channel", {
			room: team,
			channel: single_channel,
			all_channels: all_channels,
			mail: req.session.userdata.userPrincipalName,
		});
	} else {
		res.render("notauthorized");
	}
});
//Renders Video meet page where conference takes place 
router.get(
	"/:roomid/channel/:channelid/meet/:meetid/video",
	async (req, res) => {
		const user = await UserRepository.getuser(
			req.session.userdata.userPrincipalName
		);
		let single_channel = await ChannelRepository.getchannel(
			req.params.channelid
		);
			if (!single_channel) {
				res.render("notfound");
			}
		let meet_channel = await ChannelRepository.getchannel(req.params.meetid);
			if (!meet_channel) {
				res.render("notfound");
			}
		let auth = single_channel.users.includes(user._id);
		// Checks if the Meet consists of this user else renders not authorized page which tells that user is not present in this channel
		if (auth) {
			const builders = builder(req.params.meetid);
			res.render("videomeet", {
				uid: builders.uid,
				agoraappID: builders.appID,
				channelName: builders.channelName,
				token: builders.tokenforuser,
				screentoken: builders.tokenforscreenshare,
				screenuid: builders.screenuid,
				channel: meet_channel,
				mail: req.session.userdata.userPrincipalName,
			});
		} else {
			res.render("notauthorized");
		}
	}
);
router.get("/:roomid/channel/:channelid/meet/:meetid/", async (req, res) => {
	let single_channel = await ChannelRepository.getchannelmeets(
		req.params.channelid
	);
		if (!single_channel) {
			res.render("notfound");
		}
	const user = await UserRepository.getuser(
		req.session.userdata.userPrincipalName
	);
	let team = await TeamRepository.getTeam(req.params.roomid);
		if (!team) {
			res.render("notfound");
		}
	// Checks if the Meet consists of this user else renders not authorized page which tells that user is not present in this channel
	let auth = single_channel.users.includes(user.id);
	let meet_channel = await ChannelRepository.getchannel(req.params.meetid);
		if (!meet_channel) {
			res.render("notfound");
		}
//Checks if the Channel consists of this user else renders not page which tells that user is not present in this channel
	if (auth) {
		res.render("meet", {
			meet: meet_channel,
			channel: single_channel,
			mail: req.session.userdata.userPrincipalName,
			room:team,
		});
	} else {
		res.render("notauthorized");
	}
});
// User is removed from the channel
router.get("/:roomid/channel/:channelid/leave", async (req, res) => {
	const user = await UserRepository.getuser(
		req.session.userdata.userPrincipalName
	);
	let team = await TeamRepository.getTeam(req.params.roomid);
		if (!team) {
			res.render("notfound");
		}
	let getchannel = await ChannelRepository.getchannel(
		req.params.channelid
	);
		if (!getchannel) {
			res.render("notfound");
		}
	if (String(team.channels[0]) != String(getchannel._id)) {
		
		for (let i = 0; i < getchannel.users.length; i++) {
			if (String(user._id) == String(getchannel.users[i]._id)) {
				getchannel.users.splice(i, 1);
				await getchannel.save();
			}
		}
	}
	str = "/room/" + req.params.roomid + "/channel/"+team.channels[0]+"/";
	res.redirect(str);
});
// Renders the form which will add  users to the channel 
router.get("/:roomid/channel/:channelid/add", async (req, res) => {
	let team = await TeamRepository.getTeamwithusers(req.params.roomid);
		if (!team) {
			res.render("notfound");
		}
	let getchannel = await ChannelRepository.getchannel(req.params.channelid);
		if (!getchannel) {
			res.render("notfound");
		}
	if (String(team.channels[0]) != String(getchannel._id)) {
		let str = getchannel.name + " channel";
		res.render("adduser", { str: str ,room:team});
	} else {
		res.redirect("./");
	}
});
// Adds users to the given channel 
router.post("/:roomid/channel/:channelid/add", async (req, res) => {
	let users = [];
	let getchannel = await ChannelRepository.getchannel(req.params.channelid);
		if (!getchannel) {
			res.render("notfound");
		}
	let team = await TeamRepository.getTeam(req.params.roomid);
		if (!team) {
			res.render("notfound");
		}
	
	const usersstr = req.body.users.split(" ");
	if (usersstr.length > 0) {
		for (let i = 0; i < usersstr.length; i++) {
			let u = await UserRepository.getuser(usersstr[i]);
// if the user is present in Team then only user is added in the channel
			if (
				u != null &&
				!users.includes(u._id) &&
				u.rooms.includes(team._id) &&
				!getchannel.users.includes(u._id)
			) {
				getchannel.users.push(u._id);
			}
		}


		await getchannel.save();
	}
	res.redirect("../");
});
