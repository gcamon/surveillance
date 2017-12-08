"use strict";
var uuid = require('node-uuid');
var config = require("./config");
var router = config.router;

module.exports = function(db) {

	router.post("/signup",function(req,res){ 	

	   var message = '';
	   if(req.method == "POST"){
	   		
	   		var control_id = uuid.v1();
				var controlURL = req.hostname + "/" + control_id;	     
	      

        
        req.body.control_id = control_id;
        req.body.control_url = controlURL;

	      
	      db.query('INSERT INTO controls4 SET ?', req.body, function(err, result) {	
          if(err) throw err;
          if(result) {
  	         message = "Succesfully! Your account has been created.";
  	         res.render('signup.ejs',{message: message});
             //db.end();
          } else {
            res.end("error occured")
          }
          
	      });	 
	   } else {
	      res.render('signup',{message:""});
	   }

	});

}

//_id control_id control_name username password email address date control_url
 
/*

CREATE TABLE IF NOT EXISTS `controls4` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `control_name` text NOT NULL,
  `control_id` varchar(50) NOT NULL,
  `user_name` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `control_url` varchar(50) NOT NULL,
  `date_created` DATE,
  CONSTRAINT unique_id PRIMARY KEY (`id`)
);






CREATE TABLE controls (_id INT(11) NOT NULL AUTOINCREMENT, name VARCHAR(20), owner VARCHAR(20), addres VARCHAR(20), 
control_id VARCHAR(50), date_created DATE, CONSTRAINT unique_id PRIMARY KEY (_id));


INSERT INTO controls VALUES('{"control_name": "", "control_id": "","stream_list":[]}');


CREATE TABLE IF NOT EXISTS `controls` (
  `_id` int(5) NOT NULL AUTO_INCREMENT,
  `control_name` text NOT NULL,
  `address` text NOT NULL,
  `control_id` int(11) NOT NULL,
  `user_name` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `control_url` varchar(50) NOT NULL,
  `date_created` DATE,
  CONSTRAINT unique_id PRIMARY KEY (`_id`));
);






	message = '';
   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
      var fname= post.first_name;
      var lname= post.last_name;
      var mob= post.mob_no;
 
      var sql = "INSERT INTO `users`(`first_name`,`last_name`,`mob_no`,`user_name`, `password`) VALUES ('" + fname + "','" + lname + "','" + mob + "','" + name + "','" + pass + "')";
 
      var query = db.query(sql, function(err, result) {
 
         message = "Succesfully! Your account has been created.";
         res.render('signup.ejs',{message: message});
      });
 
   } else {
      res.render('signup');
   }
*/