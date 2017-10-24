/*global  io: false, console:false, Phaser: false*/

//initial varibles
"use strict";
var player = [];
var myClient;
var connectedCount = 0;
var scene = "mainMenu";
var backgroundstars;
var twinkle;
var splashscreen;
var logo;
var shine;
var start;
var about;
var startHighlight;
var aboutHighlight;
var startUnHighlight;
var aboutUnHighlight;
var stars = [];
var ship = [];
var socket; 
var keyW;
var keyA;
var keyD;
var fly;
var connection = false;

//socket handling

function socketStuff(){

	socket = io.connect('http://localhost:8080', {
		reconnection: false
	});
	
	socket.on("connReply", function(data){

		myClient = data.clientNum;
		//console.log(myClient);
		player[myClient] = new playerInfo(data.clientID, data.clientNum, data.x,data.y,data.angle);

		addPlayerToScreen(data.clientNum);

		//emit a request for all of the other players info
		socket.emit("loadOtherPlayers");
	});


	//load new players when they connect
	socket.on("loadOtherPlayers", function(data){

		connectedCount = 0;

		for(var i = 0; i < data.length; i++){
			
			if (data[i] !== null){

				connectedCount +=1;

				if(data[i].clientNum !== myClient){

					console.log("Loading Player with index "+data[i].clientNum);

					player[data[i].clientNum] = new playerInfo(data[i].clientID, data[i].clientNum, data[i].x,data[i].y,data[i].angle);

					//add the players to the screen
					addPlayerToScreen(data[i].clientNum);
					connection = true;
				}

			}
			
		}

		console.log("There are " + connectedCount + " user online!");
	});

	//remove players when they disconnect
	socket.on("playerDisconnect", function(data){
		delete player[data.id];

		console.log("player disconnected with index: " + data.id);

		connectedCount -= 1;

		console.log("There are " + connectedCount + " user online!");

		//do something to remove all of that players info from the screen
		removePlayerFromScreen(data.id);
	});

	socket.on("disconnect", function(){

		connection = false;

		console.log("connection Lost... reload your page");

	});



	//send info for server info update
	socket.on("askingForUpdates", function(data){

		//send any data to update
		socket.emit("updateReply", player[myClient]);


		//console.log("Player info being recieved: \n" + data + "\n\n");
		//process any recieved data for updates
		for(var i = 0; i < data.length; i++){

			//check if the player is connected
			if (data[i] !== null && connection === true){

				//check to make sure it is not your client
				if (data[i].clientNum != myClient){
					player[data[i].clientNum].clientID = data[i].clientID;
					player[data[i].clientNum].clientNum = data[i].clientNum;
					player[data[i].clientNum].x = data[i].x;
					player[data[i].clientNum].y = data[i].y;
					player[data[i].clientNum].angle = data[i].angle;

					updatePlayerPos(data[i].clientNum);
				}

			}

		}

	});

	//update other users location on screen
	// socket.on("playersUpdate",function(data){
	// 	//console.log(data);
	// 	if (data.clientNum != myClient){
	// 		player[data.clientNum].x = data.x;
	// 		player[data.clientNum].y = data.y;
	// 		player[data.clientNum].angle = data.angle;
	// 		updatePlayerPos(data.clientNum);
	// 	}

	// });
}


//game logic components
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload(){


	//change background of canvas to black
	game.stage.backgroundColor = 'black';

	//load sprites
    game.load.spritesheet('player1', 'Images/p1/p1forwardsheet.png',72,51,2);
    game.load.spritesheet('stars', 'Images/starfield/starfieldsheet.png', 800,600,3);
    game.load.spritesheet('player2', 'Images/p2/p2forwardsheet.png', 72,51,2);
    game.load.spritesheet('logo', 'Images/title_screen/title_sprite_sheet.png',518,188,23);
    game.load.spritesheet('start','Images/title_screen/startbutton.png',130,63,2);
    game.load.spritesheet('about','Images/title_screen/aboutbutton.png',130,63,2);
    game.load.image('splashscreen', 'Images/title_screen/title_screen_background.png');

    //load audio
    game.load.audio('themeSong', ['sounds/SpaceBattleTheme.mp3']);

}

