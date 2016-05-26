'use strict'

module.exports = function(obj) {
	let buffer_len = 2 + (42 * obj.players.length)

	let buffer = new Buffer(buffer_len)

	buffer.writeInt8(obj.players.length, 1)

	for(var i = 0, len = obj.players.length; i < len; i++) {
		let offset = 2 + (i * 42);
		let p = obj.players[i]
		buffer.writeUInt16LE(p.vr, offset)

		buffer.writeFloatLE(p.move.x, offset + 2)
		buffer.writeFloatLE(p.move.y, offset + 6)
		buffer.writeFloatLE(p.move.z, offset + 10)

		buffer.writeFloatLE(p.rotate.x, offset + 14)
		buffer.writeFloatLE(p.rotate.y, offset + 18)
		buffer.writeFloatLE(p.rotate.z, offset + 22)
		buffer.writeFloatLE(p.rotate.w, offset + 26)
		
		buffer.writeFloatLE(p.current.x, offset + 30)
		buffer.writeFloatLE(p.current.y, offset + 34)
		buffer.writeFloatLE(p.current.z, offset + 38)
	}

	return buffer
}