var PeerManager = (function (name) {
  this.name = name;
  var localId,
  config = {
    peerConnectionConfig: {
      iceServers: [
        {"url": "stun:23.21.150.121"},
        {"url": "stun:stun.l.google.com:19302"}
      ]
    },
    peerConnectionConstraints: {
      optional: [
        {"DtlsSrtpKeyAgreement": true}
      ]
    }
  },
  peerDatabase = {},
  localStream,
  remoteVideoContainer = document.getElementById('remoteVideosContainer'),
  localV = document.getElementById("localV"),
  
  
 
  socket = io();
  
  socket.on('message', handleMessage);
  socket.on('id', function(id) {
    localId = id;
  });
    

  
 
  //if peer does not exist yet, this function will create peer below otherwise peer will be retreived fron 'peerDatabase' where existin
  //peer are kept. The remark where this happened in "jj".
  function addPeer(remoteId,name) {
    var peer = new Peer(config.peerConnectionConfig, config.peerConnectionConstraints, name);
   
    peer.pc.onicecandidate = function(event) {
      if (event.candidate) {
        send('candidate', remoteId, {
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        });
      }
    };
    peer.pc.onaddstream = function(event) {
      attachMediaStream(peer.remoteVideoEl, event.stream);
      remoteVideosContainer.appendChild(peer.innerDiv);      
    };
    peer.pc.onremovestream = function(event) {
      peer.remoteVideoEl.src = '';
      remoteVideosContainer.removeChild(peer.innerDiv);
    };
    peer.pc.oniceconnectionstatechange = function(event) {
      switch(
      (  event.srcElement // Chrome
      || event.target   ) // Firefox
      .iceConnectionState) {
        case 'disconnected':
          //remoteVideoContainer.removeChild(peer.remoteVideoEl);
          break;
      }
    };
    peerDatabase[remoteId] = peer;
        
    return peer;
  }

  function answer(remoteId) {
    var pc = peerDatabase[remoteId].pc;
    pc.createAnswer(
      function(sessionDescription) {
        pc.setLocalDescription(sessionDescription);
        send('answer', remoteId, sessionDescription);
      }, 
      error
    );
  }

  function offer(remoteId) {
    var pc = peerDatabase[remoteId].pc;
    pc.createOffer(
      function(sessionDescription) {
        pc.setLocalDescription(sessionDescription);
        send('offer', remoteId, sessionDescription);
      }, 
      error
    );
  }

  function handleMessage(message) {
    var type = message.type,
        from = message.from,
        pc = (peerDatabase[from] || addPeer(from)).pc;
        console.log(peerDatabase[from])

    console.log('received ' + type + ' from ' + from);
  
    switch (type) {
      case 'init':
        toggleLocalStream(pc);
        offer(from);
        break;
      case 'offer':
        pc.setRemoteDescription(new RTCSessionDescription(message.payload), function(){}, error);
        answer(from);
        break;
      case 'answer':
        pc.setRemoteDescription(new RTCSessionDescription(message.payload), function(){}, error);
        break;
      case 'candidate':
        if(pc.remoteDescription) {
          pc.addIceCandidate(new RTCIceCandidate({
            sdpMLineIndex: message.payload.label,
            sdpMid: message.payload.id,
            candidate: message.payload.candidate
          }), function(){}, error);
        }
        break;
    }
  }

  function send(type, to, payload) {
    console.log('sending ' + type + ' to ' + to);
    socket.emit('message', {
      to: to,
      type: type,
      payload: payload
    });
  }

  function toggleLocalStream(pc) {
    if(localStream) {     
      (!!pc.getLocalStreams().length) ? pc.removeStream(localStream) : pc.addStream(localStream);
    }

  }

  function error(err){
    console.log(err);
  }

  return {
    name : name,
    getId: function() {
      return localId;
    },
    
    setLocalStream: function(stream) {
      // if local cam has been stopped, remove it from all outgoing streams.
      //this will be advace to enable a stream be remove from the remote control streams.
      if(!stream) {
        for(id in peerDatabase) {
          var pc = peerDatabase[id].pc;
          if(!!pc.getLocalStreams().length) {
            pc.removeStream(localStream);
            offer(id);
          }
        }
      } 

      localStream = stream;  
    }, 

    toggleLocalStream: function(remoteId) {
      peer = peerDatabase[remoteId] || addPeer(remoteId); //"jj"
      toggleLocalStream(peer.pc);
    },
    
    peerInit: function(remoteId,name,cb) {
      //set peer stream to remote id it belongs to or create a remote for it.
      peer = peerDatabase[remoteId] || addPeer(remoteId,name); //'jj'
      send('init', remoteId, null);
      cb()
    },

    peerRenegociate: function(remoteId) {
      offer(remoteId);
    },

    send: function(type, payload) {
      socket.emit(type, payload,function(data){
        socket.emit("init reload",{controlId:data.controlId,message:"from site init"});
      });
    },

    ResetCam: function(event,payload) {
      socket.emit(event,payload);
    },

    controlJoin: function(controlId) {
      socket.emit("control join",{control:controlId},function(data){
      })
    },
   
    getSocketForController: function() {
      return socket;
    },
    removeButton : function(name,id) {
      socket.emit('remove btn',{streamName: name,controlId: id})
    }
  };
  
});

var Peer = function (pcConfig, pcConstraints,name) {
  this.name = name //refers to the remote user name
  this.pc = new RTCPeerConnection(pcConfig, pcConstraints);
  this.remoteVideoEl = document.createElement('video');
 
 
  this.remoteVideoEl.controls = true;
  this.remoteVideoEl.autoplay = true;
  this.captionElement = document.createElement('h6');
  
 
  this.captionElement.innerHTML += "Live: " + this.name;
  this.captionElement.style.padding = "5px";
  this.captionElement.style.backgroundColor = "rgba(0,0,0,0.4)";
  this.captionElement.style.color = "#fff";
  this.captionElement.style.textAlign = "center";

  this.innerDiv = document.createElement("div");
  this.innerDiv.style.display = "inline-block";
  this.innerDiv.style.marginLeft = "2px";
  this.innerDiv.append(this.captionElement);
  this.innerDiv.append(this.remoteVideoEl);

}

