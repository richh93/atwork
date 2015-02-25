var app = angular.module('AtWork', ['atwork.system', 'atwork.users', 'atwork.posts', 'ngMaterial']);

app.controller('AppCtrl', [
  '$scope', 
  '$mdSidenav',
  '$mdBottomSheet',
  '$location',
  '$timeout',
  'appLocation',
  'appAuth',
  function($scope, $mdSidenav, $mdBottomSheet, $location, $timeout, appLocation, appAuth) {
    $scope.barTitle = '';
    $scope.search = '';

    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.updateLoginStatus = function() {
      $scope.isLoggedIn = appAuth.isLoggedIn();
      $scope.user = appAuth.getUser();
    };

    $scope.showUserActions = function($event) {
      $mdBottomSheet.show({
        templateUrl: '/modules/users/views/user-list.html',
        controller: 'UserSheet',
        targetEvent: $event
      }).then(function(clickedItem) {
        $scope.alert = clickedItem.name + ' clicked!';
      });
    };

    if (!appAuth.isLoggedIn()) {
      $scope.barTitle = 'atWork';
      appLocation.url('/login');
    } else {
      $scope.barTitle = '';
    }

    $scope.$on('loggedIn', function() {
      $scope.updateLoginStatus();
      $scope.barTitle = '';
      
    });
    $scope.$on('loggedOut', function() {
      $scope.updateLoginStatus();
      $scope.barTitle = 'atWork';
    });

    
    $scope.updateLoginStatus();
    $timeout(function() {
      $scope.appReady = true;
      appLocation.url('/feed');
    });
  }
]);