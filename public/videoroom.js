// stores messages and socket ids 
var socketu = [];
var usernames = [];
usernames.push(username);
var Profile = "480P_4"; //Video profile settings : 640 × 480 @ 30fps
const socket = io("/");

// create client instances for camera (clientinstance) and screen share (ClientScreenShare)
var clientinstance = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
var ClientScreenShare;
// stream references (keep track of active streams)
var StreamsContainer = {
	camera: {
		id: "",
		stream: {},
	},
	screen: {
		id: "",
		stream: {},
	},
};

AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.NONE);

var IsscreenShareActive = false; // flag for screen-share

function initClientAndJoinChannel() {
	// initialize Agora SDK
	clientinstance.init(
		AppId,
		function () {
			console.log("AgoraRTC client initialized");
			console.log(channelName);
			joinChannel(channelName, uid, token);

			socket.emit("join-chat-room", channelName);
			socket.emit("adduser", username);

			// join channel upon successfull initialization
		},
		function (err) {
			console.log("[ERROR] : AgoraRTC client init failed", err);
		}
	);
}
initClientAndJoinChannel();

clientinstance.on("stream-published", function () {
	console.log(" Local stream successfully publisehd");
});

// User subscribes the incoming stream
clientinstance.on("stream-added", function (incomingstream) {
	var stream = incomingstream.stream;
	clientinstance.subscribe(stream, function (err) {
		console.log("[ERROR] : subscribe stream failed", err);
	});
	socket.emit("adduser", username);
});
// Add the incoming stream to the Grid
clientinstance.on("stream-subscribed", function (incomingstream) {
	var newStream = incomingstream.stream;
	AddRemoteStreamToGrid(newStream);
});

// remove the video-container when a user leaves the channel
clientinstance.on("peer-leave", function (incomingstream) {
	var streamId = incomingstream.stream.getId(); // the stream id
	var removeContainerID = "#" + streamId + "_container";
	$(removeContainerID).empty().remove(); // remove the video-container
	ResizeGrid(); // resize grid after removing
});

// join a channel
function joinChannel(channelName, uid, token) {
	clientinstance.join(
		token,
		channelName,
		uid,
		function (uid) {
			
			getStream(uid);
			StreamsContainer.camera.id = uid; // keep track of the stream uid
		},
		function (err) {
			console.log("[ERROR] : join channel failed", err);
		}
	);
}

// Gets user stream and then adds to the Grid and then sends to Agora
function getStream(uid) {
	var localStream = AgoraRTC.createStream({
		streamID: uid,
		audio: true,
		video: true,
		screen: false,
	});
	localStream.setVideoProfile(Profile);

	localStream.init(
		function () {
			// Add to Grid
			AddRemoteStreamToGrid(localStream);

			// publish local stream
			clientinstance.publish(localStream, function (err) {
				console.log("[ERROR] : publish local stream error: " + err);
			});
			// enables user interface controls on the user's stream
			enableUiControls(localStream);
			StreamsContainer.camera.stream = localStream; // keeps track of the this(camera) stream for later
		},
		function (err) {
			document.getElementById("video-icon").innerHTML = "videocam_off";
			document.getElementById("video-btn").classList.toggle("btn-danger");
			document.getElementById("mic-icon").innerHTML = "mic_off";
			document.getElementById("mic-btn").classList.toggle("btn-danger");
			document.getElementById("screen-share-icon").innerHTML =
				"cancel_presentation";
			document
				.getElementById("screen-share-btn")
				.classList.toggle("btn-danger");
			console.log("[ERROR] : getUserMedia failed", err);
		}
	);
}

