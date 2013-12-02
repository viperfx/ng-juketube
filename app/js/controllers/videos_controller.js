angular.module("app").controller("VideosController", function ($scope, $http, $log, VideosService, socket, $rootScope, $location, notify) {


    $scope.youtube = VideosService.getYoutube();
    $scope.results = VideosService.getResults();
    $scope.upcoming = VideosService.getUpcoming();
    $scope.history = VideosService.getHistory();
    $scope.playlist = true;
    $scope.connected = false;
    $scope.mixId = false;
    $scope.showPlayer = false;
    $scope.$watch('youtube', function(newVal) {
      if (newVal.state === 'playing') {
        $scope.mixId = false;
        socket.emit('checkMix', {'room':$rootScope.room, 'youtube':newVal});
      }
    }, true);
    socket.on('onMixFound', function(playlistId) {
      $scope.mixId = playlistId;
    });
    socket.on('onSyncState', function (data) {
        VideosService.setState(data);
        $scope.youtube = VideosService.getYoutube();
        $scope.results = VideosService.getResults();
        $scope.upcoming = VideosService.getUpcoming();
        $scope.history = VideosService.getHistory();
        $rootScope.log("synced data with host");
    });

    socket.on('onPartyCreated', function (data) {
        $scope.connected = true;
        $rootScope.room = data.room;
        $rootScope.isHost = true;
    });
    socket.on('onPartyJoined', function (room) {
        if ($rootScope.isHost) {
          //client side detection of host, should find a way to check from server side
           console.log("new guest joined");
          $rootScope.log("I am host, sending data to guest");
          socket.emit('syncState', {'room':$rootScope.room, 'state':[$scope.upcoming, $scope.history, $scope.youtube]});
        }else{
          $rootScope.room = room;
        }

    });
    socket.on('onPlayerAction', function(data) {
        $rootScope.log("I recieved play action "+data.action);
        if (data.action === 'play') {
          if($rootScope.isHost){
            $rootScope.YTplayer.playVideo();
            $rootScope.log("host recieved play action");
          }else{
            $scope.youtube.state = 'playing';
          }
        } else if (data.action === 'pause') {
          if($rootScope.isHost){
            $rootScope.YTplayer.pauseVideo();
            $rootScope.log("host recieved pause action");
          }else{
            $scope.youtube.state = 'paused';
          }
        } else if (data.action === 'next') {
          VideosService.nextVideo();
        } else if (data.action === 'previous') {
          VideosService.previousVideo();
        } else if (data.action === 'launch') {
          VideosService.launchPlayer(data.args[0], data.args[1]);
        } else if (data.action === 'move') {
          $scope.upcoming.splice(data.args[1], 0, $scope.upcoming.splice(data.args[0], 1)[0]);
        }

    });
    $scope.togglePlayer = function() {
        $scope.showPlayer = !$scope.showPlayer;
    };
    $scope.connect = function(room) {
        $scope.connected= true;
        if (room === undefined) {
            // room not specified so host a new room
            socket.emit('createParty', {'room':btoa(Math.random()).substr(3,4), 'state':[$scope.upcoming, $scope.history, $scope.youtube]});
        }else{
            // join the room
            socket.emit('joinParty', room);
        }
    };
    $scope.playerControl = function(action) {
        socket.emit('playerAction', {'room':$rootScope.room, 'action':action});
    };
    $scope.move = function(current, moveto) {
        socket.emit('playerAction', {'room':$rootScope.room, 'action':'move', 'args':[current, moveto]});
    };
    $scope.launch = function (id, title) {
      VideosService.launchPlayer(id, title);
      VideosService.archiveVideo(id, title);
      VideosService.deleteVideo($scope.upcoming, id);
      socket.emit('playerAction', {'room':$rootScope.room, 'action':'launch', 'args':[id,title]});
      $rootScope.log('Launched id:' + id + ' and title:' + title);
    };

    $scope.queue = function (id, title) {
      VideosService.queueVideo(id, title);
      VideosService.deleteVideo($scope.history, id);
      socket.emit('syncState', {'room':$rootScope.room, 'state':[$scope.upcoming, $scope.history, $scope.youtube]});
      $rootScope.log('Queued id:' + id + ' and title:' + title);
    };

    $scope.delete = function (list, id) {
      VideosService.deleteVideo(list, id);
      socket.emit('syncState', {'room':$rootScope.room, 'state':[$scope.upcoming, $scope.history, $scope.youtube]});
    };

    $scope.search = function () {
      $http.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: 'AIzaSyB0Rdzmn2haPKG3YMEqFpPiYI1NrdLllx0',
          type: 'video',
          maxResults: '8',
          part: 'id,snippet',
          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
          q: this.query
        }
      })
      .success( function (data) {
        VideosService.listResults(data);
        $location.url('/search/');
      })
      .error( function () {
        $rootScope.log('Search error');
      });
    };
    $scope.getMix = function(playlistId) {
      $http.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          key: 'AIzaSyB0Rdzmn2haPKG3YMEqFpPiYI1NrdLllx0',
          type: 'video',
          maxResults: '50',
          playlistId: playlistId,
          part: 'id,snippet',
          fields: 'items/snippet/resourceId/videoId,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
        }
      })
      .success( function (data) {
        VideosService.queueMix(data);
        socket.emit('syncState', {'room':$rootScope.room, 'state':[$scope.upcoming, $scope.history, $scope.youtube]});
        $scope.mixId=false;
        $rootScope.log("Youtube Mix playlist queued up!");
      })
      .error( function () {
        $rootScope.log('Search error');
      });
    };
    $scope.tabulate = function (state) {
      $scope.playlist = state;
    };
});
