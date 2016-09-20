
// Initialize variables
var database = firebase.database();
var username = "";
var opponentname = "";
var role = "";
var players = 0;
var gameID = 0;
var playerState = "";
var choice = "";
var p1wins = 0;
var p2wins = 0;
var p1losses = 0;
var p2losses = 0;
var ties = 0;
var gamekey = "";
var round = 1;

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
function newRound(snapshot) {
	if(snapshot.val().round == "complete") {
		roundEnd(snapshot);				
		database.ref(gamekey).update({
			round: "inProgress"
		});
		setTimeout(function() {rebootRound(snapshot)}, 5000);
	}
}
function rebootRound(snapshot) {
		$(".rps").prop("disabled", false);
		show($("#"+role+" .tokens"));
		$("#game .panel-heading").html("ROUND "+round);
		$("#game .panel-body").html("<img src='"+pickImage("question")+"' class='img-responsive'>")
}
function player1Wins(snapshot) {
	p1wins = snapshot.val().player1.wins;
	p2losses = snapshot.val().player2.losses;
	p1wins++;
	p2losses++;
	database.ref(gamekey).update({
		"player1/wins": p1wins,
		"player2/losses": p2losses,
		round: "complete",
		roundWinner: "PLAYER 1 WINS!!"
	});
}
function player2Wins(snapshot) {
	p2wins = snapshot.val().player2.wins;
	p1losses = snapshot.val().player1.losses;
	p1losses++;
	p2wins++;
	database.ref(gamekey).update({
		"player1/losses": p1losses,
		"player2/wins": p2wins,
		round: "complete",
		roundWinner: "PLAYER 2 WINS!!"
	});
}
function roundEnd(snapshot) {
	var p1img = snapshot.val().player1.img;
	var p2img = snapshot.val().player2.img;
	var roundWinner = snapshot.val().roundWinner;
	$("#game .panel-heading").html(roundWinner);
	$("#game .panel-body").html("<img src='"+p1img+"' class='img-responsive'><img src='"+p2img+"' class='img-responsive'>");
}
$(document).ready(function() {

	// Initialize placeholder image for players
	$("#player1 .question").html("<img src='"+pickImage("question")+"' class='img-responsive'>")
	$("#player2 .question").html("<img src='"+pickImage("question")+"' class='img-responsive'>")
	$("#game .panel-body").html("<img src='"+pickImage("question")+"' class='img-responsive'>")
	// Update any waiting player in html and change button text
	database.ref().orderByKey().limitToLast(1).on("child_added", function(snapshot) {
		if(snapshot.val().players == 1) {
			opponentname = snapshot.val().player1.name;
			$("#player1-status").html("PLAYER 1: "+opponentname);
			show($("#player1 .stats"));
			$("#start-game").text("Join Game");
		}
	});
	// Update local variables and firebase when player starts or joins game
	$(document).on("click","#start-game", function() {
		database.ref().orderByKey().limitToLast(1).once("child_added", function(snapshot) {
			if ((!snapshot.exists() || snapshot.val().players == 2) && playerState != "joined" && $("#username").val() != "") {
				username = $("#username").val();
				role = "player1";
				$("#player1-status").html("PLAYER 1: "+username);
				players++;
				playerState = "joined";
				hide($("#start-section"));
				hide($("#player1 .question"));
				$("#player1 .rock").html("<button class='rps' data-token='rock'><img src='"+pickImage("rock")+"' class='img-responsive'>");
				$("#player1 .paper").html("<button class='rps' data-token='paper'><img src='"+pickImage("paper")+"' class='img-responsive'>");
				$("#player1 .scissors").html("<button class='rps' data-token='scissors'><img src='"+pickImage("scissors")+"' class='img-responsive'>");
				show($("#player1 .rock"));
				show($("#player1 .paper"));
				show($("#player1 .scissors"));
				show($("#player1 .stats"));
				var newkey = database.ref().push({
					player1: {name: username, wins: p1wins, losses: p1losses},
					players: players,
					ties: ties,
					dateAdded: firebase.database.ServerValue.TIMESTAMP
				});
				gamekey = newkey.getKey();
			} else if (snapshot.val().players == 1 && playerState != "joined" && $("#username").val() != "") {
				gamekey = snapshot.getKey();
				username = $("#username").val();
				players = 2;
				playerState = "joined";
				role = "player2";
				$("#player2-status").html("PLAYER 2: "+username);
				hide($("#start-section"));
				hide($("#player2 .question"));
				$("#player2 .rock").html("<button class='rps' data-token='rock'><img src='"+pickImage("rock")+"' class='img-responsive'>");
				$("#player2 .paper").html("<button class='rps' data-token='paper'><img src='"+pickImage("paper")+"' class='img-responsive'>");
				$("#player2 .scissors").html("<button class='rps' data-token='scissors'><img src='"+pickImage("scissors")+"' class='img-responsive'>");
				show($("#player2 .rock"));
				show($("#player2 .paper"));
				show($("#player2 .scissors"));				
				show($("#player2 .stats"));
				show($("#chat"));
				database.ref(gamekey).update({
					player2: {name: username, wins: p2wins, losses: p2losses},
					players: players
				});								
			}
		});
	});

	// Click event handler for player choices
	$(document).on("click", ".rps", function() {
		round++;
		choice = $(this).attr("data-token");
		var choiceImg = $(this).find("img").attr("src");
		var choicekey = {};
		choicekey[role+"/round"+round] = choice;
		choicekey[role+"/img"] = choiceImg;
		database.ref(gamekey).update(choicekey);
		$(".rps").prop("disabled", true);
		if(choice == "rock") {
			hide($("#"+role+" .paper"));
			hide($("#"+role+" .scissors"));
		} else if (choice == "paper") {
			hide($("#"+role+" .rock"));
			hide($("#"+role+" .scissors"));
		} else if (choice == "scissors") {
			hide($("#"+role+" .rock"));
			hide($("#"+role+" .paper"));
		}
		database.ref(gamekey).once("value", function(snapshot) {
			if(snapshot.child("player1/round"+round).exists() && snapshot.child("player2/round"+round).exists()) {
				var p1token = snapshot.val().player1["round"+round];
				var p2token = snapshot.val().player2["round"+round];
				if(p1token == p2token) {
					ties = snapshot.val().ties;
					ties++;
					database.ref(gamekey).update({
						ties: ties,
						round: "complete",
						roundWinner: "NO ONE. IT'S A TIE."
					});
				} else if(p1token == "rock" && p2token == "paper") {
					player2Wins(snapshot);
				} else if(p1token == "paper" && p2token == "rock") {
					player1Wins(snapshot);
				} else if(p1token == "rock" && p2token == "scissors") {
					player1Wins(snapshot);
				} else if(p1token == "scissors" && p2token == "rock") {
					player2Wins(snapshot);
				} else if(p1token == "paper" && p2token == "scissors") {
					player2Wins(snapshot);
				} else if(p1token == "scissors" && p2token == "paper") {
					player1Wins(snapshot);
				}
			}
		});
	});
	database.ref().on("value", function(snapshot) {
		if(gamekey != "") {
			database.ref(gamekey).on("value", function(snapshot) {
				p1wins = snapshot.val().player1.wins;
				p1losses = snapshot.val().player1.losses;
				ties = snapshot.val().ties;
				$("#player1 .stat-text").html("<p>Wins: "+p1wins+"<p>Losses: "+p1losses+"<p>Ties: "+ties);
				$("#player2 .stat-text").html("<p>Wins: "+p2wins+"<p>Losses: "+p2losses+"<p>Ties: "+ties);
				if(snapshot.val().players == 2) { 
					p2wins = snapshot.val().player2.wins;
					p2losses = snapshot.val().player2.losses;
				}
				if(role == "player1" && snapshot.val().players == 2) {
					opponentname = snapshot.val().player2.name;
					$("#player2-status").html("PLAYER 2: "+opponentname);
					show($("#player2 .stats"));
					show($("#chat"));
				}
				newRound(snapshot);
			});
		}
	});
});