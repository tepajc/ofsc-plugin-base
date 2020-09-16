"use strict";

var datahash;

function makeBaseAuth(user, pswd) { 
  var token = user + ':' + pswd;
  var hash = "";
  if (btoa) {
    hash = btoa(token);
  }
  return "Basic " + hash;
}

function postInvData(invArry){
  $('#fade-wrapper').fadeIn();
  for(var idx in invArry){
    $.ajax({
      type: "POST",
      data: invArry[idx],
      contentType: "application/json",
      url: fserviceURL + '/rest/ofscCore/v1/resources/'+invArry[idx].resourceId+'/inventories',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', makeBaseAuth(fserviceUser, fservicePass));
        $('#fade-wrapper').fadeIn();  
      },
      success: function(data) {
          alert("Inventory Added Sucessfully.");
          $('#inv-list tbody').empty();
          $('#fade-wrapper').fadeOut();
      }.bind(this),
      error: function(xhr, status, err) {
          console.error(fserviceURL,status, err.toString());
          $('#fade-wrapper').fadeOut();  
      }.bind(this)
    });
  }
  $('#fade-wrapper').fadeOut();
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
                //showHeader: false,
                //enableBackButton: false
            };
            this._sendPostMessageData(jsonToSend);
        },
        
        pluginOpen: function(receivedData)
        {
            console.log(receivedData);
            fserviceURL = receivedData.securedData.URL;
            fserviceUser = receivedData.securedData.username;
            fservicePass = receivedData.securedData.password;
            var url_link = fserviceURL+"/rest/ofscMetadata/v1/inventoryTypes";
         // var xhr = new XMLHttpRequest();
	     // xhr.open('GET', url_link, false);
		 //	xhr.setRequestHeader('Accept', '*/*');
	     //	xhr.setRequestHeader('Authorization', makeBaseAuth(fserviceUser, fservicePass));
	     // xhr.send();
		 // xhr.onreadystatechange = processResp;
		 // function processResp(data){
		 // console.log(data);
		 // }
		
            $.ajax({
                type: "GET",        		
                url: url_link,				
                beforeSend: function (xhr) {
                  xhr.setRequestHeader('Authorization', makeBaseAuth(fserviceUser, fservicePass));
                  $('#fade-wrapper').fadeIn();
                },
                success: function(data) {
                    console.log(data);
                    var invlist_html1 = '<select class="form-control" name="invlist" id="invlist"><option value=></option>';
                    $.each(data.items, function(key, value) {
                        invlist_html1 += '<option value='+value.label+'>'+value.name+'</option>';
                    });
                    invlist_html1 += '</select>';
                    console.log(invlist_html1);
                    $('#fade-wrapper').fadeOut();
                }.bind(this),
                error: function(xhr, status, err) {
                  console.error(url_link, status, err.toString());
                  $('#fade-wrapper').fadeOut();  
                }.bind(this)
            });
			
			
			/*function p_callback(data){
				    console.log(data);
                    invlist_html = '<select class="form-control" name="invlist" id="invlist"><option value=></option>';
                    $.each(data.items, function(key, value) {
                        invlist_html += '<option value='+value.label+'>'+value.name+'</option>';
                    });
                    invlist_html += '</select>';
                    console.log(invlist_html);
                    $('#fade-wrapper').fadeOut();
			}*/
        }
    });
 
})(jQuery);