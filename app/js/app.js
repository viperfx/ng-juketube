angular.module("app", ["ngResource", "ngRoute","ek.mobileFrame"]).run(function($rootScope) {
  // adds some basic utilities to the $rootScope for debugging purposes
  $rootScope.log = function(thing) {
    console.log(thing);
  };

  $rootScope.alert = function(thing) {
    alert(thing);
  };
  var tag = document.createElement('script');
  tag.src = "http://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}).config( ['$mobileFrameProvider', '$httpProvider', function ($mobileFrameProvider,$httpProvider ) {
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $mobileFrameProvider
            .setHeaderHeight(50)
            .setFooterHeight(30)
            .setNavWidth(200);
}]);
