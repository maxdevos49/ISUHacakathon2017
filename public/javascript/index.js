//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\//
//											ISU Hackathon Game Client 2017											 //
//								Created By: Max DeVos, Thomas Powell, and Mason Timmerman							 //
//																													 //
//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\//


var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var keyW;
var keyA;
var keyS;
var keyD;
var turn = 0;
var velX = 0;
var velY = 0;
var speed = 0;
var topSpeed = 3;
var friction = 0.95;
var move = false;
var themeSong;
var somethingHappened = false;
var spritePos = [];
var iii = 0;
var allowNewPlayer = false;
var connectedClients = [];
var scene = "menu";



 function preload(){

 	game.stage.backgroundColor = 'black';
    game.load.spritesheet('player1', 'Images/p1/p1forwardsheet.png',72,51,2);
    game.load.spritesheet('stars', 'Images/starfield/starfieldsheet.png', 800,600,3);
    game.load.audio('themeSong', ['sounds/SpaceBattleTheme.mp3']);
    game.load.spritesheet('player2', 'Images/p2/p2forwardsheet.png', 72,51,2)
    game.load.image('splashscreen', 'Images/title_screen/title_screen_background.png');
    game.load.spritesheet('logo', 'Images/title_screen/title_sprite_sheet.png',518,188,23);
    game.load.spritesheet('start','Images/title_screen/startbutton.png',130,60,2);
    game.load.spritesheet('about','Images/title_screen/aboutbutton.png',130,60,2);

 }


function create(){

	if (scene == "menu"){

		//add background
		backgroundstars = game.add.sprite(0,0,'stars');
		twinkle = backgroundstars.animations.add('twinkle');
		backgroundstars.animations.play('twinkle', 3, true);

		splashscreen = game.add.sprite(0,0,'splashscreen');

		splashscreen.alpha = 0;

    	game.add.tween(splashscreen).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, true);

    	logo = game.add.sprite(400,150,'logo');
    	logo.anchor.setTo(0.5,0.5);
		shine = logo.animations.add('shine');
		logo.animations.play('shine', 3, true);

		start = game.add.sprite(400,350,'start');
		start.anchor.setTo(0.5,0.5);
		start.inputEnabled = true;

		about = game.add.sprite(400,450,'about');
		about.anchor.setTo(0.5,0.5);
		about.inputEnabled = true;

		start.events.onInputDown.add(startGameFunc, this);

		about.events.onInputDown.add(aboutGameFunc, this);

	}

	if (scene == "game"){

	game.physics.startSystem(Phaser.Physics.ARCADE);

	//add star sprite
	stars = [];
	player = [];
	
	incr = 0;
	for (i = 0; i < 3; i++){
		for (ii = 0; ii < 3; ii++){
			stars[incr] = game.add.sprite((-800) + (ii * 800),(-600) + (i * 600),'stars');
			game.physics.enable(stars[incr], Phaser.Physics.ARCADE);
			incr++;
		}
	}

	//add player sprite
	
	player[clientNum] = game.add.sprite(400,300, 'player1');
	player[clientNum].anchor.setTo(0.5,0.5);
	//make player animation
	fly = player[clientNum].animations.add('fly');
	//set player animation to occur 5 frames a second
	player[clientNum].animations.play('fly', 5, true);
	spritePos[clientNum] = [800,600];


	//make stars animation
	for (i = 0; i < 9; i++){
		twinkle = stars[i].animations.add('twinkle');
	}

	//set twinkle animation
	for (i = 0; i < 9; i++){
		stars[i].animations.play('twinkle', 3, true);
	}

    //  and its physics settings
    for (i = 0; i < 9; i++){
    	game.physics.enable(stars[i], Phaser.Physics.ARCADE);
    	stars[i].body.drag.set(200);
    	stars[i].body.maxVelocity.set(300);
	}

    themeSong = game.add.audio('themeSong');
    themeSong.play();


    //  Game input
    keyW = game.input.keyboard.addKey(Phaser.Keyboard.W);
    keyA =  game.input.keyboard.addKey(Phaser.Keyboard.A);
    keyD =  game.input.keyboard.addKey(Phaser.Keyboard.D);
    keyP = game.input.keyboard.addKey(Phaser.Keyboard.P);

    socket.on("newPlayer",function(data){
    	allowNewPlayer = true;
    });

    socket.on("retrieveUpdates", function(data){

		spritePos[clientNum][0] = -(spritePos[clientNum][0] + stars[0].body.velocity.x);
		spritePos[clientNum][1] = -(spritePos[clientNum][1] + stars[0].body.velocity.y);

		socket.emit("playerUpdate", {
			client: clientNum,
			clientX: spritePos[clientNum][0],
			clientY: spritePos[clientNum][1],
			clientAngle: player[clientNum].angle
		});

		// console.log("info");
		// console.log(clientNum);
		// console.log(spritePos[clientNum][0]);
		// console.log(spritePos[clientNum][1]);
		// console.log(player[clientNum].angle);
		// console.log(stars[0].x);
		// console.log(stars[0].y);

	});

	socket.on("playerUpdate", function(data){
		
			// console.log("info");
			// console.log(data.client);
			if(typeof player[data.client] != "undefined"){

				// console.log("first option");
				// console.log(data.client);
				//console.log(data.clientAngle);
				// do this if exist
				if (data.client != clientNum){
					//console.log("first option");
					player[data.client].x = data.clientX;
					player[data.client].y = data.clientY;
					player[data.client].angle = data.clientAngle;

				}else{
					//console.log("second option");
					player[data.client].x = 400;
					player[data.client].y = 300;
					player[data.client].angle = data.clientAngle;
				}

			}else if(allowNewPlayer == false){
				allowNewPlayer = false;
				// console.log("second option");
				// console.log(data.client);
				connectedClients.push(data.client);

				//do this if not exist
				player[data.client] = game.add.sprite(data.clientX - stars[0].x,data.clientY - stars[0].y, 'player2');
				player[data.client].anchor.setTo(0.5,0.5);

				spritePos[data.client][0] = 800;
				spritePos[data.client][0] = 600;

				fly = player[data.client].animations.add('fly');
				//set player animation to occur 5 frames a second
				player[data.client].animations.play('fly', 5, true);

				spritePos[data.client] = [data.x,data.y];	
			}
	});
}

}

