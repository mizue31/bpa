'use strict';

angular.module('bpa', [
  'ngCookies',
  'ngSanitize',
  'ngRoute'
])
  .config(['$routeProvider', function($routeProvider){
    $routeProvider
      .when('/', {
        templateUrl: 'templates/menu.html'
      })
      .otherwise({
        redirectTo: '/'
      });
    }]);

