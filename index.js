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
const MessageRepository = require("./Repository/MessageRepository.js");
const ChannelRepository = require("./Repository/ChannelRepository.js");
const UserRepository = require("./Repository/UserRepository.js");
const mongodbStore = require("connect-mongodb-session")(session);
const morgan = require("mongoose-morgan");
var path = require("path");
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "/public")));

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
app.use(morgan({ connectionString: dburi }, {}, "short"));
morgan.token("remote-user", function (req, res, params) {
	if (req.session) {
		return req.session.userdata ? req.session.userdata.userPrincipalName : undefined;
	}
});

morgan.token("status", function (req, res, params) {
	if (req.method == "GET" || req.method == "PUT") {
		return 200;
	}
	if (req.method == "POST") {
		return 201;
	}
	if (req.method == "DELETE") {
		return 204;
	}
});

morgan.token("res", function (req, res, params) {
	return String(new Date());
});
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
	const user = await UserRepository.getuserwithrooms(
		req.session.userdata.userPrincipalName
	);
	res.render("profile",{user:user})
})
app.use("/", (req, res) => {
	res.render("notfound")
})

io.on("connection", (socket) => {
	
	socket.on("join-chat-room", (roomid) => {
	
		socket.join(roomid);
	
		socket.on("adduser", (username) => {
			socket.broadcast.to(roomid).emit("adduser",username,socket.id);
		});
		
	
		socket.on("message", async (username, data,timestr,mail) => {
			text = data;
	
			var single_channel = await ChannelRepository.getchannel(roomid);
			const newmessage = await MessageRepository.createmessage(username, text, timestr, mail);
			
			single_channel.messages.push(newmessage.id);
			await single_channel.save();
			socket.broadcast
				.to(roomid)
				.emit("message", username,text, timestr,mail);
		
		});
		socket.on("disconnect", () => {
			socket.broadcast.to(roomid).emit("removeuser", socket.id);
			
			});

	});
	socket.on("join-group", (GroupId) => {
		socket.join(GroupId);
		
		
		socket.on("message", async (username, data,timestr,mail,link) => {
			text = data;
	
			var single_channel = await ChannelRepository.getchannel(GroupId);
			const newmessage = await MessageRepository.createmessage(username, text, timestr, mail);
			single_channel.messages.push(newmessage.id);
			if (link) {
				single_channel.meets.push(link);
			}
	
			await single_channel.save();
			socket.broadcast.to(GroupId).emit("message", username, text, timestr,mail);
			
		});

		socket.on("disconnect", () => {
		  socket.broadcast.to(GroupId).emit("user-disconnected", GroupId);
		});
	});
});

