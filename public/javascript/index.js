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
 
 function preload(){

 	game.stage.backgroundColor = 'black';
    game.load.spritesheet('player1', 'Images/p1/p1forwardsheet.png',72,51,2);
    game.load.spritesheet('stars', 'Images/starfield/starfieldsheet.png', 800,600,3);


 }


function create(){

	//add star sprite
	stars = [];
	incr = 0;
	for (i = 0; i < 3; i++){
		for (ii = 0; ii < 3; ii++){
			stars[incr] = game.add.sprite((-800) + (ii * 800),(-600) + (i * 600),'stars');
			incr++;
		}
	}
	//add player sprite
	player1 = game.add.sprite(400,300, 'player1');
	player1.anchor.setTo(0.5,0.5);

	//make player animation
	fly = player1.animations.add('fly');
	//make stars animation
	for (i = 0; i < 9; i++){
		twinkle = stars[i].animations.add('twinkle');
	}

	//set player animation to occur 5 frames a second
	player1.animations.play('fly', 5, true);
	//set twinkle animation
	for (i = 0; i < 9; i++){
		stars[i].animations.play('twinkle', 3, true);
	}


	//
	keyW = game.input.keyboard.addKey(Phaser.Keyboard.W);
    keyW.onDown.add(moveForward, this);
    keyW.onUp.add(moveStop, this);

    keyA = game.input.keyboard.addKey(Phaser.Keyboard.A);
    keyA.onDown.add(moveLeft, this);
    keyA.onUp.add(stopMove, this);


    keyD = game.input.keyboard.addKey(Phaser.Keyboard.D);
    keyD.onDown.add(moveRight, this);
    keyD.onUp.add(stopMove, this);


}

function update(){

	player1.angle += turn;


	if (move == true){//either maintain speed or increase

		//calculate speed
		if (speed < topSpeed){
			speed += 0.1;
		}else{
			speed = topSpeed
		}

		//calculate individual speeds for each vector component
		angle = player1.angle;

		velX = (speed * Math.cos(angle));

		velY = (speed * Math.sin(angle));

		
	}else{//decrease speed


		velX = velX * friction;
		velY = velY * friction;

		if (velX  < 0.01 && velY < 0.01){
			speed = 0;
			velY = 0;
			velX = 0;
		}

	}

	

	for (i = 0; i < 9; i++){
		stars[i].x -= velX;
		stars[i].y -= velY;
	}
	
}

function moveForward(){
	move = true;
	console.log("1");
}

function moveStop(){
	move = false;
}

function stopMove(){
	turn = 0;
}

function moveLeft(){
	turn = -2;
}

function moveRight(){
	turn = 2;
}