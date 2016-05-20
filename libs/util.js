'use strict'

var fs = require('fs')
var Promise = require('bluebird')

exports.readFileAsync = function(fpath, encoding){
	return new Promise(function(reslove, reject){
		fs.readFile(fpath, encoding, function(err, content){
			if(err){
				console.log('read token err---', err)
				reject(err)
			}else{
				// 当前的代码有问题，会调用两次renad token。还没有查清楚怎么回事。
				// console.log('read token content---', content)
				reslove(content)
			}
		})
	})
}

exports.writeFileAsync = function(fpath, content){
	return new Promise(function(reslove, reject){
		fs.writeFile(fpath, content, function(err){
			if(err){
				reject(err)
			}else{
				reslove()
			}
		})
	})
}