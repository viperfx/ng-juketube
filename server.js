var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    port = process.env.PORT || 8000,
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

      socket.on('checkMix', function(data) {
          scrape.request({url:'http://youtube.com/watch?v='+data.youtube.videoId, useragent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36'}, function (err, $) {
              if (err) return console.error(err);

              $('.related-playlist a').each(function (el) {
                  title = el.find('span.title').first();
                  if (title.text.search('YouTube Mix') === 0) {
                    socket.emit('onMixFound', el.attribs.href.split('list=')[1]);
                  }else{
                    console.log(title.text);
                  }
              });
          });
      });
});
server.listen(port);
// require('node.io').scrape(function(){
//   this.getHtml('http://youtube.com/watch?v=WJJ5d9qbfFk', function (err, $) {
//     $('.related-playlist a').each(function (el) {
//         title = el.find('span.title').first();
//         if (title.text.search('YouTube Mix') === 0) {
//           console.log('onMixFound' + el.attribs.href.split('list=')[1]);
//         }else{
//           console.log(title.text);
//         }
//     });
//   });
// });
