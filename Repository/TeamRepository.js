const Team = require("../models/Team");
// different Colors for Team pics
var colors = [
	"800080",
	"FF6347",
	"ff033e",
	"008000",
	"ff2052",
	"007fff",
	"cd5b45",
	"e3256b",
	"ff3800",
	"e30022",
	"0000ff",
];
//create new team
const createteam = async (name, description) => {
	const newteam = await new Team({
		name: name,
		description: description,
		color: colors[Math.floor(Math.random() * 1000) % colors.length],
	});
	return newteam;
};
// gets Team with id and populate users
const getTeamwithusers = async (teamid) => {
	const team = await Team.findById(teamid).populate("users");
	return team;
};
// gets Team with id 
const getTeam= async (teamid) => {
	const team = await Team.findById(teamid);
	return team;
};
// gets Team with id and populate channels
const getTeamwithchannels = async (teamid) => {
	const team = await Team.findById(teamid).populate("channels");
	return team;
};
// gets Team with id and populate users and channels
const getTeamwithchannelsusers = async (teamid) => {
	const team = await Team.findById(teamid).populate("channels").populate("users");
	return team;
};
module.exports = {
	getTeam,
	createteam,
	getTeamwithchannels,
	getTeamwithusers,
	getTeamwithchannelsusers,
};