'use strict';
/*
Database name 'webrtcsurveillanceDB'

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

CREATE TABLE IF NOT EXISTS `files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fieldname` text NOT NULL,
  `originaname` varchar(100) NOT NULL,
  `mimetype` varchar(100) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `filename` varchar(100) NOT NULL,
  `path` varchar(100) NOT NULL,
  `url` varchar(100) NOT NULL,
);


*/

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'obinna',
  password : 'gcamon',
  database : 'webrtcsurveillanceDB',
  multipleStatements: true
});



connection.connect(function(err){
	if(!err) {
	   console.log("Database is connected ... nn");    
	} else {
		console.log(err)
	   console.log("Error connecting database ... nn"); 
	}
});


module.exports = connection;












