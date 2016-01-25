/* global delimiter1 */
'use strict';

var log             = require('./gameparty.common.logger');
var gameparty_error = require('./gameparty.common.error');
var gameparty_log	= require('./gameparty.common.log');
var roomInfo 		= require('./gameparty.room');
var client_uid_by_socketId 	= roomInfo.client_uid_by_socketId;
var client_type_by_socketId = roomInfo.client_type_by_socketId;
var current_room 			= roomInfo.current_room;
var room_list 				= roomInfo.room_list;
var isFirstConnection = false;
var isFirstAck = false;

///////////////////////////////////////////////////////////////////////////////
// COMMON Function
/////////////////////////////////////////////
exports.ack = function(socket, recv_JSON) {
	var result_json = { 
		cmd       : 'ack_result',
		time       : recv_JSON.time
	}
	send(socket, JSON.stringify(result_json));
}

exports.last_ack = function() {
	if(isFirstConnection === false || isFirstAck === false) 
		return;

	var testObject = {};

	for( room_number in room_list) {
		var room = room_list[room_number];

		if((room.host.last_ack + 3) < (Math.floor(new Date().getTime() / 1000))) {
			log.i('rest_ack close socket : '.yellow + room.host.l_code);
			close(room.host.socket);
		}
		if(room.clients != null){
			for(var j = 0; j < room.clients.length; j++) {
				var last_ack = room.clients[j].last_ack + 3;
				if (last_ack <= 3) {
					last_ack = Math.floor(new Date().getTime() / 1000);
				} 

				if(last_ack < (Math.floor(new Date().getTime() / 1000))) {
					log.i('rest_ack client close socket : '.yellow + room.clients[j].u_code);
					close(room.clients[j].socket);
				}
			}
		} else {
			// log.i('room.clients is null : '.yellow + room_number);
		}
	}
}

var send = function(socket, data) {
	socket.write(data + delimiter1);
	if(data.cmd != 'ack' && data.cmd != 'ack_result' && data.cmd != 'data' && data.cmd != 'send_host' ) {
		log.i("ST integrate :" + data + delimiter1);
	}
}

var sendToAll = function(list, data) {
	// store or game status check logic 
	for (var i = 0, length = list.length; i < length; i++) {
		send(list[i].socket, data);
	}	

	if (list.length > 0) {
		log.i("SA:" + data);
	}
}

var getUniqueNumBySocket = function(socket, uid){
	var unique_key = uid;	
	return unique_key;
}

