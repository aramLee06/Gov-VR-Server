'use strict';
/**
 * 게임 서버 진입점
 * 소켓 서버 오픈 및 처리 메시지 1차 처리
 *
 * @author Dongju Jung <lostcode7@gmaul.com>
 */

// TCP Module Load
let net = require("net")
	,SocketManager = require("./lib/utilz/socketManager.js")
	,parse = require("./lib/protocol/parser.js")

// REST Module Load
let express = require('express')
    ,path = require('path')
    ,logger = require('morgan')
    ,cookieParser = require('cookie-parser')
    ,bodyParser = require('body-parser')
    ,debug = require('debug')('RestServerNew:server')
	,http = require('http')
	,UIDMaker = require('./lib/utilz/uid.js')

// Config Load
let config = require("./config/server.json")

// Instance Create
let socketManager = new SocketManager()
let uidMaker = new UIDMaker()

let message = require("./lib/message.js")

function SocketInit() {
	// Create TCP listen server
	let server = net.createServer()

	server.on('connection', (socket) => {
		// LOG_TODO : 소켓 접속 기록 남기기
		socket.setKeepAlive(true, 5000)

		console.log(socket.remoteAddress.replace("::ffff:", "") + " hw")
		if(socket.remoteAddress.replace("::ffff:", "") == "192.168.1.102") {
			console.log("Red Tank")
			socketManager._hw.set(3, socket)
		} else if(socket.remoteAddress.replace("::ffff:", "") == "192.168.1.109") {
			console.log("Blue Tank")
			socketManager._hw.set(0, socket)
		} else if(socket.remoteAddress.replace("::ffff:", "") == "192.168.1.108") {
			console.log("Blue Drone")
			socketManager._hw.set(1, socket)
		} else if(socket.remoteAddress.replace("::ffff:", "") == "192.168.1.107") {
			console.log("Desk Top")
			socketManager._hw.set(1, socket)
		}

 		// let uuid = uuid.v4()
		// socketManager.addSocket(socket, uuid)

		socket.on('data', (buffer) => {
			while(buffer.length > 0){
				try {
					let result = parse(buffer)
					let data = result.data

					buffer = result.next

					process.nextTick(() => {
						//console.log(data)
						message.process(socket, data);
					})
				} catch (e) {
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

	server.listen(config.tcp_port)
}

function RestInit() {
	let app = express()

	app.use(logger('dev'))
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(cookieParser())
	app.use(express.static(path.join(__dirname, 'public')))

	app.all('/*', function(req, res, next){
		res.header("Access-Control-Allow-Origin", "*")
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
		res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key')
		next()
	})

	// app.use("/room", router.room)
	// app.use("/user", router.user)
	// app.use("/gamedata", router.gamedata)

	app.get("/uid", (req, res) => {
		let uuid = uidMaker.make()
		res.end(uuid + "")
	})

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
		var err = new Error('Not Found')
		err.status = 404
		next(err)
	})

	/**
	 * Get port from environment and store in Express.
	 */

	let port = normalizePort(config.rest_port);
	app.set('port', port);

	/**
	 * Create HTTP server.
	 */

	let server = http.createServer(app);

	/**
	 * Listen on provided port, on all network interfaces.
	 */

	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);

	/**
	 * Normalize a port into a number, string, or false.
	 */

	function normalizePort(val) {
	  var port = parseInt(val, 10);

	  if (isNaN(port)) {
	    // named pipe
	    return val;
	  }

	  if (port >= 0) {
	    // port number
	    return port;
	  }

	  return false;
	}

	/**
	 * Event listener for HTTP server "error" event.
	 */

	function onError(error) {
	  if (error.syscall !== 'listen') {
	    throw error;
	  }

	  var bind = typeof port === 'string'
	    ? 'Pipe ' + port
	    : 'Port ' + port;

	  // handle specific listen errors with friendly messages
	  switch (error.code) {
	    case 'EACCES':
	      console.error(bind + ' requires elevated privileges');
	      process.exit(1);
	      break;
	    case 'EADDRINUSE':
	      console.error(bind + ' is already in use');
	      process.exit(1);
	      break;
	    default:
	      throw error;
	  }
	}

	/**
	 * Event listener for HTTP server "listening" event.
	 */

	function onListening() {
	  var addr = server.address();
	  var bind = typeof addr === 'string'
	    ? 'pipe ' + addr
	    : 'port ' + addr.port;
	  debug('Listening on ' + bind);
	}

}

function Init(){
	SocketInit()
	RestInit()
}

Init()