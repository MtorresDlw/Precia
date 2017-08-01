'use strict';

module.exports = function($scope, $modalInstance, $state, languages, $translate, syncService){
	$scope.languages = languages;
	$scope.selected = {
		item: $scope.languages[0]
	};
	$scope.$state = $state;
	$scope.$modalInstance = $modalInstance;

	$scope.ok = function() {
		if ($scope.cleanDatabaseCheckbox) {
			clearDatabase();
		}
		$modalInstance.close($scope.selected.item);
	};

	$scope.changeLanguage = function(langKey) {
		$translate.use(langKey);
	};

	$scope.updateLanguage = function(selectedLanguage) {
		$translate.use(selectedLanguage.code);
	};

	function clearDatabase() {
		syncService.cleanFullDatabase();
	}

	$scope.cleanDatabaseCheckbox = false;
};
