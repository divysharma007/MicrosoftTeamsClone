const socket = io("/");
console.log('working socet')
socket.emit("join-group", ROOM_ID);
const chat = document.getElementById("chat_input_field");
const messages = document.getElementById("chat-show");
socket.on("message", (username,mes,timestr) => {
	shower(username,mes,timestr);
});
const message = (username) => {
	// console.log(11)
	// console.log(username)
	// console.log(timestr);
	card = document.createElement("div");
	card.className = "card";
	card.style.marginBottom="0.5%"
	cardbody = document.createElement("div");
	cardbody.className = "card-body";
	cardtitle = document.createElement("h5");
	cardtitle.className = "card-title";
	cardtitle.innerHTML=username
	cardsubtitle = document.createElement("h6");
	cardsubtitle.className = "card-subtitle mb-2 text-muted";
	cardsubtitle.innerHTML = timestring(new Date())
	cardtext = document.createElement("p");
	cardtext.className = "card-text";
	cardtext.innerHTML = chat.value;
	cardbody.appendChild(cardtitle)
	cardbody.appendChild(cardsubtitle);
	cardbody.appendChild(cardtext);
	card.appendChild(cardbody)
	messages.append(card)
	socket.emit("message", username,chat.value);
};
const shower = (username,mes,timestr) => {
		// console.log(11);
		// console.log(username);
	    // console.log(timestr);
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
		cardsubtitle.innerHTML =timestr;
		cardtext = document.createElement("p");
		cardtext.className = "card-text";
		cardtext.innerHTML =mes;
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

