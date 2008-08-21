//--------------------------------------------------------------------
// soundapi.js
// Unoh Inc. 2006/11/02
// version 1.000
//--------------------------------------------------------------------
var soundapi_setup = {
  obj_id:   'id_soundapi',
  swf_path: 'soundapi.swf'
};

document.write('<!-- saved from url=(0013)about:internet -->');
document.write('<div id="id_soundapi_body"></div>');

var soundapi_so  = new SWFObject(soundapi_setup.swf_path, soundapi_setup.obj_id, "1", "1", "8", "white");
soundapi_so.write("id_soundapi_body");
var soundapi = (navigator.appName.indexOf("Microsoft") != -1) ? window[soundapi_setup.obj_id] : document[soundapi_setup.obj_id];
//--------------------------------------------------------------------
