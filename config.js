'use strict';
var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var router = express.Router();
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');

var configuration = function (app) {
  //config 

	app.use('/assets',express.static(__dirname + '/public'));
	app.use(session({
	  secret: 'keyboard cat',
	  resave: true,	  
	  saveUninitialized: true,
	  cookie: {
	  	httpOnly: true, 
	  	path: "/",
	  	//maxAge: 3600000 * 72,
	  } //secure: true will be set on the cookie when i this site is on https
	}));

	//app.use(passport.initialize());
	//app.use(passport.session());
	app.use(flash());		
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	//app.use(multer({dest: './uploads'}).any());
	
	
	/*app.use(function(req,res,next){
		if(req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === "http") {
		  res.redirect("https://" + req.headers.host + req.url);
		} else {
			next();
		}		
	});*/

	/*passport.serializeUser(function(user, done) {    
    	done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {			
		model.user.findById(id, function(err, user) {
			done(err, user);
		});
	});*/

	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');

	app.use('/',router);

}

module.exports = {
  configuration: configuration,
  router: router,
  //passport: passport	
}