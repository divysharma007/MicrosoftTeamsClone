allrooms = JSON.parse(allrooms);
const searchbar = document.getElementById("searchbar");
const grpcontainer = document.getElementById("grp-show")

// renders Teams according to search bar value
searchbar.addEventListener("keyup", async (e) => {
	const searchstr = e.target.value.toLowerCase();
	var rooms = allrooms;
	newrooms = rooms.filter((room) => {
		return (
			room.name.toLowerCase().includes(searchstr) 
		);
	});

	while (grpcontainer.firstChild) {
		grpcontainer.removeChild(grpcontainer.lastChild);
	}
	
	newrooms.map((room) => {
		let grp = document.createElement("a");
		grp.setAttribute("href", "./" + room._id + "/channel/"+room.channels[0]+"/");
        let str = `https://place-hold.it/80/${room.color}/fff&text=${room.name[0].toUpperCase()}&fontsize=25px`;
		piccontainer = document.createElement("div");
		piccontainer.setAttribute("class", "piccontainer");
		pic = document.createElement("div");
		pic.setAttribute("class", "pic");
		img = document.createElement("img");
		img.setAttribute("src", str);
		img.style.paddingTop ="10px"
		pic.appendChild(img);

		grpname = document.createElement("div");
		grpname.innerHTML = room.name;
		grpname.setAttribute("class", "grp");
        piccontainer.appendChild(pic);
		piccontainer.appendChild(grpname);
		grp.append(piccontainer);
		grp.setAttribute("class", "grpcard");
		
		grpcontainer.appendChild(grp);
	});
});

