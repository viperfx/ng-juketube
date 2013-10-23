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
    // var appState = {'roomID':[upcoming, history, youtube]}
    /*var appStateDefault =  [[
    {id: 'kWbRdSiYgAY', title: 'Arrambam - En Fuse Pochu Official Full Song'},
    {id: 'h1UGJ-USaf4', title: 'Arrambam - Stylish Thamizhachi Official Full Song'},
    {id: 'mYSC8pviihY', title: 'Arrambam - Hare Rama Official Full Song'},
    {id: '5vDn-M7FvZA', title: 'Vanakkam Chennai - Oh Penne Full Song'},
    {id: 'LskTKRBJdJU', title: 'Hey Baby Official Full Song - Raja Rani'},
    {id: 'OxfGcjC7aSs', title: 'Oodha Color Ribbon - Varutha Padatha Valibar sangam'}
  ]
                            ,[
                                {id: 'K6A8W_SHdq8', title: 'Ethir Neechal'}
                              ],{
                                ready: false,
                                videoId: null,
                                videoTitle: null,
                                // playerHeight: '30',
                                playerHeight: '360',
                                playerWidth: '640',
                                state: 'stopped'
                              }];*/
    var appStateDefault = [[], [], { videoId: null,videoTitle: null,state:'stopped'}]
    var appState = {}
    io.sockets.on('connection', function(socket) {
      socket.emit('hello', { hello: 'world' });
      socket.on('createParty', function(room) {
          appState[room] = appStateDefault;
          socket.join(room);
          socket.emit('onPartyCreated', {'room':room, 'state':appState[room]});
      });

      socket.on('joinParty', function(room) {
          socket.broadcast.emit('onJoinParty', room);
          socket.join(room);
          socket.broadcast.to(room).emit('onPartyJoined', appState[room]);
          socket.emit('onPartyConnect', appState[room]);

      });

      socket.on('syncState', function(room, data){
          appState[room] = data;
          socket.broadcast.to(room).emit('onSyncState', data);
      });

      socket.on('playerAction', function(data){
          socket.broadcast.to(data.room).emit('onPlayerAction', data.action);
      });
    });
  }
};