var close = function(socket){
	
	var result_json;
	var result_data;
	
	var unique_sock_num = socket.uniqueKey;
	
	if (unique_sock_num != null) {
		
		var clientType 	= client_type_by_socketId[unique_sock_num];
		var roomId 		= current_room[unique_sock_num];
		var u_code 		= client_uid_by_socketId[unique_sock_num];
		var room 		= room_list[roomId];

		if (room != null) {
			log.i('CLOSE typeof room.status : ' + typeof room.status);
			log.i('CLOSE clientType : ' + clientType);

			// launcher socket close
			if(roomInfo.ROOM_STATUS_IN_STORE == room.status) {

				var result_user_json = {
						cmd    : 'leave_user_result',
						gp_ack    : 0,
				}
				
				var result_launcher_json = {
						cmd    : 'leave_launcher_result',
						gp_ack    : 0,
				}

				if (socket == null) {
					log.e('error : null socket');
					gameparty_log.write_log('error', 'launcher.close_client : launcher.close_client : null socket');
					return;
				}

				var unique_sock_num = socket.uniqueKey;
				if (unique_sock_num == null) {
					log.e('error: socket_key is null');
					gameparty_log.write_log('error', 'launcher.close_client : socket_key is null');
					return;
				}

				var roomId;
				if(clientType != 'launcher' && typeof recv_JSON != 'undefined') {
					roomId 		= recv_JSON.l_code;
				} else {
					roomId 		= current_room[unique_sock_num];
				}

				var clientType 	= client_type_by_socketId[unique_sock_num];
				var uid 		= client_uid_by_socketId[unique_sock_num];
				var room 		= room_list[roomId];

						
				if (room == null) {
					if(typeof recv_JSON == 'undefined') {
						// disconnect_client called this function
						log.i('client disconnected '.yellow);
						gameparty_log.write_log('info', 'launcher.close_client : client disconnected');
					} else {
						log.e('	room id is null');
						gameparty_log.write_log('error', 'launcher.close_client : room id is null');
					}

					return;
				}
				log.i('clientType : ' + clientType);
				gameparty_log.write_log('info', 'launcher.close_client : clientType : ' + clientType);

				if (clientType == 'user' || clientType == 'main_user') {
					if (room.clients != null) { 
						for (var i = 0; i < room.clients.length; i++) {
							if (uid == room.clients[i].code) {
								room.clients.splice (i, 1);
								log.i('- delete user:' + uid);
								gameparty_log.write_log('info', 'launcher.close_client : - delete user : ' + uid);
							}
						}

						if(clientType == 'main_user') 
							// 방장 넘기기
							changeMainUser(room);

						if (room.store == null && room.clients.length == 0) {
							delete room_list[roomId];//delete Room
							log.i('- delete room:' + roomId);
							gameparty_log.write_log('info', 'launcher.close_client : delete room : ' + roomId);
						}
					}
				} else if (clientType == 'launcher') {
					room.store = null;

					if (room_list[roomId] != null) {
						delete room_list[roomId];//delete Room
						log.i('- delete room:' + roomId);
						gameparty_log.write_log('info', 'launcher.close_client : delete room : ' + roomId);
					}
				}

				if (client_type_by_socketId[unique_sock_num] != null)
					delete client_type_by_socketId[unique_sock_num];

				if (current_room[unique_sock_num] != null)
					delete current_room[unique_sock_num];

				if (client_uid_by_socketId[unique_sock_num] != null)
					delete client_uid_by_socketId[unique_sock_num];

				if (clientType == 'user' || clientType == 'main_user') {
					send(socket, JSON.stringify(result_user_json));

				} else if (clientType == 'launcher') {
					send(socket, JSON.stringify(result_launcher_json));
				}

			// game socket close
			} else {
				if (clientType == 'user' || clientType == 'main_user'){
					var deleteUserUid = null;

					for (var i = 0; i < room.clients.length; i++) {
						if (u_code == room.clients[i].code) {
							deleteUserUid = room.clients[i].code;
							room.clients.splice (i, 1);
							log.i('delete user:' + u_code);
						}
					} 
					
					if (deleteUserUid != null) {
						var result_del_str;
						
						result_del_json = {
								cmd 	: 'user_del',
								u_code	: deleteUserUid,
								user_list : []
						}

						for (var i = 0; i < room.clients.length; i++) {
							result_del_json.user_list.push(room.clients[i].code + '.Player ' + (i+1));
						}

						result_del_str = JSON.stringify(result_del_json) ;
						sendToAll(room.clients, result_del_str);

						if (room.host != null) {
							result_json = {
									cmd 	: 'user_del',
									u_code	: deleteUserUid
							}
							send(room.host.socket, result_del_str);
						}
					}


						// 방장 넘기기
					if(clientType == 'main_user') {
						changeMainUser(room);
					}


					// MAX USER이면 해제
					if (room.status == roomInfo.ROOM_STATUS_MAX_USER)
						room.status =  roomInfo.ROOM_STATUS_IN_GAME;
					
					if (client_type_by_socketId[unique_sock_num] != null)	
						delete client_type_by_socketId[unique_sock_num];
					if (current_room[unique_sock_num] != null)
						delete current_room[unique_sock_num];
					if (client_uid_by_socketId[unique_sock_num] != null)
						delete client_uid_by_socketId[unique_sock_num];
				} else if (clientType == 'host') {
					var clients = room.clients;
					result_json = {
						cmd : 'host_close'
					}
					result_data = JSON.stringify(result_json) ;
					
					for (var i = 0, length = room.clients.length; i < length; i++) {
						if(room.clients[i].status == roomInfo.CLIENT_STATUS_IN_GAME) {
							send(room.clients[i].socket, result_data);
							room.clients[i].status = roomInfo.CLIENT_STATUS_IN_STORE;
						}
					}

					room.host = null;
					room.status = roomInfo.ROOM_STATUS_IN_STORE;
					
					log.i('-delete OK host:' + u_code);

					if (room.store != null) {
						gameparty_log.write_log('debug', 'CLOSE room.store is not null : ');
						if (client_type_by_socketId[unique_sock_num] != null)	
							client_type_by_socketId[unique_sock_num] = 'launcher';
							client_uid_by_socketId[unique_sock_num] = current_room[unique_sock_num];
					} else {
						gameparty_log.write_log('debug', 'CLOSE room.store is null ');
						if (client_type_by_socketId[unique_sock_num] != null)	
							delete client_type_by_socketId[unique_sock_num];
						if (current_room[unique_sock_num] != null)
							delete current_room[unique_sock_num];
						if (client_uid_by_socketId[unique_sock_num] != null)
							delete client_uid_by_socketId[unique_sock_num];
					}
				}
			}

			var send_json = {
				cmd  : 'get_user_list_result',
				ack  : 0,
				l_code : roomId,
				list : []
			}

			var user_status = null;
			if (room.status == roomInfo.ROOM_STATUS_IN_STORE) {
				user_status = roomInfo.CLIENT_STATUS_IN_STORE;
			} else {
				user_status = roomInfo.CLIENT_STATUS_IN_GAME;
			}

			for(var i = 0, length = room.clients.length; i < length; i++) {
				if(room.clients[i].status == user_status) {
					send_json.list.push(room.clients[i].code + '.Player ' + (i+1));
				}
			}
			let send_data = JSON.stringify(send_json) ;

			if ('undefined' != typeof room.host && null != room.host)
				send(room.host.socket, send_data);
			if ('undefined' != typeof room.store && null != room.store)
				send(room.store.socket, send_data);
		}	
	} else {
		log.e('ERROR - SocketKey is null');
	}
}

function changeMainUser(room) {
	if (room.clients.length > 0) {
		var temp_client = room.clients[0];
		if (temp_client != null) {
			room.clients[0].type = 'main_user';

			var uniqueKey = room.clients[0].socket.uniqueKey;
			client_type_by_socketId[uniqueKey] = 'main_user';

			var evt_json = { cmd:'first_user', gp_ack:0 }

			send(temp_client.socket, JSON.stringify(evt_json));

		} else {
			log.e('- cannot change main_user');
			gameparty_log.write_log('error', 'game.close client : cannot change main_user');
		}

		//접속된 다른 모든 플레이어에게 방장 여부 발송
		var anotherPlayer_json = { cmd:'anusr', gp_ack:0 } //0: false (방장 아님)
		var change_user_str = JSON.stringify(anotherPlayer_json);
		for(var i=0; i<room.clients.length; i++){
			//방장이 아닐 경우에만 데이타를 전송한다.
			if(room.clients[i].type != 'main_user'){
				send(room.clients[i].socket, change_user_str);
			}
		}
	}
}

var sendCmdError = function(socket, recv_JSON){
	
	var re_cmd = null;
	var result_json = {};

	switch(recv_JSON.cmd) {
	case 'join_user':
		re_cmd = 'join_user_result';
		break;
	case 'join_launcher':
		re_cmd = 'join_launcher_result';
		break;
	case 'launcher_power':
		re_cmd = 'launcher_power_result';
		break;
	case 'pad_button_touch':
		re_cmd = 'pad_button_touch_result';
		break;
	}

	if (recv_JSON.cmd == 'join_user') {
		result_json.cmd = 'join_user_result';

		if(recv_JSON.gp_ack > 0) {
			result_json.gp_ack = recv_JSON.gp_ack;
		}

	} else if (re_cmd != null) {
		result_json = {
			cmd : recv_JSON.cmd,
			gp_ack : 19999 
		}			
	}

	log.e('result ' + recv_JSON.cmd + ' ');
	log.i('======= result Json =======\n' + JSON.stringify(result_json) + '\n========================\n');
	gameparty_log.write_log('error', 'launcher.sendCmdError : result ' + recv_JSON.cmd);

	socket.write(JSON.stringify(result_json) + delimiter1);
}


