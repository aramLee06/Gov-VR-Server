'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,GameManager = require("../utilz/GameManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()
let gameManager = new GameManager()


module.exports = function(socket, data){
	if(socket.type == "PAD") {


    // 고도만 0으로 하고, 3초 뒤에 프로펠러 정지 시키면됨
    socketManager.send(socket.vr, generate({cmd : "death_stop"}))

		let msg = makeSerialMessage(150, dataToBuffer())
    let player = gameManager.getPlayer(socket.vr)
    socketManager.sendToHW(player.unit, msg)
	}
}

function dataToBuffer() {

  var d6 = 0;
  var d7 = 0;
  var d8 = 0;
  var d9 = 0;
  var d10 = 0;

  var buffer = new Buffer(5)

  buffer.writeUInt8(Number(d6), 0)
  buffer.writeUInt8(Number(d7), 1)
  buffer.writeUInt8(Number(d8), 2)
  buffer.writeUInt8(Number(d9), 3)
  buffer.writeUInt8(Number(d10), 4)

  return buffer
}

function makeSerialMessage(code, data) {

	var i, length, crc, buffer;

    length = data === undefined || data === null ? 0 : data.length;

    buffer = new Buffer(6 + length);
    buffer.write('$M<');
    buffer.writeUInt8(length, 3);
    buffer.writeUInt8(code, 4);

    crc = 0x00 ^ code ^ length;
    for (i = 0; i < length; i = i + 1) {
        crc ^= data.readUInt8(i);
        buffer.writeUInt8(data.readUInt8(i), i + 5);
    }
    buffer.writeUInt8(crc, buffer.length - 1);

    return buffer;
}