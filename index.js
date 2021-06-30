const express = require("express");
const app = express();
const server = require("http").Server(app);
const authrouter = require("./Controllers/authentication.js");
const mongoose = require("mongoose");
const roomrouter = require("./Controllers/room");
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const session = require("express-session");
const Message = require("./models/Message.js");
const room = require("./models/Room.js");
const mongodbStore = require("connect-mongodb-session")(session);
var path = require("path");
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "/public")));
console.log(path.join(__dirname, "/public"));
dburi =
	"mongodb+srv://divy:abc@cluster0.ehpvg.mongodb.net/microsoft-clone?retryWrites=true&w=majority";
mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });
const store = new mongodbStore({
	uri: dburi,
	collection: "session",
});
app.use(
	session({
		secret: "my secret",
		resave: "false",
		saveUninitialized: "false",
		store: store,
	})
);
app.use((req, res, next) => {
	if (req.session.userdata)
		res.locals.username = req.session.userdata.displayName;
	next();
});
store.on("error", function (error, res) {
	res.send(error);
});
const con = mongoose.connection;

con.on("open", () => {
	console.log("connected...");
	server.listen(process.env.PORT || 3000, () => {
		console.log("listening on 3000");
	});
});
app.get('/api/room/:id', async (req, res) => {

	single_room = await room.findById(req.params.id).populate("messages");
	res.json(single_room)
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", authrouter);

app.use((req, res, next) => {
	if (!req.session.logged) req.session.logged = false;
	console.log(req.session.logged, req.url);
	if (!req.session.logged) {
		res.redirect("/");
	} else {
		next();
	}
});
app.use("/room", roomrouter);
app.use("/logout", (req, res) => {
	req.session.destroy();
	res.send("logged out");
});
var text = {
	text: "",
};

io.on("connection", (socket) => {
	socket.on("join-chat-room", (roomid) => {
		console.log(roomid);
		socket.join(roomid);
		console.log(socket.id, roomid);

		socket.on("message", (message) => {
			console.log(socket.id, roomid, message);
			socket.broadcast.to(roomid).emit("text", message);
			console.log("message received and broadcasted");
		});
	});
	socket.on("join-group", (GroupId) => {
		socket.join(GroupId);

	
		socket.on("message", async (username, data) => {
			console.log(data);
			var timestr = timestring(new Date());
			text.text = data;
			io.sockets.emit("text", data);
			var single_room = await room.findById(GroupId);
			const newmessage = new Message({
				name: username,
				content: text.text,
				date: timestr,
			});
			await newmessage.save();
			single_room.messages.push(newmessage.id);
			await single_room.save();
			socket.broadcast.to(GroupId).emit("message", username, text.text, timestr);
			console.log("message received and broadcasted");
		});

		socket.on("disconnect", () => {
			socket.broadcast.to(GroupId).emit("user-disconnected", GroupId);
		});
	});
});
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

