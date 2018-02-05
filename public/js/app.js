(function(){
	var app = angular.module('rtcSurveillance', ["ngRoute"],
		function($locationProvider){$locationProvider.html5Mode(true);}
    );

	var client = {};
	var peer;
	var date;
	var dateFilter;

	client.allsources = [];
	/*var mediaConfig = {
        audio:true,
        video: {
			mandatory: {},
			optional: []
        }
    };*/

	//var videoElement = document.querySelector('video');
	//var audioSelect = document.querySelector('select#audioSource');
	//var videoSelect = document.querySelector('select#videoSource');

	var allCameraStream = [];

	function captureAllCameras(callback) {
    var streams = [];
    var donotDuplicateDevices = {};
    DetectRTC.videoInputDevices.forEach(function(device, idx) {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                mandatory: {},
                optional: [{
                    sourceId: device.id
                }]
            }
        }).then(function(stream) {
            if (!donotDuplicateDevices[device.id]) {
                donotDuplicateDevices[device.id] = true;
                // on-video-render:
                // called as soon as this video stream is drawn (painted or recorded) on canvas2d surface
                
                streams.push(stream);
            }
            allCameraStreams.push(stream);

            if (idx == DetectRTC.videoInputDevices.length - 1) {
                callback(streams);
            }
        }).catch(function() {
            console.error(arguments);
        });
    })
}




	client.constraintsList = [];
	client.camCount = 1;


	var recorder;

	function createPeer() {
		peer = new PeerManager(name);		
	}

	function postFiles() {
		var blob = recorder.getBlob();
		console.log(blob)
		var fileName = getRandomString() + "-" + client.getStreamName + ".webm"; //getRandomString()
		console.log(fileName);

		var file = new File([blob], fileName, {
       type: 'video/webm'
    });    

    //send the file to local machine for storage;
    xhr('http://localhost:4000/uploadFile', file, function(response) {
     	saveRecord(response);
    });
	}

	function saveRecord(data) {
		/*xhr("/addrecord", response, function(feedback){
   		consosle.log(response)
   		alert("Recorded video stream saved!");
   	})*/

   	var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
          if (request.readyState == 4 && request.status == 200) {
              //callback(request.responseText);
              console.log(request.responseText);
          }
      };
              
      /*request.upload.onprogress = function(event) {
          progressBar.max = event.total;
          progressBar.value = event.loaded;
          progressBar.innerHTML = 'Upload Progress ' + Math.round(event.loaded / event.total * 100) + "%";
      };
              
      request.upload.onload = function() {
          percentage.style.display = 'none';
          progressBar.style.display = 'none';
      };*/
      request.open('POST', "/addrecord");
     
      request.send(data);
	}


	function xhr(url, data, callback) {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function() {
          if (request.readyState == 4 && request.status == 200) {
              callback(request.responseText);
          }
      };

      /*var progressBar = document.getElementById("progressbar");

			alert("yessssss");
			console.log(progressBar);
              
      request.upload.onprogress = function(event) {
          progressBar.max = event.total;
          progressBar.value = event.loaded;
          progressBar.innerHTML = 'Upload Progress ' + Math.round(event.loaded / event.total * 100) + "%";
      };
              
      request.upload.onload = function() {
          percentage.style.display = 'none';
          progressBar.style.display = 'none';
      };*/

      request.open('POST', url);
      var formData = new FormData();
      formData.append('file', data);
      request.send(formData);
  }


	function getRandomString() {
		if (window.crypto) {
        var a = window.crypto.getRandomValues(new Uint32Array(3)),
          token = '';
        for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
        return token;
    } else {
        return (Math.random() * new Date().getTime()).toString(12).replace( /\./g , '');
    }
	}
	//var audioSelect = document.getElementById("audioselect");
		
   /*navigator.mediaDevices.getUserMedia(mediaConfig)
    .then(function(stream){
    	console.log(stream.getTracks())
    })
    .catch(function(err) {
    		console.log(err)
    })*/

    app.factory("localManager",["$window",function($window){
		  return {
		    setValue: function(key, value) {
		      $window.localStorage.setItem(key, JSON.stringify(value));
		    },
		    getValue: function(key) {       
		      return JSON.parse($window.localStorage.getItem(key)); 
		    },
		    removeItem: function(key) {
		      $window.localStorage.removeItem(key);
		    }
		  };
		}]);

    app.factory('camera', ['$rootScope', '$window', function($rootScope, $window){
    	var camera = {};
    	camera.preview = $window.document.getElementById('localVideo');
    	//Get the camera stream and attach to be passed onto a web element
    	camera.start = function(constraints){
				return requestUserMedia(constraints)
				.then(function(stream){	
					console.log(stream.getTracks());			
					//attachMediaStream(camera.preview, stream);
					stream.name = constraints.name;
					peer.setLocalStream(stream);
					camera[constraints.camCount] = stream;
					
					//$rootScope.$broadcast(constraints.camCount,true);
				})
				.catch(Error('Failed to get access to local media.'));
		  };

		  camera.record = function(streams){	  
				
					var options = {
			      mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
			      audioBitsPerSecond: 128000,
			      videoBitsPerSecond: 128000,
			      bitsPerSecond: 128000 // if this line is provided, skip above two
			    };
			    recorder = RecordRTC(streams, options);
			    recorder.startRecording();
					client.isStartRec = false;
					client.intervalId = setInterval(function() {
						if(client.isStartRec) {
							//alert("Saving recorded blobs...")						
							recorder.stopRecording(postFiles);
			        recorder.startRecording();
					  } else {
					  	client.isStartRec = true;
					  }
					},300000);
				
		  };

		  camera.stopRecord = function() {
		  	recorder.stopRecording(postFiles);
		  	clearInterval(client.intervalId)
		  }

    	camera.stop = function(constraints){
    		return new Promise(function(resolve, reject){			
				try {
					//camera.stream.stop() no longer works
					
					var track =  camera[constraints.camCount].getTracks();
          for( var i = 0; i < track.length; i++ ){
	          track[i].stop();
	        }        

	        
					//camera.preview.src = '';
					
					resolve();
				} catch(error) {
					reject(error);
				}
    		})
    		.then(function(result){
    			//$rootScope.$broadcast('cameraIsOn',false);
    		});	
		 };
		return camera;
    }]);

	  app.config(function($routeProvider){
			  $routeProvider

			  .when("/",{
			  	templateUrl: "/assets/pages/site.html"
			  })

			  .when("/cam/:id",{
			  	templateUrl: "/assets/pages/site.html",
			  })

			  .when("/cam/:id/local-streams",{
			  	templateUrl: "/assets/pages/local-remote.html",
			  	//controller: "siteRemoteStreamsController"
			  })
		 });


	 

	app.controller('RemoteStreamsController', ["$scope",'camera', '$location', '$http','$window', function($scope,camera, $location, $http, $window){
		var rtc = this;
		rtc.remoteStreams = [];

		createPeer();

		rtc.allDevices = client.allsources;
		function getStreamById(id) {
		    for(var i=0; i<rtc.remoteStreams.length;i++) {
		    	if (rtc.remoteStreams[i].id === id) {return rtc.remoteStreams[i];}
		    }
		}
		var control = {}

		rtc.siteLink = function(controlId){
			
			control.controlId = controlId;
				//join a room
    	peer.controlJoin(controlId);
			return $window.location.host + "/cam/" + controlId;
		}

		rtc.loadData = function () {
			// get list of streams from the server
		

			$http.get('/streams.json').success(function(data){
				// filter own stream
				var streams = data.filter(function(stream) {
			      	return stream.id != peer.getId();
			    });
			    // get former state
			    for(var i=0; i<streams.length;i++) {
			    	console.log(streams)
			    	var stream = getStreamById(streams[i].id);
			    	streams[i].isPlaying = (!!stream) ? stream.isPlaying : false;			    	
			    }
			    // save new streams
			  	rtc.remoteStreams = streams;
			    rtc.view(rtc.remoteStreams[0],"auto")
			});

			
		};

		var streamObj = {};
		streamObj.index = 1;
		function openStream(stream) {
			if(rtc.remoteStreams.length > streamObj.index)
			  streamObj.index++
			rtc.view(stream,"auto")
		}


		rtc.availableStreams = function() {
  		if(rtc.panel !== true) {
  			rtc.panel = true;
  		} else {
  			rtc.panel = false;
  		}
  	}


		rtc.view = function(stream,arg){ //here stream refers to sockets from the server not stream from cameras
			stream.isPlaying = !stream.isPlaying;
			peer.peerInit(stream.id,stream.name,function(){
				if(arg) {
					openStream(rtc.remoteStreams[streamObj.index])
				}
				
			});

		};
		rtc.call = function(stream){
			/* If json isn't loaded yet, construct a new stream 
			 * This happens when you load <serverUrl>/<socketId> : 
			 * it calls socketId immediatly.
			**/
			if(!stream.id){
				stream = {id: stream, isPlaying: false};
				rtc.remoteStreams.push(stream);
			}
			if(camera.isOn){
				peer.toggleLocalStream(stream.id);
				if(stream.isPlaying){
					peer.peerRenegociate(stream.id);
				} else {
					peer.peerInit(stream.id);
				}
				stream.isPlaying = !stream.isPlaying;
			} else {
				camera.start()
				.then(function(result) {
					peer.toggleLocalStream(stream.id);
					if(stream.isPlaying){
						peer.peerRenegociate(stream.id);
					} else {
						peer.peerInit(stream.id);
					}
					stream.isPlaying = !stream.isPlaying;
				})
				.catch(function(err) {
					console.log(err);
				});
			}
		};

		//initial load
		//rtc.loadData();
  	if($location.url() != '/'){
    	rtc.call($location.url().slice(1));
  	};

		var controllerSocket = peer.getSocketForController();

    controllerSocket.on("reload streams",function(data){
    	alert("reloading");
    	rtc.loadData();
    });

    controllerSocket.on("update btn",function(info) {
    	var myEl = angular.element( document.querySelector( '#' + info.btnName ) );
    	var elemPos = rtc.remoteStreams.map(function(x){return x.name}).indexOf();
    	if(elemPos !== -1) {
    		rtc.remoteStreams.splice(elemPos);
    	}    	
    	console.log(myEl)
			myEl.remove();
    });

	}]);

	app.controller('LocalStreamController',['camera', '$scope', 'localManager','$window','$location', "$filter",
		function(camera, $scope, localManager,$window, $location, $filter){
		var localStream = this;
		localStream.name = localManager.getValue("username") || 'Guest';
		localStream.link = '';
		localStream.cameraIsOn = false;

		var saveControlId = {};
		var path = $location.path();
		var newPath = path + "/local-streams";
		$scope.allLocalStreams = function() {
			$location.path(newPath);
		}

		
		
		navigator.mediaDevices.enumerateDevices()
  	.then(gotDevices).catch(handleError);

  	function gotDevices(deviceInfos) {
  		var streams = [];
   
		 for (var i = 0; i < deviceInfos.length; ++i) {
				var deviceInfo = deviceInfos[i];
				
				
				/*if (deviceInfo.kind === 'audioinput') {
				option.text = deviceInfo.label ||
				'microphone ' + i;				
				} else */
				if (deviceInfo.kind === 'videoinput') {	
				var option = {};
				var camPosition = "cam" + client.camCount;
				option.value = deviceInfo.deviceId;			
				option.text = deviceInfo.label || 'camera ' + i;
				option.position = camPosition ;
				client.allsources.push(option);				
				getStream({value:deviceInfo.deviceId,position: camPosition});
				client.camCount++;
				} else {
				  console.log('Found one other kind of source/device: ', deviceInfo);
				}
				
		 }
  	}
		$scope.$watch("localStream.device",function(newVal,oldVal){
			//alert(newVal)
			if(newVal){
				var split = newVal.split("/");
			 	getStream({value:split[0],position: split[1]});
			}
		})

		/*$rootScope.$on("cameraIsOn",function(event,val){
			$scope.$apply(function(){
				localStream.cameraStreaming = val;
			})
		})*/

		localStream.getControlId = function(id){
			saveControlId.id = id;		
		}

		localStream.allDevices = client.allsources;

		localStream.toggleCam = function(constraints){	
			if(constraints.status === false) {
				createPeer();		
				camera.start(constraints)
				.then(function(result) {
					localStream.link = $window.location.host + '/' + peer.getId();
					if(localManager.getValue("username") !== "Guest" || localManager.getValue("username") !== ""){
						localManager.setValue("username",localStream.name);
					}				
					peer.send('readyToStream', { name: localStream.name,controlId: saveControlId.id });
				})
				.catch(function(err) {
					console.log(err);
				});
				constraints.status = true;
			} else {
				localStream.stopCam(constraints);
			}			
		};

		localStream.stopCam = function(constraints) {	
		
			localManager.removeItem("username");
			//peer.ResetCam('leave',{ name: localStream.name,controlId: saveControlId.id });
			
			camera.stop(constraints)
			.then(function(result){			
				peer.setLocalStream(null);
				peer.removeButton(constraints.name,saveControlId.id) //removes button on the control when stream is terminated
			})
			.catch(function(err) {
				console.log(err);
			});
			constraints.status = false;
		};

	
	  function getStream(cam) {	  	
  		if (window.stream) {
				window.stream.getTracks().forEach(function(track) {
				track.stop();
				});
			}
			if(cam) {
			var constraints = {
				audio: true,
				video: {
					deviceId: {exact: cam.value},
					width: { max: 580 },
    			height: { max: 580 }
				},
				camCount: cam.position,
				status: false
			};

			
			client.constraintsList.push(constraints);
			//getusermedia for locally connected device. Note these streams is not being stream to a control.
  		navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
  		  
			}
  	}

  	localStream.constraints = client.constraintsList; //show constraints on the view for input of camera name

  	localStream.streamCam = function (constraints) {  	
  		localStream.name = constraints.name || constraints.camCount; 
  		localStream.toggleCam(constraints);
  	}

  	localStream.isRecord = false;
  	localStream.recordCam = function(constraints){
  		var remark = localStream.remark || "Site";
			var date = + new Date();
			var dateFilter = $filter("date")(date,"mediumDate");
			client.getStreamName = remark + "-" + dateFilter.toString();  

  		if(localStream.isRecord === false) {
  			//localStream.name = constraints.name || constraints.camCount;
  			camera.record(allCameraStream);
  			localStream.isRecord = true;
  		} else {  			
  			camera.stopRecord();
  			localStream.isRecord = false;
  		}
  		
  	}

  	
  	localStream.availableStreams = function() {
  		if(localStream.panel !== true) {
  			localStream.panel = true;
  		} else {
  			localStream.panel = false;
  		}
  	}
  	

  	var container = document.getElementById("localV");
  	var innerContainer;
  	var count = 0;

  	function gotStream(stream) {
  		
			window.stream = stream; // make stream available to console
			//var videoElement.srcObject = stream;
			//var innerContainer = document.createElement		
			var videoElem = document.createElement('video');
			videoElem.controls = true;
			videoElem.autoplay = true;
			var placeholder = document.createElement('p');		
			innerContainer = document.createElement("div");
			innerContainer.style.display = "inline-block";
			innerContainer.style.marginLeft = "2px";
			
			placeholder.style.padding = "5px";
			placeholder.style.backgroundColor = "rgba(0,0,0,0.4)";
			placeholder.style.color = "#fff";
			placeholder.style.textAlign = "center";
			placeholder.innerHTML += client.constraintsList[count].camCount;
			innerContainer.append(placeholder);			
			attachMediaStream(videoElem,stream,innerContainer,container);
			
			
			count++;
			allCameraStream.push(stream);
			
			//videoElem.srcObject = stream;
			//container.appendChild(videoElem);
		}

		function handleError(error) {
			console.log('Error: ', error);
		}

	}]);




  //controller not in use
    app.controller("siteRemoteStreamsController",["$scope","camera","$location","$http","$window",function($scope,camera,$location,$http,$window){
    	var rtc = this;
		rtc.remoteStreams = [];
		var path = $location.path();
		var toArr = path.split("/");
		console.log(toArr)
		var controlId = toArr[toArr.length - 2]; //user to get control id which is second to the last in the array
		

		function getStreamById(id) {
		    for(var i=0; i<rtc.remoteStreams.length;i++) {
		    	if (rtc.remoteStreams[i].id === id) {return rtc.remoteStreams[i];}
		    }
		}

		rtc.loadData = function () {
			// get list of streams from the server;		
			var url = "/site/streams.json/" + controlId;
			$http.get(url).success(function(data){
			
				// filter own stream
			var streams = data.filter(function(stream) {
		      return stream.id != client.getId();
		    });
		    // get former state
		    for(var i=0; i<streams.length;i++) {
		    	var stream = getStreamById(streams[i].id);
		    	streams[i].isPlaying = (!!stream) ? stream.isPLaying : false;
		    	
		    	/*if(!stream) {
		    		streams.splice(i,1);
		    	}*/
		    }
		    rtc.remoteStreams = streams;
			});
		};

		rtc.view = function(stream){
			client.peerInit(stream.id,stream.name);
			stream.isPlaying = !stream.isPlaying;
		};

		rtc.call = function(stream){
			/* If json isn't loaded yet, construct a new stream 
			 * This happens when you load <serverUrl>/<socketId> : 
			 * it calls socketId immediatly.
			**/
			if(!stream.id){
				stream = {id: stream, isPlaying: false};
				rtc.remoteStreams.push(stream);
			}
			if(camera.isOn){
				client.toggleLocalStream(stream.id);
				if(stream.isPlaying){
					client.peerRenegociate(stream.id);
				} else {
					client.peerInit(stream.id);
				}
				stream.isPlaying = !stream.isPlaying;
			} else {
				camera.start()
				.then(function(result) {
					client.toggleLocalStream(stream.id);
					if(stream.isPlaying){
						client.peerRenegociate(stream.id);
					} else {
						client.peerInit(stream.id);
					}
					stream.isPlaying = !stream.isPlaying;
				})
				.catch(function(err) {
					console.log(err);
				});
			}
		};

		//initial load
		rtc.loadData();
    	if($location.url() != '/'){
      		rtc.call($location.url().slice(1));
    	};

    

    var controllerSocket = client.getSocketForController();

    controllerSocket.on("reload streams",function(data){
    	rtc.loadData();
    })
  }]);
})();

