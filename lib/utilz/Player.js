'use strict'

class Player {
	constructor(name) {
		this.name = name

		this.health = 3
		
		this.pos = {
			x : 0,
			y : 0
		}
	}
}

module.exports = Player