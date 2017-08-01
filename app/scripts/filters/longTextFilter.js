'use strict';

module.exports = function(){
    return function (msg) {
        //var result = msg.replace(/\n/g, "\\n");
        if(msg==undefined || msg===null || msg==="" )
            return "";
        else
        {
            var result = msg.replace(/\\n/g, "\n");
            return result;
        }

    };
};
