const express = require("express");
const app = express();
const server = require("http").Server(app);
const authrouter = require("./Controllers/authentication.js");
const apirouter = require("./Controllers/api.js");
const mongoose = require("mongoose");
const roomrouter = require("./Controllers/room");
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const session = require("express-session");
const Message = require("./models/Message.js");
const channel = require("./models/Channel.js");
const User = require("./models/User.js");
const mongodbStore = require("connect-mongodb-session")(session);
const morgan = require("mongoose-morgan");
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
app.use(
	morgan({
		connectionString: dburi,
	}, {},'short')
);
app.use((req, res, next) => {
	if (req.session.userdata)
		res.locals.username = req.session.userdata.displayName;
	next();
});
store.on("error", function (error) {
	console.log(error);
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
	if (!req.session.logged) req.session.logged = false;
	console.log(req.session.logged, req.url);
	if (!req.session.logged || !req.session.userdata) {
		res.redirect("/");
	} else {
		next();
	}
});




app.use("/room", roomrouter);
app.use("/api", apirouter);
app.use("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/");
});
app.use("/profile/", async (req, res) => {
	const user = await User.findOne({
		mail: req.session.userdata.userPrincipalName,
	}).populate("rooms");
	res.render("profile",{user:user})
})

io.on("connection", (socket) => {
	socket.on("join-chat-room", (roomid) => {
		console.log(roomid);
		socket.join(roomid);
		console.log(socket.id, roomid);

		socket.on("message", (message) => {
			console.log(socket.id, roomid, message);
			socket.broadcast.to(roomid).emit("message", message);
			console.log("message received and broadcasted");
		});
	});
	socket.on("join-group", (GroupId) => {
		socket.join(GroupId);
		
		
		socket.on("message", async (username, data,timestr,type) => {
			text = data;
	
			var single_channel = await channel.findById(GroupId);
			const newmessage = new Message({
				name: username,
				content:text,
				date: timestr,
				type:type
			});
			await newmessage.save();
			single_channel.messages.push(newmessage.id);
			await single_channel.save();
			socket.broadcast.to(GroupId).emit("message", username, text, timestr,type);
			console.log("message received and broadcasted");
		});

		socket.on("disconnect", () => {
		
			
			socket.broadcast.to(GroupId).emit("user-disconnected", GroupId);
		});
	});
});

