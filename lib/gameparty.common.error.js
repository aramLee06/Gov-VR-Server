var errorCode = require('../config/errorCode.json');
var log       = require('./gameparty.common.logger');

exports.gamepartyError = function(){

	var result_json = {};
	var res;
	var err_code;

	if (arguments.length == 0) {
		log.e('gamepartyError arguments length 0');
		result_json = {
            gp_ack     : 9999,
            error_data : 'RT_ERROR_UNKNOWN : gamepartyError arguments length 0'
		}
	} else {
		res = arguments[0];
		err_code = arguments[1];

		if (typeof errorCode[err_code] === 'undefined') {
			result_json = {
				gp_ack     : 9999,
				error_data : 'RT_ERROR_UNKNOWN : ' + err_code
			}
		} 
        else {
			result_json = {
				gp_ack     : err_code,
				error_data : errorCode[err_code]
			}
		}

		if(arguments.length == 3) {
			result_json.token = arguments[2];
		}
	}
	res.json(result_json);
}

exports.errorcode = errorCode;
