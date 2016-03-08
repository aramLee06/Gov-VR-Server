'use strict';
/**
 * 게임 서버 진입점
 * 소켓 서버 오픈 및 처리 메시지 1차 처리
 *
 * @author Dongju Jung <lostcode7@gmaul.com>
 */

// Module Load
let net = require("net")
	,redis = require("redis")
	,uuid = require("node-uuid")
	,SocketManager = require("./lib/utilz/socketManager.js")
	,parse = require("./lib/protocol/parser.js")

// Config Load
let config = require("./config/server.json")
let redisConfig = require("./config/redis.json")

// Instance Create
let publisher = redis.createClient()
let socketManager = new SocketManager(0)

let message = require("./lib/message.js")

function SocketInit(){
	// Create TCP listen server
	let server = net.createServer()

	server.on('connection', (socket) => {
		// LOG_TODO : 소켓 접속 기록 남기기

		socket.setKeepAlive(true, 3000)

		// let uuid = uuid.v4()
		// socketManager.addSocket(socket, uuid)

		socket.on('data', (buffer) => {
			while(buffer.length > 0){
				try {
					let result, data

					result = parse(buffer);

					buffer = result.next_buffer;
					data = result.data;

					// TODO : if dev mode then log
					process.nextTick(() => {
						if(data.cmd === "join") {
							//console.dir(data)
							message.join(socket, data)
						} else {
							let json = JSON.stringify(data)
							publisher.publish(redisConfig.channel, json)
						}
					})
				} catch (e) {
					// TODO : ERROR 몽고디비에 저장 
					console.log(e)
					break;
				}
			}
		})

		socket.on('error', (err) => {
			// TODO : ERROR 몽고디비에 저장 
		})

		socket.on('close', () => {
			socketManager.disconnect(socket)
		})
	})

	server.listen(config.port)
}

function SubscribeInit(){
	let subscriber = redis.createClient()

	subscriber.on('message', (channel, msg) => {
		console.log(msg)
		let data = JSON.parse(msg)
		// let result = parse(new Buffer(msg, 'ascii'))
		// let data = result.data
		console.dir("데이터 : ", data)
		process.nextTick(() => {
			message.process(data)
		})
	})

	subscriber.subscribe(redisConfig.channel)
}

function Init(){
	SocketInit()
	SubscribeInit()
}

Init()