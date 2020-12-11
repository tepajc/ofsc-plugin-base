"use strict";

var activity;
var proxy;

function openMessage(data) {
  <!--PLACEHOLDER FOR CUSTOM CODE-- >

  var element = document.getElementById("received-data");
  element.innerHTML = "<pre>" + JSON.stringify(data, undefined, 4) + "</pre>";
  // Credential data from the Plugin configuration
  var instance = data.securedData.ofscInstance;
  var clientId = data.securedData.ofscRestClientId;
  var clientSecret = data.securedData.ofscRestClientSecret;
  var baseURL = data.securedData.ofscRestEndpoint;
  var ofscApiToUse = data.securedData.ofscApiToUse;
  proxy = new OFSCProxy();
  proxy.createInstance(instance, clientId, clientSecret, baseURL);

  console.log()
  var activityData = {
    "aid" : data.activity.aid,
    "A_MARK_PROPERTY": "I have invoked the Plugin"

  };

  document.getElementById("close").addEventListener("click", function() {
		closePlugin(activityData);
  });
  document.getElementById("updateCapacity").addEventListener("click", function() {
    if (ofscApiToUse == 'capacitySoap') {
        proxy.updateCapacitySOAP();
    }else if (ofscApiToUse == 'restTimeslots') {
        proxy.getTimeslots();
    }

    //proxy.getTimeslots();
    //closePlugin();
  });

  <!--END OF PLACEHOLDER-- >
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


function closePlugin(activityData) {

  var messageData = {
    "apiVersion": 1,
    "method": "close",
    "activity": activityData
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
