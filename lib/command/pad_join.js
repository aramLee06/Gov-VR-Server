'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,GameManager = require("../utilz/GameManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()
let gameManager = new GameManager()

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

		gameManager.addPlayer(data.target, data.uid)
	} else {
		socket.write(generate({cmd : "bind_failed", code : 0}))
	}
}