angular.module('cvsMobile').service('UserService', ['constants', '$http', '$localStorage', '$q', function(constants, $http, $localStorage, $q) {

  var self = this;

  self.getAuthenticatedUser = function() {
    var deferred = $q.defer();

    $http.get(constants.apiEndpoint + "/me")
      .success(function(data) {
        $localStorage.user = data.user;
        deferred.resolve($localStorage.user);
      })
      .error(function() {
        deferred.reject();
      });

    return deferred.promise;
  };

}]);