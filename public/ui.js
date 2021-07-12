// User Interface buttons
// enables button to the stream given in the function
function enableUiControls(localStream) {
	$("#mic-btn").prop("disabled", false);
	$("#video-btn").prop("disabled", false);
	$("#screen-share-btn").prop("disabled", false);
	$("#exit-btn").prop("disabled", false);

	$("#mic-btn").click(function () {
		toggleMic(localStream);
	});

	$("#video-btn").click(function () {
		toggleVideo(localStream);
	});

	$("#screen-share-btn").click(function () {
	
		toggleScreenShareBtn(); // set screen share button icon
		$("#screen-share-btn").prop("disabled", true); // disable the button on click
	
		if (IsscreenShareActive) {
			StopScreenShare();
			document.getElementById("screen-share-icon").innerHTML = "screen_share";
		} else {
			
			ShareScreen(AppId, channelName);
			document.getElementById("screen-share-icon").innerHTML =
				"stop_screen_share";
		}
	});

	$("#exit-btn").click(function () {
		
		leaveMeet();
	});

	// keyboard-listeners 
	$(document).on("keydown", function (e) {
		if (e.ctrlKey) {
			switch (e.key) {
				case "m":
					
					toggleMic(localStream);
					break;
				case "v":
					
					toggleVideo(localStream);
					break;
				case "x":
					
					toggleScreenShareBtn(); // set screen-share button icon
					$("#screen-share-btn").prop("disabled", true); // disable the scren-share button on click
					if (IsscreenShareActive) {
						StopScreenShare();
						document.getElementById("screen-share-icon").innerHTML =
							"screen_share";
					} else {
						document.getElementById("screen-share-icon").innerHTML =
							"stop_screen_share";
						ShareScreen(AppId, channelName);
					}
					break;
				case "q":
					
					leaveMeet();
					break;
				case "z":
					chat();
					break;
			
			}

			
			if (e.key === "r") {
				window.history.back(); 
			}
		}
	});
}

function toggleBtn(btn) {
	btn.toggleClass("btn-danger");
}

function toggleScreenShareBtn() {
	$("#screen-share-btn").toggleClass("btn-danger");
}

function toggleVisibility(elementID, visible) {
	if (visible) {
		$(elementID).attr("style", "display:block");
	} else {
		$(elementID).attr("style", "display:none");
	}
}

function toggleMic(localStream) {
	toggleBtn($("#mic-btn")); // toggle button colors
	// toggle the mic icon
	var mic_button = document.getElementById("mic-icon");

	if (mic_button.innerHTML == "mic_off") {
		mic_button.innerHTML = "mic";
		localStream.unmuteAudio(); // enable the local mic
		toggleVisibility("#mute-overlay", false); // hide the muted mic icon
	} else {
		mic_button.innerHTML = "mic_off";
		localStream.muteAudio(); // mute the local mic
		toggleVisibility("#mute-overlay", true); // show the muted mic icon
	}
}

function toggleVideo(localStream) {
	toggleBtn($("#video-btn")); // toggle button colors
	var vid_button = document.getElementById("video-icon");
	if (vid_button.innerHTML == "videocam_off") {
		vid_button.innerHTML = "videocam";
		localStream.unmuteVideo(); // enable the local video
		toggleVisibility("#no-local-video", false); // hide the user icon when video is enabled
	} else {
		vid_button.innerHTML = "videocam_off";
		localStream.muteVideo(); // disable the local video
		toggleVisibility("#no-local-video", true); // show the user icon when video is disabled
	}
}
