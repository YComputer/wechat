'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')


module.exports = function(opts, handler) {
    // 这里注释掉和不注释掉的区别在哪里？
    var wechat = new Wechat(opts)

    return function*(next) {
        console.log('request info from weixin--->', this.query)
        var that = this
        var token = opts.token
        var signature = this.query.signature
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var str = [token, timestamp, nonce].sort().join('')
        var sha = sha1(str)

        if (this.method === 'GET') {
            console.log('get from weixin--->')
            if (sha === signature) {
                this.body = echostr + ''
            } else {
                this.body = 'wrong'
            }
        } else if (this.method === 'POST') {
            console.log('post from weixin rawdata--->')
            if (sha !== signature) {
                this.body = 'wrong'
                return false
            }

            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            })
            console.log(data.toString())

            var content = yield util.parseXMLAsync(data)
            console.log('rawdata after parse--->', content)

            var message = util.formatMessage(content.xml)
            console.log('parse after format--->', message)

            this.weixin = message

            // 消息返回以后，把指针指向业务逻辑，跳出去到handler中去处理业务逻辑。
            yield handler.call(this, next)
                // 处理完业务逻辑后，返回到koa框架中，再把指针指向消息回复。
            wechat.reply.call(this)
        }
    }
}
