angular.module("app").config(function($routeProvider, $locationProvider) {

  $locationProvider.html5Mode(true);

  $routeProvider.when('/upcoming', {
    templateUrl: 'upcoming.html',
    // controller: 'LoginController'
  });

  // $routeProvider.when('/', {
  //   templateUrl: 'home.html'
  //   // controller: 'HomeController'
  // });

  $routeProvider.when('/search/:query', {
    templateUrl: 'search.html'
    // controller: 'HomeController'
  });

  $routeProvider.when('/history', {
    templateUrl: 'history.html',
    // uncomment if you want to see an example of a route that resolves a request prior to rendering
    // resolve: {
    //   books : function(BookService) {
    //     return BookService.get();
    //   }
    // }
  });

  $routeProvider.otherwise({ redirectTo: '/upcoming' });

});
