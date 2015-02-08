'use strict';

angular.module('atwork.utils', ['ngRoute', 'ngMaterial'])
.factory('appStorage', function() {
  return {
    get: function(item) {
      return sessionStorage.getItem(item);
    },
    set: function(item, val) {
      return sessionStorage.setItem(item, val);
    },
    remove: function(item) {
      return sessionStorage.removeItem(item);
    }
  }
})
.factory('appLocation', [
  '$location', 
  function($location) {
    return $location;
  }
])
.factory('appToast', [
  '$mdToast',
  function($mdToast) {
    return function(message) {
      var toast = $mdToast.simple()
        .content(message)
        .action('OK')
        .highlightAction(false)
        .position('bottom right');
      $mdToast.show(toast);
    }
  }
]);