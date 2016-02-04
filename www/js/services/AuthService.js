angular.module('cvsMobile').service('AuthService', ['constants', '$q', '$http', '$localStorage', 'jwtHelper', '$ionicModal', '$ionicLoading', '$ionicHistory', '$state', '$rootScope', function(constants, $q, $http, $localStorage, jwtHelper, $ionicModal, $ionicLoading, $ionicHistory, $state, $rootScope) {

  var self = this;

  $scopeModalLogin = $rootScope.$new(true);

  self.login = function(credentials) {
    var deferred = $q.defer();

    $http({
      method: 'POST',
      url: constants.apiEndpoint + '/authenticate',
      skipAuthorization: true,
      data: credentials
    }).success(function(data) {
      $localStorage.token = data.token;
      $ionicHistory.nextViewOptions({disableAnimate: true, disableBack: true});
      $state.go('app.interviews');
      deferred.resolve();
    }).error(function(err) {
      deferred.reject();
    });

    return deferred.promise;
  };

  self.getToken = function() {
    var deferred = $q.defer();

    if ($localStorage.token === null || typeof $localStorage.token === 'undefined') {
      deferred.reject();
    }

    else if (jwtHelper.isTokenExpired($localStorage.token)) {
      self.refreshToken().then(function(token) {
        deferred.resolve(token);
      }, function() {
        deferred.reject();
      });
    }

    else {
      deferred.resolve($localStorage.token);
    }

    return deferred.promise;
  };

  self.refreshToken = function() {
    var deferred = $q.defer();

    $http({
      method: 'POST',
      url: constants.apiEndpoint + '/authenticate/refresh',
      skipAuthorization: true,
      data: {
        oldToken: $localStorage.token
      }
    }).then(function (response) {
      $localStorage.token = response.data.token;
      deferred.resolve($localStorage.token);
    }, function () {
      delete $localStorage.token;
      deferred.reject();
    });

    return deferred.promise;
  }

  self.isAuthenticated = function() {
    return $localStorage.token;
  }

  self.initLoginModal = function() {
    $scopeModalLogin.credentials = {email: '', password: ''};

    $scopeModalLogin.login = function() {
      $ionicLoading.show({template: 'Connexion en cours...'});
      self.login($scopeModalLogin.credentials).then(function() {
        $ionicLoading.hide();
        $scopeModalLogin.modal.hide();
        $scopeModalLogin.modal.remove();
      }, function(err) {
        $ionicLoading.hide();
        $scopeModalLogin.credentials.password = '';
      });
    };
  };

  self.showLoginModal = function() {
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scopeModalLogin,
      animation: 'slide-in-up'
    }).then(function(modal) {
      self.initLoginModal();
      $scopeModalLogin.modal = modal;
      $scopeModalLogin.modal.show();
    });
  };

}]);
