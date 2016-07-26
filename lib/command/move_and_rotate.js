'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,GameManager = require("../utilz/GameManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()
let gameManager = new GameManager()

module.exports = function(socket, data){
	if(socket.type == "PAD") {
		socketManager.send(socket.vr, generate(data))

		let r = Math.sqrt(Math.pow(data.move.x, 2) + Math.pow(data.move.y, 2))

		let v1 = Math.round(50 * r * 10) / 10
		let v2 = Math.round(v1 * (data.move.y / r) * 10) / 10;

		let R, L
		if(data.move.y > 0) { // 1, 2 사분면
			if(data.move.x > 0) { // 2사분면
				R = v2
				L = v1
			} else { // 1사분면
				R = v1
				L = v2
			}
		} else {  // 3, 4 분면
			v1 += 100
			v2 *= -1
			v2 += 100
			if(data.move.x > 0) { // 3사분면
				R = v2
				L = v1
			} else { // 4사분면
				R = v1
				L = v2
			}
		}

		if(data.move.x == 0 && data.move.y == 0) {
			R = 0;
			L = 0;
		}

		// 포신 부분 (위아래)
		let wr = Math.sqrt(Math.pow(data.rotate.x, 2) + Math.pow(data.rotate.y, 2))
		let v3 = Math.round(50 * wr * 10) / 10
		let v4 = Math.round(v3 * (data.rotate.y / wr) * 10) / 10;

		let wU // 포신 부분 (위아래) y
		let wR // 포대 부분 (좌우) x
		if (data.rotate.y > 0) { // 1, 2
			wU = v4 + 50
		} else { // 3,4
			wU = (-1 * v4) + 50
		}

		// 포대 부분 (좌우) x
		if (data.rotate.x > 0) { // 2, 3
			wR = 100
		} else { // 4, 1
			wR = 200
		}
		
		if (data.rotate.y == 0) {
			wU = 0
		}
		if (data.rotate.x == 0) {
			wR = 0
		}
		
		let d = {
			R : R
			, L : L
			, wU : wU
			, wR : wR
		}

		let msg = makeSerialMessage(150, dataToBuffer(d))
		let player = gameManager.getPlayer(socket.vr)
		socketManager.sendToHW(player.unit, msg)
		//socketManager.sendToHW(1, msg)
	}
}

function dataToBuffer(data){
  var d6 = data.R;	// 오오른짝
  var d7 = data.L;	// 왼짝
  var d8 = data.wU; // left and right
  var d9 = data.wR; // up and down
  var d10 = 0;		// 빵야 -> 0 아닌 값만 

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