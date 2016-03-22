'use strict'

let SocketManager = require("./socketManager.js")
	,Player = require("./Player.js")

let instance = null

class GameManager {
	constructor () {
		if(!instance) {
			instance = this
		}

		this.socketManager = new SocketManager()

		this.player = [null,null,null,null]

		return instance
	}
}