///////////////////////////////////////////////////////////////////////////////
// 5000 GAME 
///////////////////////////////////////////////////////////////////////////////
exports.join = function(socket, recv_JSON){
	
	var result_json;
	var result_data;
	var room = null;
	var client_type = recv_JSON.type; 
	
	// HOST Join
	if (client_type == 'host'){
		
		var room_id   = recv_JSON.l_code;		
		var host_uid   = recv_JSON.u_code;
		var max_client = recv_JSON.max_user;
		var package_name = recv_JSON.package_name;
		
		if (max_client == 0){
			max_client = 100000;
		}
		
		if (room_list[room_id] == null) {
			room = new roomInfo.Room(room_id, max_client);
			room_list[room_id] = room;
		} else {
			room = room_list[room_id];
		}

		room.status = roomInfo.ROOM_STATUS_IN_GAME;
		log.i('store room status : ' + room.status);

		if (room.host != null) {
			result_json = {
				cmd   : 'join_result',
				ack   : 29999,
				error : 'dup host_uid'
			}
			result_data = JSON.stringify(result_json) ;
			send(room.host.socket, result_data);
			room.host.socket.destroy();
		}

		var client = new roomInfo.Client(room, socket, client_type, host_uid, 'null', 0, roomInfo.CLIENT_STATUS_IN_GAME);
		client.status = roomInfo.CLIENT_STATUS_IN_GAME;
		room.host = client;	
		room.package_game = package_name;

		// host일 경우 host_uid를 -1로 받기 때문에 room_id로 대체 -> 
		var unique_sock_num = getUniqueNumBySocket(socket, room_id);
		socket.uniqueKey 	=  unique_sock_num;
		client_type_by_socketId[unique_sock_num] = client_type;
		current_room[unique_sock_num] 			 = room_id;
		client_uid_by_socketId[unique_sock_num]  = host_uid;
		
		if (room.host != null){
			result_json = {
				cmd       : 'join_result',
				ack       : 0,
				user_list : []
			}
			
			for(var i = 0, length = room.clients.length; i < length; i++) {
				if(room.clients[i].status == roomInfo.CLIENT_STATUS_IN_GAME) {
					result_json.user_list.push(room.clients[i].code + '.Player ' + (i+1));
				}
			}
			
			// HOST Join Result
			result_data = JSON.stringify(result_json) ;
			send(room.host.socket, result_data);
			
			// HOST Joined Message.
			result_json = {
				cmd : 'host_joined',
				ack : 0,
				l_code : room_id // host_uid에서 room_id로 변경
			}

			result_data = JSON.stringify(result_json) ;
			for(var i = 0, length = room.clients.length; i < length; i++) {
				if(room.clients[i].status == roomInfo.CLIENT_STATUS_IN_GAME) {
					sendToAll(room.clients[i], result_data);
				}
			}
		}			
	
	// USER Join
	} else if (client_type == 'user' || client_type == 'main_user') {

		var room_id 	= recv_JSON.l_code;
		var u_code		= recv_JSON.u_code;
		var user_name	= recv_JSON.name;
		var userInGame 	= 0;

		log.i('join : ' + u_code);

		room = room_list[room_id];

		log.i('room status : ' + room.status);
		log.i('typeof room : ' + typeof room);
		log.i('clients length : ' + room.clients.length);

		// User count in game
		for (var i = 0, length = room.clients.length; i < length; i++) {
			if( room.clients[i].status ==  roomInfo.CLIENT_STATUS_IN_GAME ) {
				log.i('JOIN user status in Game : ' + room.clients[i].code);
				userInGame++;
			}
		}

		log.i('JOIN userInGame : ' + userInGame);
		log.i('JOIN maxClient : ' + room.maxClient);

		if (userInGame >= room.maxClient) {
			room.status = roomInfo.ROOM_STATUS_MAX_USER;
		}

		// Game Max User Check
		if(room.status == roomInfo.ROOM_STATUS_MAX_USER) {
			result_json = {
				cmd   : 'join_result',
				ack   : 20001,
				error : 'error max user'
			}
			
			result_data = JSON.stringify(result_json) ;
			send(socket, result_data);
			return;
		} else {

			var unique_sock_num = getUniqueNumBySocket(socket, u_code);

			// Add Client Object
			var isExistClient = false;

			if (room.clients != null) {
				if(room.clients.length > 0) {
					for (var i = 0, length = room.clients.length; i < length; i++) {
						if (u_code == room.clients[i].code) {
							isExistClient = true;
							if(room.clients[0] == u_code) {
								client_type = 'main_user';
							}
						}
					}	
				}
			}


			log.i('join isExistClient : ' + isExistClient);
			log.i('join u_code : ' + u_code);

			if (isExistClient != true) {
				var client = new roomInfo.Client(room, socket, client_type, u_code, user_name, 0, roomInfo.CLIENT_STATUS_IN_GAME);
				client.status = roomInfo.CLIENT_STATUS_IN_GAME;
				room.clients.push(client);

				client_type_by_socketId[unique_sock_num] = client_type;
				current_room[unique_sock_num] = room_id;
				client_uid_by_socketId[unique_sock_num] = u_code;
			}

			socket.uniqueKey =  unique_sock_num + '';
			log.i('join unique_sock_num : ' + unique_sock_num);
			log.i('join socket.uniqueKey : ' + socket.uniqueKey);
			log.i('join client_uid_by_socketId[unique_sock_num] : ' + client_uid_by_socketId[unique_sock_num]);
			gameparty_log.write_log('JOIN client_type_by_socketId[unique_sock_num] : ' + client_type_by_socketId[unique_sock_num]);
			gameparty_log.write_log('JOIN current_room[unique_sock_num] : ' + current_room[unique_sock_num]);
			gameparty_log.write_log('JOIN client_uid_by_socketId[unique_sock_num] : ' + client_uid_by_socketId[unique_sock_num]);

		}
		// Game Started Check
		if (room.status == roomInfo.ROOM_STATUS_GAME_STARTED || room.status == roomInfo.ROOM_STATUS_COUNT_STARTED) {
			
			result_json = {
				cmd   : 'join_result',
				ack   : 20002,
				error : 'error game start'
			}
			
			result_data = JSON.stringify(result_json) ;
			send(socket, result_data);
			return;
		}

		var is_host_joined = true;

		if (room.host != null) {
			is_host_joined = true;
		}
		else{
			is_host_joined = false;
		}
		
		if (room.clients != null) {

			var result_add_str;
			var result_add_json = {
				cmd 	: 'user_add',
				u_code 	: u_code,
				name 	: 'Player ' + userInGame,
				user_list : []
			}

			// 나의 상태를 게임중으로 변경 
			for (var i = 0, length = room.clients.length; i < length; i++) {
				if (room.clients[i].code == u_code) {
					room.clients[i].status = roomInfo.CLIENT_STATUS_IN_GAME;
				}
			}

			for (var i = 0, length = room.clients.length; i < length; i++) {
				if(room.clients[i].status == roomInfo.CLIENT_STATUS_IN_GAME) {
					result_add_json.user_list.push(room.clients[i].code + '.Player ' + (i+1));
				}
			}

			result_add_str = JSON.stringify(result_add_json) ;

			for (var i = 0, length = room.clients.length; i < length; i++) {
				if (room.clients[i].code == u_code) {
					var uid_name = u_code + '.Player ' + (i+1);

					result_json = {
						cmd     : 'join_result',
						ack     : 0,
						user    : uid_name,
						is_host : is_host_joined,
						package_name : room.package
					}
					
					result_data = JSON.stringify(result_json) ;
					send(room.clients[i].socket, result_data);
					
					result_json = {
						cmd    : 'update_user_index_result',
						ack    : 0,
						u_code : u_code,
						index  : i,
						l_code   : room_id
					}
					
					result_data = JSON.stringify(result_json) ;
					send(socket, result_data);
				} else {
					if(room.clients[i].status == roomInfo.CLIENT_STATUS_IN_GAME) {
						send(room.clients[i].socket, result_add_str);
					}
				}
			}

			if (room.host != null) {
				send(room.host.socket, result_add_str);
			}
		}		


	} else {
		result_json = {
			cmd : 'join_result',
			ack : 29999,
			error : 'incorrect_type'
		}
		
		result_data = JSON.stringify(result_json) ;
		send(room.host.socket, result_data);
	}
	isFirstConnection = true;
}

