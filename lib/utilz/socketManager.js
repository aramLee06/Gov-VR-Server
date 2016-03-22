'use strict'
/**
 * 소켓 관리자
 * 현재 접속중인 소켓 관리 및 소켓 관련 함수 제공
 *
 * @author Dongju Jung <lostcode7@gmaul.com>
 */

// Module Load

let instance = null

class SocketManager {
	constructor(pid) {
		if (!instance) {
			instance = this
		}

		this._sockets = new Map()
		this._vr = new Map()
		this._pad = new Map()
		this._hw = new Map()

		return instance
	}

	/**
	 * unique_id 로 특정 소켓 가져오기
	 *
	 * @param uid {string} 대상의 Socket Unique ID
	 *
	 * @return {Socket} Unique ID와 일치하는 Socket
	 */
	getSocket(uid) {
		uid = Number(uid)
		if(this._sockets.has(uid)) {
			return this._sockets.get(uid)
		} else {
			return null
		}
	}

	/**
	 * Socket을 매니저에 추가
	 *
	 * @param socket {Socket} 추가할 소켓
	 * @param uid {string} 소켓 유니크 키
	 * @param cb {function} CallBack 함수
	 */
	addSocket(socket, uid, cb) {
		if(typeof socket !== 'object'){
			// ERROR_TODO : thorw Error 추가
		}

		socket["uid"] = uid
		this._sockets.set(uid, socket)

		if(socket.type == "PAD") {
			this._pad.set(uid, socket)
		} else if (socket.type == "VR") {
			this._vr.set(uid, socket)
		}

		if(typeof cb === 'function'){
			cb(socket)
		}
	}

	/**
	 * Socket을 매니저에서 삭제
	 *
	 * @param uid {string} 소켓 유니크 키
	 * @param cb {function} CallBack 함수
	 */
	removeSocket(uid, cb) {
		let socket = this.getSocket(uid)

		if(socket !== null) {
			this._sockets.delete(uid)
		}

		if(typeof cb === 'function'){
			cb()
		}
	}

	/**
	 * 소켓의 연결이 종료 되었을때 처리부분
	 *
	 * @param socket {Socket} 소켓 오브젝트
	 * @param cb {function} Callback Function
	 */
	disconnect(socket, cb) {
		this.removeSocket(socket.uid)
	}

	/**
	 * 특정 대상에게 메시지 전송
	 *
	 * @param uid {string} 대상의 Socket Unique ID
	 * @param msg {buffer} 보낼 메시지 
	 */
	send(uid, msg, cb) {
		let socket = this.getSocket(uid)
		let err = null

		if(socket !== null) {
			socket.write(msg)
		}

		if(typeof cb === 'function'){
			cb(socket)
		}
	}

	broadcast2vr(msg) {
		for(var sock of this._vr.values()){
			process.nextTick(() => {
				sock.write(msg)
			})
		}
	}

	broadcast2pad(msg) {
		for(var sock of this._pad.values()){
			process.nextTick(() => {
				sock.write(msg)
			})
		}
	}

	broadcast2all(msg) {
		for(var sock of this._sockets.values()){
			process.nextTick(() => {
				sock.write(msg)
			})
		}	
	}
}

module.exports = SocketManager