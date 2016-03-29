'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()

module.exports = function(socket, data){
	socketManager.broadcast2vr(generate({cmd : "death", uid : socket.uid}))
}