'use strict';

module.exports = function(){
	this.get = function(sUrl){
		if (window.location.hostname === "localhost"){
		    //return "/api" + sUrl;
		}
		//DEV
		//return 'http://sbe1-vm-gwdev.stowint.be:8000/sap/opu/odata/sap/ZFIELD_SRV;o=QASCLNT900' + sUrl;
		return 'http://rdwdcr03.bt.dcsc.be:50000/sap/opu/odata/sap/ZFIELD_SRV' + sUrl;

		//PRD
		// return 'http://sbe1-vm-gwdev.stowint.be:8000/sap/opu/odata/sap/ZFIELD_SRV;o=ECC_STO' + sUrl;
		//return 'http://scvwis0423.dcsc.be:8100/sap/opu/odata/sap/ZFIELD_SRV' + sUrl;
		//return 'http://gsusapdp01.group.ad:8001/sap/opu/odata/sap/ZFIELD_SRV' + sUrl;

		// var temp = sUrl.split('?');
		// if(temp[0] === '/'){
		// 	temp[0] = '/login';
		// }
		// temp[0] = temp[0] + '.json';
		// return 'mock' + temp.join('?');
	};
};
