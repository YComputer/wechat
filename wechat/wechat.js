'use strict'


var Promise = require('bluebird')
var _ = require('lodash')
var request = Promise.promisify(require('request'))
var util = require('./util')
var fs = require('fs')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/'
var semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?'
var api = {
    accessToken: prefix + 'token?grant_type=client_credential',
    temporary: {
        upload: prefix + 'media/upload?',
        fetch: prefix + 'media/get?'
    },
    permanent: {
        upload: prefix + 'material/add_material?',
        fetch: prefix + 'material/get_material?',
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'media/uploadimg?',
        del: prefix + 'material/del_material?',
        update: prefix + 'material/update_news?',
        count: prefix + 'material/get_materialcount?',
        batch: prefix + 'material/batchget_material?'
    },
    tag: {
        create: prefix + 'tags/create?',
        get: prefix + 'tags/get?',
        getUserTags: prefix + 'tags/getidlist?',
        update: prefix + 'tags/update?',
        delete: prefix + 'tags/delete?'
    },
    user: {
        remark: prefix + 'user/info/updateremark?',
        getInfo: prefix + 'user/info?',
        batchGetInfo: prefix + 'user/info/batchget?',
        list: prefix + 'user/get?'
    },
    mass: {
        tag: prefix + 'message/mass/sendall?'
    },
    menu: {
        create: prefix + 'menu/create?',
        get: prefix + 'menu/get?',
        delete: prefix + 'menu/delete?',
        current: prefix + 'get_current_selfmenu_info?'
    },
    qrcode: {
        create: prefix + 'qrcode/create?',
        show: mpPrefix + 'showqrcode?'
    },
    shortUrl:{
        create: prefixe + 'shorturl?'
    },
    semanticUrl:semanticUrl
}

function Wechat(opts) {
    //var that = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.fetchAccessToken()
    console.log(this.fetchAccessToken())
}

Wechat.prototype.fetchAccessToken = function() {
    var that = this

    if (this.access_token && this.expires_in) {
        if (this.isValidAccessToken(this)) {
            return Promise.resolve(this)
        }
    }

    this.getAccessToken()
        .then(function(data) {
            try {
                data = JSON.parse(data)
            } catch (e) {
                return that.updateAccessToken()
            }

            if (that.isValidAccessToken(data)) {
                return Promise.resolve(data)
            } else {
                return that.updateAccessToken()
            }
        })
        .then(function(data) {
            that.access_token = data.access_token
            that.expires_in = data.expires_in
            that.saveAccessToken(data)
            return Promise.resolve(data)
        })
}

Wechat.prototype.isValidAccessToken = function(data) {
    if (!data || !data.access_token || !data.expires_in) {
        return false
    }

    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if (now < expires_in) {
        return true
    } else {
        return false
    }
}

Wechat.prototype.updateAccessToken = function() {
    var appID = this.appID
    var appSecret = this.appSecret
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret

    console.log('tokenurl---', url)

    return new Promise(function(resolve, reject) {
        request({ url: url, json: true }).then(function(response) {
            console.log('token-response', response.body)
            var data = response.body
            var now = (new Date().getTime())
            console.log('now----', now)
            var expires_in = now + (data.expires_in - 20) * 1000
            console.log('data.expires_in----', data.expires_in)
            console.log('expires_in----', expires_in)
            data.expires_in = expires_in
            resolve(data)

        })

    })
}

Wechat.prototype.uploadMaterial = function(type, material, permanent) {
    var that = this
    var form = {}
    var uploadUrl = api.temporary.upload

    if (permanent) {
        uploadUrl = api.permanent.upload
        _.extend(form, permanent)
    }

    if (type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic
    }

    if (type === 'news') {
        uploadUrl = api.permanent.uploadNews
        form = material
    } else {
        form.media = fs.createReadStream(material)
    }

    // var appID = this.appID
    // var appSecret = this.appSecret
    // console.log('tokenurl---', url)

    return new Promise(function(resolve, reject) {
    //var that = this
        console.log('==========',that.fetchAccessToken())
        that.fetchAccessToken()
            .then(function(data) {
                var url = uploadUrl + 'access_token=' + data.access_token
                if (!permanent) {
                    url += '&type=' + type
                } else {
                    form.access_token = data.access_token
                }

                var options = {
                    method: 'POST',
                    url: url,
                    json: true
                }

                if (type === 'news') {
                    options.body = form
                } else {
                    options.formData = form
                }

                request(options).then(function(response) {
                    console.log('token-response', response.body)
                    var _data = response.body

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Upload material failed')
                    }

                }).catch(function(err) {
                    reject(err)
                })

            })

    })
}

Wechat.prototype.fetchMaterial = function(mediaId, type, permanent) {
    var that = this
    var fetchUrl = api.temporary.fetch

    if (permanent) {
        fetchUrl = api.permanent.fetch
    }

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = fetchUrl + 'access_token=' + data.access_token
                var form = {}
                var options = { method: 'POST', url: url, json: true }
                if (permanent) {
                    form.media_id = mediaId,
                        form.access_token = data.access_token
                    options.body = form
                } else {
                    if (type === 'video') {
                        url = url.replace('https://', 'http://')
                    }
                    url += '&media_id=' + mediaId
                }

                if (type === 'news' || type === 'video') {
                    request(options).then(function(response) {
                        var _data = response.body

                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('fetch material failed')
                        }

                    }).catch(function(err) {
                        reject(err)
                    })
                } else {
                    resolve(url)
                }

            })

    })
}

Wechat.prototype.deleteMaterial = function(mediaId) {
    var that = this
    var form = {
        media_id: mediaId
    }

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.permanent.del + 'access_token=' + data.access_token +
                    '&media_id=' + mediaId

                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function(response) {
                    var _data = response.body

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Delete material failed')
                    }

                }).catch(function(err) {
                    reject(err)
                })
            })
    })
}

