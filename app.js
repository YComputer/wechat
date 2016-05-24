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


var ejs = require('ejs')
var heredoc = require('heredoc')
var tpl = heredoc(function(){/*
	<!DOCTYPE html>
	<html>
		<head>
			<title>猜电影</title>
			<meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
		</head>
		<body>
			<h1>点击标题，开始录音翻译<h1>
			<p id="title"></p>
			<div id="poster"></div>
			<script src="http://zeptojs.com/zepto-docs.min.js"></script>
			<script src="http://res.wx.qq.com/open/js/jweixin-1.1.0.js"></script>

		</body>
	</html>
*/})
app.use(function* (next){
	if(this.url.indexOf('/movie') > -1){
	console.log('!!!!!!!!')

		this.body = ejs.render(tp.,{})
		return next
	}

	yield next
})



// 微信通信 middle ware
app.use(g(config.wechat, reply.reply))

app.listen(80)

console.log('listening: 80')
