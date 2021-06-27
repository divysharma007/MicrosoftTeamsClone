const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

// IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

// Build token with uid
const builder = (channelname) => {
	const agoraappID = "a4fd8db003b946ad91dca2bc071f2019";
	const appCertificate = "389047fde19c47d4a7f495caee723fb0";
	const channelName = channelname;
	const uid = Math.floor(Math.random() * 1000) + 1;
	const screenuid = Math.floor(Math.random() * 1000) + 1;

	const role = RtcRole.PUBLISHER;

	const expirationTimeInSeconds = 360000;

	const currentTimestamp = Math.floor(Date.now() / 1000);

	const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

	const token = RtcTokenBuilder.buildTokenWithUid(
		agoraappID,
		appCertificate,
		channelName,
		uid,
		role,
		privilegeExpiredTs
	);
	const screentoken = RtcTokenBuilder.buildTokenWithUid(
		agoraappID,
		appCertificate,
		channelName,
		screenuid,
		role,
		privilegeExpiredTs
	);
	return { channelName, token, agoraappID, uid, screenuid, screentoken };
};
module.exports = builder;
