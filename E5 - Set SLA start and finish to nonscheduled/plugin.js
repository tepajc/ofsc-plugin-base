"use strict";

var proxy;
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

  var instance = data.securedData.ofscInstance;
  var clientId = data.securedData.ofscRestClientId;
  var clientSecret = data.securedData.ofscRestClientSecret;
  var baseURL = data.securedData.ofscRestEndpoint;

  proxy = new OFSCProxy();
  proxy.createInstance(instance, clientId, clientSecret, baseURL);
  //proxy = new OFSCProxy();
  var clousureData = {
    //"DISPATCHER_COMMENTS": "CHANGED",
	//	"pid" : data.resource.pid
  };
  internalData.root = document.getElementById("root").value;

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
  document.getElementById("scheduleActivities").addEventListener("click", function() {
    var element = document.getElementById("action-debug");
    element.innerHTML = "Scheduling activities ...";
    scheduleActivities();
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


  // Getting the list of activities
  proxy.getNonscheduledActivities( internalData.root , 0,1000,'activityId,apptNumber,slaWindowStart,slaWindowEnd,postalCode,resourceId,timeSlot,date,status,city,activityType,workZone,startTime,endTime' ,"A_NOT_CLEAN=='' and activityType!='LU'").then(function(response) {
    //element.innerHTML = "<pre>" + JSON.stringify(response, undefined, 4) + "</pre>";
    var activitiesTmp = response.items.filter(filterActivites);
    //console.log('info', JSON.stringify(internalData, undefined, 4));
    internalData.activities = activitiesTmp;
    var element = document.getElementById("get-activities");
    element.innerHTML = "<pre>" + "Number activities with SLA obtained " + activitiesTmp.length + "</pre>";
    var element = document.getElementById("action-debug");
    element.innerHTML = "Done obtaining activities";
    var element = document.getElementById("activity_list");
    element.innerHTML = JSON.stringify(internalData.activities, undefined, 4);
    element.style.display = "block";

  });
}


async function scheduleActivities() {
  var activities = internalData.activities;
  var startDate = new Date();
  startDate= startDate.addDays(1);
  var endDate= startDate.addDays(5);
  var slaStartTxt = formatDateToTxt(startDate) + " 00:00:00";
  var slaEndTxt = formatDateToTxt(endDate) + " 00:00:00";
  for ( var i=0; i <  activities.length ; i++){
     activities[i].slaWindowStart = slaStartTxt;
     activities[i].slaWindowEnd= slaEndTxt;
  }
  const updateResponse = await proxy.bulkUpdateActivities(activities);
  var element =document.getElementById("get-corrected-activities");
  element.innerHTML = JSON.stringify(updateResponse, undefined, 4);
  element = document.getElementById("action-debug");
  element.innerHTML = "Done updating activities";
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


function compareDuedates( a, b ) {
  if ( a.slaWindowEnd < b.slaWindowEnd ){
    return -1;
  }
  if ( a.slaWindowEnd > b.slaWindowEnd ){
    return 1;
  }
  return 0;
}

function filterActivites ( obj ) {
  return (!("slaWindowEnd" in obj));
}

function formatDateToTxt (date ){
  var bookingYears = date.getFullYear();
  var monthsNumber = date.getMonth() + 1;
  var bookingMonth= (monthsNumber<10?'0':'') + monthsNumber;
  var bookingDay = (date.getDate()<10?'0':'') + date.getDate();
  var bookingDate = bookingYears + "-" + bookingMonth + "-" + bookingDay;
  return bookingDate;
}
