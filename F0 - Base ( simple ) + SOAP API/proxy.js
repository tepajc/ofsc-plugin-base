class OFSCProxy {
    createInstance(instance, clientId, clientSecret, baseURL) {
         // TODO: add auth construction
         this.instance = instance;
         this.clientId = clientId;
         this.clientSecret = clientSecret;
         this.baseURL = new URL(baseURL);
         /** Sunrise0511 - REPLACE */
         this.authorization = this.authenticateUser(clientId,instance,clientSecret)
         console.log('error', "USER AUTHENTICATION is " + this.authorization)
    }

    authenticateUser(clientId, company, clientSecret) {
          var token = clientId +'@'+company+':'+clientSecret;
          var hash = btoa(token);
          return 'Basic '+ hash;
    }
    constructor() {
        // TODO: HARDCODEADO
        this.instance="";
        this.baseURL = new URL("https://api.etadirect.com");
        this.clientId = "";
        this.clientSecret = "";
        this.authorization = "";
        //this.instance = "sunrise0701";
        //this.baseURL = new URL("https://api.etadirect.com");
        //this.clientId = 'demoauth';
        //this.clientSecret = '6bdd127b992e6250942730f1313a1b1bbc2c2a7efbed661c662ed0d0584a27e0';
        //this.authorization = this.authenticateUser(  this.clientId,this.instance,this.clientSecret)
        //this.authorization = "Basic ZGVtb2F1dGhAc3VucmlzZTA1MTE6NmJkZDEyN2I5OTJlNjI1MDk0MjczMGYxMzEzYTFiMWJiYzJjMmE3ZWZiZWQ2NjFjNjYyZWQwZDA1ODRhMjdlMA==";
    }
    bulkUpdateActivities( activities ){
       var theURL = new URL('/rest/ofscCore/v1/activities/custom-actions/bulkUpdate',this.baseURL);
       var myHeaders = new Headers();
       myHeaders.append("Authorization", this.authorization);
       var updateParameters = {
              "identifyActivityBy": "activityId",
              "ifInFinalStatusThen": "doNothing" };
       var data = {};
       data.updateParameters  = updateParameters;
       data.activities = activities;
       var requestOptions = {
           method: 'POST',
           headers: myHeaders,
           redirect: 'follow',
           body: JSON.stringify(data)
       };
      // console.log('info', 'REQUEST Data bulkUpdateActivities' + JSON.stringify(data));
       const fetchPromiseUpdate = fetch(theURL, requestOptions)
           .then(response => response.json())
           .then(function(response) {
               // Your code for handling the data you get from the API
               return response;
           })
           .catch(error => console.log('error', error));
       return fetchPromiseUpdate;
   }
   updateCapacitySOAP(){
      var inputDate = new Date().toISOString().substr(0, 19);
      var inputClientId = this.clientId;
      var inputSecret = this.clientSecret;
      console.log("Input data" +  inputDate +","+ inputClientId +","+ inputSecret );
      // SHA 256
      var clientId256 = CryptoJS.SHA256(inputClientId);
      console.log("First SHA256 input - output " +  inputClientId  +","+  clientId256  );
      var toTransform = inputSecret + clientId256;
      var tmpSha256 = CryptoJS.SHA256(toTransform);
      console.log("Second SHA256 input - output " +  toTransform  +","+  tmpSha256  );
      toTransform = inputDate + tmpSha256;
      var authString = CryptoJS.SHA256(toTransform);
      console.log("Final SHA256 input - output " +  toTransform  +","+  authString  );
      var header ="<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" "
      header = header + "xmlns:urn=\"urn:toa:capacity\"><soapenv:Header /><soapenv:Body><urn:get_quota_data><user>";
      header = header + "<now>"+inputDate+"</now><login>"+inputClientId+"</login>";
      header = header + "<company>"+this.instance +"</company>";
      header = header + "<auth_string>"+authString+"</auth_string></user>";

      var body = " <date>2020-01-21</date>";
      body = body + "<resource_id>FLUSA</resource_id>";
      body = body + "<aggregate_results>0</aggregate_results>";
      body = body + "<calculate_totals>true</calculate_totals>";
      body = body + "<category_quota_field>max_available</category_quota_field>";
      body = body + "<category_quota_field>quota_percent</category_quota_field>";
      body = body + "<category_quota_field>quota</category_quota_field>";
      body = body + "<category_quota_field>count</category_quota_field>";
      body = body + "<category_quota_field>used</category_quota_field>";
      body = body + "<category_quota_field>used_quota_percent</category_quota_field>";
      body = body + "<category_quota_field>status</category_quota_field>";
      body = body + "<category_quota_field>close_time</category_quota_field>";
      var footer = "</urn:get_quota_data></soapenv:Body></soapenv:Envelope>";
      var data = header + body + footer;
      console.log("XML" +  data);
      var theURL = new URL('/soap/capacity/',this.baseURL);
      var myHeaders = new Headers();
      myHeaders.append( "SOAPAction", this.baseURL + "/soap/capacity" );
      myHeaders.append( "Content-Type", this.baseURL + "text/xml" );

       var requestOptions = {
           method: 'POST',
          headers: myHeaders,
          redirect: 'follow',
          body: data
        };
     const fetchPromiseUpdate = fetch(theURL, requestOptions)
            .then(response => response.text())
            .then(function(response) {
              console.log("XML Response "+ response);
                return response;
            })
            .catch(error => console.log('error', error));
            console.log(fetchPromiseUpdate);
            return fetchPromiseUpdate;
  }
    getActivities(root, from, to, offset=0, limit=1000, fields, query) {
        var myHeaders = new Headers();
        var theURL = new URL('/rest/ofscCore/v1/activities',this.baseURL);
        theURL.searchParams.append("resources", root);
        theURL.searchParams.append("dateFrom", from);
        theURL.searchParams.append("dateTo", to);
        theURL.searchParams.append("offset", offset);
        theURL.searchParams.append("limit", limit);
        theURL.searchParams.append("fields", fields)
        theURL.searchParams.append("query", query)


        myHeaders.append("Authorization", this.authorization);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow',

        };
        const fetchPromise = fetch(theURL, requestOptions)
            .then(response => response.json())
            .then(function(response) {
                // Your code for handling the data you get from the API
                return response;
            })
            .catch(error => console.log('error', error));
        return fetchPromise;
    }
    getTimeslots() {
        var myHeaders = new Headers();
        var theURL = new URL('/rest/ofscMetadata/v1/timeSlots',this.baseURL);
        myHeaders.append("Authorization", this.authorization);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const fetchPromise = fetch(theURL, requestOptions)
            .then(response => response.json())
            .then(function(response) {
                // Your code for handling the data you get from the API
                  console.log("RESULT" + JSON.stringify(response));
                return response;
            })
            .catch(error => console.log('error', error));

        return fetchPromise;
    }
    getSubscriptions() {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", this.authorization);
        var theURL = new URL('rest/ofscCore/v1/events/subscriptions',this.baseURL);
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const fetchPromise = fetch(theURL, requestOptions)
            .then(response => response.json())
            .then(function(response) {
                // Your code for handling the data you get from the API
                return response;
            })
            .catch(error => console.log('error', error));
        return fetchPromise;
    }
    getActivityBookingOptions(activity , areas, dates) {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", this.authorization);
        var theURL = new URL('rest/ofscCapacity/v1/activityBookingOptions',this.baseURL);
        // standard parameters
        theURL.searchParams.append("determineCategory", "true");
        theURL.searchParams.append("estimateTravelTime", "true");
        if ( areas == ""){
            theURL.searchParams.append("determineAreaByWorkZone", "true");
        }else{
            theURL.searchParams.append("areas", areas);
            theURL.searchParams.append("determineAreaByWorkZone", "false");
        }
        theURL.searchParams.append("dates", dates);
        // specific parameters
        theURL.searchParams.append("activityType", activity.activityType);
        theURL.searchParams.append("apptNumber", activity.apptNumber);
        theURL.searchParams.append("city", activity.city);
        theURL.searchParams.append("postalCode", activity.postalCode);
        if ("TIMESLOT_Selected" in activity && activity.TIMESLOT_Selected != ""){
            theURL.searchParams.append("TIMESLOT_Selected", activity.TIMESLOT_Selected);
        }

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const fetchPromise = fetch(theURL, requestOptions)
            .then(response => response.json())
            .then(function(response) {
                // Your code for handling the data you get from the API
                return response;
            })
            .catch(error => console.log('error', error));
        return fetchPromise;
    }

}
