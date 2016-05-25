

// var gen = function* (n){
// 	for(i = 0; i<3; i++){
// 		n++

// 		yield n
// 	}
// }

// var genObj = gen(2)

// console.log(genObj.next())
// console.log(genObj.next())
// console.log(genObj.next())
// console.log(genObj.next())

var getRawBody = require('raw-body')
var koa = require('koa');
var app = koa();

function getData (str){
  return str
}


// x-response-time
// koa 的use就是将generator函数push到了中间件数组当中去了。
app.use(function *(next){
  var start = new Date;
  // console.log('execute x-response-time before')
  // console.log(next)
  // console.log('before x-response-time, this.body is ',this.body)
  var data1 = yield getRawBody(this.req, { length: this.length, limit: '1mb', encoding: this.charset})

  yield next;

  console.log('data1--->',data1.toString())
  // console.log(next)
  // console.log('after x-response-time, this.body is ',this.body)
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
  // console.log('execute x-response-time after')
});

// logger
app.use(function *(next){
  var start = new Date;
  console.log('execute log before')
  console.log(next)
  console.log('before logger this.body is', this.body)
  yield next;
  // var data2 = yield function(){
  //   return '2'
  // }
  // console.log('data2',data2)
  console.log(next)
  console.log('after logger this.body is', this.body)
  var ms = new Date - start;
  console.log('execute log after %s %s - %s', this.method, this.url, ms);
});

// response
app.use(function *(){
  console.log('before execute body')
  this.body = 'Hello World';
  console.log('after execute body', this.body)
});

app.listen(3000);
console.log('listen to 3000')

