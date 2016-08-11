'use strict'

let SocketManager = require("../utilz/socketManager.js")
	,GameManager = require("../utilz/GameManager.js")
	,generate = require("../protocol/generator.js")

let socketManager = new SocketManager()
let gameManager = new GameManager()

module.exports = function(socket, data){
	if(socket.type == "PAD") {

		socketManager.send(socket.vr, generate(data))
		
		let player = gameManager.getPlayer(socket.vr)
		
		// Left Joystick
		let r = Math.sqrt(Math.pow(data.move.x, 2) + Math.pow(data.move.y, 2))
		let v1 = Math.round(100 * r * 10) / 10
		let v2 = Math.round(v1 * (data.move.y / r) * 10) / 10;

		let wr = Math.sqrt(Math.pow(data.rotate.x, 2) + Math.pow(data.rotate.y, 2))
		let v3 = Math.round(50 * wr * 10) / 10
		let v4 = Math.round(v3 * (data.rotate.y / wr) * 10) / 10;

		//console.log ("moveX : " + data.move.x + " / moveY : " + data.move.y)
		//console.log("r : " + r + " / v1 : " + v1 + " / v2 : " + v2)

		//0,3 = 탱크 / 1,2 = 드론
		if (player.unit === 0 || player.unit === 3) {
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
				v2 = v2
				v2 += 100
				if(data.move.x > 0) { // 3사분면
					R = v2
					L = v1
				} else { // 4사분면
					R = v1
					L = v2
				}
			}

			if(data.move.x === 0) {
				R = 0;
				L = 0;
			}
			if(data.move.y === 0 && data.move.x > 0) {
				R = 0;
			} else if (data.move.y === 0 && data.move.x < 0) {
				L = 0;
			}

			let wU // 포신 부분 (위아래) y
			let wR // 포대 부분 (좌우) x
			if (data.rotate.y > 0.7) { // 1, 2
				wU = v4 + 50
			} else if (data.rotate.y < -0.7) { // 3,4
				wU = (-1 * v4) + 50
			} else {
				wU = 0;
			}

			// 포대 부분 (좌우) x
			if (data.rotate.x > 0.7) { // 2, 3
				wR = 100
			} else if (data.rotate.x < -0.7) { // 4, 1
				wR = 200
			} else {
				wR = 0;
			}

			let d = {
			L : L
			, R : R
			, wU : wU
			, wR : wR
			}
			console.log(d)
			let msg = makeSerialMessage(150, dataToBuffer(d))
			socketManager.sendToHW(player.unit, msg)
			//socketManager.sendToHW(1, msg)
		} else if (player.unit === 1 || player.unit === 2) {

			// 드론 테스트 용
			let Pitch, Roll, Throtlle
			if ((data.move.y > 0.7) && (data.move.x < 0.7 || data.move.x > -0.7)) {
				Pitch = 80
				Roll = 0
			} else if ((data.move.y < -0.7) && (data.move.x < 0.7 || data.move.x > - 0.7)) {
				Pitch = 180
				Roll = 0
			} else if ((data.move.x < -0.7) && (data.move.y < 0.7 || data.move.y > -0.7)) {
				Pitch = 0
				Roll = 180
			} else if ((data.move.x > 0.7) && (data.move.y < 0.7 || data.move.y > -0.7)) {
				Pitch = 0
				Roll = 80
			}

			
			// 드론 테스트 용
			/*
			let Pitch // 전(0-100) 후(101-200)
			let Roll // 좌 (101-200) 우(0-100)
			let Throttle // 고도 (0=착륙, 50,100,150)

			if (data.move.y > 0) { // 1,2
				if (data.move.x < 0) { // 1
					Pitch = v2
					Roll = v1 - v2 + 100
				} else if (data.move.x > 0) { // 2
					Pitch = v2
					Roll = v1 - v2	
				} 
			} else if (data.move.y < 0) { // 3, 4
				v2 *= -1
				if (data.move.x > 0) { // 3
					Pitch = v2 + 100
					Roll = v1 - v2
				} else if (data.move.x < 0) { // 4
					Pitch = v2 + 100
					Roll = v1 - v2 + 100
				}
			}
			*/
			
			if(data.move.x === 0) {
				Pitch = 0;
			}
			if (data.move.y === 0) {
				Roll = 0;
			}

			// Max = 200 이 숫자보다 낮은 숫자로만 입력 할 것
			let wR
			if (data.rotate.y > 0) {
				wR = 180
			} else if (data.rotate.y < 0) {
				wR = 150
			} else if (data.rotate.y === 0) {
				wR = 100
			}

			let wU = 0
			console.log("P : " + Pitch + " / R : " + Roll)	
			let d = {
				R : Roll
				, L : Pitch
				, wU : wU // Yaw = 사용 안함 
				, wR : wR // Throttle 고정
			}

			let msg = makeSerialMessage(150, dataToBuffer(d))
			socketManager.sendToHW(player.unit, msg)
			
		}
	}
}

function dataToBuffer(data){
  var d6 = data.R;	// 오오른짝
  var d7 = data.L;	// 왼짝
  var d8 = data.wU; // left and right
  var d9 = data.wR; // up and down
  var d10 = 0;		// 발사 (GunFire에서 처리)

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