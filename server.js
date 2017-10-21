//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\//
//											ISU Hackathon Game Server 2017											 //
//								Created By: Max DeVos, Thomas Powell, and Mason Timmerman							 //
//																													 //
//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\//
const version = 0.1;


var express = require('express'),app = express();

var fs = require('fs');

var server = require('http').Server(app);

var io = require('socket.io')(server);

//let the server listen on port 80
server.listen(8080);

console.log("Server Started!\nServer Version: " + version + "\nListening on http://10.27.164.135:8080");


app.use(express.static('public'))

app.get('/', function (req, res) {

  res.sendFile(__dirname + '/index.html');

});

var client = 0
var playerInfo = [];

io.on('connection', function (socket) {

//new game setup here

  socket.emit('newConnection', {
  	clientID: socket.Id,
  	client: client,
  	clientX: 0,
  	clientY: 0,
  	clientScore: 0,
  	clientHealth: 100
  });


  socket.on('newConnectionReply', function(data){
  	playerInfo[data.client] = new player(data.clientID,data.client,data.clientUserName,0,0,0,100,0,0);
  	console.log("New Connection:\nUsername: " + playerInfo[data.client].username);
  });

  client++;

  //game relays below this

  socket.on('playerUpdate', function(data){
  		socket.emit('playerUpdate', {
  			client: data.client,
  			clientX: data.x,
  			clientY: data.y
  		});
  });


});

function player(clientID, client,clientUsername,clientX,clientY,clientScore,clientHealth,clientXVel,clientYVel){
	this.clientID = clientID;
	this.client = client;
	this.username = clientUsername;
	this.x = clientX;
	this.y = clientY;
	this.score = clientScore;
	this.health = clientHealth;
	this.XVel = clientXVel;
	this.YVel = clientYVel;
}

