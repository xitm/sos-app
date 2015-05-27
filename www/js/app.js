// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('arbeitsoberflaeche', {
    url: '/arbeitsoberflaeche',
        templateUrl: 'templates/arbeitsoberflaeche.html',
        controller: 'DashCtrl'
  })
  
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
  })
    
    .state('sessionuebersicht', {
        url: '/sessionuebersicht',
        templateUrl: 'templates/sessionuebersicht.html',
        controller: 'SessionuebersichtCtrl'
  })
    
    .state('sessionmanager', {
      url: '/sessionmanager',
      templateUrl: 'templates/sessionmanager.html',
      controller: 'SessionmanagerCtrl'
  })
    
    .state('arbeitsmanager', {
      url: '/arbeitsmanager',
      templateUrl: 'templates/arbeitsmanager.html',
      controller: 'ArbeitsmanagerCtrl'
  })
    
    .state('fahrtenmanager', {
      url: '/fahrtenmanager',
      templateUrl: 'templates/fahrtenmanager.html',
      controller: 'FahrtenmanagerCtrl'
  })
    
    .state('sessionbearbeitung', {
      url: '/sessionbearbeitung',
      abstract: true,
      templateUrl: 'templates/sessionbearbeitung.html',
      controller: 'SessionbearbeitungCtrl',
  })
    .state('sessionbearbeitung.sessionbearbeitung_fahrt', {
    url: '/fahrt',
    views: {
      'fahrt': {
        templateUrl: 'templates/sessionbearbeitung_fahrt.html',
        controller: 'FahrtCtrl'
      }
    }
    
  })
  
  .state('sessionbearbeitung.sessionbearbeitung_arbeit', {
    url: '/arbeit',
    views: {
      'arbeit': {
        templateUrl: 'templates/sessionbearbeitung_arbeit.html',
        controller: 'ArbeitCtrl'
      }
    }
  });

  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('login');

});




