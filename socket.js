"use strict";

module.exports = function(io, streams) {    
 io.on('connection', function(client) {
 	 //client refers to the user socket which just connected. in this case it cound be cammera from the sites or the control center itself
    console.log('-- ' + client.id + ' joined --');
    client.emit('id', client.id);

    client.on('message', function (details) {

      var otherClient = io.sockets.connected[details.to];
      console.log(client.id + " sending init to : " + details.to)

      if (!otherClient) {
        return;
      }

    
        delete details.to;
      
        details.from = client.id;
        otherClient.emit('message', details);
    });
      
    /*client.on('readyToStream', function(options) {
      console.log('-- ' + client.id + ' is ready to stream --');      
      streams.addStream(client.id, options.name); 
    });*/

    //gets te control to join a room
    client.on("control join",function(control,cb){
    	client.join(control.control);//control.joins a roo
    	cb(control);
    })

    client.on('readyToStream', function(options,cb) {
      console.log('-- ' + client.id + ' is ready to stream --');
      //search database to see which control this client belong to.
      streams.addStream(client.id, options.name, options.controlId);
      client.join(options.controlId); //create a room for common sites using one control.
      //io.sockets.to(options.controlId).emit("new stream added",{message:"new stream",controlId:options.controlId});
      cb({controlId:options.controlId})
    });

    client.on("init reload",function(data){
    	io.sockets.to(data.controlId).emit("reload streams",{status:true})
    })
    
    client.on('update', function(options) {
      streams.update(client.id, options.name);
    });

    client.on('remove btn',function(data){     
      streams.removeStreamByName(data.streamName,data.controlId);
      io.sockets.to(data.controlId).emit("update btn",{btnName: data.streamName})
    })

    function leave(data) {
      console.log('-- ' + client.id + ' left --');
      streams.removeStream(client.id);
      io.sockets.to(data.controlId).emit("reload streams",{status:true})
    }



    client.on('disconnect', leave);
    client.on('leave', leave);
  });
}

