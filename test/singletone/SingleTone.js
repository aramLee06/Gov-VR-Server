'use strict'
/**
 * 소켓 관리자
 * 현재 접속중인 소켓 관리 및 소켓 관련 함수 제공
 *
 * @author Dongju Jung <lostcode7@gmaul.com>
 */

let instance = null;

class SingleTone {
	constructor() {
		if (!instance) {
			instance = this;
		}

		_test = {};

		return instance;
	}

	add(key, item){
		_test[key] = item;
		print()
	}

	print(){
		console.log(this._test);
	}
}

module.exports = SingleTone;