/*!
 ##################################################################################
 # @file Oracle Field Service - Activity Detail Plug-In
 # @author Robert Surujbhan <robert.surujbhan@oracle.com>
 # @copyright 2020, Oracle Corporation. All rights reserved.
 # https://www.oracle.com
 ##################################################################################
 */

var ACTIVITY_ID = 0;

function _getOrigin(url) {
    if (url != '') {
        if (url.indexOf("://") > -1) {
            return 'https://' + url.split('/')[2];
        }
        else {
            return 'https://' + url.split('/')[0];
        }
    }
    return '';
}

function _getDomain(url) {
    if (url != '') {
        if (url.indexOf("://") > -1) {
            return url.split('/')[2];
        }
        else {
            return url.split('/')[0];
        }
    }
    return '';
}

function _sendPostMessageData(data) {
    console.log("_sendPostMessageData", data);

    if (document.referrer !== '') {
        console.log(window.location.host + ' -> ' + data.method + ' ' + _getDomain(document.referrer), JSON.stringify(data, null, 4));
        parent.postMessage(JSON.stringify(data), _getOrigin(document.referrer));
    }
}

function _getPostMessageData(event) {
    //console.log("_getPostMessageData", event);
    if (typeof event.data !== 'undefined' && _isFromOfscSource(_getDomain(event.origin))) {
        if (_isJson(event.data)) {
            console.log(window.location.host + ' <- JSON OK: ' + _getDomain(event.origin));
            var data = JSON.parse(event.data);
            console.log(data);
            if (data.method) {
                console.log(window.location.host + ' <- ' + data.method + ': ' + _getDomain(event.origin));
                switch (data.method) {
                    case 'open':
                        console.log("RS", data);
                        ACTIVITY_ID = data.activity.aid;
                        break;
                    case 'error':
                        data.errors = data.errors || { error: 'Unknown error' };
                        console.log(data.errors);
                        break;
                    default:
                        console.log("RS Unknown method", data.method);
                        break;
                }
            }
        }
        else {
            console.log(window.location.host + ' <- NOT JSON: ' + _getDomain(event.origin));
        }
    }
    else {
        // event msg not from OFSC...
    }
}

function _isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function _isFromOfscSource(str) {
    return str.indexOf("etadirect.com") !== -1;
}

function init() {
    window.addEventListener("message", _getPostMessageData, false);
    _sendPostMessageData({
        apiVersion: 1,
        method: 'ready'
    });
}

function updateActivityProps(bngModel, bngSpeed) {
    console.log("updateActivityProps", bngModel, bngSpeed);
    if (ACTIVITY_ID > 0) {
        _sendPostMessageData({
            apiVersion: 1,
            method: 'close',
            entity: 'activity',
            activity: {
                aid: ACTIVITY_ID,
                XA_BNG_MODEL: bngModel,
                XA_BNG_SPEED: bngSpeed
            }
        });
    }
}