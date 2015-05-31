angular.module('starter.services', [])

.service('LoginService', function($q) {
    return {
        loginUser: function(pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
 
            if ( pw == '1234') {
                deferred.resolve('Welcome ' + ' Alex' + '!');
            } else {
                deferred.reject('Wrong credentials.');
            }
            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
});
