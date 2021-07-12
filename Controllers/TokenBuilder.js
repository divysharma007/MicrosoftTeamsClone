// using agora-access-token for generating tokens which is required for user authentication 
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");


// Build Token with uid for screen stream and camera stream
const Tokenbuilder = (channelname) => {
	const appID = "a4fd8db003b946ad91dca2bc071f2019";
	const appCertificate = "389047fde19c47d4a7f495caee723fb0";
	const channelName = channelname;
	const uid = Math.floor(Math.random() * 1000) + 1;
	const screenuid = Math.floor(Math.random() * 1000) + 1;

	const role = RtcRole.PUBLISHER;

	const expiretimeinseconds = 360000;

	const curtimestamp = Math.floor(Date.now() / 1000);

	const privilegeExpire = curtimestamp + expiretimeinseconds;

	const tokenforuser = RtcTokenBuilder.buildTokenWithUid(
		appID,
		appCertificate,
		channelName,
		uid,
		role,
		privilegeExpire
	);
	const tokenforscreenshare = RtcTokenBuilder.buildTokenWithUid(
		appID,
		appCertificate,
		channelName,
		screenuid,
		role,
		privilegeExpire
	);
	return { channelName, tokenforuser, appID, uid, screenuid, tokenforscreenshare };
};
module.exports = Tokenbuilder;
