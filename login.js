"use strict";

var config = require("./config");
var router = config.router;

module.exports = function(db,streams) {	
	router.post("/login",function(req,res){
		var message = "";
		if(req.method == 'POST'){
			

		
			var sql = "SELECT * FROM controls4 WHERE password = " +
			 db.escape(req.body.password) + " and user_name" + " = " + db.escape(req.body.user_name);
			                    
      db.query(sql,function(err, results){
      	console.log(results) 
       if(err) throw err;  
          
       if(results.length){
          req.session.userId = results[0]._id;
          req.session.user = results[0];
          console.log(req.session);
          res.redirect("/control");
          //db.end();
       }

       else{
          message = 'Wrong Credentials.';
          res.render('login',{message: message});
       }

     });
    
		} else {			
       res.render('login',{message:message});
		}
	});

	router.get("/control",function(req,res){
		if(req.session.user) {
	  	var id = req.session.user.control_id;
	  	streams.addControl(id)
	  	res.render("centeral",{user:req.session.user});
  	} else {
  		res.redirect("/login")
  	}
  });

	 router.get('/logout',function(req,res) {
	  req.logout();
	  res.redirect('/login');
	});
}




/*var message = '';
   var sess = req.session; 
 
   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
     
      var sql="SELECT id, first_name, last_name, user_name FROM `users` WHERE `user_name`='"+name+"' and password = '"+pass+"'";                           
      db.query(sql, function(err, results){      
         if(results.length){
            req.session.userId = results[0].id;
            req.session.user = results[0];
            console.log(results[0].id);
            res.redirect('/home/dashboard');
         }
         else{
            message = 'Wrong Credentials.';
            res.render('index.ejs',{message: message});
         }
                 
      });
   } else {
      res.render('index.ejs',{message: message});
   }         
};*/