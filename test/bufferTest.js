'use strict'

let buffer = new Buffer(20)

buffer.writeInt8(97, 0)
buffer.writeInt8(5, 5)
buffer.writeInt8(98, 10)
buffer.writeInt8(5, 15)

let len = 5 + buffer.readInt8(5)
let buffer1 = buffer.slice(0, len)
buffer = buffer.slice(len)

let buffer2 = buffer.slice(0, 5 + buffer.readInt8(5))

console.log(buffer1, buffer1.length)
console.log(buffer2, buffer2.length)