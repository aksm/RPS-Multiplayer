$(document).ready(function() {
	var mnumber = 0;
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
						} else if((role == "player2" && username == snapshot.val().chat["m"+mnumber].player) || (role == "player1" && opponentname == snapshot.val().chat["m"+mnumber].player)) {
				 			$("#chat-display").append("<p class='text-right chat-user'>"+snapshot.val().chat["m"+mnumber].player+"<p class='text-right chat-text'>"+snapshot.val().chat["m"+mnumber].text+"<hr>");							
						}
					}
				}

			});
		}
	});
});