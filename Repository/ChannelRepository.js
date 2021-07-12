const Channel = require("../models/Channel");
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
// Creates new channel
const createchannel = async(name,description) =>{
    const newchannel = await new Channel({
			name: name,
			description: description,
			color: colors[Math.floor(Math.random() * 1000) % colors.length],
		});
    return newchannel;
}
// gets channel with id
const getchannel = async (channelid)=>{
    const channel = await Channel.findById(channelid);
    return channel;
}
// gets channel with id and populate users
const getchannelwithusers = async (channelid) => {
	const channel = await Channel.findById(channelid).populate("users");
	return channel;
};
// gets channel with id and populate meets
const getchannelmeets = async (channelid) => {
	const channel = await Channel.findById(channelid).populate("meets");
	return channel;
};
// gets channel with id and populate users and meets
const getchannelusermeets = async (channelid) => {
	const channel = await Channel.findById(channelid)
		.populate("users")
		.populate("meets");
	return channel;
};
module.exports = {
	getchannel,
	createchannel,
    getchannelmeets,
    getchannelwithusers,
    getchannelusermeets,
};