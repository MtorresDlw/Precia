'use strict';

module.exports = function($scope, $state, dbPut, dbGet, dbRemove, AuthenticationService, loginService){

	$scope.pageClass = 'page-login';

	//Get the credentials from the most recent user
	var tempUsername;
	var tempPassword;

	dbGet.credentials().then(function(doc) {
	    $scope.username = doc.username;
	    $scope.password = doc.password;
	    tempUsername = doc.username;
	    tempPassword = doc.password;
	    AuthenticationService.SetTemporaryCredentials($scope.username, $scope.password);

	    $scope.$evalAsync(); // do this in the current digest loop instead of the next
	}).catch(function (err) {
	    console.info(err);
	});

	//Login with the given credentials
	$scope.login = function () {
	    $scope.dataLoading = true;

	    console.info('Logging in online: ' + navigator.onLine);

	    if(navigator.onLine){
	    	    AuthenticationService.Login($scope.username, $scope.password, $scope.offline).then(function(response){
	    	    	if(response){
	    	    		AuthenticationService.SetCredentials($scope.username, $scope.password);

	    	    		var credentials = {};

	    	    		if($scope.username !== loginService.tempUsername){
	    	    			dbRemove.operations().then(function(){
	    	    				return dbGet.credentials();
	    	    			}).then(function(oldCredentials){
	    	    				oldCredentials.username = $scope.username;
	    						oldCredentials.password = $scope.password;
	    	    				return dbPut.credentials(oldCredentials.username, oldCredentials.password);
	    	    			}).catch(function(err){
	    	    				return dbPut.credentials($scope.username, $scope.password);
	    	    			}).then(function(res){
	    	    				$state.go('dashboard');
	    	    			}).catch(function(err){
	    	    				console.error(err);
	    	    				$state.go('dashboard');
	    	    			});
	    	    		}else{
	    	    			dbGet.credentials().then(function(oldCredentials) {
	    	    			    return dbPut.credentials($scope.username, $scope.password);
	    	    			}).catch(function (err) {
	    	    			    return dbPut.credentials($scope.username, $scope.password);
	    	    			});

	    	    			$state.go('dashboard');
	    	    		}
	    	    	}
	    	    }).catch(function(res){
	    	    	$scope.error = res.messageCode + ' - ' + res.message;
	    	    	$scope.dataLoading = false;

	    	    	if(res.authenticationError){
	    	    	    $scope.password = '';
	    	    	    AuthenticationService.SetTemporaryCredentials($scope.username, $scope.password);

	    	    	    dbGet.credentials().then(function(doc) {
	    	    	        return dbPut.credentials(doc.username, '');
	    	    	    });
	    	    	}
	    	    });

	    }else{
	    	dbGet.credentials().then(function(credentials){
	    		if($scope.username === credentials.username && $scope.password === credentials.password){
	    			AuthenticationService.SetCredentials($scope.username, $scope.password);
	    			$state.go('dashboard');
	    		}else{
	    			$scope.error = 'Authentication failed, please check credentials.';
	    			$scope.dataLoading = false;
	    		}
	    	}).catch(function(err){
	    		$scope.error = 'Not able to connect to the server. Offline mode is only available for the most recent user.';
	    		$scope.dataLoading = false;
	    	});
	    }
	};
};
