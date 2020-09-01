/*!
 ##################################################################################
 # @file Oracle Field Service - Activity Detail Plug-In
 # @author Robert Surujbhan <robert.surujbhan@oracle.com>
 # @copyright 2020, Oracle Corporation. All rights reserved.
 # https://www.oracle.com
 ##################################################################################
 */

document.getElementById("wsUpdateButton").addEventListener("click", function () {
    updateActivityProps(staticData.BNG_MODEL, staticData.BNG_SPEED);
});

function getExternalData() {
    var serviceUrl = "https://apex.oracle.com/pls/apex/oraclejet/emp/";
    var requestHeaders = {
        //"Authorization": 'Basic ' + btoa(USER+":"+PASSWORD)
    };
    return new Promise((resolve, reject) => {
        $.ajax({
            url: serviceUrl,
            method: "GET",
            dataType: "json",
            headers: requestHeaders,
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}

function isEmpty(str) {
    return (!str || 0 === str.length || str === undefined);
}

function processData() {
    var dateObj = new Date();
    document.getElementById("content").innerHTML = dateObj.toString();
    //console.log(staticData);
    $.each(staticData, function (key, value) {
        if (typeof value != 'object') {
            //console.log( key + ": " + value);
            $("#wsDataTable tbody").append("<tr><td><b>" + key + "</b></td><td>" + value + "</td></tr>");
        }
    });

    getExternalData().then(function (response) {
        console.log(response);
        var tableData = [];
        tableData = response.items;
        var recordCount = 0;
    
        for (var i = 0; i < tableData.length; i++) {
            var itemData = tableData[i];
            if (!isEmpty(itemData.ename) && !isEmpty(itemData.job)) {
                $("#emps").append((i+1)+": " + itemData.ename + " ("+itemData.job+")" + "<br/>");
                recordCount++;
            }
        }

        document.getElementById("empCount").innerHTML = "# employees: " + recordCount;
    })
    .catch(function (error) {
        alert(error.statusText);
        console.log("getExternalData failed");
        console.log(error.responseText);
    });
}