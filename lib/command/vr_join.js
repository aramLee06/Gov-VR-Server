'use strict'

let SocketManager = require("../utilz/socketManager.js")

let socketManager = new SocketManager()

module.exports = function(socket, data){
	socket.type = "VR"
	socketManager.addSocket(socket, data.uid)
}