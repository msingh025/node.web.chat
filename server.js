
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var CONFIG = require('./core/config');
var express = require('express');
var route = require('./lib/routes')({});
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var socketsClient = [];
    path = require('path'),
    static = require('node-static');
var url = require('url');
app.use(busboy()); 
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(__dirname));

var params = {io:io};
app.get('/', function (req, res){
	params['socketsClient'] = socketsClient;
	route.action(req, res,'/home', params);
});
app.post('/logout', function (req, res) {
	params['socketsClient'] = socketsClient;
	route.action(req, res,'/logout',params);
});
app.post('/login', function (req, res) {
	params['socketsClient'] = socketsClient;
	route.action(req, res,'/login', params);
});
app.post('/register', function (req, res) {
	params['socketsClient'] = socketsClient;
	route.action(req, res,'/register', params);
});
app.post('/userlist', function (req, res) {
	params['socketsClient'] = socketsClient;
	route.action(req, res,'/userlist', params);
});
app.post('/upload', function (req, res, next) {
	params['socketsClient'] = socketsClient;
	route.action(req, res,'/upload', params);
});
app.get('/download/:file', function (req, res) {
	route.action(req, res,'/download', params);
});
app.post('/message', function (req, res) {
	params['socketsClient'] = socketsClient;
	route.action(req, res,'/message', params);
});
io.sockets.on('connection', function (socket) {
	   socket.on('hello', function(data, id,messageType,to, cb){ 
		   var len = socketsClient.length;
		   for(var i=0; i<len; i++){
			   if(socketsClient[i].user ==to){
				 io.to(socketsClient[i].id).emit('message', data,id,messageType, to);
				 break;
			   }
			   }
		   var modelmessage = route.getModel('message');
		   modelmessage.insert(to, id,data,messageType);
	  });
	   socket.on('updatelist',function(userName, cb){
		   var len = socketsClient.length;
		   for(var i=0; i<len; i++){
		    	 if(socketsClient[i].user ==userName){
		    		 var idclient = socketsClient[i].id;
		    		 socketsClient.splice(i,1);
		    		 break;
		    	 }
		     }
		   socketsClient.push({'user':userName,'id':socket.id,'login':true});
		   cb(socketsClient);
	   });
	   socket.on('disconnect', function () {
		     var len = socketsClient.length;
		     for(var i=0; i<len; i++){
		    	 if(socketsClient[i].id ==socket.id){
		    		 socketsClient.splice(i,1);
		    		 break;
		    	 }
		     }
		  });
});
http.listen(CONFIG['PORT'], function () {
     console.log('host:=> localhost port=>'+CONFIG['PORT']);
});
