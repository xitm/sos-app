angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state) {
    $scope.callSessionmanager = function() {
        $state.go('sessionmanager')
    }
    $scope.callSessionuebersicht = function() {
        $state.go('sessionuebersicht')
    }
    
})


.controller('LoginCtrl', function($scope, LoginService, $state) {
 
    $scope.init = function() {
      $scope.passcode = "";
    }
    $scope.add = function(value) {
      if($scope.passcode.length < 4) {
        $scope.passcode = $scope.passcode + value;
        if($scope.passcode.length == 4) {
            LoginService.loginUser($scope.passcode).success(function(data) {
                $state.go('arbeitsoberflaeche')
            }).error(function(data) {
              var alertPopup = alert({
                  title: 'Login failed!',
                  template: 'Please check your credentials!'
                });
            });
        }
      }
    }
    $scope.delete = function() {
      if($scope.passcode.length > 0) {
        $scope.passcode = $scope.passcode.substring(0, $scope.passcode.length - 1);
      }
    }
})

.controller('SessionmanagerCtrl', function($scope, $state) {
    $scope.callArbeitsoberflaeche = function() {
        $state.go('arbeitsoberflaeche');
    }
})

.controller('SessionuebersichtCtrl', function($scope, $state) {
    $scope.callArbeitsoberflaeche = function() {
        $state.go('arbeitsoberflaeche');
    }
});


var app = angular.module('app.controllers', [])

app.controller('sessionmanager', function($scope) {
    $scope.callSessionmanager = function() {
        alert ("hello World")
    }
});