function create(){

	if (scene === "mainMenu"){

		//add background
		backgroundstars = game.add.sprite(0,0,'stars');
		twinkle = backgroundstars.animations.add('twinkle');
		backgroundstars.animations.play('twinkle', 3, true);

		//splashscreen sprite
		splashscreen = game.add.sprite(0,0,'splashscreen');
		splashscreen.alpha = 0;
    	game.add.tween(splashscreen).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, true);

    	//title sprite
    	logo = game.add.sprite(400,150,'logo');
    	logo.anchor.setTo(0.5,0.5);
		shine = logo.animations.add('shine');
		logo.animations.play('shine', 3, true);

		/*jshint validthis:true */

		//start sprite
		start = game.add.sprite(400,350,'start');
		start.anchor.setTo(0.5,0.5);
		startHighlight = start.animations.add('startHighlight',[1], 0, true);
		startUnHighlight = start.animations.add('startUnHighlight',[0], 0, true);
		//start.animations.play('startHighlight', [1],0, true);
		start.inputEnabled = true;
		start.events.onInputDown.add(startGameFunc, this);
		start.events.onInputOver.add(startButtHover,this);
		start.events.onInputOut.add(startButtOut,this);

		//about sprite
		about = game.add.sprite(400,450,'about');
		about.anchor.setTo(0.5,0.5);
		aboutHighlight = about.animations.add('aboutHighlight',[1], 0, true);
		aboutUnHighlight = about.animations.add('aboutUnHighlight',[0], 0, true);
		//about.animations.play('aboutHighlight',[0], true);
		about.inputEnabled = true;
		about.events.onInputDown.add(aboutGameFunc, this);
		about.events.onInputOver.add(aboutButtHover,this);
		about.events.onInputOut.add(aboutButtOut,this);


	}else if(scene === "game"){

		game.physics.startSystem(Phaser.Physics.ARCADE);

		//add stars to the background
		stars[0] = game.add.sprite(-800,-600,'stars');//top left
		stars[1] = stars[0].addChild(game.add.sprite(0,-600,'stars'));//top center
		stars[2] = stars[0].addChild(game.add.sprite(800,-600,'stars'));//top right
		stars[3] = stars[0].addChild(game.add.sprite(-800,0,'stars'));//middle left
		stars[4] = stars[0].addChild(game.add.sprite(0,0,'stars'));//center
		stars[5] = stars[0].addChild(game.add.sprite(800,0,'stars'));//middle right
		stars[6] = stars[0].addChild(game.add.sprite(-800,600,'stars'));//bottom left
		stars[7] = stars[0].addChild(game.add.sprite(0,600,'stars'));//bottom middle
		stars[8] = stars[0].addChild(game.add.sprite(800,600,'stars'));//bottom right

		for (var i = 0; i < stars.length; i++){
			twinkle = stars[i].animations.add('twinkle');
			stars[i].animations.play('twinkle', 3, true);
			game.physics.enable(stars[i], Phaser.Physics.ARCADE);
			stars[i].body.drag.set(200);
    		stars[i].body.maxVelocity.set(300);
		}

		socketStuff();


		//  Game input
	    keyW = game.input.keyboard.addKey(Phaser.Keyboard.W);
	    keyA =  game.input.keyboard.addKey(Phaser.Keyboard.A);
	    keyD =  game.input.keyboard.addKey(Phaser.Keyboard.D);

	}

}

function update(){

	if (scene == "game" && connection === true){
		
	    if (keyW.isDown){

	    	//move forward
	        game.physics.arcade.velocityFromAngle(ship[myClient].angle, -350, stars[0].body.acceleration);
	        //update the player object
	        player[myClient].x = -(stars[0].x - ship[myClient].x);
	        player[myClient].y = -(stars[0].y - ship[myClient].y);


	    }else{

        	stars[0].body.acceleration.set(0);
        	//update the player object
	        player[myClient].x = -(stars[0].x - ship[myClient].x);
	        player[myClient].y = -(stars[0].y - ship[myClient].y);
        
	    }
	    if (keyA.isDown){

	    		//turn left
	        	ship[myClient].angle -= 2;
	        	//update the player object
		        player[myClient].angle = ship[myClient].angle;


	        
	    }else if (keyD.isDown){

	        	ship[myClient].angle += 2;
	        	//update the player object
		        player[myClient].angle = ship[myClient].angle;

	    }
	}



}



//function add new players to the screen
function addPlayerToScreen(index){
	//add new player to screen here

	if (index == myClient){

		//this is loading before the sprite is declared
		ship[index] = game.add.sprite(400,300,'player1');
		ship[index].anchor.setTo(0.5,0.5);
		fly = ship[index].animations.add('fly');
		ship[index].animations.play('fly', 5, true);

	}else{
		//console.log(index);
		//console.log(myClient);
		ship[index] = stars[0].addChild(game.add.sprite(player[index].x ,player[index].y,'player2'));
		ship[index].anchor.setTo(0.5,0.5);
		fly = ship[index].animations.add('fly');
		ship[index].animations.play('fly', 5, true);
	}

}

function removePlayerFromScreen(index){
	//remove players from the screen here
	//delete player[index];
	ship[index].destroy();
	delete ship[index];
}

function updatePlayerPos(index){

	//update player positions
	ship[index].x = player[index].x;
	ship[index].y = player[index].y;
	ship[index].angle = player[index].angle;

}

function startGameFunc(){
	scene = "game";
    start.destroy();
    logo.destroy();
    backgroundstars.destroy();
    about.destroy();
    splashscreen.destroy();
	create();
}

function aboutGameFunc(){
	window.open("https://github.com/maxdevos49/ISUHackathon2017");
}

function startButtHover(){
	start.animations.play('startHighlight');
}

function startButtOut(){
	start.animations.play('startUnHighlight');
}

function aboutButtHover(){
	about.animations.play('aboutHighlight');
}

function aboutButtOut(){
	about.animations.play('aboutUnHighlight');
}

//player info object constructor
function playerInfo(clientID,client,clientX,clientY,clientAngle){
	/*jshint validthis:true */
	this.clientID = clientID;
	this.clientNum = client;
	this.x = clientX;
	this.y = clientY;
	this.angle = clientAngle;
}	
	