function aboutGameFunc(){
	window.open("https://github.com/maxdevos49/ISUHackathon2017");
}

function startGameFunc(){
	scene = "game";
	splashscreen.events.onInputDown.add(destroySprite, this);
	logo.events.onInputDown.add(destroySprite, this);
	backgroundstars.events.onInputDown.add(destroySprite, this);
	start.events.onInputDown.add(destroySprite, this);
	about.events.onInputDown.add(destroySprite, this);
	create();

}

function destroySprite (sprite) {

    start.destroy();
    logo.destroy();
    backgroundstars.destroy();
    about.destroy();
    splashscreen.destroy();


}

function update(){


	if (scene == "menu"){

	}

	// if (keyP.onDown){
	// 	if (game.paused == true){
	// 		game.paused = false;
	// 	}else{
	// 		game.paused = true;
	// 	}
	// }

	 
	if (scene == "game"){
	    if (keyW.isDown){

	    	for (i = 0; i < 9; i++){
	        	game.physics.arcade.velocityFromAngle(player[clientNum].angle, -350, stars[i].body.acceleration);
	        }

	        // for (var i = 0, len = connectedClients.length; i < len; i++) {
	        // 	console.log(i);

	        // 	if(connectedClients[i] !== clientNum){
		       //  	spritePos[connectedClients[i]][0] = -(spritePos[connectedClients[i]][0] + stars[0].body.velocity.x);
		       //  	spritePos[connectedClients[i]][1] = -(spritePos[connectedClients[i]][0] + stars[0].body.velocity.x);
	        // 	}
	        // }

	    }else{
	    	for (i = 0; i < 9; i++){
	        	 stars[i].body.acceleration.set(0);
	        }
	    }
	    if (keyA.isDown){

	        	player[clientNum].angle -= 2;
	        
	    }else if (keyD.isDown){

	        	player[clientNum].angle += 2;

	    }
	}

}