exports.get_user_list = function(socket, recv_JSON) {
	
	var unique_sock_num = socket.uniqueKey;
	var room_id 		= current_room[unique_sock_num];
	var cur_ucode 		= client_uid_by_socketId[unique_sock_num];
	var type    		= client_type_by_socketId[unique_sock_num];
	var room 			= room_list[room_id];
	var user_status		= recv_JSON.user_status;
	let send_data 		= null;

	if(typeof user_status == 'undefined' || user_status == null )
		user_status = roomInfo.CLIENT_STATUS_IN_GAME;	
	if (room != null){
		if (room.clients != null) {
			var send_json = {
				cmd  : 'get_user_list_result',
				ack  : 0,
				l_code : room_id,
				list : []
			}
			
			for(var i = 0, length = room.clients.length; i < length; i++) 
            {
				log.i('client[' + i + '] status : ' + room.clients[i].status);
			}

			for(var i = 0, length = room.clients.length; i < length; i++) 
            {
				if(room.clients[i].status == user_status) {
					send_json.list.push(room.clients[i].code + '.Player ' + (i+1));
				}
			}
			// get_user_list은 host가 요청을 하기 때문에 별도로 처리 구문 없슴.
			send_data = JSON.stringify(send_json) ;
			send(socket, send_data);

			// 클라이언트들에게도 전송.
			for(var i = 0, length = room.clients.length; i < length; i++) {
				if(room.clients[i].status == roomInfo.CLIENT_STATUS_IN_GAME) {
					send(room.clients[i].socket, send_data);
				}
			}

		} else {
			send(socket, '{"cmd":"send_error", "type":"host", "u_code":"' +  cur_ucode + '", "error":"get_user_list"}');
		}
	} else {
		send(socket, '{"cmd":"send_error", "type":"host", "u_code":"' +  cur_ucode + '", "error":"get_user_list"}');
	}
}

// 사용자 인덱스가 바뀔때 호출 
exports.update_user_index = function(socket, recv_JSON) {
	
	var result_json;
	var result_data;
	var unique_sock_num = socket.uniqueKey;
	var room_id = current_room[unique_sock_num];
	var cur_uid = client_uid_by_socketId[unique_sock_num];
	var type    = client_type_by_socketId[unique_sock_num];
	let send_data = null;

	if (type == 'host') {
		var room = room_list[room_id];
		
		if (room != null) {
			if (room.clients != null) {
				var user_index = 0;
				for(var i = 0, length = room.clients.length; i < length; i++) 
                {
					if (room.clients[i].code == recv_JSON.u_code) {

						if(room.clients[i].status == roomInfo.CLIENT_STATUS_IN_GAME) {
							user_index = i;
							result_json = {
								cmd   : 'update_user_index_result',
								ack   : 0,
								u_code  : recv_JSON.u_code,
								l_code  : recv_JSON.l_code,
								index : user_index
							}
							
							result_data = JSON.stringify(result_json) ;
							send(room.clients[user_index].socket, result_data);
							break;
						} else {
							send(socket, '{"cmd":"send_error", "type":"host", "u_code":"' +  cur_uid + '", "error":"update_user_index"}');
						}
					}
				}
			}
		} else {
			send(socket, '{"cmd":"send_error", "type":"host", "u_code":"' +  cur_uid + '", "error":"update_user_index"}');
		}
	} else {
		log.e('invalid host, u_code : ' +  cur_uid );		
		send(socket, '{"cmd":"send_error", "type":"host", "u_code":"' +  cur_uid + '", "error":"update_user_index"}');
	}
}

