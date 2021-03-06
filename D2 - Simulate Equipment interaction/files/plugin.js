"use strict";


function openMessage(data) {
  <!--PLACEHOLDER FOR CUSTOM CODE-- >

  //var element = document.getElementById("received-data");
  //element.innerHTML = "<pre>" + JSON.stringify(data, undefined, 4) + "</pre>";

  var clousureData = {
    aid:  data.activity.aid//,
    //XA_BNG_MODEL: bngModel,
    //XA_BNG_SPEED: bngSpeed
  };

  document.getElementById("wsUpdateButton").addEventListener("click", function() {
		closePlugin(clousureData);
  });
  document.getElementById("wsTestButton").addEventListener("click", function() {
    processData();
  });



  <!--END OF PLACEHOLDER-- >
}
function showElement(element){
    element.style.visibility = "visible";
}
function hideElement(element){
    element.style.visibility = "hidden";
}
function initMessage(data) {

  var messsageData = {
    apiVersion: 1,
    method: 'initEnd'
  };

  sendWebMessage(messsageData);
}

function initPlugin() {

  window.addEventListener("message", getWebMessage, false);

  var messsageData = {
    apiVersion: 1,
    method: 'ready'
  };

  sendWebMessage(messsageData);
}

function _isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function getWebMessage(event) {

  if (typeof event.data === 'undefined') {
    return false;
  }

  if (!_isJson(event.data)) {
    return false;
  }

  var data = JSON.parse(event.data);

  if (!data.method) {
    return false;
  }

  switch (data.method) {
    case 'open':
      openMessage(data);
      break;
    case 'open':
      initMessage(data);
      break;
    case 'error':
			console.log("Received error message " + JSON.stringify(data, undefined, 4));
      break;
      // other methods may go here
  }
}

function getOriginURL(url) {
  if (url != '') {
    if (url.indexOf("://") > -1) {
      return 'https://' + url.split('/')[2];
    } else {
      return 'https://' + url.split('/')[0];
    }
  }
  return '';
}


function closePlugin(clousureData) {

  var messageData = {
    "apiVersion": 1,
    "method": "close",
    "activity": clousureData
  };
	console.log("Sending close message" + JSON.stringify(messageData, undefined, 4));
  sendWebMessage(messageData);
}

function sendWebMessage(data) {
  var originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';

  if (originUrl) {
    parent.postMessage(data, getOriginURL(originUrl));
  }
}
function showData(){
  alert("Test completed OK");
  document.getElementById("loading").style.visibility = "hidden";
  document.getElementById("data").style.visibility = "visible";
  $.each(staticData, function (key, value) {
      if (typeof value != 'object') {
          //console.log( key + ": " + value);
          $("#wsDataTable tbody").append("<tr><td><b>" + key + "</b></td><td>" + value + "</td></tr>");
      }
  });
  document.getElementById("loading").style.visibility = "hidden";
}
function processData() {
    if (confirm("Se va a lanzar una prueba de equipo. Confirmar o Cancelar!")){
      document.getElementById("loading").style.visibility = "visible";
      var dateObj = new Date();
      document.getElementById("content").innerHTML = dateObj.toString();
      var myVar2 = setTimeout(showData, 4000);
    }
}
