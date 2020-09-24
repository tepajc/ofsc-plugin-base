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
  var clousureData = {
    //"DISPATCHER_COMMENTS": "CHANGED",
	//	"pid" : data.resource.pid
  };
  internalData.root = document.getElementById("root").value;
  internalData.days = document.getElementById("days").value;

  document.getElementById("getInitialData").addEventListener("click", function() {
    var element = document.getElementById("action-debug");
    element.innerHTML = "Looking for activities...";
		getData(data);
  });
  document.getElementById("pinActivities").addEventListener("click", function() {
    var element = document.getElementById("action-debug");
    element.innerHTML = "Pinning activities ...";
		pinActivities();
  });
  document.getElementById("resetPinActivities").addEventListener("click", function() {
    var element = document.getElementById("action-debug");
    element.innerHTML = "Reset pinning activities ...";
    resetPinActivities();
  });
  var showHideButton = document.getElementById("showHideActivities");
  //showHideButton.display.style = "block";
  showHideButton.addEventListener("click", function() {
    showHideActivities();
  });
  document.getElementById("correctAssigments").addEventListener("click", function() {
    var element = document.getElementById("action-debug");
    element.innerHTML = "Correcting activities ...";
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
  var d = new Date();
  console.log('info', 'DATE BEFORE ADDING DAYS' + d);
  var dAfter = d.addDays(parseInt(internalData.days));
  console.log('info', 'DATE AFTER ADDING DAYS' + dAfter);
  var afterYears = dAfter.getFullYear();
  var monthsNumber = dAfter.getMonth() + 1;
  var afterMonth = (monthsNumber<10?'0':'') + monthsNumber;
  var afterDay = (dAfter.getDate()<10?'0':'') + dAfter.getDate();
  var dAfterTxt = afterYears + "-" + afterMonth + "-" + afterDay;
  console.log('info', 'DATE USE IN API' + dAfterTxt);
  // Getting the list of activities
  proxy.getActivities( internalData.root , dAfterTxt, dAfterTxt,0,1000,'activityId,apptNumber,postalCode,resourceId,timeSlot,date,status,city,activityType,workZone,startTime,endTime,TIMESLOT_Selected' ,"A_NOT_CLEAN=='' and activityType!='LU'").then(function(response) {
    //element.innerHTML = "<pre>" + JSON.stringify(response, undefined, 4) + "</pre>";
    internalData.activities =  response.items;
    //console.log('info', JSON.stringify(internalData, undefined, 4));
    var element = document.getElementById("get-activities");
    element.innerHTML = "<pre>" + "Number or preliminar activities obtained " + response.items.length + "</pre>";
    var element = document.getElementById("action-debug");
    element.innerHTML = "Done obtaining activities";
    // Getting timeslots
    proxy.getTimeslots().then(function(response) {
      var timeslotsTmpList = response.items.filter(function( obj ) {
        return !(obj.isAllDay);
      });
      internalData.timeslots = timeslotsTmpList.sort(compareTimeSlots);
    //  console.log('info', JSON.stringify(internalData, undefined, 4));
      var element = document.getElementById("get-timeslots");
      element.innerHTML = "<pre> Recovered and ordered " + internalData.timeslots.length + " timeslots </pre>";
      // Cleaning the activitiesUpdates
      var cleanActivities = [];
      var activities = internalData.activities;
      var rootBucket = internalData.root ;
      var timeslots = internalData.timeslots;
      var internalActivitiesLength  = activities.length;
      //console.log ('info', 'INTERNAL ACTIVITIES LENGHT '+ internalActivitiesLength);
      var element = document.getElementById("action-debug");
      element.innerHTML = "<pre>" + "Cleaning activities ... </pre>";
      for(var i = 0; i < internalActivitiesLength; i++) {
          var activity = activities[i];
          var startTime = activity.startTime;
          var d = new Date(startTime);
          var dHours = (d.getHours()<10?'0':'') + d.getHours();
          var dMinutes = (d.getMinutes()<10?'0':'') + d.getMinutes();
          var startTimeText =  dHours + ":" + dMinutes;
          if ( activity.resourceId !=  rootBucket ){
            if ( "apptNumber" in activity){
              // This activity is part of the candidates even if we can't set a timeslot
              for ( var j = 0; j < timeslots.length ; j++){
                //console.log("Activity i " + i + " Timeslot j " + j);
                if( startTimeText >= timeslots[j].timeStart ){
                  if( startTimeText < timeslots[j].timeEnd ){
                    if ("timeSlot" in activity ){
                      activity.A_PREVIOUS_TIMESLOT_LABEL = activity.timeSlot;
                    }else{
                      activity.A_PREVIOUS_TIMESLOT_LABEL = "EMPTY";
                    }
                    activity.A_PREVIOUS_START_TIME = activity.startTime
                    activity.timeSlot = timeslots[j].label;
                    // This logic is to set the right timeframe for
                  //  console.log('debug' , 'activity timeslot is ' + activity.timeSlot);
                    if (timeslots[j].name.includes("AM")){
                      activity.TIMESLOT_Selected = "2";
                    }else if (timeslots[j].name.includes("PM")){
                      activity.TIMESLOT_Selected = "3";
                    }else{
                      activity.TIMESLOT_Selected = "4";
                    }
                  //  console.log('debug' , 'activity timeslot selected is ' + activity.TIMESLOT_Selected);
                    break;
                  }
                }
              }
              cleanActivities.push(activity);
            }
          }
      }
      internalData.activities = cleanActivities;
      var element = document.getElementById("get-activities");
      element.innerHTML = "<pre>" + "Number or preliminar activities obtained after cleaning " + internalData.activities.length + "</pre>";
      var element = document.getElementById("activity_list");
      element.innerHTML = JSON.stringify(internalData.activities, undefined, 4);
      element.style.display = "block";
      var element = document.getElementById("action-debug");
      element.innerHTML = "Done cleaning activities";
      //var element = document.getElementById("showHideActivities");
    //  element.style.display = "none";
    });
  });
  // Getting the Slots


}
function compareTimeSlots( a, b ) {
  if ( a.timeStart < b.timeStart ){
    return -1;
  }
  if ( a.timeStart > b.timeStart ){
    return 1;
  }
  return 0;
}

function pinActivities (){

  pinActivities = internalData.activities;
//  console.log('info', JSON.stringify(internalData.activities, undefined, 4));
  proxy.bulkUpdateActivities(pinActivities).then(function(response) {
      //element.innerHTML = "<pre>" + JSON.stringify(response, undefined, 4) + "</pre>";
    //console.log('info', JSON.stringify(response, undefined, 4));
    var activitiesUpdates = "0";
    if ("results" in response ){
        activitiesUpdates = "" + response.results.length;
    }
    var element = document.getElementById("get-pin-activities");
    element.innerHTML = "<pre>" + "Number or pinned activities sent {"+ pinActivities.length +"} and updated  {"+ activitiesUpdates + "} </pre>";
    var element = document.getElementById("action-debug");
    element.innerHTML = "Pin activities Done";
  });

}

function resetPinActivities (){
  var pinActivitiesToReset = [];
  var activities = internalData.activities;
  var internalActivitiesLength  = activities.length;
  //console.log ('info', 'INTERNAL ACTIVITIES LENGHT '+ internalActivitiesLength);
  for(var i = 0; i < internalActivitiesLength; i++) {
      var activity = activities[i];
      activity.timeSlot = "all-day";
      pinActivitiesToReset.push(activity);

  }
  internalData.activities = pinActivitiesToReset;

  proxy.bulkUpdateActivities(pinActivitiesToReset).then(function(response) {
    //element.innerHTML = "<pre>" + JSON.stringify(response, undefined, 4) + "</pre>";
  //  console.log('info', JSON.stringify(response, undefined, 4));
    var activitiesUpdates = "0";
    if ("results" in response ){
        activitiesUpdates = "" + response.results.length;
    }
    var element = document.getElementById("get-pin-activities");
    element.innerHTML = "<pre>" + "Number or pinned activities sent to reset {"+ pinActivitiesToReset.length +"} and reset  {"+ activitiesUpdates + "} </pre>";
  });

}

function correctAssignments() {
  var activities = internalData.activities;
  var rootBucket = internalData.root ;
  var internalActivitiesLength  = activities.length;
  var errorActivities = 0;
  var okActivities = 0;
  var activitiesToCorrect = [];
  var activitiesCorrected = [];
  //console.log ('info', 'INTERNAL ACTIVITIES LENGHT '+ internalActivitiesLength);
  var element = document.getElementById("action-debug");
  element.innerHTML = "<pre>" + "Correcting assignments  ... </pre>";
  var iteration = 0;
  var data = {};
  data.iteration = iteration;
  internalData.activitiesToCorrect = activitiesToCorrect;
  internalData.activitiesCorrected = activitiesCorrected;
  data.okActivites = okActivities;
  data.errorActivities =  errorActivities;
  correctActivity(data);

}


function correctActivity( data ){
  var iteration = data.iteration;
  var totalLength = internalData.activities.length;
  var activity = internalData.activities[iteration];
  var activitiesToCorrect = internalData.activitiesToCorrect;
  var activitiesCorrected = internalData.activitiesCorrected;
  var okActivities = data.okActivites;
  var errorActivities = data.errorActivities;
  proxy.getActivityBookingOptions( activity, internalData.root , activity.date ).then( async function(response) {
     var found = 0;
     //console.log('info', JSON.stringify(response, undefined, 4));
     if ("dates" in response && response.dates.length == 1 ) {
         console.log('info', "Reviewing activity " + iteration + " of " + totalLength + " and timeslot " +  activity.timeSlot);
         var date = response.dates[0];
         if ("areas" in date && date.areas.length == 1){
             var area = date.areas[0];
             if ( "remainingQuota" in area && area.remainingQuota > 0 ){
               if ("timeSlots" in area && area.timeSlots.length > 0 ){
                    var timeSlotNotFound = 1;
                    for (var j =0; j < area.timeSlots.length ; j++){
                         if( area.timeSlots[j].label == activity.timeSlot ){
                           timeSlotNotFound = 0;
                           found = 1;
                           if ("reason" in area.timeSlots[j] && area.timeSlots[j].reason == "noCapacity"){
                                activity.resourceId = internalData.root;
                                activity.date = null;
                                if ("A_PREVIOUS_TIMESLOT_LABEL" in activity && activity.A_PREVIOUS_TIMESLOT_LABEL != "EMPTY" ){
                                   activity.timeSlot = activity.A_PREVIOUS_TIMESLOT_LABEL;
                                }else{
                                   activity.timeSlot = "all-day";
                                }
                                activity.TIMESLOT_Selected = "4";
                                activitiesToCorrect.push(activity);
                                var activityToUpdate = [activity ];
                              //  console.log('info', "'response' : { " + JSON.stringify(response, undefined, 4) + "}");
                                console.log('info', "Correcting " + iteration + "} of " + totalLength + " - activity {" + JSON.stringify(activity, undefined, 4) + "}" );
                                console.log('debug', "Correcting activity {" + JSON.stringify(activity, undefined, 4)  );
                                const updateResponse = await proxy.bulkUpdateActivities(activityToUpdate);
                                  //element.innerHTML = "<pre>" + JSON.stringify(response, undefined, 4) + "</pre>";

                                if ("results" in updateResponse ){
                                    if ( updateResponse.results.length > 0) {
                                        activitiesCorrected.push(activity);
                                    }
                                }
                                //console.log('info', "Correcting activity " + iteration + " of " + totalLength);

                            }else{
                                console.log('debug', "Activity {" + JSON.stringify(activity, undefined, 4)   + "} has capacity" );
                                //console.log('debug', "reason noCapacity not found in timeslot {" +  activity.timeSlot +"} of activity data  {" + JSON.stringify(activity, undefined, 4) + "," + "} response  here" + JSON.stringify(area.timeSlots[j], undefined, 4) );
                            }
                         }
                    }
                    if (timeSlotNotFound){
                        console.log('debug', "timeslot {" +  activity.timeSlot +"} of activity {" + JSON.stringify(activity, undefined, 4)  + "} Not found here" + JSON.stringify(area, undefined, 4) );
                    }
               }
            }else{
              activity.resourceId = internalData.root;
              activity.date = null;
              activitiesToCorrect.push(activity);
              var activityToUpdate = [activity ];
              console.log('info', "'response' : { " + JSON.stringify(response, undefined, 4) + "}");
              console.log('info', "Correcting activity " + iteration +" {" + JSON.stringify(activity, undefined, 4)  + "} of " + totalLength);
              const updateResponse = await proxy.bulkUpdateActivities(activityToUpdate);
                //element.innerHTML = "<pre>" + JSON.stringify(response, undefined, 4) + "</pre>";

              if ("results" in updateResponse ){
                  if ( updateResponse.results.length > 0) {
                      activitiesCorrected.push(activity);
                  }
              }
            }

         }
     }
     if (found){
       okActivities++;
     }else{
       errorActivities++;
     }
     iteration++;
     data.iteration = iteration;
     internalData.activitiesToCorrect = activitiesToCorrect;
     internalData.activitiesCorrected = activitiesCorrected;
     data.okActivites = okActivities;
     data.errorActivities = errorActivities;
     if ( iteration < totalLength ){
         correctActivity(data);
     }else{
       var element = document.getElementById("get-corrected-activities");
       element.innerHTML = "<pre>" + "Total Analized ( OK / Error ) " + okActivities + "/"+ errorActivities + " Assignments corrected ( OK / TOTAL )" + activitiesCorrected.length +"/" +activitiesToCorrect.length+" </pre>";
       element.innerHTML = "<pre>" +  " Assignments corrected Detail : " +  +activitiesToCorrect.length+" </pre>";
       var element = document.getElementById("action-debug");
       element.innerHTML = "<pre>" + "Assignments corrected </pre>";
     }

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
