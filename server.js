
//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\//
//                      ISU Hackathon Game Server 2017                                   //
//                Created By: Max DeVos, Thomas Powell, and Mason Timmerman                    //
//                            Version 0.2                            //
//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\//
/*global require: false, console: false, __dirname: false*/

"use strict";


const version = 0.2;

var express = require('express'),app = express();

var server = require('http').Server(app);

var io = require('socket.io')(server);

//let the server listen on port 80
server.listen(8080);

//tell console the server is running
console.log("Server Started!\nServer Version: " + version + "\nListening on http://localhost:8080");

//tell where to find page depended info. css/javascript/images/audio/and other stuff
app.use(express.static('public'));

//do this on a connection from the client
app.get('/', function (req, res) {

  //respond with this for the client
    res.sendFile(__dirname + '/index.html');

});



var client = 0;
var player = [];
var num_Id = [];
var rmIndex;

setInterval(askForUpdates, 1000/20);

//process socket request
io.on("connection", function(socket){//this runs on first connection

  num_Id[client] = socket.id; 

  player[client] = new playerInfo(socket.id, client, 1200,900, 0);

  console.log("new connection with index: " + client);

  //reply for initial connection
  socket.emit("connReply", player[client]);


  //give the connecting player all of the other players who are online
  socket.on("loadOtherPlayers", function(){

    io.sockets.emit("loadOtherPlayers", player);

  });

  socket.on("updateReply", function(data){
    //update players info located on server
    //console.log("new reply: ");
    player[data.clientNum].clientID = data.clientID;
    player[data.clientNum].clientNum = data.clientNum;
    player[data.clientNum].x = data.x;
    player[data.clientNum].y = data.y;
    player[data.clientNum].angle = data.angle;
    //console.log(player[data.clientNum]);
  });


  //run this when someone disconnects
  socket.on("disconnect", function(){

    for (var i = 0; i < num_Id.length ;i++ ){

      if (num_Id[i] == socket.id){
  
        rmIndex = i;
      }
    }

    delete player[rmIndex];

    console.log("Player Disconnected with index: " + rmIndex);

    io.sockets.emit("playerDisconnect", {
      id: rmIndex
    });

  });

  client++;
});

function askForUpdates(){
  io.sockets.emit("askingForUpdates", player);
  //console.log("Player info being sent: \n" + player + "\n\n");
}

function playerInfo(clientID,clientNum,clientX,clientY,clientAngle){
  /*jshint validthis:true */
  this.clientID = clientID;
  this.clientNum = clientNum;
  this.x = clientX;
  this.y = clientY;
  this.angle = clientAngle;
}

