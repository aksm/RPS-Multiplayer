
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

// Initialize functions

// Pick image for rock, paper, or scissors
function pickImage(token) {
	return "assets/images/"+token+(Math.floor(Math.random() * (Math.floor(9) - Math.ceil(1) + 1)) + Math.ceil(1)) + ".gif";
}

// Hide divs as necessary
function hide(element) {
	element.removeClass("show");
	element.addClass("hide");
}

// Show divs as necessary
function show(element) {
	element.removeClass("hide");
	element.addClass("show");	
}

// End round and start new round
function newRound(snapshot) {
	if(snapshot.val().round == "complete") {
		roundEnd(snapshot);				
		database.ref(gamekey).update({
			round: "inProgress"
		});
		setTimeout(function() {rebootRound(snapshot)}, 5000);
	}
}

// Refresh new round elements
function rebootRound(snapshot) {
	$(".rps").prop("disabled", false);
	show($("#"+role+" .tokens"));
	$("#game .panel-heading").html("ROUND "+round);
	$("#game .panel-body").html("<img src='"+pickImage("question")+"' class='img-responsive img-circle'>")
}

// Update local variables for player stats and update firebase
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

// Update local variables for player stats and update firebase
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

// Update end of round elements
function roundEnd(snapshot) {
	var p1img = snapshot.val().player1.img;
	var p2img = snapshot.val().player2.img;
	var roundWinner = snapshot.val().roundWinner;
	$("#game .panel-heading").html(roundWinner);
	$("#game .panel-body").html("<img src='"+p1img+"' class='img-responsive img-circle'><img src='"+p2img+"' class='img-responsive img-circle'>");
}

