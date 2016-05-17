'use strict'

var koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util require('./libs/util')
var wechat_file = path.join(__dirname, './config/wechat.txt')

var config = {
    wechat: {
        appID: 'wxb6947ead7fe5b0df',
        appSecret: 'db9c8bffb60da0479ab35960676d9f6f',
        token: 'xiaobing',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function(data) {
        	data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file, data)
        }

    }
}

var app = new koa()

app.use(wechat(config.wechat))

app.listen(80)

console.log('listening: 80')
