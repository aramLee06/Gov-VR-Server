'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()

module.exports = function(socket, data){
	if(socket.type == "PAD") {
		socketManager.send(socket.vr, generate(data))

		let r = Math.sqrt(Math.pow(data.move.x, 2) + Math.pow(data.move.y, 2))

		let v1 = Math.round(100 * r * 10) / 10
		let v2 = Math.round(v1 * (data.move.y / r) * 10) / 10;

		let R, L
		if(data.move.y > 0) { // 1, 2 사분면
			if(data.move.x > 0) {
				R = v2
				L = v1
			} else {
				R = v1
				L = v2
			}
		} else {  // 3, 4 분면
			v1 += 100
			v2 *= -1
			v2 += 100
			if(data.move.x > 0) {
				R = v2
				L = v1
			} else {
				R = v1
				L = v2
			}
		}

		if(data.move.x == 0 && data.move.y == 0) {
			R = 0;
			L = 0;
		}

		let d = {
			R : R
			, L : L
		}


		console.log(d)
		let msg = makeSerialMessage(150, dataToBuffer(d))
		socketManager.sendToHW(0, msg)
		//socketManager.sendToHW(1, msg)
	}
}

function dataToBuffer(data){
  var d6 = data.R;
  var d7 = data.L;
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
};