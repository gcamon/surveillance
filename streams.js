module.exports = function() {
  /**
   * available streams 
   * the id value is considered unique (provided by socket.io)
   */
  var streamList = [];

  var controls = {};

  /**
   * Stream object
   */

   /*
   todo keep  control in  database. Creat a json object with the following field, Name of control, id of control, streamlist of Array of objects.,
   */
  var Stream = function(id, name) {
    this.name = name;
    this.id = id;
  }

  return {
    /*addStream : function(id, name,) {
      var stream = new Stream(id, name);
      streamList.push(stream);
    },*/

    addStream : function(id, name, controlId) {
      var stream = new Stream(id, name, controlId);
      if(controls[controlId]) {
        controls[controlId].push(stream);
      } else {
        this.addControl(controlId)
      }
      
    },

    removeStream : function(id) {
      var index = 0;
      while(index < streamList.length && streamList[index].id != id){
        index++;
      }
      streamList.splice(index, 1);
    },

    // update function
    update : function(id, name) {
      var stream = streamList.find(function(element, i, array) {
        return element.id == id;
      });
      stream.name = name;
    },

    

    addControl: function(controlId){
      //check to see if control does not exist then add it 
      //do database search to find a control the requested site belongs to.
      //if control is found attach the control id to the controls object properties  
      if(!controls.hasOwnProperty(controlId)) {
        controls[controlId] = [];
      }
      
    },

    getStreamToControl: function(controlId) { 
      var controlStreamList = (controls.hasOwnProperty(controlId)) ? controls[controlId] : addControl(controlId);
      if(controlStreamList) {
        return controlStreamList;
      }
    },

  }
};
