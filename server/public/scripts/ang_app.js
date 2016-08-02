var myApp = angular.module('myApp', ['ngRoute', 'ngMaterial', 'ngMap',  'ngMessages', 'ngAnimate', 'ngSanitize']);


  myApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/poke', {
        templateUrl: '/views/poke.html',
        controller: "pokeController"
      })
      .otherwise({
        redirectTo: 'poke'
      })
}]);
