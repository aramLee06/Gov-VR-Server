'use strict'

module.exports = function(obj) {
	let buffer = new Buffer(25)

	buffer.writeFloatLE(obj.position.x, 1)
	buffer.writeFloatLE(obj.position.y, 5)
	buffer.writeFloatLE(obj.position.z, 9)

	buffer.writeFloatLE(obj.velocity.x, 13)
	buffer.writeFloatLE(obj.velocity.y, 17)
	buffer.writeFloatLE(obj.velocity.z, 21)

	return buffer
}