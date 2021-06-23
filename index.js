const express = require("express");
const app = express();
const server = require("http").Server(app);
const authrouter = require("./Controllers/authentication.js");
const mongoose = require("mongoose");
const roomrouter = require("./Controllers/room");
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);
app.set("view engine", "ejs");
app.use(express.static("views"));
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
		store: store
	})
);
store.on("error", function (error) {
	res.send(error);
});
const con = mongoose.connection;


con.on("open", () => {
	console.log("connected...");
	server.listen(process.env.PORT || 3000, () => {
		console.log("listening on 3000");
	});
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", authrouter);

app.use((req, res, next) => {
	
	if(!req.session.logged)req.session.logged=false
	console.log(req.session.logged,req.url);
	if (!req.session.logged) {
		res.redirect('/');
	}
	else {
       
		next();
	}
})
app.use("/room", roomrouter);
app.use("/logout", (req, res) => {
    req.session.destroy();
	res.send("logged out");
});

io.on("connection", (socket) => {
	console.log("socket connected ");
	socket.on("join-chat-room", (roomid) => {
		socket.join(roomid);
		console.log(socket.id, roomid);

		socket.on("message", (message) => {
			console.log(socket.id, roomid, message);
			socket.broadcast.to(roomid).emit("message", message);
			console.log("message received and broadcasted");
		});
	});
	socket.on("join-room", (roomId, userId) => {
		socket.join(roomId);
		socket.on("gotpermission", () => {
			socket.broadcast.to(roomId).emit("user-connected", userId);
		});

		socket.on("share-screen", (peerid) => {
			console.log(peerid);
            socket.broadcast.to(roomId).emit("share-screen", peerid);
		
			console.log("screen broadcasted");
		});

		socket.on("message", (message) => {
			socket.broadcast.to(roomId).emit("message", message);
			console.log("message received and broadcasted");
		});
		socket.on("disconnect", () => {
			socket.broadcast.to(roomId).emit("user-disconnected", userId);
		});
	});
});

