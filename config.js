'use strict'

var path = require('path')
var util = require('./libs/util')
var wechat_file = path.join(__dirname, './config/wechat.txt')
var wechat_ticket_file = path.join(__dirname, './config/wechat_ticket.txt')

var config = {
    wechat: {
        // 这个appid可以是公众号开放平台分配的。也可以是微信开放平台分配的。
        appID: 'wx83c86a79dfc2a0a6',
        appSecret: '9845d1cb099c9d4dd4a7fb9ef3b99adb',
        token: 'xiaobing2',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file, 'utf-8')
        },
        saveAccessToken: function(data) {
        	data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file, data)
        },
        getTicket: function() {
            return util.readFileAsync(wechat_ticket_file, 'utf-8')
        },
        saveTicket: function(data) {
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_ticket_file, data)
        }
    }
}

module.exports = config