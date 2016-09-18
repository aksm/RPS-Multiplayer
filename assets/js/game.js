
// function getImage(choice, div) {
// 	var queryURL = "https://crossorigin.me/http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&rating=pg-13&tag="+choice;

// 	$.ajax({url: queryURL, method: 'GET'}).done(function(response) {
// 		p1 = $("<img width='300px'>").attr("src", response.data.image_original_url); 
// 		div.append(p1);
// 	});

// }

// getImage("scissors",$("#player1"));
var database = firebase.database();
var username = "";
var opponentname = "";
var players = 0;
var gameID = 0;
var playerState = "";

$(document).ready(function() {
	database.ref().orderByKey().limitToLast(1).on("child_added", function(snapshot) {
		if(snapshot.val().players == 1) {
			opponentname = snapshot.val().player1;
			$("#player1-status").html(opponentname);
			$("#start-game").text("Join Game");			
		}	
	});
	
	$(document).on("click","#start-game", function() {
		database.ref().orderByKey().limitToLast(1).on("child_added", function(snapshot) {
			var gamekey = snapshot.getKey();
			if ((!snapshot.exists() || snapshot.val().players == 2) && playerState != "joined") {
				username = $("#username").val();
				$("#player1-status").html(username);
				players++;
				playerState = "joined";
				database.ref().push({
					player1: username,
					players: players
				});
			} else if (snapshot.val().players == 1 && playerState != "joined") {
				username = $("#username").val();
				players = 2;
				playerState = "joined";
				database.ref(gamekey).update({
					player2: username,
					players: players
				});								
			}
		});
	});
});