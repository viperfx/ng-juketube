angular.module("app").controller("VideosController", function ($scope, $http, $log, VideosService, socket, $rootScope, $location) {

    // init();

    // function init() {
    $scope.youtube = VideosService.getYoutube();
    $scope.results = VideosService.getResults();
    $scope.upcoming = VideosService.getUpcoming();
    $scope.history = VideosService.getHistory();
    $scope.playlist = true;
    $scope.connected = false;

    $scope.$watch('upcoming', function(delta){
      console.info("watcher %O", delta);
      // do stuff here
      // newValues contains the new values of the observed collection array
    });
    socket.on('onPartyConnect', function (data) {
        VideosService.setState(data);
        $scope.youtube = VideosService.getYoutube();
        $scope.results = VideosService.getResults();
        $scope.upcoming = VideosService.getUpcoming();
        $scope.history = VideosService.getHistory();
    });

    socket.on('onPartyCreated', function (data) {
        $scope.connected = true;
        $scope.room = data.room;
        $scope.isHost = true;
    //     VideosService.setState(data.state);
    //     $scope.youtube = VideosService.getYoutube();
    //     $scope.upcoming = VideosService.getUpcoming();
    //     $scope.history = VideosService.getHistory();
    });
    socket.on('onPartyJoined', function (data) {
        console.log("new guest joined");
        console.log(data);
    });
    socket.on('onPlayerAction', function(action) {
        if($scope.isHost){
          $rootScope.YTplayer.playVideo();
          console.log("host recieved play action")
        };
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
        if ($scope.isHost) {
          $scope.YTplayer.playVideo();
        }else{
          socket.emit('playerAction', {'room':$scope.room, 'action':'play'});
        }

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
        $log.info(this.query.value);
        $location.url('/search/');
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
