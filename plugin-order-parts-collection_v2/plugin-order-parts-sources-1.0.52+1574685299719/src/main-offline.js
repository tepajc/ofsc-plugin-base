(function () {

    const originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';

    window.addEventListener("message", onPostMessage, false);

    window.parent.postMessage({
        apiVersion: 1,
        method: 'ready'
    }, getOrigin(originUrl));

    function onPostMessage(event) {
        // Ignore internal JET messages
        if (event.source === window) {
            return;
        }

        alert('You must be online to proceed');

        window.parent.postMessage({
            apiVersion: 1,
            method: 'close'
        }, getOrigin(originUrl));
    }
    function getOrigin(url) {
        if (typeof url === 'string' && url !== '') {
            if (url.indexOf("://") > -1) {
                return 'https://' + url.split('/')[2];
            } else {
                return 'https://' + url.split('/')[0];
            }
        }

        return '';
    }
})();
