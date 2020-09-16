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
            ec_url = receivedData.securedData.URL;
            ec_username = receivedData.securedData.username;
            ec_password = receivedData.securedData.password;
            resource_name = receivedData.resource.pname;
            res_sub_inv = receivedData.resource.res_svc_inv;
            external_id = receivedData.resource.external_id;
            service_center = receivedData.resource.service_center_res;
            get_part_data(); 
            set_locations(receivedData);
        }
    });
    
    function set_locations(receivedData){
        var cur_service_center = receivedData.resource.service_center_res;
        //cur_service_center = cur_service_center.replace(" SERVICE CENTER", "");
        var url_link = receivedData.securedData.URL+":443/crmRestApi/resources/latest/Inventory_Location_c?onlyData=true&limit=3000&q=ServiceCenter_c= '"+cur_service_center+"'";
        $.ajax({
            type: "GET",
            url: url_link,
            beforeSend: function (xhr) {
                $('#fade-wrapper').fadeIn();  
                xhr.setRequestHeader('Authorization', makeBaseAuth(receivedData.securedData.username, receivedData.securedData.password));
            },
            success: function(data) {
                $.each(data.items, function(key, value) {
                    if(value.RecordName.indexOf("EAC") != -1){
                        eac_location_id = value.Id;
                    }
                    if(value.RecordName.indexOf("TPC") != -1){
                        tpc_location_id = value.Id;
                    }
                });
                set_sublocations(eac_location_id);
                set_sublocations(tpc_location_id);
            }.bind(this),
            error: function(xhr, status, err) {
              console.error(url_link, status, err.toString());
            }.bind(this)
        });
    }
    
    function set_sublocations(service_center){
        var url_link = ec_url+"/crmRestApi/resources/latest/Subinventory_Location_c?fields=Id,RecordName,EBSSubinventoryID_c,Inventory_Id_c&q=Inventory_Id_c="+service_center+"&onlyData=true&limit=1000&totalResults=True";
        $.ajax({
            type: "GET",
            url: url_link,
            beforeSend: function (xhr) {
                $('#fade-wrapper').fadeIn();  
                xhr.setRequestHeader('Authorization', makeBaseAuth(ec_username, ec_password));
            },
            success: function(data) {
                $.each(data.items, function(key, value) {
                    if(value.RecordName.toLowerCase().indexOf("eac") != -1 && value.EBSSubinventoryID_c.toLowerCase() == res_sub_inv.toLowerCase()){
                        eac_desti = value.Id;
                    }
                    if(value.RecordName.toLowerCase().indexOf("tpc") != -1 && value.EBSSubinventoryID_c.toLowerCase() == res_sub_inv.toLowerCase()){
                        tpc_desti = value.Id;
                    }
                    if(value.RecordName.toLowerCase().indexOf("eac") != -1 && value.RecordName.toLowerCase().indexOf("fresh") != -1 ){
                        eac_source = value.Id;
                    }
                    if(value.RecordName.toLowerCase().indexOf("tpc") != -1 && value.RecordName.toLowerCase().indexOf("fresh") != -1 ){
                        tpc_source = value.Id;
                    }
                });
            }.bind(this),
            error: function(xhr, status, err) {
              console.error(url_link, status, err.toString());
            }.bind(this)
        });
    }
    
    function get_part_data(){
        var call_url = ec_url+":443/crmRestApi/resources/11.13.18.05/products?q=InventoryItemStatusCode='Active';Type_c='PART'&onlyData=true&totalResults=true&limit=30000&&fields=InventoryItemId,ItemNumber,Oraganization_c,EBSID_c,SellingPrice_c,AlternatePartForThisPart_c,Type_c&offset="+offset;
        $.ajax({
            type: "GET",
            url: call_url,
            beforeSend: function (xhr) {
               if(offset == 0){
                  $('#fade-wrapper').fadeIn();  
               }
               xhr.setRequestHeader('Authorization', makeBaseAuth(ec_username, ec_password));
            },
            success: function(data) {
                $.each(data.items, function(key, value) {
                    availableTags.push(value.ItemNumber);
                    part_source[value.ItemNumber]={id:value.InventoryItemId,type:value.Oraganization_c,ebs_id:value.EBSID_c,selling_price:value.SellingPrice_c,alter_part:value.AlternatePartForThisPart_c};
                    offset++;
                });
                if(offset < data.totalResults){
                    get_part_data();
                } else {
                    $('#fade-wrapper').fadeOut();
                    $("#parts").autocomplete({
                      source: availableTags,
                      change: function(event, ui) {
                            if (ui.item == null) {
                                $("#parts").val("");
                                $("#parts").focus();
                            }
                        }
                    });
                }
            }.bind(this),
            error: function(xhr, status, err) {
              console.error(url_link, status, err.toString());
            }.bind(this)
        });
    }
 
})(jQuery);