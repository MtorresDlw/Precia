
angular
    .module('stowApp')
    .filter('longTextFilter', longTextFilter)
function longTextFilter() {
    var longTextFilter = function (msg) {
        //var result = msg.replace(/\n/g, "\\n");
        if(msg==undefined || msg===null || msg==="" )
            return "";
        else
        {
            var result = msg.replace(/\\n/g, "\n");
            return result;
        }

    };
    return longTextFilter;
};


