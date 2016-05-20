'use strict'

var koa = require('koa')
var wechat = require('./wechat/g')
var config = require('./config')
var reply = require('./wx/reply')
var app = new koa()



// logger middle ware
app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// 微信通信 middle ware
app.use(wechat(config.wechat, reply.reply))

app.listen(80)

console.log('listening: 80')
