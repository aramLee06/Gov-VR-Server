'use strict'

module.exports = function(obj) {
	let buffer = new Buffer(2)

	buffer.writeInt8(obj.code, 1)

	return buffer
}