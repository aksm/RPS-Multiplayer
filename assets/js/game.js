
// Initialize variables
var database = firebase.database();
var username = "";
var opponentname = "";
var players = 0;
var gameID = 0;
var playerState = "";

// Pick image for rock, paper, or scissors
function pickImage(token) {
	return "assets/images/"+token+(Math.floor(Math.random() * (Math.floor(9) - Math.ceil(1) + 1)) + Math.ceil(1)) + ".gif";
}
function hide(element) {
	element.removeClass("show");
	element.addClass("hide");
}
function show(element) {
	element.removeClass("hide");
	element.addClass("show");	
}
$(document).ready(function() {
	// Update any waiting player in html and change button text
	database.ref().orderByKey().limitToLast(1).on("child_added", function(snapshot) {
		if(snapshot.val().players == 1) {
			opponentname = snapshot.val().player1;
			$("#player1-status").html(opponentname);
			$("#start-game").text("Join Game");			
		}	
	});
	// Update local variables and firebase when player starts or joins game
	$(document).on("click","#start-game", function() {

		database.ref().orderByKey().limitToLast(1).on("child_added", function(snapshot) {
			var gamekey = snapshot.getKey();
			if ((!snapshot.exists() || snapshot.val().players == 2) && playerState != "joined") {
				username = $("#username").val();
				$("#player1-status").html(username);
				players++;
				playerState = "joined";
				$("#start-section").addClass("hide")
				$("div#player1 div.rock").html("<button class='rock'><img src='"+pickImage("rock")+"' class='img-responsive'>");
				$("div#player1 div.paper").html("<button class='paper'><img src='"+pickImage("paper")+"' class='img-responsive'>");
				$("div#player1 div.scissors").html("<button class='scissors'><img src='"+pickImage("scissors")+"' class='img-responsive'>");
				show($("div#player1 div.rock"));
				show($("div#player1 div.paper"));
				show($("div#player1 div.scissors"));				
				database.ref().push({
					player1: username,
					players: players
				});
			} else if (snapshot.val().players == 1 && playerState != "joined") {
				username = $("#username").val();
				players = 2;
				playerState = "joined";
				$("#start-section").addClass("hide")
				$("div#player2 div.rock").html("<button class='rock'><img src='"+pickImage("rock")+"' class='img-responsive'>");
				$("div#player2 div.paper").html("<button class='paper'><img src='"+pickImage("paper")+"' class='img-responsive'>");
				$("div#player2 div.scissors").html("<button class='scissors'><img src='"+pickImage("scissors")+"' class='img-responsive'>");
				show($("div#player2 div.rock"));
				show($("div#player2 div.paper"));
				show($("div#player2 div.scissors"));				
				database.ref(gamekey).update({
					player2: username,
					players: players
				});								
			}
		});
	});
});