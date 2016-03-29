'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()

module.exports = function(socket, data){
	if(socket.type == "PAD") {
		socketManager.send(socket.vr, generate({cmd : "gun_fire"}))
	}
}