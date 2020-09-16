"use strict";

function getQueryStringValue (key) {  
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
}
function makeBaseAuth(user, pswd) { 
    var token = user + ':' + pswd;
    var hash = "";
    if (btoa) {
    hash = btoa(token);
    }
    return "Basic " + hash;
} 
(function ($) {
    window.OfscPlugin = function (debugMode) {
        this.debugMode = debugMode || false;
    };
 
    $.extend(window.OfscPlugin.prototype, {
        /**
         * Check for string is valid JSON
         *
         * @param {*} str - String that should be validated
         *
         * @returns {boolean}
         *
         * @private
         */
        _isJson: function (str) {
            try {
                JSON.parse(str);
            }
            catch (e) {
                return false;
            }
            return true;
        },
 
        /**
         * Return origin of URL (protocol + domain)
         *
         * @param {String} url
         *
         * @returns {String}
         *
         * @private
         */
        _getOrigin: function (url) {
            if (url != '') {
                if (url.indexOf("://") > -1) {
                    return 'https://' + url.split('/')[2];
                } else {
                    return 'https://' + url.split('/')[0];
                }
            }
 
            return '';
        },
 
        /**
         * Return domain of URL
         *
         * @param {String} url
         *
         * @returns {String}
         *
         * @private
         */
        _getDomain: function (url) {
            if (url != '') {
                if (url.indexOf("://") > -1) {
                    return url.split('/')[2];
                } else {
                    return url.split('/')[0];
                }
            }
 
            return '';
        },
 
        /**
         * Sends postMessage to document.referrer
         *
         * @param {Object} data - Data that will be sent
         *
         * @private
         */
         
         
        _getPostMessageData: function (event) {
 
            if (typeof event.data === 'undefined') {
                this._log(window.location.host + ' <- NO DATA ' + this._getDomain(event.origin), null, null, true);
 
                return false;
            }
 
            if (!this._isJson(event.data)) {
                this._log(window.location.host + ' <- NOT JSON ' + this._getDomain(event.origin), null, null, true);
 
                return false;
            }
 
            var data = JSON.parse(event.data);
 
            if (!data.method) {
                this._log(window.location.host + ' <- NO METHOD ' + this._getDomain(event.origin), null, null, true);
 
                return false;
            }
 
            this._log(window.location.host + ' <- ' + data.method + ' ' + this._getDomain(event.origin), JSON.stringify(data, null, 4));
 
            
            switch (data.method) {
                case 'init':
                    var messageData = {
                        apiVersion: 1,
                        method: 'initEnd'
                    };
                    this._sendPostMessageData(messageData);
                    break;
 
                case 'open':
                    console.log('Open called');
                    this.pluginOpen(data);
                    break;
 
                // case 'wakeup':
                    // console.log('Wake Up called');
                    // this.pluginWakeup(data);
                    // break;
 
                // case 'error':
                    // data.errors = data.errors || {error: 'Unknown error'};
                    // this.processProcedureResult(document, event.data);
                    // this._showError(data.errors);
                    // break;
 
                // case 'callProcedureResult':
                    // console.log('callProcedureResult called');
                    // this.processProcedureResult(document, event.data);
                    // break;
 
                // default:
                    // this.processProcedureResult(document, event.data);
                    // console.log('default called');
                    // this._log(window.location.host + ' <- UNKNOWN METHOD: ' + data.method + ' ' + this._getDomain(event.origin), null, null, true);
                    // break;
            }
        },
        
        _sendPostMessageData: function (data) {
            //var originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';
            var originUrl = (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || 'aljefieldservic1.test.etadirect.com';
            var isString = 'string' === typeof data;

            if (originUrl) {
                this._log(window.location.host + ' -> ' + (isString ? '' : data.method) + ' ' + this._getDomain(originUrl), isString ? data : JSON.stringify(data, null, 4));
                //parent.postMessage(data, this._getOrigin('aljefieldservic1.test.etadirect.com'));
                parent.postMessage(data, this._getOrigin(originUrl));
            } else {
                this._log(window.location.host + ' -> ' + (isString ? '' : data.method) + ' ERROR. UNABLE TO GET REFERRER');
            }
        },
        _showError: function (errorData) {
            alert(JSON.stringify(errorData, null, 4));
            },
            _log: function (title, data, color, warning) {
                if (!this.debugMode) {
                    return;
                }
                if (!color) {
                    color = '#0066FF';
                }
                if (!!data) {
                    console.groupCollapsed('%c[Plugin API] ' + title, 'color: ' + color + '; ' + (!!warning ? 'font-weight: bold;' : 'font-weight: normal;'));
                    console.log('[Plugin API] ' + data);
                    console.groupEnd();
                } else {
                    console.log('%c[Plugin API] ' + title, 'color: ' + color + '; ' + (!!warning ? 'font-weight: bold;' : ''));
                }
            },

        init: function () {
            this._log(window.location.host + ' PLUGIN HAS BEEN STARTED');
            window.addEventListener("message", this._getPostMessageData.bind(this), false);
            var jsonToSend = {
                apiVersion: 1,
                method: 'ready',
                sendInitData: true
            };
            this._sendPostMessageData(jsonToSend);
        },
        pluginOpen: function(receivedData)
        {
            console.log(receivedData);
            getDetails(receivedData);
        }
    });
 
 
    function getDetails(receivedData){
        var to_details_link = receivedData.securedData.URL+':443/crmRestApi/resources/11.13.18.05/TransferOrder_c/'+getQueryStringValue('id');
        var to_line_link = receivedData.securedData.URL+':443/crmRestApi/resources/11.13.18.05/TransferOrder_c/'+getQueryStringValue('id')+'/child/TransferOrderLineCollection_c';
        
        
        ec_url = receivedData.securedData.URL;
        ec_username = receivedData.securedData.username;
        ec_password = receivedData.securedData.password;
        oFSCUsername = receivedData.securedData.oFSCUsername;
        oFSCPassword = receivedData.securedData.oFSCPassword;
        resourceName = receivedData.resource.pname;
        external_id = receivedData.resource.external_id;
        
        $.ajax({
            type: "GET",
            url: to_details_link,
            beforeSend: function (xhr) {
              xhr.setRequestHeader('Authorization', makeBaseAuth(ec_username, ec_password));
              $('#fade-wrapper').fadeIn();  
            },
            success: function(data) {
                var date = new Date(data.CreationDate);
                var reuqest_date =((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
                $('#request-number').html(data.RecordName);
                $('#status').html(data.Status_c);
                $('#recive_parts').hide();
                if(data.Status_c == 'APPROVED'){
                    $('#recive_parts').show();
                }
                $('#requested-date').html(reuqest_date);
                $('#record-id').val(data.Id);
                $('#fade-wrapper').fadeOut();
                getLines(to_line_link);
            }.bind(this),
            error: function(xhr, status, err) {
              console.error(to_details_link, status, err.toString());
              $('#fade-wrapper').fadeOut();  
            }.bind(this)
        });
    }
    
    function getLines(url_link){
        $.ajax({
            type: "GET",
            url: url_link,
            beforeSend: function (xhr) {
              xhr.setRequestHeader('Authorization', makeBaseAuth(ec_username, ec_password));
              $('#fade-wrapper').fadeIn();  
            },
            success: function(data) {
                updateLines(data);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(url_link, status, err.toString());
                $('#fade-wrapper').fadeOut();  
            }.bind(this)
        });
    }
    
    function updateLines(intialdata){
        var lineData = intialdata;
        var product_number = [];
        $.each(intialdata.items, function(key, value) {
            product_number.push(value.PartName_c);
        });
        var productString = product_number.join(",");
        var finalString = '\'' + productString.split(',').join('\',\'') + '\'';
        var URL = ec_url+":443/crmRestApi/resources/11.13.18.05/products?onlyData=true&q=ItemNumber IN ("+finalString+")&totalResults=true&limit=30000&fields=InventoryItemId,ItemNumber,SellingPrice_c";
        $.ajax({
            type: "GET",
            url: URL,
            beforeSend: function (xhr) {
              xhr.setRequestHeader('Authorization', makeBaseAuth(ec_username, ec_password));
              xhr.setRequestHeader('rest-framework-version','2');
            },
            success: function(data) {
                var productPrice = {};
                $.each(data.items, function(key, value) {
                    productPrice[value.ItemNumber] = value.SellingPrice_c;
                });
                $.each(lineData.items, function(key, value) {
                    var price = (value.PartName_c in productPrice) ? ((productPrice[value.PartName_c] !==null )? productPrice[value.PartName_c] :0) : 0;
                    var issue_qty = (value.IssueQuantity_c !==null )? value.IssueQuantity_c : 'NA';
                    var row_data = $('#part-list tbody').html();
                    row_data = row_data+"<tr><td>"+value.PartName_c+"</td><td>"+value.Quantity_c+"</td><td>"+issue_qty+"</td><td>"+price+"</td><td>"+(value.IssueQuantity_c*price)+"</td></tr>";
                    $('#part-list tbody').html(row_data);
                });
                $('#fade-wrapper').fadeOut();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(URL, status, err.toString());
                $('#fade-wrapper').fadeOut();  
            }.bind(this)
        });   
    }
})(jQuery);