// Screen sharing function
function ShareScreen(AppId, channelName) {
	// Screen sharing is initialized and this stream is added as if a new client has joined
	ClientScreenShare = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
	// Gets user's screen stream
	ClientScreenShare.init(AppId);
	// keep track of the uid of the screen stream.
	StreamsContainer.screen.id = screenuid;

	// Create the stream for screen sharing.
	var ScreenShareStream = AgoraRTC.createStream({
		streamID: screenuid,
		audio: false, // Set the audio attribute as false to avoid any echo during the meet
		video: false,
		screen: true, // screen stream
		screenAudio: true,
		mediaSource: "screen",
	});
	// set video settings
	ScreenShareStream.setVideoProfile(Profile);
	// initialize the screen share stream
	ScreenShareStream.init(
		function () {
			StreamsContainer.screen.stream = ScreenShareStream; // keep track of the screen share stream
			IsscreenShareActive = true;
			$("#screen-share-btn").prop("disabled", false); // enable screen share button
			ClientScreenShare.join(
				screentoken,
				channelName,
				screenuid,
				function () {
					ClientScreenShare.publish(ScreenShareStream, function (err) {
						console.log("[ERROR] : publish screen share stream error: " + err);
					});
				},
				function (err) {
					console.log("[ERROR] : join channel as screen-share failed", err);
				}
			);
		},
		function (err) {
			document.getElementById("screen-share-icon").innerHTML = "screen_share";
			console.log("[ERROR] : getScreen failed", err);
			StreamsContainer.screen.id = ""; // reset screen share stream id
			StreamsContainer.screen.stream = {}; // reset the screen share stream
			IsscreenShareActive = false; // resest screen share flag
			toggleScreenShareBtn(); // toggle the button icon back
			$("#screen-share-btn").prop("disabled", false); // enable button
		}
	);
}
// function to stop screen sharing
function StopScreenShare() {
	StreamsContainer.screen.stream.disableVideo(); // disable the  video stream (will send a mute signal)
	StreamsContainer.screen.stream.stop(); // stop playing the  stream

	$("#video-btn").prop("disabled", false);
	ClientScreenShare.leave(
		function () {
			IsscreenShareActive = false;
			console.log("screen client leaves channel");
			$("#screen-share-btn").prop("disabled", false); // enable screen share  button
			StreamsContainer.screen.stream.stop();
			ClientScreenShare.unpublish(StreamsContainer.screen.stream); // unpublish the screen share client
			StreamsContainer.screen.stream.close(); // close the screen  share  stream
			StreamsContainer.screen.id = ""; // reset the screen share id
			StreamsContainer.screen.stream = {}; // reset the screen share stream object
		},
		function (err) {
			console.log("client failed to leave ", err); //handle errors
		}
	);
}

// This function creates video element and gives sources as the stream given in input and then adds this into a container and appends this container into the Grid
function AddRemoteStreamToGrid(newStream) {
	var streamId = newStream.getId();
	// append the stream to Grid
	$("#video-grid").append(
		$("<div/>", {
			id: streamId + "_container",
			class: "user-container",
		}).append(
			$("<div/>", { id: "user_video_" + streamId, class: "user-video" })
		)
	);
	newStream.play("user_video_" + streamId);
	document.getElementById("video" + streamId).style.objectFit = "contain";
	document.getElementById("video" + streamId).style.backgroundColor = "#5f6368";
	document.getElementById("player_" + streamId).style.backgroundColor =
		"transparent";

	ResizeGrid(); // resize grid after new user stream joins the Grid
}
// this function removes user stream after the user leaves the meet
function leaveMeet() {
	// remove screen share stream if the user is sharing screen as well
	if (IsscreenShareActive) {
		StopScreenShare();
	}

	clientinstance.leave(
		function () {
			console.log("client leaves channel");
			StreamsContainer.camera.stream.stop(); // stop the camera stream playback of the user
			clientinstance.unpublish(StreamsContainer.camera.stream); // unpublish the camera stream of the user
			StreamsContainer.camera.stream.close(); // clean up and close the camera stream of the user
			$("#remote-streams").empty();
			//disable the UI elements which were enabled when the stream was received first time
			$("#mic-btn").prop("disabled", true);
			$("#video-btn").prop("disabled", true);
			$("#screen-share-btn").prop("disabled", true);
			$("#exit-btn").prop("disabled", true);
			toggleVisibility("#mute-overlay", false);
			toggleVisibility("#no-local-video", false);
			ResizeGrid(); // resize grid after the user leaves
			redir(); // redirect back to meet room
		},
		function (err) {
			console.log("client failed  to leave", err); //error handling in case user couldnt leave properly
		}
	);
}

