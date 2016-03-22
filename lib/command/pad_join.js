'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()

module.exports = function(socket, data){
	let vrSocket = socketManager.getSocket(data.target)
	if(vrSocket){
		vrSocket.pad = data.uid
		socket.vr = data.target
		socket.type = "PAD"
		socketManager.addSocket(socket, data.uid)

		let msg = generate({cmd : "bind_success"})
		
		socketManager.send(data.uid, msg)
		socketManager.send(data.target, msg)
	} else {
		socket.write(generate({cmd : "bind_failed", code : 0}))
	}
}