Wechat.prototype.updateMaterial = function(mediaId, news) {
    var that = this
    var form = {
        media_id: mediaId
    }

    _.extend(form, news)

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.permanent.update + 'access_token=' + data.access_token +
                    '&media_id=' + mediaId

                request({
                    method: 'POST',
                    url: url,
                    body: form,
                    json: true
                }).then(function(response) {
                    var _data = response.body

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Delete material failed')
                    }

                }).catch(function(err) {
                    reject(err)
                })
            })
    })
}

Wechat.prototype.countMaterial = function() {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.permanent.count + 'access_token=' + data.access_token

                request({
                    method: 'GET',
                    url: url,
                    json: true
                }).then(function(response) {
                    var _data = response.body

                    if (_data) {
                        resolve(_data)
                    } else {
                        throw new Error('Count material failed')
                    }

                }).catch(function(err) {
                    reject(err)
                })
            })
    })
}

Wechat.prototype.batchMaterial = function(options) {
    var that = this

    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 1



    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.permanent.batch + 'access_token=' + data.access_token

                request({ method: 'POST', url: url, body: options, json: true })
                    .then(function(response) {
                        var _data = response.body

                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Batch material failed')
                        }

                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.createTag = function(name) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.tag.create + 'access_token=' + data.access_token

                var options = {
                    tag: {
                        name: name
                    }
                }

                request({ method: 'POST', url: url, body: options, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Create Tag failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.getTags = function() {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.tag.get + 'access_token=' + data.access_token

                request({ url: url, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Get Tag failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.getUserTags = function(userOpenid) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.tag.getUserTags + 'access_token=' + data.access_token

                var options = {
                    openid: userOpenid
                }

                request({ method: 'POST', url: url, body: options, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Get User Tags failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.updateTag = function(id, name) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.tag.update + 'access_token=' + data.access_token

                var options = {
                    tag: {
                        id: id,
                        name: name
                    }
                }

                request({ method: 'POST', url: url, body: options, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Update Tag failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.deleteTag = function(id) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.tag.delete + 'access_token=' + data.access_token

                var options = {
                    tag: {
                        id: id
                    }
                }

                request({ method: 'POST', url: url, body: options, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Delete Tag failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.remarkUser = function(userOpenid, remark) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.user.remark + 'access_token=' + data.access_token

                var options = {
                    openid: userOpenid,
                    remark: remark
                }

                request({ method: 'POST', url: url, body: options, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Remark user  failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.getUsers = function(userOpenids, lang) {
    var that = this
    lang = lang || 'zh_CN'
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var options = {
                    json: true
                }
                if (_.isArray(userOpenids)) {
                    options.url = api.user.batchGetInfo + 'access_token=' + data.access_token
                    options.body = {
                        user_list: userOpenids
                    }
                    options.method = 'POST'
                } else {
                    options.url = api.user.getInfo + 'access_token=' + data.access_token +
                        '&openid=' + userOpenids + '&lang=' + lang
                }

                request(options)
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('getUsers failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.listUsers = function(userOpenid) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.user.list + 'access_token=' + data.access_token

                if(userOpenid){
                    url += '&next_openid=' + userOpenid
                }

                request({ method: 'GET', url: url, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('listUsers failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.sendByTag = function(type, message, tagId) {
    var that = this
    var msg = {
        filter: {},
        msgtype: type
    }

    msg[type] = type

    if(!tagId){
        msg.filter.is_to_all = true
    }else{
        msg.filter = {
            is_to_all: false,
            tag_id: tagId
        }
    }

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.mass.tag + 'access_token=' + data.access_token

                request({ method: 'POST', url: url, body: msg, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('sendByTag failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.createMenu = function(menu) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.create + 'access_token=' + data.access_token

                request({ method: 'POST', url: url, body: menu, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Create menu failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.getMenu = function() {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.get + 'access_token=' + data.access_token

                request({ method: 'GET', url: url, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Get menu failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.deleteMenu = function() {
    var that = this
    console.log('============',that)
    console.log('ready to deleteMenu',this.fetchAccessToken())

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.delete + 'access_token=' + data.access_token

                request({ method: 'GET', url: url, json: true })
                    .then(function(response) {
                        console.log('delete menu success!!!')
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Delete menu failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.getCurrentMenu = function() {
    var that = this
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.current + 'access_token=' + data.access_token

                request({ method: 'GET', url: url, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Get current menu failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.createQrcode = function(qr) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.qrcode.create + 'access_token=' + data.access_token

                request({ method: 'POST', url: url, body: qr, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Create qrcode failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.showQrcode = function(ticket) {
    return api.qrcode.show + 'ticket=' + encodeURI(ticket)
}

Wechat.prototype.createShorturl = function(action, url) {
    action = action || 'long2short'

    var that = this
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.shortUrl.create + 'access_token=' + data.access_token

                var form = {
                    action: action,
                    long_url:url
                }

                request({ method: 'POST', url: url, body: qr, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('Create shorturl failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.semantic = function(semanticData) {
    var that = this

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.semanticUrl + 'access_token=' + data.access_token

                semanticData.appid =data.appID
                request({ method: 'POST', url: url, body: semanticData, json: true })
                    .then(function(response) {
                        var _data = response.body
                        if (_data) {
                            resolve(_data)
                        } else {
                            throw new Error('semantic failed')
                        }
                    }).catch(function(err) {
                        reject(err)
                    })
            })
    })
}

Wechat.prototype.send = function() {
    var content = this.body
    var message = this.weixin
    var xml = util.tpl(content, message)

    this.status = 200
    this.type = 'application/xml'
    this.body = xml
}

module.exports = Wechat
