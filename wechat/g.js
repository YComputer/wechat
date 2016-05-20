'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')


module.exports = function(opts, handler) {
    // 初始化 微信回复 对象
    var wechat = new Wechat(opts)
    console.log('init wechat instance 会初始化好多条件，这里的初始化流程还不是最优的')

    return function*(next) {
        console.log('request from weixin server↓↓↓↓\n' +
                ' method is %s \n url is %s \n data is %s \n' +
                'request from weixin server↑↑↑↑',
                this.method, this.url, JSON.stringify(this.query))
            // 这里其实应该单独配置一个path用来做微信认证。而不是像现在这样混在整个应用中。
        var token = opts.token
        var signature = this.query.signature
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var str = [token, timestamp, nonce].sort().join('')
        var sha = sha1(str)
        if (this.method === 'GET') {
            if (sha === signature) {
                this.body = echostr + ''
            } else {
                this.body = '来自微信认证以外的GET请求'
            }
        } else if (this.method === 'POST') {
            if (sha !== signature) {
                this.body = '来自微信server以外的POST请求'
            } else {
                var data = yield getRawBody(this.req, {
                        length: this.length,
                        limit: '1mb',
                        encoding: this.charset
                    })
                    // console.log(data.toString())

                var content = yield util.parseXMLAsync(data)
                    //console.log('rawdata after parse--->', content)

                var message = util.formatMessage(content.xml)
                    //console.log('parse after format--->', message)

                this.weixin = message

                // 消息返回以后，把指针指向业务逻辑，跳出去到handler中去处理业务逻辑。
                yield handler.call(this, next)
                    // 处理完业务逻辑后，返回到koa框架中，再把指针指向消息回复。
                wechat.reply.call(this)
            }


        }
    }
}
