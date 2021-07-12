// stores messages that comes after the page has been loaded 
let roommessages = []
let roomnewmessages = [];
const url = `/api/channel/${MEET_ID}`;
// displays messages after the page loads 
const displaymessages = async function () {
    roommessages= await axios.get(url)
	roommessages.data.messages.map((mes) => {
		message(mes.name, mes.content, mes.date,mes.mail);
	});
};
const messages = document.getElementById("chat-show");
const searchbar = document.getElementById("searchbar");
// renders messages after filtering it according to searchbar value
searchbar.addEventListener("keyup", async (e) => {
	const searchstr = e.target.value.toLowerCase();
	var messdata = roommessages;
	var newmessdata = roomnewmessages;
	messdata = messdata.data.messages.filter((mes) => {
		return (
			mes.content.toLowerCase().includes(searchstr) ||
			mes.name.toLowerCase().includes(searchstr)
		);
	});
	newmessdata = newmessdata.filter((mes) => {
		return (
			mes[1].toLowerCase().includes(searchstr) ||
			mes[0].toLowerCase().includes(searchstr)
		);
	});

	while (messages.firstChild) {
		messages.removeChild(messages.lastChild);
	}
	messdata.map((mes) => {
		message(mes.name, mes.content, mes.date,mes.mail);
	});
	newmessdata.map((mes) => {
		message(mes[0], mes[1], mes[2], mes[3]);
	});
});
var socket;
// Converts string(message content) to html to be rendered
var stringToHTML = function (str) {
	var parser = new DOMParser();

	str = String(str);

	var doc = parser.parseFromString(str, "text/html");

	return doc.body.innerHTML;
};
// after the page loads 
function setup() {
	socket = io("/");
	//Socket joins meet
	socket.emit("join-group", MEET_ID);

	// Froala Editor settings
	$("#text").froalaEditor({
		toolbarButtons: [
			"color",
			"inlineStyle",
			"|",
			"formatOL",
			"formatUL",
			"outdent",
			"indent",
			"insertLink",
			"insertImage",
			"insertVideo",
			"insertFile",
			"|",
			"specialCharacters",
			"insertHR",
			"selectAll",
			"|",
			"html",
			"|",
			"undo",
			"redo",
			"|",
		],
		toolbarButtonsMD: [
			"color",
			"inlineStyle",
			"|",
			"formatOL",
			"formatUL",
			"outdent",
			"indent",
			"insertLink",
			"insertImage",
			"insertVideo",
			"insertFile",
			"|",
			"specialCharacters",
			"selectAll",
			"|",
			"undo",
			"redo",
			"|",
		],
		toolbarButtonsSM: [
			"color",
			"inlineStyle",
			"|",
			"formatOL",
			"formatUL",
			"outdent",
			"indent",
			"insertLink",
			"insertImage",
			"insertVideo",
			"insertFile",
			"|",
			"specialCharacters",
			"selectAll",
			"|",
			"undo",
			"redo",
			"|",
		],
		toolbarButtonsXS: [
			"color",
			"|",
			"insertImage",
			"insertVideo",
			"insertLink",
			"insertFile",
			"|",
			"specialCharacters",
			"|",
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
	socket.on("message", (username, text, timestr, email) => {
		if (searchbar.value.length == 0) message(username, text, timestr, email);
		mes = [username, text, timestr, email];
		roomnewmessages.push(mes);
	});

	document.getElementById("defaultCanvas0").style.display = "none";
}
// this creates messages and then these messages are pushed in chat-show section
const message = (username, text, timestr,email) => {
	card = document.createElement("div");
	card.className = "card";
	if (email == mail) {
		card.style.borderLeft = "3px solid #464775";
	}
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
// Pushes  message on sender side 's chat -show and then emits this message to all other sockets in channel
const shower = async() => {
	var html = $("#text").froalaEditor("html.get");
	var timestr = new Date().toLocaleString("en-US", {
		timeZone: "Asia/Kolkata",
	});
	await socket.emit("message", username, String(html), timestr,mail);
	mes = [username, String(html), timestr,mail];
	roomnewmessages.push(mes);
	var x = document.getElementsByClassName("fr-element")[0];
	x.innerHTML = "";

	document
		.getElementsByClassName("fr-wrapper")[0]
		.classList.add("show-placeholder");
	x.focus();

	message(username, String(html),timestr,mail);
};


//Checks current channel and then makes background light grey
const isactive = () => {

	document.getElementById(`channel_${MEET_ID}`).style.backgroundColor =
		"lightgrey";

};
isactive();

displaymessages()

