angular.module("app").service("VideosService", ['$window', '$rootScope', '$log', 'socket', function ($window, $rootScope, $log, socket) {

  var service = this;
  $rootScope.YTplayer = null;
  // var playerHeight = '30';
  var playerHeight =  '360';
  var playerWidth = '640';
  var ready = false;
  var youtube = {
    videoId: null,
    videoTitle: null,
    state: 'stopped'
  };
  var results = [];
  var upcoming = [
    {id: 'kRJuY6ZDLPo', title: 'La Roux - In for the Kill (Twelves Remix)'},
    {id: '45YSGFctLws', title: 'Shout Out Louds - Illusions'},
    {id: 'ktoaj1IpTbw', title: 'CHVRCHES - Gun'},
    {id: 'FgAJWQCC7L0', title: 'Stardust Music Sounds Better With You (High Quality)'},
    {id: '8Zh0tY2NfLs', title: 'N.E.R.D. ft. Nelly Furtado - Hot N\' Fun (Boys Noize Remix) HQ'},
    {id: 'zwJPcRtbzDk', title: 'Daft Punk - Human After All (SebastiAn Remix)'},
    {id: 'sEwM6ERq0gc', title: 'HAIM - Forever (Official Music Video)'},
    {id: 'fTK4XTvZWmk', title: 'Housse De Racket ☁☀☁ Apocalypso'}
  ];

  // var upcoming = [];
  var history = [
    {id: 'XKa7Ywiv734', title: '[OFFICIAL HD] Daft Punk - Give Life Back To Music (feat. Nile Rodgers)'}
  ];
  // var history = [];

  $window.onYouTubeIframeAPIReady = function () {
    $log.info('Youtube API is ready');
    socket.on('onPartyCreated', function (data) {
      ready = true;
      service.loadPlayer();
      // $rootScope.$apply();
    });
  };


  function onYoutubeReady (event) {
    $log.info('YouTube Player is ready');
    // event.target.setVolume(0);
    $rootScope.YTplayer.cueVideoById(history[0].id);
    youtube.videoId = history[0].id;
    youtube.videoTitle = history[0].title;
    $rootScope.$apply();
  }

  function onYoutubeStateChange (event) {
    if (event.data === YT.PlayerState.PLAYING) {
      youtube.state = 'playing';
    } else if (event.data === YT.PlayerState.PAUSED) {
      youtube.state = 'paused';
    } else if (event.data === YT.PlayerState.ENDED) {
      youtube.state = 'ended';
      service.nextVideo();
    }
    $rootScope.$apply();
  }

  this.nextVideo = function() {
      service.launchPlayer(upcoming[0].id, upcoming[0].title);
      service.archiveVideo(upcoming[0].id, upcoming[0].title);
      service.deleteVideo(upcoming, upcoming[0].id);
      // socket.emit('syncState', {'room':$rootScope.room, 'state':[upcoming,history, youtube]});
  };

  // this.previousVideo = function() {
  //     if ($rootScope.isHost){
  //       service.launchPlayer(history[1].id, upcoming[1].title);
  //       service.reviveVideo();
  //       socket.emit('syncState', {'room':$rootScope.room, 'state':[upcoming, history, youtube]});
  //     }
  // }
  this.createPlayer = function () {
    $log.info('Creating a new Youtube player for DOM id placeholder'+ 'and video ' + youtube.videoId);
    return new YT.Player('placeholder', {
      height: playerHeight,
      width: playerWidth,
      playerVars: {
        rel: 0,
        showinfo: 0,
      },
      events: {
        'onReady': onYoutubeReady,
        'onStateChange': onYoutubeStateChange
      }
    });
  };

  this.loadPlayer = function () {
    if (ready) {
      if ($rootScope.YTplayer) {
        $rootScope.YTplayer.destroy();
      }
      $rootScope.YTplayer = service.createPlayer();
    }
  };

  this.launchPlayer = function (id, title) {
    if ($rootScope.isHost){
      $rootScope.YTplayer.loadVideoById(id);
    }
    youtube.videoId = id;
    youtube.videoTitle = title;
    return youtube;
  };

  this.listResults = function (data) {
    results.length = 0;
    for (var i = data.items.length - 1; i >= 0; i--) {
      results.push({
        id: data.items[i].id.videoId,
        title: data.items[i].snippet.title,
        description: data.items[i].snippet.description,
        thumbnail: data.items[i].snippet.thumbnails.default.url,
        author: data.items[i].snippet.channelTitle
      });
    }
    return results;
  };

  this.queueMix = function (data) {
    upcoming.length = 0;
    for (var i =  1; i < data.items.length-1; i++) {
      upcoming.push({
        id: data.items[i].snippet.resourceId.videoId,
        title: data.items[i].snippet.title,
      });
    }
    return upcoming;
  };


  this.queueVideo = function (id, title) {
    upcoming.push({
      id: id,
      title: title
    });
    return upcoming;
  };

  this.archiveVideo = function (id, title) {
    history.unshift({
      id: id,
      title: title
    });
    return history;
  };

  this.deleteVideo = function (list, id) {
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i].id === id) {
        list.splice(i, 1);
        break;
      }
    }
  };

  this.getYoutube = function () {
    return youtube;
  };

  this.getResults = function () {
    return results;
  };

  this.getUpcoming = function () {
    return upcoming;
  };

  this.getHistory = function () {
    return history;
  };
  this.setState = function (data) {
    upcoming = data[0];
    history = data[1];
    youtube = data[2];
    youtube.videoId = history[0].id;
    youtube.videoTitle = history[0].title;
    // YTplayer.destroy();
    // YTplayer = service.createPlayer();
  };

}]);
