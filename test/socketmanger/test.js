'use strict'

var uuid = require('node-uuid')

let SocketManager = require("../../lib/utilz/socketManager.js")
let socketManager = new SocketManager()
let Socket = require("./fakeSocket.js")

let hostSocket = new Socket("HostSocket")
let huuid = uuid.v1();

let clientSocket1 = new Socket("ClientSocket1")
let cuuid1 = uuid.v1();

let clientSocket2 = new Socket("ClientSocket2")
let cuuid2 = uuid.v1();

let roomNumber = 12335

socketManager.addSocket(hostSocket, huuid)
socketManager.addSocket(clientSocket1, cuuid1)
socketManager.addSocket(clientSocket2, cuuid2)

socketManager.joinRoom(huuid, roomNumber, true)
socketManager.joinRoom(cuuid1, roomNumber, false)
socketManager.joinRoom(cuuid2, roomNumber, false)

console.log(hostSocket.ishost)

socketManager.sendAll(roomNumber, "SendAll!")
socketManager.sendToHost(roomNumber, "Send to host")

socketManager.sendTo(roomNumber, 0, "Send to 0")
socketManager.sendTo(roomNumber, 1, "Send to 1")
socketManager.sendTo(roomNumber, [0,1], "Send to 0, 1")

socketManager.disconnect(clientSocket1)
socketManager.disconnect(hostSocket)