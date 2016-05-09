'use strict'

let async = require("async")

let SocketManager = require("./socketManager.js")
	,generate = require("../protocol/generator.js")
	,Player = require("./Player.js")

let instance = null

class GameManager {
	constructor () {
		if(!instance) {
			instance = this
		}

		this.socketManager = new SocketManager()
		this.status = "WAIT"
		this.players = new Map()

		return instance
	}

	addPlayer(vr_uid, pad_uid){
		let player = new Player(vr_uid, pad_uid)

		this.players.set(vr_uid, player)
	}

	getPlayer(vr_uid){
		let player = this.players.get(vr_uid)
		return player
	}

	ready(vr_uid, unit){
		let player = this.getPlayer(vr_uid)

		if(player) {
			for(let p of this.players.values()){
				if(p.unit == unit)
					return null
			}

			player.unit = unit
			player.status = "READY"
		}

		return true
	}

	isAllReady() {
		let isReady = true

		for(let p of this.players.values()){
			if(p.status !== "READY") {
				isReady = false
				break
			}
		}

		return isReady
	}

	isAllLoadingSuccess() {
		let isReady = true

		for(let p of this.players.values()){
			if(p.status !== "GAME_READY") {
				isReady = false
				break
			}
		}

		return isReady
	}

	gameStart() {
		if(this.isAllReady()){
			this.status = "LOADING"
			for(let p of this.players.values()){
				p.status = "LOADING"
			}
			setTimeout(() => {
				this.socketManager.broadcast2vr(generate({cmd : "game_start"}))
			}, 3000);
		}
	}

	inGameStart() {
		if(this.isAllLoadingSuccess()){
			this.status = "INGAME"
			for(let p of this.players.values()){
				p.status = "INGAME"
			}

			async.waterfall([
				(cb) => {
					this.socketManager.broadcast2vr(generate({cmd : "game_count", value : 3}))
					setTimeout(cb, 1000)
				}
				,(cb) => {
					this.socketManager.broadcast2vr(generate({cmd : "game_count", value : 2}))
					setTimeout(cb, 1000)
				}
				,(cb) => {
					this.socketManager.broadcast2vr(generate({cmd : "game_count", value : 1}))
					setTimeout(cb, 1000)
				}
			], (err) => {
				this.socketManager.broadcast2vr(generate({cmd : "game_start"}))
				this.startTimer()
			})
		}
	}

	isGameEnd(){
		let red = []
		let blue = []

		for(let p of this.players.values()){
			if(p.unit == 0 || p.unit ==1)
				blue.push(p)
			else
				red.push(p)
		}

		let result = "NONE"

		let isRedAllDead = true
		for(let i = 0, len = red.length; i < len; i++){
			let p = red[i]
			if(p.status != "DEATH")
				isRedAllDead = false
		}	

		let isBlueAllDead = true
		for(let i = 0, len = blue.length; i < len; i++){
			let p = blue[i]
			if(p.status != "DEATH")
				isBlueAllDead = false
		}

		if(isRedAllDead)
			result = "RED"
		else if (isBlueAllDead)
			result = "BLUE"

		//return result
		return "NONE"
	}

	startTimer() {
		this.timer = setInterval(() => {
			process.nextTick(() => {
				let obj = {
					cmd : "player_position"
					,players : []
				}

				for(let p of this.players.values()){
					obj.players.push(p)
				}

				let msg = generate(obj)

				this.socketManager.broadcast2vr(msg)

				let endCheck = this.isGameEnd()

				if(endCheck != "NONE") {
					this.socketManager.broadcast2vr(generate({cmd : "game_end", value : 0}));
					clearInterval(this.timer);
				}
			})
		}, 300)	
	}
}

module.exports = GameManager