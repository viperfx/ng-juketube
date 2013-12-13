var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    port = process.env.PORT || 8181,
    scrape = require('scrape');

app.configure(function() {
    app.use(express.static(__dirname + '/generated'));
});

var appState = {}
io.sockets.on('connection', function(socket) {
      socket.on('createParty', function(data) {
          appState[data.room] = data.state;
          socket.join(data.room);
          socket.emit('onPartyCreated', {'room':data.room, 'state':appState[data.room]});
      });

      socket.on('joinParty', function(room) {
          socket.join(room);
          io.sockets.in(room).emit('onPartyJoined', room);
      });

      socket.on('syncState', function(data){
          appState[data.room] = data.state;
          //send back to all clients in room except host
          socket.broadcast.to(data.room).emit('onSyncState', appState[data.room]);
      });

      socket.on('playerAction', function(data){
          io.sockets.in(data.room).emit('onPlayerAction', {'action':data.action, 'args':data.args});
      });

});
server.listen(port);
