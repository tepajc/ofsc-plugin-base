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
  proxy = new OFSCProxy(instance, clientId, clientSecret, baseURL);
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
  proxy.getNonscheduledActivities( internalData.root , 0,1000,'activityId,apptNumber,slaWindowStart,slaWindowEnd,postalCode,resourceId,timeSlot,date,status,city,activityType,workZone,startTime,endTime,TIMESLOT_Selected' ,"A_NOT_CLEAN=='' and activityType!='LU'").then(function(response) {
    //element.innerHTML = "<pre>" + JSON.stringify(response, undefined, 4) + "</pre>";
    var activitiesTmp = response.items.filter(filterActivites);
    internalData.activities = activitiesTmp.sort(compareDuedates);
    //console.log('info', JSON.stringify(internalData, undefined, 4));
    var element = document.getElementById("get-activities");
    element.innerHTML = "<pre>" + "Number activities with SLA obtained " + response.items.length + "</pre>";
    var element = document.getElementById("action-debug");
    element.innerHTML = "Done obtaining activities";
    var element = document.getElementById("activity_list");
    element.innerHTML = JSON.stringify(internalData.activities, undefined, 4);
    element.style.display = "block";

  });
}




function scheduleActivities() {
  var activities = internalData.activities;
  var rootBucket = internalData.root ;
  var internalActivitiesLength  = activities.length;
  var errorActivities = 0;
  var okActivities = 0;
  var activitiesScheduled = [];
  var activitiesNonScheduled = [];
  //console.log ('info', 'INTERNAL ACTIVITIES LENGHT '+ internalActivitiesLength);
  var element = document.getElementById("action-debug");
  element.innerHTML = "<pre>" + "Correcting assignments  ... </pre>";
  var iteration = 0;
  var data = {};
  data.iteration = iteration;
  internalData.activitiesScheduled = activitiesScheduled;
  internalData.activitiesNonScheduled = activitiesNonScheduled;
  scheduleActivity(data);

}


function scheduleActivity( data ){
  var iteration = data.iteration;
  var totalLength = internalData.activities.length;
  var activity = internalData.activities[iteration];
  var activitiesScheduled = internalData.activitiesScheduled;
  var activitiesNonScheduled = internalData.activitiesNonScheduled;
  var okActivities = data.okActivites;
  var errorActivities = data.errorActivities;
  var activityAm = { ...activity };
  var activityPm = { ...activity };
  // As activities as parts of the day I will manage
  activityAm["TIMESLOT_Selected"] ="2";
  activityPm["TIMESLOT_Selected"] ="3";
  var activities = [];
  activities[0] = activityAm;
  activities[1] = activityPm;

  var slaStartDate = new Date();
  if ("slaWindowStart" in activity){
     slaStartDate = new Date(activity.slaWindowStart);
  }
  var slaEndDate = new Date(activity.slaWindowEnd);
  var bookingDate = getBookingDates(slaStartDate,slaEndDate);
  var responseArray = [];
  console.log('info' , "I will start looking for available dates in  "+ bookingDate);
  proxy.getActivityBookingOptions( activities[0], internalData.root , bookingDate ).then( async function(response1 ) {
      responseArray[0] = response1;
      proxy.getActivityBookingOptions( activities[1], internalData.root , bookingDate ).then( async function(response2 ) {
        // Looping the main array of responses
        responseArray[1] = response2;
        var timeslotDateResult
        for (var i =0; i < responseArray[0].dates.length ; i++){
           const dateTimeslotTmp =  await findRightTimeslot(responseArray[0].dates[i],  activities[0] , slaStartDate, slaEndDate );
           if ("date" in dateTimeslotTmp){
             timeslotDateResult=dateTimeslotTmp;
             break;
           }else{
              // If I have not found availability, look on the second array of responses
              for (var j =0; j < responseArray[1].dates.length ; j++){
                if (responseArray[1].dates[j].label == responseArray[0].dates[i].label){
                   const dateTimeslotTmp =  await findRightTimeslot(responseArray[1].dates[j],   activities[1] , slaStartDate, slaEndDate );
                   timeslotDateResult=dateTimeslotTmp;
                   break;
                }
              }
           }
      }
      if ("date" in timeslotDateResult){
          activity.date = timeslotDateResult.date;
          activity.timeSlot = timeslotDateResult.timeSlot;
          activity.TIMESLOT_Selected = timeslotDateResult.TIMESLOT_Selected;
          const updateResponse = await proxy.bulkUpdateActivities(activity);
          if ("results" in updateResponse ){
              if ( updateResponse.results.length > 0) {
                  activitiesScheduled.push(activity);
              }
          }
      }else{
        activitiesNonScheduled.push(activity);
      }

      iteration++;
      data.iteration = iteration;
      internalData.activitiesScheduled = activitiesScheduled;
      if ( iteration < totalLength ){
             scheduleActivity(data);
      } else{
        var element = document.getElementById("get-corrected-activities");
        element.innerHTML = "<pre>" +  " Assignments scheduled Detail : " +   JSON.stringify(activitiesScheduled, undefined, 4) + " \n Assignments Non scheduled Detail : "+  JSON.stringify(activitiesNonScheduled, undefined, 4) + "</pre>";
        var element = document.getElementById("action-debug");
        element.innerHTML = "<pre>" + "Assignments corrected </pre>";
      }
     });
  });
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
  return ("slaWindowEnd" in obj);
}
function getBookingDates ( startDate, endDate ) {
  var bookingDate = formatDateToTxt(startDate);
  var diffInMilisecond = endDate.getTime() - startDate.getTime();
var dayDuration = 24*3600*1000;
//console.log('info', "Looking for a booking date {" + startDate + "-" + endDate + "} {" + diffInMilisecond +  "," + dayDuration +"}");
  while ( diffInMilisecond > parseInt(dayDuration) ){
     startDate= startDate.addDays(1);
     bookingDate = bookingDate +","+ formatDateToTxt(startDate);
     diffInMilisecond = endDate.getTime() - startDate.getTime();
     //console.log('info', "Looking for a booking date {" + startDate + "-" + endDate + "} {" + diffInMilisecond +  "," + dayDuration +"}");
  }
    //console.log('info', "Found a booking date " + bookingDate);
  return bookingDate;
}
function formatDateToTxt (date ){
  var bookingYears = date.getFullYear();
  var monthsNumber = date.getMonth() + 1;
  var bookingMonth= (monthsNumber<10?'0':'') + monthsNumber;
  var bookingDay = (date.getDate()<10?'0':'') + date.getDate();
  var bookingDate = bookingYears + "-" + bookingMonth + "-" + bookingDay;
  return bookingDate;
}

async function findRightTimeslot(date,  activity , startDate, endDate ){
  var timeslotDateResult = {};
  if ("areas" in date && date.areas.length == 1){
    var area = date.areas[0];
    if ( "remainingQuota" in area && area.remainingQuota > 0 ){
      if ("timeSlots" in area && area.timeSlots.length > 0 ){
        for (var j =0; j < area.timeSlots.length ; j++){
          if ( !( "reason" in area.timeSlots[j] ) ){
            console.log('debug', "Found availability in " +date.date + " Area " + area.label + " timeslot " + area.timeSlots[j].label);
            timeslotDateResult.date = date.date;
            timeslotDateResult.timeSlot = area.timeSlots[j].label;
            timeslotDateResult.TIMESLOT_Selected = activity.TIMESLOT_Selected;
            return timeslotDateResult;
          }
        }
      }
    }
  }
  return timeslotDateResult;
}
