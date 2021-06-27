const router = require("express").Router();
const msal = require("@azure/msal-node");
const axios = require("axios");
const User = require("../models/User");

let accesstoken;
const config = {
	auth: {
		clientId: "593d89bc-523b-4e46-9d9c-f97753ac8ae9",
		authority: "https://login.microsoftonline.com/common",
		clientSecret: "D~6Pp~38Y6yPb1w.2X_Ltnw~YN-OA27xw7",
		postlogoutRedirectUri: "http://localhost:3000/logout/",
	},
	system: {
		loggerOptions: {
			loggerCallback(loglevel, message, containsPii) {},
			piiLoggingEnabled: false,
			logLevel: msal.LogLevel.error,
		},
	},
};

const cca = new msal.ConfidentialClientApplication(config);
router.get("/", (req, res) => {
	req.session.logged = true;
	const authCodeUrlParameters = {
		scopes: ["user.read", "Mail.read"],
		redirectUri: "http://localhost:3000/redirect",
	};

	cca
		.getAuthCodeUrl(authCodeUrlParameters)
		.then((response) => {
			res.redirect(response);
		})
		.catch((error) => console.log(JSON.stringify(error)));
});

router.get("/redirect", (req, res) => {
	const tokenRequest = {
		code: req.query.code,
		scopes: ["user.read", "mail.read"],
		redirectUri: "http://localhost:3000/redirect",
	};

	cca
		.acquireTokenByCode(tokenRequest)
		.then((response) => {
			var user_details = response;
			accesstoken = response.accessToken;
			res.redirect("/data");
		})
		.catch((error) => {
			console.log(error);
			res.status(500).send(error);
		});
});

router.get("/data", (req, res) => {
	const response = axios("https://graph.microsoft.com/v1.0/me", {
		method: "GET",
		headers: { Authorization: `Bearer ${accesstoken}` },
	})
		.then(async (data) => {
			req.session.userdata = data.data;

			// console.log(req.session.userdata.displayName)
			// console.log(accesstoken,data.data)
			user = await User.findOne({ mail: data.data.userPrincipalName });
			console.log(user, data.data.displayName, data.data.mail);
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
			res.send("Error : Unauthorized");
		});
});

module.exports = router;
