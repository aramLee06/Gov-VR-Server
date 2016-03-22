'use strict'

module.exports = function(obj) {
	let buffer = new Buffer(17)

	buffer.writeFloatLE(obj.move.x, 1)
	buffer.writeFloatLE(obj.move.y, 5)
	buffer.writeFloatLE(obj.rotate.x, 9)
	buffer.writeFloatLE(obj.rotate.y, 13)

	return buffer
}