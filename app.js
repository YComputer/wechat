'use strict'

var Koa = require('koa')
var wechat = require('./wechat/g')
var config = {
    wechat: {
        appID: 'wxb6947ead7fe5b0df',
        appSecret: 'db9c8bffb60da0479ab35960676d9f6f',
        token: 'xiaobing'
    }
}

var app = new Koa()

app.use(wechat(config.wechat))

app.listen(80)

console.log('listening: 80')
