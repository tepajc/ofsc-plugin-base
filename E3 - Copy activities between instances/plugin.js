"use strict";

var proxyOrigin;
var proxyDestination;
// TODO : If this doesn't work, change to var proxy = new OFSCProxy();

var internalData = {};
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function openMessage(data) {
  <!--PLACEHOLDER FOR CUSTOM CODE-- >

  //var element = document.getElementById("received-data");
  //element.innerHTML = "<pre>" + JSON.stringify(data, undefined, 4) + "</pre>";
  console.log('info', "Open method ");

  internalData.baseURL = data.securedData.ofscRestEndpoint;
  internalData.instanceOrigin = data.securedData.ofscInstanceOrigin;
  internalData.clientIdOrigin = data.securedData.ofscClientIdOrigin;
  internalData.clientSecretOrigin = data.securedData.ofscClientSecretOrigin;
  internalData.instanceDestination = data.securedData.ofscInstanceDestination;
  internalData.clientIdDestination = data.securedData.ofscClientIdDestination;
  internalData.clientSecretDestination = data.securedData.ofscClientSecretDestination;
  var d = new Date();
  var dAfter = d.addDays(1);
  var afterYears = dAfter.getFullYear();
  var monthsNumber = dAfter.getMonth() + 1;
  var afterMonth = (monthsNumber<10?'0':'') + monthsNumber;
  var afterDay = (dAfter.getDate()<10?'0':'') + dAfter.getDate();
  var dAfterTxt = afterYears + "-" + afterMonth + "-" + afterDay;
  console.log('info', "Date should be updated with " + dAfterTxt);
  var element  = document.getElementById("dateOrigin").value = dAfterTxt;
  element  = document.getElementById("dateDestination").value = dAfterTxt;


  var clousureData = {
    //"DISPATCHER_COMMENTS": "CHANGED",
	//	"pid" : data.resource.pid
  };

  document.getElementById("getInitialData").addEventListener("click", function() {
    var element = document.getElementById("action-debug");
    element.innerHTML = "Looking for activities...";
		getData(data);
  });
  var showHideButton = document.getElementById("showHideActivities");
  //showHideButton.display.style = "block";
  showHideButton.addEventListener("click", function() {
    showHideActivities();
  });
  document.getElementById("copyActivities").addEventListener("click", function() {
    var element = document.getElementById("action-debug");
    element.innerHTML = "Copying activities ...";
    correctAssignments();
  });
  document.getElementById("close").addEventListener("click", function() {
		closePlugin(clousureData);
  });




  <!--END OF PLACEHOLDER-- >
}
function showHideActivities(){
 var element = document.getElementById("activity_list");
  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}


function getData(data) {

  //var instanceOrigin = document.getElementById("instanceOrigin").value;
  //var clientIdOrigin = document.getElementById("clientIdOrigin").value;
  //var clientSecretOrigin = document.getElementById("clientSecretOrigin").value;
  var dateOrigin = document.getElementById("dateOrigin").value;
  var rootOrigin = document.getElementById("rootOrigin").value;
  //var clientIdOrigin = document.getElementById("clientIdOrigin").value;
  //var clientSecretOrigin = document.getElementById("clientSecretOrigin").value;
  var clientIdOrigin = internalData.clientIdOrigin;
  var clientSecretOrigin = internalData.clientSecretOrigin;
  var dateDestination = document.getElementById("dateDestination").value;
  var rootDestination = document.getElementById("rootDestination").value;
  console.log('info', "Voy a buscar en " + internalData.instanceOrigin + "," + clientIdOrigin+ "," +  clientSecretOrigin+ "," +  internalData.baseURL);
  proxyOrigin = new OFSCProxy()
  proxyOrigin.createInstance(internalData.instanceOrigin, clientIdOrigin, clientSecretOrigin, internalData.baseURL);


  var fields = document.getElementById("fields").value;
  // Getting the list of activities
  proxyOrigin.getActivities( rootOrigin, dateOrigin, dateOrigin,0,1000,fields ,"").then(function(response) {
    //element.innerHTML = "<pre>" + JSON.stringify(response, undefined, 4) + "</pre>";
    var activities =  response.items;
    for (var i=0 ; i < activities.length ; i++){
      //activities[i].activityId ="";
      activities[i].phoneNumber = "111111111";
      if (!("apptNumber" in activities[i])){
        activities[i].apptNumber = "FAKE_APPT_NUMBER";
      }
      activities[i].resourceId = rootDestination;
      activities[i].date = dateDestination;
    }
    internalData.activities=activities;
    var element = document.getElementById("get-activities");
    element.innerHTML = "<pre>" + "Number or preliminar activities obtained after cleaning " + internalData.activities.length + "</pre>";
    var element = document.getElementById("activity_list");
    element.innerHTML = JSON.stringify(internalData.activities, undefined, 4);
    element.style.display = "block";
    var element = document.getElementById("action-debug");
    element.innerHTML = "Activities obtained";
  });

}


async function correctAssignments() {
  var activities = internalData.activities;
  var clientIdDestination = internalData.clientIdDestination;
  var clientSecretDestination = internalData.clientSecretDestination;



  //console.log ('info', 'INTERNAL ACTIVITIES LENGHT '+ internalActivitiesLength);
  var element = document.getElementById("action-debug");
  element.innerHTML = "<pre>" + "Moving activities   ... </pre>";
  proxyDestination = new OFSCProxy();
  proxyDestination.createInstance(internalData.instanceDestination, clientIdDestination, clientSecretDestination, internalData.baseURL);
  const updateResponse = await proxyDestination.bulkUpdateActivities(activities);
  var element = document.getElementById("action-debug");
  console.log('info', JSON.stringify(updateResponse, undefined, 4));
  if ("results" in updateResponse ){
      if ( updateResponse.results.length > 0) {
        var element = document.getElementById("action-debug");
        element.innerHTML = "<pre>" + updateResponse.results.length + " Activities Moved</pre>";
      }
  }

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
    "method": "close"//,
    //"resource": clousureData
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
