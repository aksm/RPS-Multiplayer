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
				 		$("#chat-display").append("<p>"+snapshot.val().chat["m"+mnumber].player+": "+snapshot.val().chat["m"+mnumber].text);
					}
				}

			});
		}
	});
});