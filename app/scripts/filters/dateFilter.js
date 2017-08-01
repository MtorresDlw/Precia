'use strict';

module.exports = function(){
    return function (dateValue) {
        var resultDate = '';
        if (dateValue !==undefined && dateValue !==null && dateValue !== '' && dateValue != '00000000' && dateValue.length === 8) {
            var year = dateValue.substr(0,4);
            var month = dateValue.substr(4, 2);
            var day = dateValue.substr(6, 2);
            resultDate = year + '-' + month + '-' + day;
        }
        return resultDate;
    };
};
