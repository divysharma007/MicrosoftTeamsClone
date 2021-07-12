const router = require("express").Router();
const msal = require("@azure/msal-node");
const axios = require("axios");
const User = require("../models/User");

var accesstoken;
// Giver your App details 
const configuration = {
	auth: {
		clientId: "593d89bc-523b-4e46-9d9c-f97753ac8ae9",
		authority: "https://login.microsoftonline.com/common",
		clientSecret: "D~6Pp~38Y6yPb1w.2X_Ltnw~YN-OA27xw7",
		postlogoutRedirectUri:
			"https://meteor-teams.herokuapp.com/logout",
	},
	system: {
		loggerOptions: {
			loggerCallback(loglevel, message, containsPii) {},
			piiLoggingEnabled: false,
			logLevel: msal.LogLevel.error,
		},
	},
};
// Create msal instance
const msal_cca = new msal.ConfidentialClientApplication(configuration);
// Redirect to microsoft authentication page after forming proper URL
router.get("/", (req, res) => {
	req.session.logged = true;
	const authCodeUrlParametersNeeded = {
		scopes: ["user.read"],
		redirectUri: "https://meteor-teams.herokuapp.com/redirect",
	};

	msal_cca
		.getAuthCodeUrl(authCodeUrlParametersNeeded)
		.then((response) => {
			res.redirect(response);
		})
		.catch((error) => console.log(JSON.stringify(error)));
});
//Gets Token after Authentication
router.get("/redirect", (req, res) => {
	const RequestforToken = {
		code: req.query.code,
		scopes: ["user.read"],
		redirectUri: "https://meteor-teams.herokuapp.com/redirect",
	};

	msal_cca
		.acquireTokenByCode(RequestforToken)
		.then((response) => {
		
		
		
			req.session.accesstoken = response.accessToken;
			accesstoken = response.accessToken;
			res.redirect("/data");
		})
		.catch((error) => {
		
			res.status(500).send(error);
		});
});
// Call Graph API for User information 
router.get("/data", (req, res) => {

	const response = axios("https://graph.microsoft.com/v1.0/me", {
		method: "GET",
		headers: { Authorization: `Bearer ${accesstoken}` },
	})
		.then(async (data) => {
			req.session.userdata = data.data;

		
			user = await User.findOne({ mail: data.data.userPrincipalName });
		
			if (!user) {
				const newuser = new User({
					mail: data.data.userPrincipalName,
					username: data.data.displayName,
				});
				await newuser.save();
			}
			res.redirect("/room/");
		})
		.catch((err) => {
			res.send("Error : Unauthorized " +err );
		});
});

module.exports = router;
