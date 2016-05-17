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
		}else if(message.Event === 'LOCATION'){
			this.body = '你上报的位置是：' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
		}else if(message.Event === 'CLICK'){
			this.body = '你点击了菜单：' + message.EventKey
		}else if(message.Event === 'SCAN'){
			console.log('关注后扫描二维码'+message.EventKey+' '+ message.Ticket)

			this.body = '确认你已经扫描了二维码'
		}else if(message.Event === 'VIEW'){
			this.body = '你点击了菜单中的连接：'+ message.EventKey
		}


	}else if(message.MsgType === 'text'){
		var content = message.Content
		var reply = '你说的 '+ message.Content + ' 太复杂了'

		if(content === 1){
			reply = '你输入了1'
		}else if(content === 2){
			reply = '你输入了2'
		}else if(content === 3){
			reply = '你输入了3'
		}

		this.body = reply
	}

	yield next
}



