angular.module("app", ["ek.mobileFrame", "cgNotify"]).run(function($rootScope, notify) {
  // adds some basic utilities to the $rootScope for debugging purposes
  $rootScope.log = function(thing) {
    console.log(thing);
    notify(thing);
  };

  $rootScope.alert = function(thing) {
    alert(thing);
  };
  var tag = document.createElement('script');
  tag.src = "http://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}).config( ['$mobileFrameProvider', '$httpProvider', function ($mobileFrameProvider,$httpProvider) {
  $mobileFrameProvider
            .setHeaderHeight(50)
            .setFooterHeight(50)
            .setNavWidth(250);
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);
