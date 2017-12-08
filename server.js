"use strict";
var express = require('express'),      
  db = require('./model'),
  config = require('./config'),    
  route = require('./route'),
  signupRoute = require('./signup'),
  loginRoute = require('./login'),  
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  streams = require('./streams.js')(),
 
  mySocket = require("./socket"),
  port = process.env.PORT || 8080;

http.listen(port,function(){
    console.log('listening on *:' + port);
});

config.configuration(app);
signupRoute(db);
console.log("it happened")
loginRoute(db,streams);
route(db,streams); 
mySocket(io,streams);


      
    