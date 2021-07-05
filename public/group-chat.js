let roommessages = []
let roomnewmessages=[]
const url = `/api/channel/${CHANNEL_ID}`;

const displaymessages = async function () {
	

    roommessages = await axios.get(url);
	roommessages.data.messages.map((mes) => {
		
			message(mes.name, mes.content, mes.date, mes.type);
		});

}
const messages = document.getElementById("chat-show");
const searchbar = document.getElementById("searchbar")
searchbar.addEventListener('keyup', async(e) => {
	const searchstr = e.target.value.toLowerCase();
	var messdata = roommessages
	var newmessdata =roomnewmessages
	messdata=messdata.data.messages.filter(mes => {
		return mes.content.toLowerCase().includes(searchstr) || mes.name.toLowerCase().includes(searchstr);
	})
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

	message(mes.name, mes.content, mes.date, mes.type);
	});
		newmessdata.map((mes) => {
			message(mes[0], mes[1], mes[2], mes[3]);
		});
	
	
})
var socket;


var stringToHTML = function (str) {
	var parser = new DOMParser();

	str = String(str);

	var doc = parser.parseFromString(str, "text/html");

  
	return doc.body.innerHTML;
};
function setup() {
	socket = io	("/");
	socket.emit("join-group",CHANNEL_ID);

	$("#text").froalaEditor({
		toolbarButtons: [
			"fullscreen",

			// "fontFamily",
			
			"insertLink",
			"insertImage",
			"insertVideo",
			"insertFile",
			"insertTable",
			"|",
			"specialCharacters",
			"insertHR",
			"selectAll",
			"clearFormatting",
			"|",
			"html",
			"|",
			"undo",
			"redo",
		],
	});

	socket.on("message", (username, text, timestr, type) => {
		if (searchbar.value.length == 0)
			message(username, text, timestr, type);
		mes = [username, text, timestr, type];
		roomnewmessages.push(mes)
	});
	

	document.getElementById("defaultCanvas0").style.display = "none";

}

const message = (username, text, timestr,type) => {

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

	if (type == "message") {
		cardtext = document.createElement("div");
		cardtext.innerHTML = stringToHTML(text);
	} else {
		cardtext = document.createElement("div");
		btn = document.createElement("button");
		btn.className="btn btn-primary"
		a = document.createElement("a");
		a.setAttribute("href", text);
		a.style.color = "whitesmoke";
		a.innerHTML="Join Meeting"
		btn.appendChild(a)

		
		cardtext.innerHTML = "<p>Started Meeting-</p>"
		cardtext.appendChild(btn)
		

	}

	cardbody.appendChild(cardtitle);
	cardbody.appendChild(cardsubtitle);
	cardbody.appendChild(cardtext);
	card.appendChild(cardbody);
	messages.append(card);
	messages.scrollTop = messages.scrollHeight;
   
	
};

const shower = () => {
	
	var html = $("#text").froalaEditor("html.get");
    console.log(html)
	var timestr = timestring(new Date());
	socket.emit("message", username, String(html), timestr, "message");
	mes = [username, String(html), timestr, "message"];
	roomnewmessages.push(mes)
	
	message(username, String(html), timestring(new Date()),"message");
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
		String(date.getMonth()+1) +
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

const link = (roomid) => {
	var cururl = String(window.location.href);
	if (cururl.charAt(cururl.length - 1) == '#') { cururl=cururl.substring(0,cururl.length-1)};
	const url = cururl+"video/"+roomid;
	socket.emit("message", username, url,timestring(new Date()),"link");
	
	console.log(roomid)
	window.location.href = url;

}

const channelgrid=document.getElementById("channel-show")
const displaychannel = async() => {
	var channels = await axios.get(`/api/room/${ROOM_ID}`);
	channels.data.map((channel) => {
		var doc = document.createElement("div");
		doc.style.marginBottom = "1%"
		doc.className = "channel"
			if (channel._id == CHANNEL_ID) {
				doc.style.backgroundColor = "lightgrey";
			}
		var a = document.createElement("a");
		a.style.display = "inline-block"
		a.style.width="100%";
		a.setAttribute("href", "../" + channel._id + "/");
		a.innerHTML = channel.name;
		doc.append(a)
	
		
		channelgrid.appendChild(doc)
	})
	
	
}
const isgen = () => {
	console.log(channeln)
	if (channeln == "General") {
		document.getElementById("ifnotgeneral").style.display="none";

	}
}
isgen();
displaychannel();
displaymessages()

