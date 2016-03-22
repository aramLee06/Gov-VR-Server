'use strict'

let buffer = new Buffer([0x70,0x88,0x90,0xe7])

let value = buffer.readInt32LE(buffer)

console.log(value)