function simple_send_all(socket, recv_JSON, command) {
    var unique_sock_num = socket.uniqueKey;
    var room_id 		= current_room[unique_sock_num];
    var cur_uid 		= client_uid_by_socketId[unique_sock_num];
    var type    		= client_type_by_socketId[unique_sock_num];
	let send_data 		= null;

    var room = room_list[room_id];

    if (room != null) {
        if (room.clients != null) {

            send_data = '{"cmd":"' + command + '", "ack":0,"l_code":"' + recv_JSON.l_code + '"}';

            for(var i = 0, length = room.clients.length; i < length; i++) {
                if(room.clients[i].status == roomInfo.CLIENT_STATUS_IN_GAME) {
                    send(room.clients[i].socket, send_data);
                }
            }

            if (command == 'end_game_result') {
                room.status = roomInfo.ROOM_STATUS_IN_GAME;

            } else if (command == 'start_game_result' || command == 'restart_game_result') {
                room.status = roomInfo.ROOM_STATUS_GAME_STARTED;
            }

            try {
                if (typeof room.host.socket != null) {
                    send(room.host.socket, send_data);
                } else {
                    log.i(command + ' simple send all room.host.socket is null');
                }
            } catch(e) {
                log.e('simple_send_all room or host cloed');
            }
        }
    } else {
        send(socket, '{"cmd":"send_error", "type":"host", "u_code":"' +  cur_uid + '", "error":"room is null"}');
    } 
}

exports.end_game = function(socket, recv_JSON){
    simple_send_all(socket, recv_JSON, 'end_game_result');
}

exports.restart_game = function(socket, recv_JSON) {
	simple_send_all(socket, recv_JSON, "restart_game_result");
}

exports.start_game = function(socket, recv_JSON) {
	simple_send_all(socket, recv_JSON, "start_game_result");
}

exports.result_game = function(socket, recv_JSON) {
	simple_send_all(socket, recv_JSON, "result_game_result");	
}

exports.broadcast = function(socket, recv_JSON) {

	var data = recv_JSON.data;
	var unique_sock_num = socket.uniqueKey;
	var room_id = current_room[unique_sock_num];
	var cur_uid = client_uid_by_socketId[unique_sock_num];
	var type    = client_type_by_socketId[unique_sock_num];
	let send_data = null;
	
	if (type == 'host') {
		var room = room_list[room_id];
		if (room != null) {
			if (room.clients != null) {
				send_data = '{"cmd":"data", "sender":"' + cur_uid + '","data":' + JSON.stringify(data) + '}';
				sendToAll(room.clients, send_data);
			}
		} else {
			send(socket, '{"cmd":"send_error", "type":"user", "u_code":"' +  cur_uid + '", "error":"broadcast"}');
		}
	} else if (type == 'user' || type == 'main_user') {
		var room = room_list[room_id];
		if (room != null) {
			if (room.clients != null) {
				for (var i = 0, length = room.clients.length; i < length; i++) 
                {
					if (room.clients[i].code != cur_uid && room.clients[i].status == roomInfo.CLIENT_STATUS_IN_GAME) {
						send_data = '{"cmd":"data", "sender":"' + cur_uid + '","data":' + JSON.stringify(data) + '}';
						send(room.clients[i].socket, send_data);
					}
				}
			}
			
			if (room.host != null && room.status != roomInfo.ROOM_STATUS_IN_STORE) {
				send_data = '{"cmd":"data", "sender":"' + cur_uid + '","data":' + JSON.stringify(data) + '}';
				send(room.host.socket, send_data);
			}
		} else {
			send(socket, '{"cmd":"send_error", "type":"user", "u_code":"' +  cur_uid + '", "error":"broadcast"}');
		}
	}
}

exports.change_lobby_state = function(socket, recv_JSON) {
	relay_host('change_lobby_state_result', socket, recv_JSON);	
}

exports.report_network_state = function(socket, recv_JSON) {
	relay_host('report_network_state_result', socket, recv_JSON);
}

exports.check_network_state = function(socket, recv_JSON) {
	reply_knock('check_network_state_result', socket, recv_JSON);
}

exports.update_ready_count = function(socket, recv_JSON) {
    var unique_sock_num = socket.uniqueKey;
	var room_id = current_room[unique_sock_num];
	var cur_ucode = client_uid_by_socketId[unique_sock_num];
	var type    = client_type_by_socketId[unique_sock_num];
	let send_data = null;

	if (type == 'host'){
		var room = room_list[room_id];

		if (room != null) {
			if (room.clients != null) {
                send_data = '{"cmd":"update_ready_count_result", "ack":"cmd_ok","l_code":"' + room_id + '","ready":"' + recv_JSON.ready + '","total":"' + recv_JSON.total + '"}';
                sendToAll(room.clients, send_data);
                send(room.host.socket, send_data);
	        } 

		} else {
            send(socket, '{"cmd":"send_error", "type":"host", "u_code":"' +  cur_ucode + '", "error":"start_game_from_host"}');
        }
    } else {
        send(socket, '{"cmd":"send_error", "type":"host", "u_code":"' +  cur_ucode + '", "error":"start_game_from_host"}');
    }
}

