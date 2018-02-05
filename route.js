'use strict';
var path = require('path');
var route = require('./config');
var router = route.router;
var fs = require("fs");


module.exports = function (db,streams) {

  router.get("/",function(req,res){
    res.render('index');
  });

  router.get("/signup",function(req,res){
  	res.render('signup',{message:""});
  });

  router.get("/login",function(req,res){
  	res.render("login",{message:""})
  });

  router.post("/addrecord",function(req,res){
  	console.log(req.body);

  	db.query('INSERT INTO files SET ?', req.body, function(err, result) {	
      if(err) throw err;
	      if(result) {
		      res.send({status: "success"})   
	         //db.end();
	      } else {
	        res.end("error occured")
	      }      
      });  	
  });
 
  router.get("/cam/:controlId",function(req,res){
  	var sql = "SELECT * FROM controls4 WHERE control_id = " +
		db.escape(req.params.controlId);
		db.query(sql,function(err,result){		
			if(err) throw err;
			if(result) {
				if(result.length > 0) {
					res.render("site",{details: result});
				} else {
					res.render("error",{details:"Oops! It seems this control does not exist in our database."})
				}
			} else {
				res.end({status: "Control not found."})
			}
		})
  	
  });

  //sites getting their local streams
  router.get("/site/streams.json/:controlId",function(req,res){
  	var sql = "SELECT * FROM controls4 WHERE control_id = " +
		db.escape(req.params.controlId);
		db.query(sql,function(err,result){
			if(err) throw err;
			if(result)
				if(result.length > 0) {
					var streamList = streams.getStreamToControl(req.params.controlId);
					if(streamList) {
						var data = (JSON.parse(JSON.stringify(streamList)));    
		    		res.status(200).json(data);
	    		} else {
	    			res.send({status: "Control not available as at this time."});
	    		}
				} else {
					res.send({status:"control does not exist."});
				}
		})
  });
  //control getting streams from sites they control.
  router.get('/streams.json',function(req,res){
	   if(req.session.user) {
	  	var streamList = streams.getStreamToControl(req.session.user.control_id);//streams.getStreams();
	    var data = (JSON.parse(JSON.stringify(streamList)));    
	    res.status(200).json(data);
	   } else {
	   	res.end("Please login before you can access streams.")
	   }
  });

  router.get("/logout",function(req,res){
  	res.redirect("/")
  })

}



//central control must be on for stream to work
