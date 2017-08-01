'use strict';

module.exports = function() {
	return {
		restrict: 'EA',
		templateUrl: 'priorityFilter.html',
		transclude: true,
		link: function(scope, element, attrs) {
			scope.localFunction = function($event) {
				var selectedElements = document.getElementsByClassName('selected');
				for (var i = 0; i < selectedElements.length; i++) {
					selectedElements[i].className = '';
				}

				var elementToSelect;
				if ($event.target.className === 'navFa fa fa-exclamation-triangle' || $event.target.className === 'navFa fa fa-list') {
					elementToSelect = $event.target.parentNode;
				} else {
					elementToSelect = $event.target;
				}
				elementToSelect.className = 'selected';
			};
		}

	};
};
