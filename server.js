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

console.log("Server Started!\nServer Version: " + version + "\nListening on http://localhost:8080");


app.use(express.static('public'))

app.get('/', function (req, res) {

  res.sendFile(__dirname + '/index.html');

});

io.on('connection', function (socket) {

  socket.emit('news', { hello: 'world' });

  socket.on('my other event', function (data) {
    console.log(data);
  });

});

