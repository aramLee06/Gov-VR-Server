'use strict'

class Player {
	constructor(vr, pad) {
		this.vr = vr
		this.pad = pad

		this.unit = -1

		this.status = "UNIT_SELECT"

		this.move = {
			x : 0
			,y : 0
			,z : 0
		}

		this.rotate = {
			x : 0
			,y : 0
			,z : 0
			,w : 0
		}

		this.current = {
			x : 0
			,y : 0
			,z : 0
		}
	}

	setPosition(data){
		this.move = data.move
		this.rotate = data.rotate
		this.current = data.current
	}
}

module.exports = Player