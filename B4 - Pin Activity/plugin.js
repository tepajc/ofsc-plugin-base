"use strict";

var activity;

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
Date.prototype.decreaseDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
}

function openMessage(data) {
  <!--PLACEHOLDER FOR CUSTOM CODE-- >
  console.log('info', "PIN ACTIVITY " + JSON.stringify(data, undefined, 4) );
  var action = "PIN";
  if ("pinAction" in data.openParams){
    action = data.openParams.pinAction;
  }
  var minutesThreshold = 15;
  if ("minutesThreshold" in data.openParams){
    minutesThreshold = data.openParams.minutesThreshold;
  }
  var activityData = {
		"aid" : data.activity.aid
  };
  if (action == "PIN"){
    var newSlaStart = generateStartSla(data.activity.ETA, data.activity.date, parseInt(minutesThreshold));
    var newSlaEnd = generateEndSla( data.activity.end_time, data.activity.date, parseInt(minutesThreshold));
     activityData = {
       "aid" : data.activity.aid,
       "XA_ORIGINAL_SLA_START" : data.activity.sla_window_start ,
       "XA_ORIGINAL_SLA_END" : data.activity.sla_window_end,
       "sla_window_start" : newSlaStart,
       "sla_window_end" : newSlaEnd
     };
  } else if (action == "UNPIN"){
      activityData = {
        "aid" : data.activity.aid,
        "sla_window_start" : data.activity.XA_ORIGINAL_SLA_START ,
        "sla_window_end" : data.activity.XA_ORIGINAL_SLA_END
      };
  }else{
    alert("The parameter pinAction needs to be configured as a securedParameter in plugin configuration")
  }


  closePlugin(activityData);
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


// additional function
function generateStartSla(startTime, startDate, minutes) {

  var a = startTime.split(':'); // split it at the colons
  // Get start time and give 15 minutes of margin
  var hours12 = a[0];
  var minutesAmPm = a[1].split(' ');
  var startMinute = parseInt(minutesAmPm[0]);
  var amPm = minutesAmPm[1];
  var startHour = parseInt(hours12);
  // To correct AM/PM situations
  if ( amPm == "PM"){
    if ( startHour != 12 ){
      startHour=startHour+12;
    }
  }else{
    if ( startHour == 12 ){
      startHour=startHour-12;
    }
  }

  if (startMinute > minutes ){
    startMinute = startMinute - minutes;
  }else{
    startMinute = startMinute + 60 - minutes;
    if (startHour > 0  ){
        startHour = startHour - 1;
    }else{
      startHour = 23;
      // TODO : Correct date to date - 1
      var date = new Date(startDate);
      var dAfter = date.decreaseDays(1);
      var afterYears = dAfter.getFullYear();
      var monthsNumber = dAfter.getMonth() + 1;
      var afterMonth = (monthsNumber<10?'0':'') + monthsNumber;
      var afterDay = (dAfter.getDate()<10?'0':'') + dAfter.getDate();
      var dAfterTxt = afterYears + "-" + afterMonth + "-" + afterDay;
    }

  }
  var newSlaStart = startDate + " " + (startHour<10?'0':'') + startHour + ":" + (startMinute<10?'0':'') + startMinute + ":00";
  return newSlaStart;
}
function generateEndSla(endTime, endDate, minutes) {
  var a = endTime.split(':'); // split it at the colons
  // Get start time and give 15 minutes of margin
  var hours12 = a[0];
  var minutesAmPm = a[1].split(' ');
  var endMinute = parseInt(minutesAmPm[0]);
  var amPm = minutesAmPm[1];
  var endHour = parseInt(hours12);
  // To correct AM/PM situations
  if ( amPm == "PM"){
    if ( endHour != 12 ){
      endHour=endHour+12;
    }
  }else{
    if ( amPm == 12 ){
      amPm=amPm-12;
    }
  }
  console.log('info', "HOUR and MINUTES Before" + endHour +":" + endMinute);
  var result = parseInt(endMinute) + parseInt(minutes);
  if (result < 60 ){
    endMinute = result;
  }else{
    endMinute = parseInt(endMinute) - 60 + parseInt(minutes);
    if (endHour < 23  ){
        endHour = endHour + 1;
    }else{
      endHour = 0;
      // TODO : Correct date to date - 1
      var date = new Date(startDate);
      var dAfter = date.addDays(1);
      var afterYears = dAfter.getFullYear();
      var monthsNumber = dAfter.getMonth() + 1;
      var afterMonth = (monthsNumber<10?'0':'') + monthsNumber;
      var afterDay = (dAfter.getDate()<10?'0':'') + dAfter.getDate();
      var dAfterTxt = afterYears + "-" + afterMonth + "-" + afterDay;
    }

  }
  console.log('info', "HOUR and MINUTES After" + endHour +":" + endMinute);
  var newSlaEnd = endDate + " " + (endHour<10?'0':'') + endHour + ":" + (endMinute<10?'0':'') + endMinute + ":00";
  return newSlaEnd;
}
