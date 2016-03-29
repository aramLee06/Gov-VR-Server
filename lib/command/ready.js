'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,GameManager = require("../utilz/GameManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()
let gameManager = new GameManager()

module.exports = function(socket, data){
	if(gameManager.ready(socket.uid, data.unit)){
		socketManager.broadcast2vr(
			generate({
				cmd : "soldout"
				, uid : socket.uid
				, unit : data.unit
			})
		)

		gameManager.gameStart()
	}
}