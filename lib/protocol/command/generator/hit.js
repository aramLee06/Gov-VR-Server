'use strict'

module.exports = function(obj) {
	let buffer = new Buffer(3)

	buffer.writeInt16LE(obj.uid)

	return buffer
}