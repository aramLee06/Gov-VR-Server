var async = require("async")

var count = 0;

async.waterfall([
    (cb) => {
        setTimeout(cb, 1000)
        console.log(1);
    }
    ,(cb) => {
        setTimeout(cb, 1000)
        console.log(2);
    }
    ,(cb) => {
        setTimeout(cb, 1000)
        console.log(3);
    }
], (err) => {
    console.log("start")
})