$(document).ready(function() {

	// Initialize placeholder image for players
	$("#player1 .question").html("<img src='"+pickImage("question")+"' class='img-responsive img-circle'>")
	$("#player2 .question").html("<img src='"+pickImage("question")+"' class='img-responsive img-circle'>")
	$("#game .panel-body").html("<img src='"+pickImage("question")+"' class='img-responsive img-circle'>")

	// Update any waiting player in html and change button text
	database.ref().orderByKey().limitToLast(1).on("child_added", function(snapshot) {
		if(snapshot.val().players == 1) {
			opponentname = snapshot.val().player1.name;
			$("#player1-status").html("PLAYER 1: "+opponentname);
			show($("#player1 .stats"));
			$("#start-game").text("Join Game");
		}
	});

	// Update local variables, dom, and firebase when player starts or joins game
	$(document).on("click","#start-game", function() {
		database.ref().orderByKey().limitToLast(1).once("child_added", function(snapshot) {
			// Update player 1 dom
			if ((!snapshot.exists() || snapshot.val().players == 2) && playerState != "joined" && $("#username").val() != "") {
				username = $("#username").val();
				role = "player1";
				$("#player1-status").html("PLAYER 1: "+username);
				players++;
				playerState = "joined";
				hide($("#start-section"));
				hide($("#player1 .question"));
				$("#player1 .rock").html("<button class='btn btn-default rps' data-token='rock'><img src='"+pickImage("rock")+"' class='img-responsive img-circle col-xs-12 col-sm-12 col-md-12'>");
				$("#player1 .paper").html("<button class='btn btn-default rps' data-token='paper'><img src='"+pickImage("paper")+"' class='img-responsive img-circle col-xs-12 col-sm-12 col-md-12'>");
				$("#player1 .scissors").html("<button class='btn btn-default rps' data-token='scissors'><img src='"+pickImage("scissors")+"' class='img-responsive img-circle col-xs-12 col-sm-12 col-md-12'>");
				$("#player1 .lizard").html("<button class='btn btn-default rps' data-token='lizard'><img src='"+pickImage("lizard")+"' class='img-responsive img-circle col-xs-12 col-sm-12 col-md-12'>");
				$("#player1 .spock").html("<button class='btn btn-default rps' data-token='spock'><img src='"+pickImage("spock")+"' class='img-responsive img-circle col-xs-12 col-sm-12 col-md-12'>");
				show($("#player1 .rock"));
				show($("#player1 .paper"));
				show($("#player1 .scissors"));
				show($("#player1 .lizard"));
				show($("#player1 .spock"));
				show($("#player1 .stats"));
				var newkey = database.ref().push({
					player1: {name: username, wins: p1wins, losses: p1losses},
					players: players,
					ties: ties,
					dateAdded: firebase.database.ServerValue.TIMESTAMP
				});
				gamekey = newkey.getKey();
				// Update player 2 dom
			} else if (snapshot.val().players == 1 && playerState != "joined" && $("#username").val() != "") {
				gamekey = snapshot.getKey();
				username = $("#username").val();
				players = 2;
				playerState = "joined";
				role = "player2";
				$("#player2-status").html("PLAYER 2: "+username);
				hide($("#start-section"));
				hide($("#player2 .question"));
				$("#player2 .rock").html("<button class='btn btn-default rps' data-token='rock'><img src='"+pickImage("rock")+"' class='img-responsive img-circle col-xs-12 col-sm-12 col-md-12'>");
				$("#player2 .paper").html("<button class='btn btn-default rps' data-token='paper'><img src='"+pickImage("paper")+"' class='img-responsive img-circle col-xs-12 col-sm-12 col-md-12'>");
				$("#player2 .scissors").html("<button class='btn btn-default rps' data-token='scissors'><img src='"+pickImage("scissors")+"' class='img-responsive img-circle col-xs-12 col-sm-12 col-md-12'>");
				$("#player2 .lizard").html("<button class='btn btn-default rps' data-token='lizard'><img src='"+pickImage("lizard")+"' class='img-responsive img-circle col-xs-12 col-sm-12 col-md-12'>");
				$("#player2 .spock").html("<button class='btn btn-default rps' data-token='spock'><img src='"+pickImage("spock")+"' class='img-responsive img-circle col-xs-12 col-sm-12 col-md-12'>");
				show($("#player2 .rock"));
				show($("#player2 .paper"));
				show($("#player2 .scissors"));				
				show($("#player2 .stats"));
				show($("#player2 .lizard"));
				show($("#player2 .spock"));
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
		// Disable button when choice is made and hide other choices
		$(".rps").prop("disabled", true);
		if(choice == "rock") {
			hide($("#"+role+" .paper"));
			hide($("#"+role+" .scissors"));
			hide($("#"+role+" .lizard"));
			hide($("#"+role+" .spock"));
		} else if (choice == "paper") {
			hide($("#"+role+" .rock"));
			hide($("#"+role+" .scissors"));
			hide($("#"+role+" .lizard"));
			hide($("#"+role+" .spock"));
		} else if (choice == "scissors") {
			hide($("#"+role+" .rock"));
			hide($("#"+role+" .paper"));
			hide($("#"+role+" .lizard"));
			hide($("#"+role+" .spock"));
		} else if (choice == "lizard") {
			hide($("#"+role+" .rock"));
			hide($("#"+role+" .paper"));
			hide($("#"+role+" .scissors"));
			hide($("#"+role+" .spock"));
		} else if (choice == "spock") {
			hide($("#"+role+" .rock"));
			hide($("#"+role+" .paper"));
			hide($("#"+role+" .scissors"));
			hide($("#"+role+" .lizard"));
		}

		// Grab player choices from firebase and determine winner. Call win functions to update variables and firebase.
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
				} else if(p1token == "lizard" && p2token == "rock") {
					player2Wins(snapshot);
				} else if(p1token == "rock" && p2token == "lizard") {
					player1Wins(snapshot);
				} else if(p1token == "lizard" && p2token == "paper") {
					player1Wins(snapshot);
				} else if(p1token == "paper" && p2token == "lizard") {
					player2Wins(snapshot);
				} else if(p1token == "lizard" && p2token == "scissors") {
					player2Wins(snapshot);
				} else if(p1token == "scissors" && p2token == "lizard") {
					player1Wins(snapshot);
				} else if(p1token == "lizard" && p2token == "spock") {
					player1Wins(snapshot);
				} else if(p1token == "spock" && p2token == "lizard") {
					player2Wins(snapshot);
				} else if(p1token == "spock" && p2token == "rock") {
					player1Wins(snapshot);
				} else if(p1token == "rock" && p2token == "spock") {
					player2Wins(snapshot);
				} else if(p1token == "spock" && p2token == "paper") {
					player2Wins(snapshot);
				} else if(p1token == "paper" && p2token == "spock") {
					player1Wins(snapshot);
				} else if(p1token == "spock" && p2token == "scissors") {
					player1Wins(snapshot);
				} else if(p1token == "scissors" && p2token == "spock") {
					player2Wins(snapshot);
				}
			}
		});
	});

	// Grab winner/loser info from firebase show in dom and call new round function
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