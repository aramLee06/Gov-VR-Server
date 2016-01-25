/* global delimiter1 */
'use strict';

var net                     = require('net');
var roomManager             = require('./gameparty.core.roommanager');
var log                     = require('./gameparty.common.logger');
var before_last_data        = [];

exports.startGamepartyServer = function(recv_port) 
{
	var port = 5000;
	
	if (recv_port != null){
		port = recv_port;
	}
	else{
		console.log('port null');
	}
	
	var server = net.createServer();
	
	server.on('connection',function(socket) {
		log.s('connect remote:' + socket.remoteAddress + '-' + socket.remotePort);
		
	    server.getConnections(function(err, count) {
	        log.s("# Node Connections: " + count);
	    });
		
		socket.setNoDelay(true);
		socket.setKeepAlive(true, 3000);
	
		var recv_JSON = null;
		var cmd_arr = null;
		var recv_data = null;
		var before_last_data = null;
		
		socket.on('data', function(data) {
			try{
				cmd_arr = null;
				recv_data = data.toString();
				
				if (before_last_data != null) {
					recv_data = before_last_data + delimiter1 + recv_data;
					before_last_data = null;
					log.i(recv_data);
				}
				
				if (recv_data != null) { 
					cmd_arr = recv_data.split(delimiter1);
				}
				
				recv_data = null;
				recv_JSON = null;
			} catch (err) {
				log.e(err);
				recv_JSON = null;
				cmd_arr = null;
				recv_data = null;
			}
			
			if (cmd_arr != null) {
				cmd_arr.forEach(function(msg){
					try {
						if(msg.length > 0){
							var obj = JSON.parse(msg);

							if(typeof obj === "object"){
								if(obj.cmd != 'ack' && obj.cmd != 'ack_result' && obj.cmd != 'data' ) {
									log.i('Receive:' + obj.cmd + ', ' + msg);
								}
								roomManager[obj.cmd](socket, recv_JSON);
							}
						}
					} catch (e) {
						before_last_data = msg;
						log.e('ERR : ' + msg + '-' + e);
					}
				});
				// for (var i = 0, length = cmd_arr.length; i < length; i++) {
				// 	try {
				// 		if (cmd_arr[i].length > 0) {
				// 			recv_JSON = JSON.parse(cmd_arr[i]);

				// 			if(typeof recv_JSON.cmd != 'undefined' && recv_JSON.cmd != null) {

				// 				if(recv_JSON.cmd != 'ack' && recv_JSON.cmd != 'ack_result' && recv_JSON.cmd != 'data' ) {
				// 					log.i('Receive:' + recv_JSON.cmd + ', ' + cmd_arr[i]);
				// 				}
				// 				roomManager[recv_JSON.cmd](socket, recv_JSON);	
				// 			} 

				// 		}
				// 	} catch(e) {
				// 		before_last_data = cmd_arr[i];
				// 		log.e('ERR:' + cmd_arr[i] + '-' + e);
				// 	}
				// }
			}
		});
		
		socket.on('close',function(){
			roomManager.disconnect(socket);
			log.i('code : ' + socket.uniqueKey + ' socket was closed');

		});
	
		socket.on('error',function(err){
			log.e('SERVER Error:'+ err.message);
		});
	
		socket.on('drain', function(){
			log.e('drain');
		});
	});
	server.listen(port);
	console.log('GameParty Integrated Room Server-listen:' + port);
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};