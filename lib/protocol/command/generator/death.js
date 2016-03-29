'use strict'

module.exports = function(obj) {
	let buffer = new Buffer(3)

	buffer.writeUInt16LE(obj.uid, 1)

	return buffer
}