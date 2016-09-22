$(document).ready(function() {
	// Local variable for current number of messages
	var mnumber = 0;

	// Scroll chat window to last message
	function autoscroll() {
		var height = $("#chat .panel-body")[0].scrollHeight;
		$("#chat .panel-body").scrollTop(height);
	}

	// Click event handler to capture chat text and upload to firebase
	$(document).on("click", "#chat button", function() {
		if($("#chat .form-control").val() != "") {
			mnumber++;
			var chatText = $("#chat .form-control").val();
			var chat = {};
			chat["chat/m"+mnumber+"/text"] = chatText;
			chat["chat/messages"] = mnumber;
			chat["chat/m"+mnumber+"/player"] = username;
			chat["chat/m"+mnumber+"/timestamp"] = firebase.database.ServerValue.TIMESTAMP;
			chat["chat/m"+mnumber+"/status"] = "send";
			database.ref(gamekey).update(chat);								
			$("#chat .form-control").val("");
		}
	});

	// Firebase snapshot to display uploaded chat text in div
	database.ref().on("value", function(snapshot) {
		if(gamekey != "") {
			database.ref().orderByKey().equalTo(gamekey).on("child_added", function(snapshot) {
				if(snapshot.val().chat) {
		 			mnumber = snapshot.val().chat.messages;
					if(snapshot.val().chat["m"+mnumber].status == "send") {
				 		var chatstatus = {};
				 		chatstatus["chat/m"+mnumber+"/status"] = "sent";
				 		database.ref(gamekey).update(chatstatus);
				 		if((role == "player1" && username == snapshot.val().chat["m"+mnumber].player) || (role == "player2" && opponentname == snapshot.val().chat["m"+mnumber].player)) {
				 			$("#chat-display").append("<p class='text-left chat-user'>"+snapshot.val().chat["m"+mnumber].player+"<p class='text-left chat-text'>"+snapshot.val().chat["m"+mnumber].text+"<hr>");
				 			autoscroll();
						} else if((role == "player2" && username == snapshot.val().chat["m"+mnumber].player) || (role == "player1" && opponentname == snapshot.val().chat["m"+mnumber].player)) {
				 			$("#chat-display").append("<p class='text-right chat-user'>"+snapshot.val().chat["m"+mnumber].player+"<p class='text-right chat-text'>"+snapshot.val().chat["m"+mnumber].text+"<hr>");
				 			autoscroll();
						}
					}
				}

			});
		}
	});
});