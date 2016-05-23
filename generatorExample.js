

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


var koa = require('koa');
var app = koa();

// x-response-time
// koa 的use就是将generator函数push到了中间件数组当中去了。
app.use(function *(next){
  var start = new Date;
  //console.log('execute x-response-time before')
  //console.log(next)
  console.log('before x-response-time, this.body is ',this.body)
  yield next;
  //console.log(next)
  console.log('after x-response-time, this.body is ',this.body)
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
  //console.log('execute x-response-time after')
});

// logger
app.use(function *(next){
  var start = new Date;
  //console.log('execute log before')
  //console.log(next)
  console.log('before logger this.body is', this.body)
  yield next;
  //console.log(next)
  console.log('after logger this.body is', this.body)
  var ms = new Date - start;
  //console.log('execute log after %s %s - %s', this.method, this.url, ms);

});

// response

app.use(function *(){
  //console.log('execute body')
  this.body = 'Hello World';
  console.log('current this.body is ', this.body)
});

app.listen(3000);
console.log('listen to 3000')

