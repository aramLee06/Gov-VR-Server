'use strict';

var async = require('async');

exports.client_uid_by_socketId = {name : "client_uid_by_socketId"};
exports.client_type_by_socketId = {name : "client_type_by_sockeId"};
exports.current_room = {name : "current_room"};
exports.room_list = {name : "room_list"};

exports.ROOM_STATUS_IN_STORE 		= 0;
exports.ROOM_STATUS_IN_GAME 		= 1; 
exports.ROOM_STATUS_MAX_USER		= 2;
exports.ROOM_STATUS_COUNT_STARTED	= 3;
exports.ROOM_STATUS_GAME_STARTED	= 4;

exports.CLIENT_STATUS_IN_STORE	= 0;
exports.CLIENT_STATUS_IN_GAME	= 1;


exports.Client = function(room, socket, type, code, name, ack, stat) {
	this.room = room;
	this.socket = socket;
	this.type = type; //user or mainUser or launcher;
	this.code = code; //u_code or l_code
	this.name = name; //userName or launcherId
	this.last_ack = ack;
	this.status = null;

	if(typeof stat == 'undefined' || stat == null) {
		this.status = 0;
	} else {
		this.status = stat;
	}
}

exports.Room = function(roomName, max_client, stat) {
	this.clients = [];
	this.roomName = roomName;
	this.host = null;
	this.store = null;
	this.package_store = null;
	this.package_game = null;
	this.status = null;
	this.maxClient = max_client;
	this.isGameStart = false;

	if(typeof stat == 'undefined' || stat == null) {
		this.status = 0;
	} else {
		this.status = stat;
	}
}

////////////////////////////////////////////////////////////////////////////
// Room Number 관련 함수들
////////////////////////////////////////////////////////////////////////////
var RoomNumberLength = 5;   // Room 고유 번호 자릿수 정의
exports.makeRoomNumber = function(cb) {
    
    let roomNumber;
    async.waterfall([
        function(callback) {
            roomNumber = randomRoomNumber();
            callback(zeroFill(roomNumber, RoomNumberLength));
        }
    ], 
    function(results) {
        cb(results);
    });
    
}

function randomRoomNumber() {
    return Math.floor(Math.random() * Math.pow(10, RoomNumberLength)) + 1;
}

function zeroFill( number, width ) {
    width -= number.toString().length;
    if ( width > 0 )
    {
        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + ""; 
}

////////////////////////////////
// macaddress를 이용한 고유번호 관리
////////////////////////////////
var userInfo = [];

exports.setUserInfo = function(mac) {
    console.log("userInfo.push(mac);: " + userInfo + " / " + mac);
	userInfo.push(mac);
	return userInfo.indexOf(mac);
}

exports.getUserInfo = function(num) {
    console.log("userInfo[num]: " + userInfo + " / " + num);
	return userInfo[num];
}

exports.delUserInfo = function(num) {
	userInfo[num] = null;
}

