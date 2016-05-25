'use strict'

var koa = require('koa')
var g = require('./wechat/g')
var config = require('./config')
var reply = require('./wx/reply')
var Wechat = require('./wechat/wechat')

var app = new koa()



// logger middle ware
app.use(function*(next) {
    var start = new Date;
    yield next;
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
});


var ejs = require('ejs')
var crypto = require('crypto')
var heredoc = require('heredoc')
var tpl = heredoc(function() {
    /*
    	<!DOCTYPE html>
    	<html>
    		<head>
    			<title>搜电影</title>
    			<meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
    		</head>
    		<body>
    			<h1>点击标题，开始录音翻译<h1>
    			<p id="title"></p>
    			<div id="director"></div>
    			<div id="year"></div>
    			<div id="poster"></div>
    			<script src="http://zeptojs.com/zepto-docs.min.js"></script>
    			<script src="http://res.wx.qq.com/open/js/jweixin-1.1.0.js"></script>
    			<script>
    				wx.config({
    				    debug: false,
    				    appId: 'wx83c86a79dfc2a0a6', 
    				    timestamp: '<%= timestamp %>', 
    				    nonceStr: '<%= noncestr %>', 
    				    signature: '<%= signature %>',
    				    jsApiList: [
    						'startRecord',
    						'stopRecord',
    						'onVoicePlayEnd',
    						'translateVoice'
    				    ]
    				})

					wx.ready(function(){
						wx.checkJsApi({
	        				jsApiList: ['onVoicePlayEnd'],
	        				success: function(res) {
	            			console.log('-------',res)
	        				}
    					})

						var isRecording = false
						$('h1').on('tap', function(){
							if(!isRecording){
								isRecording = true
								wx.startRecord({
									cancel: function(){
										window.alert('取消就无法语音搜索')
									}
								})
								return
							}

							isRecording = false

							wx.stopRecord({
								success: function(res){
									var localId = res.localId
									wx.translateVoice({
									   localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
									    isShowProgressTips: 1, // 默认为1，显示进度提示
									    success: function (res) {
									        window.alert(res.translateResult); // 语音识别的结果
									    }
									})
								}
							})
						})

					})//ready 外面

    			</script>
    		</body>
    	</html>
    */
})

var createNonce = function() {
    //console.log('params------------->createNonce')
    return Math.random().toString(36).substr(2, 15)
}

var createTimestamp = function() {
    //console.log('params------------->createTimestamp')
    return parseInt(new Date().getTime() / 1000, 10) + ''
}
var _sign = function(noncestr, ticket, timestamp, url) {
    var params = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ]

    var str = params.sort().join('&')
    var shasum = crypto.createHash('sha1')
    shasum.update(str)

    return shasum.digest('hex')
}

function sign(ticket, url) {
    var noncestr = createNonce()
    var timestamp = createTimestamp()
    var signature = _sign(noncestr, ticket, timestamp, url)
    //console.log(ticket)
    console.log(url)
    return {
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    }
}

app.use(function*(next) {
    if (this.url.indexOf('/movie') > -1) {
        var wechatApi = new Wechat(config.wechat)
        //console.log('params------------->after new Wechat')
        var data = yield wechatApi.fetchAccessToken()
        //console.log('params-------------> after fetchAccessToken')
        var access_token = data.access_token
        var ticketData = yield wechatApi.fetchTicket(access_token)
        //console.log('params------------->after fetchTicket')
        var ticket = ticketData.ticket
        var url = this.href.replace(':8000', '')
        var params = sign(ticket, url)

        //console.log('params------------->', params)

        this.body = ejs.render(tpl, params)

        return next
    }

    yield next
})



// 微信通信 middle ware
app.use(g(config.wechat, reply.reply))

app.listen(8080)

console.log('listening: 8080')