exports.exit = function(socket, recv_JSON){
	
	var data = recv_JSON.data;
	var unique_sock_num = socket.uniqueKey;
	
	var room_id = current_room[unique_sock_num];
	var type    = client_type_by_socketId[unique_sock_num];
	
	var cur_uid 	= client_uid_by_socketId[unique_sock_num];
	let send_data 	= null;
	
	var room = room_list[room_id];

	if (type == 'user' || type == 'main_user') {
		if (room != null && room.host != null) {
			send_data = '{"cmd":"exit_result", "ack":0}';
			send(room.host.socket, send_data);
			
			if (room.clients != null) {
				sendToAll(room.clients, send_data);
			}
		} else {
			send(socket, '{"cmd":"exit_error", "type":"user", "u_code":"' +  cur_uid + '", "error":"no host"}');
		}
	} else if (type == 'host') {

		room.status = roomInfo.ROOM_STATUS_IN_STORE;
		log.i('end_gaem_result room.status : ' + room.status);

		var send_json = {
			cmd  : 'get_user_list_result',
			ack  : 0,
			l_code : room_id,
			list : []
		}

		for(var i = 0, length = room.clients.length; i < length; i++) {
			room.clients[i].status = roomInfo.CLIENT_STATUS_IN_STORE;
			log.i('end_game_result room.clients[' + i + '] : ' + room.clients[i].status );
			send_json.list.push(room.clients[i].code + '.Player ' + (i+1));
		}
		
		for(var i = 0, length = room.clients.length; i < length; i++) {
			// get_user_list은 host가 요청을 하기 때문에 별도로 처리 구문 없슴.
			send_data = JSON.stringify(send_json) ;

			send(room.clients[i].socket, send_data);

		}
        //방장이 나갈 경우 권한 변경
		changeMainUser(room);
	} else {
		send(socket, '{"cmd":"exit_error", "type":"user", "u_code":"' +  cur_uid + '", "error":"incorrect type"}');
	}
}

exports.send_host = function(socket, recv_JSON){
	
	var data = recv_JSON.data;
	var unique_sock_num = socket.uniqueKey;
	
	var room_id = current_room[unique_sock_num];
	var type    = client_type_by_socketId[unique_sock_num];
	
	//not to be used
	var cur_ucode = client_uid_by_socketId[unique_sock_num];
	let send_data = null;
	
	if (type == 'user' || type == 'main_user') {
		var room = room_list[room_id];
		if (room != null && room.host != null && room.status != roomInfo.ROOM_STATUS_IN_STORE) {
			send_data = '{"cmd":"data", "sender":"' + cur_ucode + '","data":' + JSON.stringify(data) + '}';
			send(room.host.socket, send_data);
		} else {
			send(socket, '{"cmd":"send_error", "type":"user", "u_code":"' +  cur_ucode + '", "error":"send_host1"}');
		}
	} else {
		send(socket, '{"cmd":"send_error", "type":"user", "u_code":"' +  cur_ucode + '", "error":"send_host2"}');
	}
}

exports.send_target = function(socket, recv_JSON) {
	
	var data 		= recv_JSON.data;
	var target_arr 	= recv_JSON.target;
	var unique_sock_num = socket.uniqueKey;
	var room_id    	= current_room[unique_sock_num];
	var cur_ucode 	= client_uid_by_socketId[unique_sock_num];
	var room 		= room_list[room_id];
	var isSendTarget = false;
	let send_data 	= null;
	
	if (room != null) {
		if (room.clients != null) {
			for (var i = 0, length = target_arr.length; i < length; i++) {
				for (var j = 0, length2 = room.clients.length; j < length2; j++) {
					if (target_arr[i] == room.clients[j].code) {
						send_data = '{"cmd":"data", "sender":"' + cur_ucode + '","data":' + JSON.stringify(data) + '}';
						send(room.clients[j].socket, send_data);
						isSendTarget = true;
					}
				}
				
				if (target_arr[i] == room_id) {
					send_data = '{"cmd":"data", "sender":"' + cur_ucode + '","data":' + JSON.stringify(data) + '}';
					send(room.host.socket, send_data);
					isSendTarget = true;
				}
			}
		} else {
			send(socket, '{"cmd":"send_error", "type":"user", "u_code":"' +  cur_ucode + '", "error":"send_target"}');
		}
	} else {
		send(socket, '{"cmd":"send_error", "type":"user", "u_code":"' +  cur_ucode + '", "error":"send_target"}');
	}
}

exports.disconnect = function(socket) {
	close(socket);
}


var reply_knock = function(cmd_type, socket, recv_JSON) {
	
	var unique_sock_num = socket.uniqueKey;
	var room_id = current_room[unique_sock_num];
	let send_data ="";
	var cur_ucode = client_uid_by_socketId[unique_sock_num];
	var room = room_list[room_id];

	if (room != null && room.host != null) {
		if (cmd_type == 'check_network_state_result') {
			send_data = '{"cmd":"' + cmd_type + '", "ack":0,"u_code":"' + recv_JSON.u_code + '", "l_code":"' + recv_JSON.l_code + '","count":"' + recv_JSON.count + '","time":"' + recv_JSON.time + '"}';
		}
			
		send(socket, send_data);
	} else {
		send(socket, '{"cmd":"send_error", "type":"user", "u_code":"' +  cur_ucode + '", "error":"' + cmd_type + '"}');
	}
}

var relay_host = function(cmd_type, socket, recv_JSON){
	
	var unique_sock_num = socket.uniqueKey;
	var room_id = current_room[unique_sock_num];
	let send_data ="";
	var cur_ucode = client_uid_by_socketId[unique_sock_num];

	var room = room_list[room_id];
	log.i('command : ' + recv_JSON.cmd);
	console.dir(recv_JSON)
	log.i('socket.uniqueKey : ' + socket.uniqueKey);
	log.i('room_id : ' + room_id);

	if (room != null && room.host != null) {
		if (cmd_type == 'change_lobby_state_result') {
			send_data = '{"cmd":"' + cmd_type + '", "ack":0,"u_code":"' + recv_JSON.u_code + '", "l_code":"' + recv_JSON.l_code + '","state":"' + recv_JSON.state + '"}';

		} else if (cmd_type == 'report_network_state_result') {
			send_data = '{"cmd":"' + cmd_type + '", "ack":0,"u_code":"' + recv_JSON.u_code + '", "l_code":"' + recv_JSON.l_code + '","count":"' + recv_JSON.count + '","time":"' + recv_JSON.time + '"}';

		}
			
		send(room.host.socket, send_data);
	} else {
		send(socket, '{"cmd":"send_error", "type":"u_code", "u_code":"' +  cur_ucode + '", "error":' + cmd_type + '"}');
	}
}

