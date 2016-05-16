'use strict'

var Koa = require('koa')
var sha1 = require('sha1')
var config = {
    wechat: {
        appID: 'wxb6947ead7fe5b0df',
        appSecret: 'db9c8bffb60da0479ab35960676d9f6f',
        token: 'xiaobing'
    }
}

var app = new Koa()

app.use(function*(next) {
    console.log(this.query)

    var token = config.wecaht.token
    var signature = this.query.signature
    var nonce = this.query.nonce
    var timestamp = this.query.timestamp
    var echostr = this.query.echostr
    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)
    if (sha === signature) {
        this.body = echostr + ''
    } else {
        this.body = 'wrong'
    }

})

app.listen(80)

console.log('listening: 1234')
