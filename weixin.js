'use strict'

exports.reply = function* (next){
	var message = this.weixin

	if(message.MsgType === 'event'){
		if(message.Event === 'subscribe'){
			if(message.EventKey){
				console.log('扫二维码进来：' + message.EventKey + ' ' + message.ticket)
			}

			this.body = '欢迎订阅 fooads\r\n' + ' 消息ID：' + message.MsgId
		} else if(message.Event === 'unsubscribe'){
			//可以记录到数据库中查看取消订阅的用户信息
			console.log('取消关注')
			this.body = ''
		}


	}else{

	}

	yield next
}



