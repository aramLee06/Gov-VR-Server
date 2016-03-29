'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,GameManager = require("../utilz/GameManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()
let gameManager = new GameManager()

module.exports = function(socket, data){
	let player = gameManager.getPlayer(socket.uid)
	player.setPosition(data)
}