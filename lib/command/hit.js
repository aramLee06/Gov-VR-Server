'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()

module.exports = function(socket, data){
	let target = data.uid

	let msg = generate({cmd : "attacked", uid : socket.uid})

	socketManager.send(target, msg)
}