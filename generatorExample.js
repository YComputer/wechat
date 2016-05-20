

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

app.use(function *(next){
  var start = new Date;
  console.log('execute x-response-time before')
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
  console.log('execute x-response-time after')
});

// logger
app.use(function *(next){
  var start = new Date;
  console.log('execute log before')
  yield next;
  var ms = new Date - start;
  console.log('execute log after %s %s - %s', this.method, this.url, ms);

});

// response

app.use(function *(){
  console.log('execute body')
  this.body = 'Hello World';
});

app.listen(3000);
console.log('listen to 3000')

