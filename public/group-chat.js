console.log(ROOM_ID);
const url = `/api/room/${ROOM_ID}`;
console.log(url, ROOM_ID);
const info = async (url) => {
	return await axios.get(url);
};
const room = info(url);
room.then((data) => {
	console.log(data.data.messages);
	// console.log(room.data)
	data.data.messages.map((mes) => {
		message(mes.name, mes.content, mes.date);
	});
});

var socket;
var text = {
	text: "",
};
const messages = document.getElementById("chat-show");
var stringToHTML = function (str) {
	var parser = new DOMParser();
	str = String(str);

	var doc = parser.parseFromString(str, "text/html");
	console.log(123, doc.body.innerHTML);

	return doc.body.innerHTML;
};
function setup() {
	socket = io.connect("http://localhost:3000");
	socket.emit("join-group", ROOM_ID);

	$("#text").froalaEditor({
		toolbarButtons: [
			"fullscreen",
			"bold",
			"italic",
			"underline",
			"strikeThrough",
			"subscript",
			"superscript",
			"|",
			"fontFamily",
			"fontSize",
			"color",
			"inlineStyle",
			"paragraphStyle",
			"|",
			"paragraphFormat",
			"align",
			"formatOL",
			"formatUL",
			"outdent",
			"indent",
			"quote",
			"-",
			"insertLink",
			"insertImage",
			"insertVideo",
			"insertFile",
			"insertTable",
			"|",
			"emoticons",
			"specialCharacters",
			"insertHR",
			"selectAll",
			"clearFormatting",
			"|",
			"print",
			"help",
			"html",
			"|",
			"undo",
			"redo",
		],
	});

	socket.on("message", message);

	document.getElementById("defaultCanvas0").style.display = "none";
	var x = document.getElementById("chat_input_field");
	console.log(x);
	x.classList.remove("input-group");
}

const message = (username, text, timestr) => {
	card = document.createElement("div");
	card.className = "card";
	card.style.marginBottom = "0.5%";
	cardbody = document.createElement("div");
	cardbody.className = "card-body";
	cardtitle = document.createElement("h5");
	cardtitle.className = "card-title";
	cardtitle.innerHTML = username;
	cardsubtitle = document.createElement("h6");
	cardsubtitle.className = "card-subtitle mb-2 text-muted";
	cardsubtitle.innerHTML = timestr;
	cardtext = document.createElement("div");
	console.log(text);
	cardtext.innerHTML = stringToHTML(text);

	cardbody.appendChild(cardtitle);
	cardbody.appendChild(cardsubtitle);
	cardbody.appendChild(cardtext);
	card.appendChild(cardbody);
	messages.append(card);
};
const shower = () => {
	var html = $("#text").froalaEditor("html.get");
	var data = {
		text: html,
	};

	socket.emit("message", username, data.text);

	card = document.createElement("div");
	card.className = "card";
	card.style.marginBottom = "0.5%";
	cardbody = document.createElement("div");
	cardbody.className = "card-body";
	cardtitle = document.createElement("h5");
	cardtitle.className = "card-title";
	cardtitle.innerHTML = username;
	cardsubtitle = document.createElement("h6");
	cardsubtitle.className = "card-subtitle mb-2 text-muted";
	cardsubtitle.innerHTML = timestring(new Date());
	cardtext = document.createElement("div");

	cardtext.innerHTML = data.text;
	cardbody.appendChild(cardtitle);
	cardbody.appendChild(cardsubtitle);
	cardbody.appendChild(cardtext);
	card.appendChild(cardbody);
	messages.append(card);
};
function timestring(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? "pm" : "am";
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? "0" + minutes : minutes;
	var time =
		String(date.getDate()) +
		"/" +
		String(date.getMonth()) +
		"/" +
		String(date.getFullYear()) +
		", " +
		hours +
		":" +
		minutes +
		" " +
		ampm;

	return time;
}
