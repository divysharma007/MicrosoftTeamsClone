const socket = io("/");
socket.emit("join-chat-room", ROOM_ID);
const chat = document.getElementById("chat-box");
socket.on("message", (mes) => {
	shower(mes);
});
const message = () => {
	div = document.createElement("div");
	div.innerHTML = chat.value;
	div.className = "message";
	div.setAttribute("align", "right");
	messages.appendChild(div);
	socket.emit("message", chat.value);
};
const shower = (mes) => {
	div = document.createElement("div");
	div.innerHTML = mes;
	div.className = "message";
	div.setAttribute("align", "left");
	messages.appendChild(div);
};
