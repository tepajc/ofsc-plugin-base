"use strict";

var activity;

function openMessage(data) {
    <!--PLACEHOLDER FOR CUSTOM CODE-- >

    // Read property data
    var tabledata = JSON.parse(data.activity["XA_LIST"]);
    // Create x2js instance with default config
    var x2js = new X2JS();

    //Build Tabulator
    var table = new Tabulator("#issues-table", {
        data:tabledata,
        layout:"fitDataStretch",
        columns:[
            {title:"ID", field:"id", width:150, editor:"input"},
            {title:"Fecha/Hora", field:"date", hozAlign:"center", sorter:"date", width:140},
            {title:"Valor Medio", field:"avg_value", sorter:"number", hozAlign:"left", width:140, editor:true},
            {title:"Grupo", field:"group",  editor:"select", editorParams:{values:{"Uno":"One", "Dos":"two", "Otro":"Other"}}},
            {title:"Comentario", field:"comment", hozAlign:"center", width:140, editor:true},
            {title:"Valores", field:"values", hozAlign:"center", editor:true},
        ],
    });



    //var element = document.getElementById("received-data");
    //element.innerHTML = "<pre>" + JSON.stringify(data, undefined, 4) + "</pre>";



// Submit results

    document.getElementById("submit").addEventListener("click", function() {
        var tableData = table.getData();
        var newData = JSON.stringify(tableData);
        var temp = {};
        temp.item = tableData;
        var temp2 = {};
        temp2.root = temp;
        var xmlData = x2js.json2xml_str( temp2 );
        var activityData = {
            "XA_LIST": newData,
            "XA_LIST_XML": xmlData,
            "aid": data.activity.aid
        };
        closePlugin(activityData);
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
