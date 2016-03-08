'use strict'

let uuid = require('node-uuid')
let redis = require('redis')
let client = redis.createClient()
let async = require('async')

var funcArr = []
var testFunc = function(cb){
	let buffer = new Buffer(32)

	uuid.v1(null, buffer)

	buffer = buffer.slice(0, 4)

	let val = buffer.readUInt32LE(0)

	client.sismember("testkey2", val, (err, result)=>{
		if(result){
			cb("ERROR! 중복 발생")
		} else {
			//console.log("add this key", buffer)
			client.sadd("testkey2", val)
			cb()
		}
	})
}

for(var i = 0; i < 240000; i ++){
	funcArr.push(testFunc)
}

async.waterfall(funcArr, (err) => {
	if(err){
		console.log(err)
		client.end()
	} else {
		console.log("end!")
		client.end()
	}
})