"use strict";

var activity;

function showPosition(position) {
  console.log("In showPosition");

  var lon;
  var lat;

  lat = position.coords.latitude;
  lon = position.coords.longitude;

  alert("Position captured " + lat + "-" + lon);
  console.log(lat);
  console.log(lon);
}

function openMessage(data) {
  console.log("In openMessage");
  var element = document.getElementById("received-data");
  element.innerHTML = "<pre>" + JSON.stringify(data, undefined, 4) + "</pre>";

  var externalData = data.externalData;
  var externalValues;
//  var sJanesSays = Date.now();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  // add more properties below in activityData, to be updates on the activity, or
  // change according to requirements; object used in closePlugin method
  var activityData = {
		"aid" : data.activity.aid,
		"cname" : data.activity.cname
  };

  // used when invoked from deep link
  for (var key in externalData) {
     if (externalData.hasOwnProperty(key)) {
        activityData[key]=externalData[key];
     }
   }
  document.getElementById("submit").addEventListener("click", function() {
	closePlugin(activityData);
  });
}

function initMessage(data) {
console.log("In initMessage");
  var messsageData = {
    apiVersion: 1,
    method: 'initEnd'
  };

  sendWebMessage(messsageData);
}

function initPlugin() {
console.log("In initPlugin");
  window.addEventListener("message", getWebMessage, false);

  var messsageData = {
    apiVersion: 1,
    method: 'ready'
  };

  sendWebMessage(messsageData);
}

function _isJson(str) {
	console.log("In _isJson");
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function getWebMessage(event) {
console.log("In getWebMessage");
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
	console.log("In getOriginURL");
  if (url != '') {
    if (url.indexOf("://") > -1) {
      return 'https://' + url.split('/')[2];
    } else {
      return 'https://' + url.split('/')[0];
    }
  }
  return '';
}


function closePlugin(activityData) {
console.log("In closePlugin");
  var messageData = {
    "apiVersion": 1,
    "method": "close",
    "activity": activityData
  };

  console.log("Sending close message" + JSON.stringify(messageData, undefined, 4));
  sendWebMessage(messageData);
}

function sendWebMessage(data) {
	console.log("In sendWebMessage");
  var originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';

  if (originUrl) {
    parent.postMessage(data, getOriginURL(originUrl));
  }
}
