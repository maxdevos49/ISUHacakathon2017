//game server file

console.log('Server Started!!');

socket = require('socket.io');
fs = require('fs');



// Socket setup & pass server
http = require('http').createServer().listen(8080);
io = require('socket.io').listen(http);

//start socket operations
io.on('connection', function(socket){



});

