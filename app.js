'use strict'

var koa = require('koa')
var g = require('./wechat/g')
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

app.use(function* (next){

	console.log('-=-==-=-==-=-=-=-=-=-=--=-=',this.url)

	if(this.url.indexOf('/movie') > -1){
	console.log('!!!!!!!!')

		this.body = '<h1>Hi there.<h1>'
		return next
	}

	yield next
})

// 微信通信 middle ware
app.use(g(config.wechat, reply.reply))

app.listen(80)

console.log('listening: 80')
