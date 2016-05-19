'use strict'

var koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
var config = require('./config')
var reply = require('./wx/reply')

var app = new koa()

app.use(wechat(config.wechat, reply.reply))

app.listen(80)
console.log('listening: 80')
