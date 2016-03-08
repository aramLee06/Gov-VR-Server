'use strict'
let redis = require('redis')
	,client = redis.createClient()


client.sadd("room:test2", "test")
client.smembers("room:test2", (err, result) => {
	console.dir(result)
	client.sadd("room:test2", "test1")
	client.smembers("room:test2", (err, result) => {
		console.dir(result)
		client.sadd("room:test2", "test2")		
		client.smembers("room:test2", (err, result) => {
			console.dir(result)
			client.end()
		})	
	})	
})