///////////////////////////////////////////////////////////////////////////////
// 4000 LAUNCHER 
///////////////////////////////////////////////////////////////////////////////
exports.first_user = function(socket, recv_JSON) {
	var unique_sock_num = socket.uniqueKey;
	if (unique_sock_num != null) {
		var roomId 		= current_room[unique_sock_num];
		var room 		= room_list[roomId];
		if (room != null) {
			if (room.clients.length > 0) {
				var temp_client = room.clients[0];
				if (temp_client != null) {
					var uniqueKey = room.clients[0].socket.uniqueKey;
					if(uniqueKey === unique_sock_num) {
						var evt_json = {
			                cmd    : 'first_user',
			                gp_ack    : 0 
                        }
						send(socket, JSON.stringify(evt_json));
					}
				}
			}
		}
	}
}

exports.join_user = function(socket, recv_JSON) {
	var u_code 	= recv_JSON.u_code;
	var u_name 	= recv_JSON.u_name;
	var l_code  = recv_JSON.l_code;
	var result_json = {};

	var temp_socket_key = getUniqueNumBySocket(socket, u_code);

	// Socket 정상유무 체크
	if (socket == null) {
		log.e('null socket');
		gameparty_log.write_log('error', 'launcher.join_user : null socket');
		return;
	}

	var room = null; 
	var client_type;

	if (room_list[l_code] == null) {
		recv_JSON.gp_ack = 10001;
		sendCmdError(socket, recv_JSON);
		return;
	} else{
		room = room_list[l_code];
	}

	log.i('store join user in [room] :' + l_code);
	log.i('typeof room : ' + typeof room);

	if (room == null) {
		log.e('room is null');
		gameparty_log.write_log('error', 'launcher.join_user : room is null');
		return;
	}		

	for(var i = 0, length = room.clients.length; i < length; i++) {
		if (room.clients[i].code == u_code) {

			room.clients[i].socket.destroy();

			log.e('same socket user in room');
			gameparty_log.write_log('error', 'launchyer.join_user : same socket user in room' + u_code);
			log.i(JSON.stringify(client_type_by_socketId));
			log.i('join_user call close_client');

			room.clients.splice (i, 1);
			recv_JSON.gp_ack = 10002;
			sendCmdError(socket, recv_JSON);

			socket.destroy();
			return;
		}
	}

	if (room.clients.length > 0) {
		client_type = 'user';
	} else{
		client_type = 'main_user';
	}

	var myStatus = null;

	// 스토어로 입장.
	myStatus = roomInfo.CLIENT_STATUS_IN_STORE;

	var client = new roomInfo.Client(room, socket, client_type, u_code, u_name, 0, myStatus);
	client.status = myStatus;
	room.clients.push(client);
	log.i(u_code + ' client instance pushed ' + room.roomName);

	var unique_sock_num = getUniqueNumBySocket(socket, u_code);
	socket.uniqueKey = unique_sock_num;
	log.i('join_user socket.uniqueKey : ' + socket.uniqueKey);

	var package_name = null;

	if (room.status == roomInfo.ROOM_STATUS_IN_STORE) {
		package_name = room.package_store;
	} else {
		package_name = room.package_game;
	}

	client_type_by_socketId[unique_sock_num] = client_type;
	current_room[unique_sock_num]            = l_code;
	client_uid_by_socketId[unique_sock_num]  = u_code;
	log.i('join_user client_uid_by_socketId[unique_sock_num] : ' + client_uid_by_socketId[unique_sock_num]);


	var userInGame = 0;
	// User count in game
	for (var i = 0, length = room.clients.length; i < length; i++) {
		if( room.clients[i].status ==  roomInfo.CLIENT_STATUS_IN_GAME ) {
			log.i('JOIN_USER user status in Game : ' + room.clients[i].code);
			userInGame++;
		}
	}

	if (userInGame >= room.maxClient) {
		room.status = roomInfo.ROOM_STATUS_MAX_USER;
	}



	var ret_ack = 0;
	// Max User Error
	if (room.status == roomInfo.ROOM_STATUS_MAX_USER ) {
		ret_ack = 10003;
	// Already Game start Error
	} else if (room.status == roomInfo.ROOM_STATUS_GAME_STARTED ) {
		ret_ack = 10004;
	}


	result_json = {
		cmd    	: 'join_user_result',
		gp_ack    	: ret_ack,
		u_code  	: u_code,
		l_code 		: l_code,
		is_first 	: (client_type == 'main_user'),
		package_name: package_name
	}

	log.i('join user : ' + u_code);
	gameparty_log.write_log('info', 'launcher.join_user : ' + u_code);
	send(socket, JSON.stringify(result_json));
	isFirstConnection = true;

}

exports.leave_user = function(socket, recv_JSON) {
	log.i('leave_user : ' + recv_JSON.u_code);
	log.i('leave_user call close_client');
	gameparty_log.write_log('info', 'launcher.leave_user : ' + recv_JSON.u_code);

	close(socket, recv_JSON);
}

