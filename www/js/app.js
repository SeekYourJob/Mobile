angular.module('cvsMobile', ['ionic', 'ngIOS9UIWebViewPatch', 'starter.controllers', 'starter.services', 'angular-jwt', 'ngStorage'])

.run(function($ionicPlatform, AuthService, $rootScope, $state, $ionicHistory) {

  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  // https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec#.5d83feptm
  $rootScope.$on('$stateChangeStart', function (event, next) {
    if (!AuthService.isAuthenticated()) {
      event.preventDefault();
      AuthService.showLoginModal();
    }
  });

})

.config(function($stateProvider, $urlRouterProvider, $httpProvider, jwtInterceptorProvider) {

  // JWT tokens
  jwtInterceptorProvider.tokenGetter = ['jwtHelper', '$http', 'config', '$window', '$localStorage', 'AuthService',
    function(jwtHelper, $http, config, $window, $localStorage, AuthService) {
      // Skip authentication for any requests ending in .html
      if (config.url.substr(config.url.length - 5) === '.html') {
        return null;
      }

      return AuthService.getToken().then(function(token) {
        return token;
      }, function() {
        return null;
      });
    }
  ];
  $httpProvider.interceptors.push('jwtInterceptor');

  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/app.html'
  })
  .state('app.interviews', {
    url: '/interviews',
    views: {
      'app-interviews': {
        templateUrl: 'templates/app-interviews.html',
        controller: 'InterviewsController as interviewsCtrl'
      }
    }
  })
  .state('app.candidates', {
      url: '/candidates',
      views: {
        'app-candidates': {
          templateUrl: 'templates/app-candidates.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('app.recruiters', {
      url: '/recruiters',
      views: {
        'app-recruiters': {
          templateUrl: 'templates/app-recruiters.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })
  .state('app.account', {
    url: '/account',
    views: {
      'app-account': {
        templateUrl: 'templates/app-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // https://github.com/angular-ui/ui-router/issues/600#issuecomment-47228922
  $urlRouterProvider.otherwise(function($injector, $location){
    var $state = $injector.get("$state");
    $state.go('app.interviews');
  });

});
