var log4js = require('log4js'); 
var fs     = require('fs');
var logfileDir = process.cwd();

var info  = log4js.getLogger('info'); 
var error = log4js.getLogger('error'); 
var debug = log4js.getLogger('debug'); 
var old_filename = '';

exports.write_log = function(type, log){
	var curDate = new Date();
	var filename = curDate.getFullYear() + '-' + (curDate.getMonth()+1) + '-' + curDate.getDate();
	
	if (filename != old_filename){
		var logConfig = { 
			appenders: [
			{   
				type: 'file',
				filename: logfileDir + '/log/' + filename + '-error.log',
				category: 'error',
				maxLogSize: 20480,
				backups: 10
			},
			{   
				type: 'file',
				filename: logfileDir + '/log/' + filename + '-info.log', 
				category: 'info',
				maxLogSize: 20480,
				backups: 10
			},
			{   
				type: 'file',
				filename: logfileDir + '/log/' + filename + '-debug.log', 
				category: 'debug',
				maxLogSize: 20480,
				backups: 10
			}]
		};
		
		log4js.configure(logConfig);

		old_filename = filename;
		
		for (var i = 0; i < logConfig.appenders.length; i++)
        {
			if (!fs.existsSync(logConfig.appenders[i].filename)){
				var fd = fs.openSync(logConfig.appenders[i].filename, 'w');
				fs.closeSync(fd);
			} 
		}
	}

	if (type == 'info'){
		info.info('info::'+log);
	}
	else if (type == 'error'){
		error.info('error::'+log);
	}
	else if (type == 'debug'){
		debug.info('debug::'+log);
	}
}




