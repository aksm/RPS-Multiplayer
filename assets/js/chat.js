$(document).ready(function() {
	var mnumber = 0;
	$(document).on("click", "#chat button", function() {
		if($("#chat .form-control").val() != "") {
			mnumber++;
			var chatText = $("#chat .form-control").val();
			var chat = {}
			chat["chat/m"+mnumber+"/text"] = chatText;
			chat["chat/messages"] = mnumber;
			chat["chat/m"+mnumber+"/player"] = username;
			chat["chat/m"+mnumber+"/timestamp"] = firebase.database.ServerValue.TIMESTAMP;
			database.ref(gamekey).update(chat);								

		}
	});
	database.ref().on("value", function(snapshot) {
		if(gamekey != "") {
			database.ref(gamekey).on("value", function(snapshot) {
				if(snapshot.child("chat/messages").exists()) {
					mnumber = snapshot.val().chat.messages;
				}
			});
		}
	});
});