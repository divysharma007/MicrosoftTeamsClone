var allrooms=[]
const searchbar = document.getElementById("searchbar");
const grpcontainer=document.getElementById("grp-show")
searchbar.addEventListener("keyup", async (e) => {
	const searchstr = e.target.value.toLowerCase();
	var rooms = allrooms;
	newrooms = rooms.data.rooms.filter((room) => {
		return (
			room.name.toLowerCase().includes(searchstr) 
		);
	});

	while (grpcontainer.firstChild) {
		grpcontainer.removeChild(grpcontainer.lastChild);
	}
	newrooms.map((room) => {
		let grp = document.createElement("a");
		grp.setAttribute("href", "./" + room._id + "/");

		pic = document.createElement("div");
		pic.innerHTML = room.name[0].toUpperCase();

		pic.setAttribute("class", "pic");
		grp.appendChild(pic);

		grpname = document.createElement("div");
		grpname.innerHTML = room.name;
		grpname.setAttribute("class", "grp");

		grp.appendChild(grpname);
		grp.setAttribute("class", "grpcard");
		grpcontainer.appendChild(grp);
	});
});
const displayrooms = async () => {
	var rooms = await axios.get(`/api/rooms/`);
	allrooms=rooms
	console.log(rooms);
	rooms.data.rooms.map((room) => {
		let grp = document.createElement("a");
		grp.setAttribute("href", "./" + room._id + "/");

		pic = document.createElement("div");
		pic.innerHTML = room.name[0].toUpperCase();

		pic.setAttribute("class", "pic");
		grp.appendChild(pic);

		grpname = document.createElement("div");
		grpname.innerHTML = room.name;
		grpname.setAttribute("class", "grp");

		grp.appendChild(grpname);
		grp.setAttribute("class", "grpcard");
		grpcontainer.appendChild(grp);
	});
};
displayrooms();