exports.join_launcher = function(socket, recv_JSON) {
	
	var l_code 		= recv_JSON.l_code;
	var clientType 	= 'launcher';
	var room 		= null;
	var isSameSocket = false;
	var package_name = recv_JSON.package_name;

	var result_json = {
		cmd      : 'join_launcher_result',
		gp_ack      : 0,
		l_code 		: l_code
	}

	var temp_socket_key = getUniqueNumBySocket(socket, l_code);

	if (client_type_by_socketId[temp_socket_key] != null)
		isSameSocket = true;
	
	if (socket == null) { 
		log.e('SOCKET IS NULL-USER');
		gameparty_log.write_log('error', 'launcher.join_launcher : socket is null-user');
		return;
	}

	if (room_list[l_code] == null) {
		room = new roomInfo.Room(l_code);
		room_list[l_code] = room;
	} else {
		room = room_list[l_code];
	}

	if (isSameSocket == true) {
		log.e('same socket launcher');	
		var client = new roomInfo.Client(room, socket, clientType, l_code, 'launcher', 0);
		client.status = roomInfo.CLIENT_STATUS_IN_STORE;
		room.store = client;
		
		var unique_sock_num = getUniqueNumBySocket(socket, l_code);
		socket.uniqueKey 	= unique_sock_num;
		
		client_type_by_socketId[unique_sock_num] = clientType;
		current_room[unique_sock_num] 			 = l_code;
		client_uid_by_socketId[unique_sock_num]  = l_code;

		gameparty_log.write_log('info', 'launcher.join_launcher : rejoin launcher : ' + l_code);
		send(socket, JSON.stringify(result_json));

	}

	if (room.store != null) {
		room.store.socket.destroy();
		socket.destroy();
	} else {
		var client = new roomInfo.Client(room, socket, clientType, l_code, 'launcher', 0);
		client.status = roomInfo.CLIENT_STATUS_IN_STORE;
		room.store = client;	
		
		room.package_store = package_name;

		var unique_sock_num = getUniqueNumBySocket(socket, l_code);
		socket.uniqueKey 	= unique_sock_num;
		log.i('set store uniquekey : ' + socket.uniqueKey);

		client_type_by_socketId[unique_sock_num] = clientType;
		current_room[unique_sock_num] 			 = l_code;
		client_uid_by_socketId[unique_sock_num]  = l_code;

		log.i('join launcher : ' + l_code);
		gameparty_log.write_log('info', 'launcher.join_launcher : join launcher : ' + l_code);
		gameparty_log.write_log('debug', 'client_type_by_socketId[unique_sock_num] : ' + client_type_by_socketId[unique_sock_num] );
		gameparty_log.write_log('debug', 'current_room[unique_sock_num] : ' + current_room[unique_sock_num]  );
		gameparty_log.write_log('debug', 'client_uid_by_socketId[unique_sock_num] : ' + client_uid_by_socketId[unique_sock_num] );

		send(socket, JSON.stringify(result_json));
	}

	isFirstConnection = true;
}

exports.leave_launcher = function (socket, recv_JSON) {
	log.i('leave_launcher : ' + recv_JSON.l_code);
	gameparty_log.write_log('info', 'launcher.leave_launcher : ' + recv_JSON.l_code);
	close(socket, recv_JSON);
}

exports.disconnect_client = function(socket) {
	log.i('disconnect_client call close_client');
	close(socket);
}

exports.launcher_power = function(socket, recv_JSON){

	var l_code = recv_JSON.l_code;
	var u_code = recv_JSON.u_code;
	var unique_sock_num = socket.uniqueKey;
	var client_type  = client_type_by_socketId[unique_sock_num];
log.i("client_type :: " + client_type);
	if (client_type == 'main_user') {
		var room = room_list[l_code];
		if (room != null) {
			send(room.store.socket, JSON.stringify(recv_JSON));
		} else {
			sendCmdError(socket, recv_JSON);
		}
	} else {
		sendCmdError(socket, recv_JSON);
	}
}

exports.launcher_power_result = function(socket, recv_JSON){
	
	var l_code = recv_JSON.l_code;
	var u_code = recv_JSON.u_code;
	var room = room_list[l_code];

	if (room == null || room.clients == null) {
		log.e('error - room null: launcher_power_result');
		gameparty_log.write_log('error', 'launcher.launcher_power_result : room null: launcher_power_result');
		return;
	}		

	var clients = room.clients;
		
	for (var i = 0, length = clients.length; i < length; i++) {
		if (clients[i].code == u_code) {
			send(clients[i].socket, JSON.stringify(recv_JSON));
			break;
		}
	}
}

exports.pad_button_touch = function(socket, recv_JSON) {

	var l_code = recv_JSON.l_code;
	var u_code = recv_JSON.u_code;
	var temp_JSON = recv_JSON;
	var unique_sock_num = socket.uniqueKey;
	var client_type = client_type_by_socketId[unique_sock_num];

	if (client_type != 'main_user') {
		log.e('no main_user(pad_button_touch):' + client_type);
		gameparty_log.write_log('error', 'launcher.pad_button_touch : no main_user(pad_button_touch):' + client_type);
		sendCmdError(socket, recv_JSON);
		return;
	}		
	
	var room = room_list[l_code];

	//  런처 호스트 방이 안만들어졌을 경우 에러 전송할것.
	if (room == null) {
		sendCmdError(socket, recv_JSON);
		return;
	}	
	send(room.store.socket, JSON.stringify(temp_JSON));
}

exports.pad_button_touch_result = function(socket, recv_JSON) {
	
	var l_code = recv_JSON.l_code;
	var u_code = recv_JSON.u_code;
	var room   = room_list[l_code];
	var isBroadcast = false;
	
	if (recv_JSON.button_type == 'ok' || recv_JSON.button_type == 'click' || recv_JSON.button_type == 'back') {
		isBroadcast = true;
	}
	
	if (room == null || room.clients == null) {
		log.i('error-room null: pad_button_touch_result' + ' : ' + l_code + ' : ' + Date());
		gameparty_log.write_log('info', 'launcher.pad_button_touch_result : error-room null: pad_button_touch_result : '  + l_code);
		return;
	}

	var clients = room.clients;
		
	for (var i = 0, length = clients.length; i < length; i++) {
		if (isBroadcast == true) {
			send(clients[i].socket, JSON.stringify(recv_JSON));
		} else {
			if (clients[i].code == u_code) {
				send(clients[i].socket, JSON.stringify(recv_JSON));
				break;
			}
		}
	}
}

exports.get_launcher_room_list = function(socket, recv_JSON) {
	send(socket, JSON.stringify(room_list));
}

exports.get_current_room_info = function(socket, recv_JSON) {
	var room_l = recv_JSON.l_code;
	
	current_room[unique_sock_num]
}
