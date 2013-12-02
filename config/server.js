/* Define custom server-side HTTP routes for lineman's development server
 *   These might be as simple as stubbing a little JSON to
 *   facilitate development of code that interacts with an HTTP service
 *   (presumably, mirroring one that will be reachable in a live environment).
 *
 * It's important to remember that any custom endpoints defined here
 *   will only be available in development, as lineman only builds
 *   static assets, it can't run server-side code.
 *
 * This file can be very useful for rapid prototyping or even organically
 *   defining a spec based on the needs of the client code that emerge.
 *
 */

module.exports = {
  drawRoutes: function(app) {
    app.post('/login', function(req, res) {
      res.json({ message: 'logging in!' });
    });

    app.post('/logout', function(req, res) {
      res.json({ message: 'logging out!'});
    });

    app.get('/books', function (req, res) {
      res.json([
        {title: 'Great Expectations', author: 'Dickens'},
        {title: 'Foundation Series', author: 'Asimov'},
        {title: 'Treasure Island', author: 'Stephenson'}
      ]);
    });
  },
  modifyHttpServer: function(server) {
    io = require('socket.io').listen(server);
    io.set('log level', 2)
    scrape = require('scrape');
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
        // curl 'http://www.youtube.com/watch?v=WJJ5d9qbfFk' -H 'Accept-Encoding: gzip,deflate,sdch' -H 'Host: www.youtube.com' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' -H 'Referer: http://www.youtube.com/results?search_query=irandam+ulagam&sm=3' -H 'Cookie: YSC=ndRc_70goac; VISITOR_INFO1_LIVE=SUjKHIedMZk; PREF=f1=50000000&fv=11.9.900; ACTIVITY=1386013363860' -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0' --compressed
          scrape.request({url:'http://youtube.com/watch?v='+data.youtube.videoId}, function (err, $) {
              if (err) return console.error(err);

              $('.related-playlist a').each(function (el) {
                  title = el.find('span.title').first();
                  if (title.text.search('YouTube Mix') === 0) {
                    io.sockets.in(data.room).emit('onMixFound', el.attribs.href.split('list=')[1]);
                  }else{
                    console.log(title.text);
                  }
              });
          });
      });
    });
  }
};