const messages = document.getElementById("main__chat__window");
const chat_inbox = document.getElementById("text");
var roomnewmessages = [];
// whenever new user join Meet append that user to Meet members
socket.on("adduser", (user, sid) => {
	if (!socketu.includes(sid)) {
		socketu.push(sid);
		usernames.push(user);
	}
});
// whenever a user leaves meet remove that user from Meet members
socket.on("removeuser", (sid) => {
	for (let i = 0; i < socketu.length; i++) {
		if (socketu[i] == sid) {
			socketu.splice(i, 1);
			usernames.splice(i, 1);
		}
	}
});
// on receiving message from other users
socket.on("message", (username, text, timestr) => {
	message(username, text, timestr);
	mes = [username, text, timestr];
	roomnewmessages.push(mes);
});
// convert messge content string to HTML
var stringToHTML = function (str) {
	var parser = new DOMParser();

	str = String(str);

	var doc = parser.parseFromString(str, "text/html");

	return doc.body.innerHTML;
};
// gets message from editor and then the socket emits this to the server
const shower = async (mes) => {
	var html = $("#text").froalaEditor("html.get");
	console.log(html);
	var timestr = new Date().toLocaleString("en-US", {
		timeZone: "Asia/Kolkata",
	});
	await socket.emit("message", username, String(html), timestr, mail);
	mes = [username, String(html), timestr, "message"];
	roomnewmessages.push(mes);
	var x = document.getElementsByClassName("fr-element")[0];
	x.innerHTML = "";

	document
		.getElementsByClassName("fr-wrapper")[0]
		.classList.add("show-placeholder");
	x.focus();

	message(username, String(html), timestr, "message");
};
// redirects the user
const redir = () => {
	document.location.href = "./";
};


// after the page loads
function setup() {
	// display the messages from the database
	displaymessages();
	// Froala Editor Settings for different type of screen sizes

	$("#text").froalaEditor({
		toolbarButtons: [
			"insertImage",
			"insertVideo",
			"insertFile",
			"insertLink",
			"|",
			"color",
			"|",
            "specialCharacters",
		],
		toolbarButtonsMD: [
			"insertLink",
			"insertImage",
			"insertVideo",
			"insertFile",
			"|",
			"specialCharacters",
			"|",
			"color",
		],
		toolbarButtonsSM: [
			"insertLink",
			"insertImage",
			"insertVideo",
			"insertFile",
			"|",
			"color",
			"|",
			"specialCharacters",
		],
		toolbarButtonsXS: [
			"insertImage",
			"insertVideo",
			"insertLink",
			"insertFile",
			"|",
			"specialCharacters",
			"|",
			"color",
		],

		theme: "gray",
		heightMin: 80,
		heightMax: 80,
		width: "100%",
		imageDefaultWidth: 50,
		requestWithCORS: true,
		imageResizeWithPercent: true,
		charCounterCount: true,
		toolbarBottom: true,
		tabSpaces: 4,
	});
	// remove agora unlicensed product div after the page loads
	var unlicensed_box = document.getElementsByClassName("fr-box")[0];
	if (
		unlicensed_box &&
		unlicensed_box.childNodes.length >= 2 &&
		unlicensed_box.childNodes[1].tagName == "DIV" &&
		unlicensed_box.childNodes[1].style.position == "absolute"
	) {
		unlicensed_box.childNodes[1].remove();
	}
}
// creates message container body and append it to chat section
const message = (username, text, timestr) => {
	card = document.createElement("div");
	card.className = "card";
	card.style.marginBottom = "0.5%";
	cardbody = document.createElement("div");
	cardbody.className = "card-body";
	cardtitle = document.createElement("h5");
	cardtitle.className = "card-title";
	cardtitle.innerHTML = username;
	cardtitle.style.fontSize = "1rem";
	cardsubtitle = document.createElement("h6");
	cardsubtitle.style.fontSize = ".8rem";
	cardsubtitle.className = "card-subtitle mb-2 text-muted";
	cardsubtitle.innerHTML = timestr;

	cardtext = document.createElement("div");
	cardtext.innerHTML = stringToHTML(text);

	cardbody.appendChild(cardtitle);
	cardbody.appendChild(cardsubtitle);
	cardbody.appendChild(cardtext);
	card.appendChild(cardbody);
	messages.append(card);
	messages.scrollTop = messages.scrollHeight;
};
// API url from which messages will be received
const url = `/api/channel/${CHANNEL_ID}`;

// place to show members in the meet
var x = document.getElementById("membercontainer");
//adds members present in the meet to the membercontainer after emptying existing members div
const showmembers = () => {
	while (x.firstChild) {
		x.removeChild(x.lastChild);
	}
	for (let i = 0; i < usernames.length; i++) {
		let y = document.createElement("div");
		y.innerHTML = usernames[i];
		x.append(y);
	}
};
// Get messages  from database after page loads and show them
const displaymessages = async function () {
	roommessages = await axios.get(url);
	roommessages.data.messages.map((mes) => {
		message(mes.name, mes.content, mes.date);
	});
};

