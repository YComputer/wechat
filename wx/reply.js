'use strict'

var path = require('path')
var config = require('../config')
var Wechat = require('../wechat/wechat')
var menu = require('./menu')
var wechatApi = new Wechat(config.wechat)

// wechatApi.deleteMenu().then(function(data){
//     return wechatApi.createMenu(menu)
// }).then(function(msg){
//     console.log('after createMenu-->',msg)
// })


exports.reply = function*(next) {
    var message = this.weixin

    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log('扫二维码进来：' + message.EventKey + ' ' + message.ticket)
            }

            this.body = '欢迎订阅 fooads\r\n' + ' 消息ID：' + message.MsgId + '请输入1查询订单，2查询余额，3进行充值'
        } else if (message.Event === 'unsubscribe') {
            //可以记录到数据库中查看取消订阅的用户信息
            console.log('取消关注')
            this.body = ''
        } else if (message.Event === 'LOCATION') {
            this.body = '你上报的位置是：' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
        } else if (message.Event === 'CLICK') {
            this.body = '你点击了菜单：' + message.EventKey
        } else if (message.Event === 'SCAN') {
            console.log('关注后扫描二维码' + message.EventKey + ' ' + message.Ticket)
            this.body = '确认你已经扫描了二维码'
        } else if (message.Event === 'VIEW') {
            this.body = '你点击了菜单中的连接：' + message.EventKey
        }else if (message.Event === 'scancode_push') {
            console.log(message.ScanCodeInfo.ScanType)
            console.log(message.ScanCodeInfo.ScanResult)
            this.body = '你点击了菜单中的连接：' + message.EventKey
        }else if (message.Event === 'scancode_waitmsg') {  
         console.log(message.ScanCodeInfo.ScanType)
            console.log(message.ScanCodeInfo.ScanResult)         
            this.body = '你点击了菜单中的连接：' + message.EventKey
        }else if (message.Event === 'pic_sysphoto') {
            console.log(message.PicList)
            console.log(message.Count)
            this.body = '你点击了菜单中的连接：' + message.EventKey
        }else if (message.Event === 'pic_photo_or_album') {
            console.log(message.PicList)
            console.log(message.Count)
            this.body = '你点击了菜单中的连接：' + message.EventKey
        }else if (message.Event === 'pic_weixin') {
            console.log(message.PicList)
            console.log(message.Count)
            this.body = '你点击了菜单中的连接：' + message.EventKey
        }else if (message.Event === 'location_select') {
            console.log(message.SendLocationInfo.Location_X)
            console.log(message.SendLocationInfo.Location_Y)
            console.log(message.SendLocationInfo.Scale)
            console.log(message.SendLocationInfo.Label)
            console.log(message.SendLocationInfo.Poiname)

            this.body = '你点击了菜单中的连接：' + message.EventKey
        }
    } else if (message.MsgType === 'text') {
        var content = message.Content
        var reply = '你说的 ' + message.Content + ' 太复杂了'

        if (content === '1') {
            reply = '你的订单正在处理中'
        } else if (content === '2') {
            reply = '你的余额为88888'
        } else if (content === '3') {
            reply = '请选择充值种类'
        } else if (content === '4') {
            reply = [{
                title: '图文的title',
                description: '图文的description',
                picurl: 'http://fooads.com/dist/img/people.png',
                url: 'http://fooads.com/'
            }, {
                title: '图文的title',
                description: '图文的description',
                picurl: 'http://fooads.com/dist/img/date.png',
                url: 'http://fooads.com/'
            }, {
                title: '图文的title',
                description: '图文的description',
                picurl: 'http://fooads.com/dist/img/data.png',
                url: 'http://fooads.com/'
            }]
        } else if (content === '5') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.png'))
            console.log('data---', data)
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
            console.log(reply)
        } else if (content === '6') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, '../video.mp4'))
            console.log('data---', data)
            reply = {
                type: 'video',
                title: '回复视频内容title',
                description: '这是视频描述',
                mediaId: data.media_id
            }
            console.log(reply)
        } else if (content === '7') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.png'))
            console.log('data---', data)
            reply = {
                type: 'music',
                title: '回复后的音乐title',
                description: '这是音乐描述',
                musicUrl: 'http://www.nodejs.org',
                thumbMediaId: data.media_id
            }
            console.log(reply)
        } else if (content === '8') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.png'), { type: 'image' })
            console.log('data---', data)
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
            console.log(reply)
        } else if (content === '9') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, '../video.mp4'), { type: 'video', description: '{"title":"nice place","introduction":"just do it"}' })
            console.log('data---', data)
            reply = {
                type: 'video',
                title: '回复视频内容title',
                description: '这是视频描述',
                mediaId: data.media_id
            }
            console.log(reply)
        } else if (content === '10') {
            var picData = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../2.png'), {})

            var media = {
                    articles: [{
                        title: 'tututu',
                        thumb_media_id: picData.media_id,
                        author: 'xiaobing',
                        digest: '摘要',
                        show_cover_pic: 1,
                        content: 'zheshineirong',
                        content_source_url: 'http://www.baidu.com'
                    }, {
                        title: 'tututu2',
                        thumb_media_id: picData.media_id,
                        author: 'xiaobing',
                        digest: '摘要',
                        show_cover_pic: 1,
                        content: 'zheshineirong',
                        content_source_url: 'http://www.baidu.com'
                    }]
                }
                // 这里没有var来定义对吗？
            var data = yield wechatApi.uploadMaterial('news', media, {})
            var data = yield wechatApi.fetchMaterial(data.media_id, 'news', {})

            console.log('data--->', data)

            var items = data.news_item
            var news = []

            items.forEach(function(item) {
                news.push({
                    title: item.title,
                    description: item.digest,
                    picUrl: picData.url,
                    url: item.url
                })
            })

            reply = news

        } else if (content === '11') {
            // 这个接口调用好像有问题总是报 reach max api daily quota limit
            var counts = yield wechatApi.countMaterial()

            console.log(JSON.stringify(counts))

            var results = yield [
                wechatApi.batchMaterial({
                    type: 'image',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'video',
                    offset: 0,
                    count: 10
                }),
                wechatApi.batchMaterial({
                    type: 'voice',
                    offset: 0,
                    count: 10
                }), wechatApi.batchMaterial({
                    type: 'news',
                    offset: 0,
                    count: 10
                })
            ]
            console.log(JSON.stringify(results))

            reply = '1'
        } else if (content === '12') {
            var tag = yield wechatApi.createTag('非常忠实用户')
            console.log('新添加的标签为：', tag)

            var tags = yield wechatApi.getTags()
            console.log('所有的标签', tags)

            var userTags = yield wechatApi.getUserTags(message.FromUserName)
            console.log(message.FromUserName + '的标签为：', userTags)

            reply = '标签查询完毕'
        } else if (content === '13') {
            var user = yield wechatApi.getUsers(message.FromUserName)
            console.log('users--', user)

            var openIds = [{
                openid: message.FromUserName,
                lang: 'en'
            }]

            var users = yield wechatApi.getUsers(openIds)
            console.log('users--', users)

            reply = JSON.stringify(user)
        } else if (content === '14') {
            var userList = yield wechatApi.listUsers()
            console.log(userList)

            reply = userList.total

        } else if (content === '15') {
            var mpnews = {
                media_id: 'RnvccWa8PMqXRUuLNZcAThqaGLi_SZdYFqpWne6zD58'
            }

            var text = {
                'content': 'Hello ......'
            }

            //var msgData = yield wechatApi.sendByTag('mpnews',media_id, 100)
            var msgData = yield wechatApi.sendByTag('text',text, 100)

            console.log(msgData)
            reply = 'Yeah'
        }else if (content === '16') {

        }else if (content === '17') {

        }else if (content === '18') {

        }

        this.body = reply
    }

    yield next
}
