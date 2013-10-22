angular.module("app").controller("VideosController", function ($scope, $http, $log, VideosService, socket) {

    // init();

    // function init() {
    $scope.youtube = VideosService.getYoutube();
    $scope.results = VideosService.getResults();
    $scope.upcoming = VideosService.getUpcoming();
    $scope.history = VideosService.getHistory();
    // $scope.playlist = true;
    $scope.connected = false;
    socket.on('onPartyConnect', function (data) {
        VideosService.setState(data);
        $scope.youtube = VideosService.getYoutube();
        $scope.results = VideosService.getResults();
        $scope.upcoming = VideosService.getUpcoming();
        $scope.history = VideosService.getHistory();
    });

    socket.on('onPartyCreated', function (room) {
        $scope.connected = true;
        $scope.room = room;
    });
    socket.on('onPartyJoined', function (data) {
        console.log("new guest joined");
        console.log(data);
    });
    $scope.connect = function(room) {
        $scope.connected= true;
        if (room === undefined) {
            // room not specified so host a new room
            socket.emit('createParty', 'test');
        }else{
            // join the room
            socket.emit('joinParty', room);
        }
    }
    $scope.playVid = function() {
        $scope.youtube.player.playVideo();
    }
    $scope.launch = function (id, title) {
      VideosService.launchPlayer(id, title);
      VideosService.archiveVideo(id, title);
      VideosService.deleteVideo($scope.upcoming, id);
      $log.info('Launched id:' + id + ' and title:' + title);
    };

    $scope.queue = function (id, title) {
      VideosService.queueVideo(id, title);
      VideosService.deleteVideo($scope.history, id);
      $log.info('Queued id:' + id + ' and title:' + title);
    };

    $scope.delete = function (list, id) {
      VideosService.deleteVideo(list, id);
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
        $log.info(data);
      })
      .error( function () {
        $log.info('Search error');
      });
    };

    $scope.tabulate = function (state) {
      $scope.playlist = state;
    };
});
