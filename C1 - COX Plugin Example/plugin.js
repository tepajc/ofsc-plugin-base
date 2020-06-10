"use strict";

function _isJson(str){
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}

function _getPostMessageData(event) {

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
            console.log(data);
            if (data.activityList && Object.keys(data.activityList).length > 0) {
                let count = 0;

                for (let act of Object.values(data.activityList)) {
                    if (act.astatus == "pending" || act.astatus == "started") {
                        count++;
                    }
                }
                if (count > 0) {
                    window.location.href = 'https://slc06wer.us.oracle.com/plugins/cox-navigate/app1.html'
                }
                else {
                    window.location.href = 'https://slc06wer.us.oracle.com/plugins/cox-navigate/app2.html'
                }
            }
            else {
                window.location.href = 'https://slc06wer.us.oracle.com/plugins/cox-navigate/app2.html'
            }
            break;

        case 'init':
            var logo = atob("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");
            var ab = new ArrayBuffer(logo.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < logo.length; i++) {
                ia[i] = logo.charCodeAt(i);
            }
            var myBlob = new Blob([ab], {type: 'image/png'});
            var jsonToSend = {
                apiVersion: 1,
                method: 'initEnd',
                buttonsIconData: {}
            };
            for (var i=0; i < data.buttons.length; i++) {
                var bi = data.buttons[i].buttonId;
                jsonToSend.buttonsIconData[bi] = {
                    image: myBlob,
                    text: ""
                }
            }

            _sendPostMessageData(jsonToSend);

            break;
        case 'error':

            break;
        // other methods may go here
    }
}

function _getOrigin(url) {
    if (url != '') {
        if (url.indexOf("://") > -1) {
            return 'https://' + url.split('/')[2];
        } else {
            return 'https://' + url.split('/')[0];
        }
    }
    return '';
}

function _sendPostMessageData(data) {
    var originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';

    if (originUrl) {
        parent.postMessage(data, _getOrigin(originUrl));
    }
}

function plugin_init() {

    window.addEventListener("message", _getPostMessageData, false);

    var jsonToSend = {
        apiVersion: 1,
        method: 'ready',
        "sendInitData": true
    };

    _sendPostMessageData(jsonToSend);
}
