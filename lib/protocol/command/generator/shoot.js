'use strict'

module.exports = function(obj) {
	let buffer = new Buffer(27)

	buffer.writeFloatLE(obj.position.x, 1)
	buffer.writeFloatLE(obj.position.y, 5)
	buffer.writeFloatLE(obj.position.z, 9)

	buffer.writeFloatLE(obj.rotate.x, 13)
	buffer.writeFloatLE(obj.rotate.y, 17)
	buffer.writeFloatLE(obj.rotate.z, 21)

	buffer.writeUInt16LE(obj.uid, 25);

	return buffer
}