'use strict'

module.exports = function(obj) {
	let buffer = new Buffer(4)

	buffer.writeUInt16LE(obj.uid, 1)
	buffer.writeInt8(obj.unit, 3)

	return buffer
}