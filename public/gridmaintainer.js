//Finds maximum possible width of a single video stream in  Grid (taking account of Grid dimensions)
function maxpossiblewidth(Increment, Count, Width, Height, Margin = 10) {
	let i = (w = 0);
	let h = Increment * 0.75 + Margin * 2;
	while (i < Count) {
		if (w + Increment > Width) {
			w = 0;
			h = h + Increment * 0.75 + Margin * 2;
		}
		w = w + Increment + Margin * 2;
		i++;
	}
	if (h > Height) return false;
	else return Increment;
}
// Resizes Grid whenever required
function ResizeGrid() {
	// variables:
	let Margin = 2;
	let Scenary = document.getElementById("video-grid");
	let Width = Scenary.offsetWidth - Margin * 2;
	let Height = Scenary.offsetHeight - Margin * 2;
	let Cameras = document.getElementsByClassName("user-container");
	let max = 0;


	let i = 1;
	while (i < 5000) {
		let w = maxpossiblewidth(i, Cameras.length, Width, Height, Margin);
		if (w === false) {
			max = i - 1;
			break;
		}
		i++;
	}


	max = max - Margin * 2;
	assignWidth(max, Margin);
}

// set width and margin of each stream in the Grid
function assignWidth(width, margin) {
	let Cameras = document.getElementsByClassName("user-video");
	for (var s = 0; s < Cameras.length; s++) {
		Cameras[s].style.width = width + "px";
		Cameras[s].style.margin = margin + "px";
		Cameras[s].style.height = width * 0.75 + "px";
	}
}

// whenever page loads or resizes takes place call ResizeGrid to resize the grid 
window.addEventListener(
	"load",
	function () {
		ResizeGrid();
		window.onresize = ResizeGrid;
	},
	false,
	ResizeGrid()
);

window.addEventListener(
	"onresize",
	function (event) {
		ResizeGrid();
		window.onresize = ResizeGrid;
	},
	false
);
// Chatr section will show/hide by calling this function
const chat = () => {
	
	var x = document.getElementById("main__right");
	var y = document.getElementById("main__left");
	
	
	if (x.style.display === "none" || y.style.width == "100%") {
		
		x.style.display = "flex";
		document.getElementsByClassName("fr-element")[0].focus();
		y.style.width = "80%";
		document.getElementById("chat-btn").innerHTML = "chat_bubble_outline";
	} else {
		y.style.width = "100%";
		x.style.display = "none";
		document.getElementById("chat-btn").innerHTML = "chat_bubble";
	}
	// resize grid after showing/hiding chat section
	ResizeGrid();
};
