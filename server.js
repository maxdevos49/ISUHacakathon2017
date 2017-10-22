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
var player = [];
var connectedClients = [];


setInterval(getupdates, 1000/10);

io.on('connection', function (socket) {

//new game setup here

connectedClients.push(socket.id);

  socket.emit('newConnection', {
  	clientID: socket.Id,
  	client: client,
  	clientX: 0,
  	clientY: 0,
  	clientScore: 0,
  	clientHealth: 100
  });


  socket.on('newConnectionReply', function(data){
  	player[data.client] = new playerInfo(data.clientID,data.client,data.clientUserName,0,0,0,100);
  	console.log("New Connection:\n" + socket.id);
  	io.sockets.emit("newPlayer", "New Player Joined");
  });

  client++;

  //game relays below this

  		socket.on('playerUpdate', function(data){
  		io.sockets.emit('playerUpdate', {
  			client: data.client,
  			clientX: data.clientX,
  			clientY: data.clientY,
  			clientAngle: data.clientAngle,
  			connectedClients: connectedClients
  		});

  // 		console.log("info");
		// console.log(data.client);
		// console.log(data.clientX);
		// console.log(data.clientY);
		// console.log(data.clientAngle);
  });

  socket.on('disconnect', function (data) {
    
    index = connectedClients.indexOf(socket.id);
    connectedClients.splice(index,index+1);
  	console.log(socket.id);

  });

});

function getupdates(){
	io.sockets.emit("retrieveUpdates", "HI");
}


function playerInfo(clientID, client,clientUsername,clientX,clientY,clientScore,clientHealth){
	this.clientID = clientID;
	this.client = client;
	this.username = clientUsername;
	this.x = clientX;
	this.y = clientY;
	this.score = clientScore;
	this.health = clientHealth;
}

