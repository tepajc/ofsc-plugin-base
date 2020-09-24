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
    updateResourceWorkschedule( resourceId, fields ){
       var theURL = new URL('/rest/ofscCore/v1/resources/'+resourceId+'/workSchedules',this.baseURL);
       var myHeaders = new Headers();
       myHeaders.append("Authorization", this.authorization);
       var requestOptions = {
           method: 'POST',
           headers: myHeaders,
           redirect: 'follow',
           body: JSON.stringify(fields)
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


}
