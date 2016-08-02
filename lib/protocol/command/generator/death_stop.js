'use strict'

module.exports = function(obj) {
	let buffer = new Buffer(5)

	buffer.writeFloatLE(obj.count, 1)

	return buffer
}