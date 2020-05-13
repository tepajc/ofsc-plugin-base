"use strict";

(function ($) {
    window.OfscPlugin = function (debugMode) {
        this.debugMode = debugMode || false;
    };

    $.extend(window.OfscPlugin.prototype, {
        /**
         * Dictionary of enums
         */
        dictionary: {
            astatus: {
                pending: {
                    label: 'pending',
                    translation: 'Pending',
                    outs: ['started', 'cancelled', 'suspended'],
                    color: '#FFDE00'
                },
                started: {
                    label: 'started',
                    translation: 'Started',
                    outs: ['complete', 'suspended', 'notdone', 'cancelled'],
                    color: '#A2DE61'
                },
                complete: {
                    label: 'complete',
                    translation: 'Completed',
                    outs: [],
                    color: '#79B6EB'
                },
                suspended: {
                    label: 'suspended',
                    translation: 'Suspended',
                    outs: [],
                    color: '#9FF'
                },
                notdone: {
                    label: 'notdone',
                    translation: 'Not done',
                    outs: [],
                    color: '#60CECE'
                },
                cancelled: {
                    label: 'cancelled',
                    translation: 'Cancelled',
                    outs: [],
                    color: '#80FF80'
                }
            },
            invpool: {
                customer: {
                    label: 'customer',
                    translation: 'Customer',
                    outs: ['deinstall'],
                    color: '#04D330'
                },
                install: {
                    label: 'install',
                    translation: 'Installed',
                    outs: ['provider'],
                    color: '#00A6F0'
                },
                deinstall: {
                    label: 'deinstall',
                    translation: 'Deinstalled',
                    outs: ['customer'],
                    color: '#00F8E8'
                },
                provider: {
                    label: 'provider',
                    translation: 'Resource',
                    outs: ['install'],
                    color: '#FFE43B'
                }
            }
        },

        mandatoryActionProperties: {},

        /**
         * Which field shouldn't be editable
         *
         * format:
         *
         * parent: {
         *     key: true|false
         * }
         *
         */
        renderReadOnlyFieldsByParent: {
            data: {
                apiVersion: true,
                method: true,
                entity: true
            },
            resource: {
                pid: true,
                pname: true,
                gender: true
            }
        },

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
        _sendPostMessageData: function (data) {
            var originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';
            var isString = 'string' === typeof data;

            if (originUrl) {
                this._log(window.location.host + ' -> ' + (isString ? '' : data.method) + ' ' + this._getDomain(originUrl), isString ? data : JSON.stringify(data, null, 4));

                parent.postMessage(data, this._getOrigin(originUrl));
            } else {
                this._log(window.location.host + ' -> ' + (isString ? '' : data.method) + ' ERROR. UNABLE TO GET REFERRER');
            }
        },

        /**
         * Handles during receiving postMessage
         *
         * @param {MessageEvent} event - Javascript event
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
                    this.pluginInitEnd(data);
                    break;

                case 'open':
                    this.pluginOpen(data);
                    break;

                case 'wakeup':
                    this.pluginWakeup(data);
                    break;

                case 'error':
                    data.errors = data.errors || {error: 'Unknown error'};
                    this.processProcedureResult(document, event.data);
                    this._showError(data.errors);
                    break;

                case 'callProcedureResult':
                    this.processProcedureResult(document, event.data);
                    break;

                default:
                    this.processProcedureResult(document, event.data);
                    this._log(window.location.host + ' <- UNKNOWN METHOD: ' + data.method + ' ' + this._getDomain(event.origin), null, null, true);
                    break;
            }
        },

        /**
         * Show alert with error
         *
         * @param {Object} errorData - Object with errors
         *
         * @private
         */
        _showError: function (errorData) {
            alert(JSON.stringify(errorData, null, 4));
        },

        /**
         * Logs to console
         *
         * @param {String} title - Message that will be log
         * @param {String} [data] - Formatted data that will be collapsed
         * @param {String} [color] - Color in Hex format
         * @param {Boolean} [warning] - Is it warning message?
         *
         * @private
         */
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

        _getBlob: function (url) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();

                xhr.responseType = 'blob';
                xhr.open('GET', url, true);

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === xhr.DONE) {
                        if (200 == xhr.status || 201 == xhr.status) {
                            try {
                                return resolve(xhr.response);
                            } catch (e) {
                                return reject(e);
                            }
                        }

                        return reject(new Error(
                            'Server returned an error. HTTP Status: ' + xhr.status
                        ));
                    }
                };

                xhr.send();
            });
        },

        /**
         * Business login on plugin init
         */
        saveToLocalStorage: function (data) {
            this._log(window.location.host + ' INIT. SET DATA TO LOCAL STORAGE', JSON.stringify(data, null, 4));

            var initData = {};

            $.each(data, function (key, value) {
                if (-1 !== $.inArray(key, ['apiVersion', 'method'])) {
                    return true;
                }

                initData[key] = value;
            });

            localStorage.setItem('pluginInitData', JSON.stringify(initData));
        },

        /**
         * Business login on plugin init end
         *
         * @param {Object} data - JSON object that contain data from OFSC
         */
        pluginInitEnd: function (data) {
            this.saveToLocalStorage(data);

            var messageData = {
                apiVersion: 1,
                method: 'initEnd'
            };

            if (localStorage.getItem('pluginWakeupCount') < localStorage.getItem('pluginWakeupMaxCount')) {
                this._log(window.location.host + ' UNFINISHED WAKEUP DATA FOUND IN LOCAL STORAGE');

                messageData.wakeupNeeded = true;
            }

            this._sendPostMessageData(messageData);
        },

        /**
         * Business login on plugin open
         *
         * @param {Object} receivedData - JSON object that contain data from OFSC
         */
        pluginOpen: function (receivedData) {
          var received = JSON.stringify(receivedData, null, 4);
          var fileContent = receivedData.activity.XA_issue_list;
          //document.getElementById("file-data").innerHTML = "<pre>" + fileContent.fileName + "</pre>";

          var tabledata = JSON.parse(receivedData.activity["List of Issues"]);

          //Create Date Editor
          var dateEditor = function(cell, onRendered, success, cancel){
              //cell - the cell component for the editable cell
              //onRendered - function to call when the editor has been rendered
              //success - function to call to pass the successfuly updated value to Tabulator
              //cancel - function to call to abort the edit and return to a normal cell

              //create and style input
              var cellValue = moment(cell.getValue(), "YYYY-MM-DD hh:mm").format("YYYY-MM-DD hh:mm"),
              input = document.createElement("input");

              input.setAttribute("type", "date");

              input.style.padding = "4px";
              input.style.width = "100%";
              input.style.boxSizing = "border-box";

              input.value = cellValue;

              onRendered(function(){
                  input.focus();
                  input.style.height = "100%";
              });

              function onChange(){
                  if(input.value != cellValue){
                      success(moment(input.value, "YYYY-MM-DD hh:mm").format("YYYY-MM-DD hh:mm"));
                  }else{
                      cancel();
                  }
              }

              //submit new value on blur or change
              input.addEventListener("blur", onChange);

              //submit new value on enter
              input.addEventListener("keydown", function(e){
                  if(e.keyCode == 13){
                      onChange();
                  }

                  if(e.keyCode == 27){
                      cancel();
                  }
              });

              return input;
          };


          //Build Tabulator
          var table = new Tabulator("#example-table", {
              data:tabledata,
              layout:"fitDataStretch",
              columns:[
                  {title:"ID", field:"id", width:150, editor:"input"},
                  {title:"Fecha/Hora", field:"date", hozAlign:"center", sorter:"date", width:140, editor:dateEditor},
                  {title:"Valor Medio", field:"avg_value", sorter:"number", hozAlign:"left", width:140, editor:true},
                  {title:"Grupo", field:"group",  editor:"select", editorParams:{values:{"Uno":"One", "Dos":"two", "Otro":"Other"}}},
                  {title:"Comentario", field:"comment", hozAlign:"center", width:140, editor:true},
                  {title:"Valores", field:"values", hozAlign:"center", editor:true},
              ],
          });

          //Add row on "Add Row" button click
          document.getElementById("add-row").addEventListener("click", function(){
              var new_record = {};
              new_record.date = moment().format("YYYY-MM-DD hh:mm");
              new_record.group - "Uno";
              table.addRow(new_record);
          });

          //Add row on "Add Row" button click
          document.getElementById("show-hide").addEventListener("click", function(){
            var element = document.getElementById("show-data");
            if (element.style.display === "none") {
              element.style.display = "block";
            } else {
              element.style.display = "none";
            };
            var element = document.getElementById("received-data");
            element.innerHTML = "<pre>" + JSON.stringify(receivedData, undefined, 4) + "</pre>";
            if (element.style.display === "none") {
              element.style.display = "block";
            } else {
              element.style.display = "none";
            };
          });

          //Add row on "Add Row" button click
          document.getElementById("get-data").addEventListener("click", function(){
              var data = table.getData();
              document.getElementById("show-data").innerHTML = "<pre>" + JSON.stringify(data, undefined, 4) + "</pre>";
          });

          //Add row on "Add Row" button click
          document.getElementById("submit").addEventListener("click", function(){
              alert(JSON.stringify(table.getData(), undefined, 4));
          });


        },


        /**
         * Business login on plugin wakeup (background open for sync)
         *
         * @param {Object} receivedData - JSON object that contain data from OFSC
         */
        pluginWakeup: function (receivedData) {
            this._log(window.location.host + ' WAKEUP', JSON.stringify(receivedData, null, 4));

            var wakeupData = {
                pluginWakeupCount:                +localStorage.getItem('pluginWakeupCount'),
                pluginWakeupMaxCount:             +localStorage.getItem('pluginWakeupMaxCount'),
                pluginWakeupDontRespondOn:        +localStorage.getItem('pluginWakeupDontRespondOn'),
                pluginWakeupChangeIcon: JSON.parse(localStorage.getItem('pluginWakeupChangeIcon'))
            };

            wakeupData.pluginWakeupCount = wakeupData.pluginWakeupCount + 1;

            localStorage.setItem('pluginWakeupCount',         wakeupData.pluginWakeupCount);
            localStorage.setItem('pluginWakeupMaxCount',      wakeupData.pluginWakeupMaxCount);
            localStorage.setItem('pluginWakeupDontRespondOn', wakeupData.pluginWakeupDontRespondOn);
            localStorage.setItem('pluginWakeupChangeIcon',    wakeupData.pluginWakeupChangeIcon);

            this._log(window.location.host + ' SAVE WAKEUP DATA TO LOCAL STORAGE', JSON.stringify(wakeupData, null, 4));

            if (wakeupData.pluginWakeupDontRespondOn == wakeupData.pluginWakeupCount) {
                this._log(window.location.host + ' EMULATE NOT RESPONDING PLUGIN');

                return;
            }

            var iconUrl = './online.svg';
            var iconPromise = wakeupData.pluginWakeupChangeIcon ? this._getBlob(iconUrl) : Promise.resolve(null);

            iconPromise.then(function (iconFile) {
                var iconDataParams = {};

                if (iconFile) {
                    iconDataParams.iconData = {
                        text:  '' + wakeupData.pluginWakeupCount,
                        image: iconFile
                    };
                }

                if (wakeupData.pluginWakeupCount < wakeupData.pluginWakeupMaxCount) {
                    setTimeout(function () {
                        this._log(window.location.host + ' SLEEP. RETRY NEEDED');

                        this._sendPostMessageData($.extend({
                            apiVersion: 1,
                            method: 'sleep',
                            wakeupNeeded: true
                        }, iconDataParams));
                    }.bind(this), 2000);
                } else {
                    setTimeout(function () {
                        this._log(window.location.host + ' SLEEP. NO RETRY');

                        this._sendPostMessageData($.extend({
                            apiVersion: 1,
                            method: 'sleep',
                            wakeupNeeded: false
                        }, iconDataParams));
                    }.bind(this), 12000);
                }
            }.bind(this)).catch(function () {
                this._log('Unable to load icon file "' + iconUrl + '"', null, null, true);
            }.bind(this));
        },

        /**
         * Save configuration of wakeup (background open for sync) behavior for Plugin
         * to Local Storage
         *
         * @private
         */
        _saveWakeupData: function () {
            var wakeupData = {
                pluginWakeupCount: 0,
                pluginWakeupMaxCount: 0,
                pluginWakeupDontRespondOn: 0,
                pluginWakeupChangeIcon: false
            };

            if ($('#wakeup').is(':checked')) {
                wakeupData.pluginWakeupMaxCount = parseInt($('#repeat_count').val());

                if ($('#dont_respond').is(':checked')) {
                    wakeupData.pluginWakeupDontRespondOn = parseInt($('#dont_respond_on').val());
                }

                if ($('#wakeup_change_icon').is(':checked')) {
                    wakeupData.pluginWakeupChangeIcon = true;
                }
            }

            localStorage.setItem('pluginWakeupCount', wakeupData.pluginWakeupCount);
            localStorage.setItem('pluginWakeupMaxCount', wakeupData.pluginWakeupMaxCount);
            localStorage.setItem('pluginWakeupDontRespondOn', wakeupData.pluginWakeupDontRespondOn);
            localStorage.setItem('pluginWakeupChangeIcon', wakeupData.pluginWakeupChangeIcon);

            this._log(window.location.host + ' SAVE WAKEUP DATA TO LOCAL STORAGE', JSON.stringify(wakeupData, null, 4));
        },

        /**
         * Clear previous configuration of wakeup (background open for sync) behavior for Plugin
         * from the Local Storage
         *
         * @private
         */
        _clearWakeupData: function () {
            localStorage.removeItem('pluginWakeupCount');
            localStorage.removeItem('pluginWakeupMaxCount');
            localStorage.removeItem('pluginWakeupDontRespondOn');
            localStorage.removeItem('pluginWakeupChangeIcon');

            this._log(window.location.host + ' CLEAR WAKEUP DATA FROM LOCAL STORAGE');
        },

        addMandatoryParam: function (target, key, value) {
            key = key || '';
            value = value || '';

            var clonedElement = $('.example-property').clone().removeClass('example-property').addClass('item--mandatory');

            clonedElement.find('.key').removeClass('writable').removeAttr('contenteditable').text(key);
            clonedElement.find('.value').text(value);

            this.initChangeOfValue(clonedElement);
            this.initItemRemove(clonedElement);

            $(target).parent('.item').after(clonedElement);
        },

        initChangeOfWakeup: function (element) {

            function onWakeupChange(elem) {
                var isChecked = $(elem).is(':checked');

                if (isChecked) {
                    $(element).find('#repeat_count').prop('disabled', false);
                    $(element).find('#dont_respond').prop('disabled', false);
                    $(element).find('#wakeup_change_icon').prop('disabled', false);

                    $(element).find('#wakeup_row').removeClass('wakeup-form-row--disabled');

                    onDontRespondChange($(element).find('#dont_respond'));
                    onWakeupIconChange($(element).find('#wakeup_change_icon'));
                } else {
                    $(element).find('#repeat_count').prop('disabled', true);
                    $(element).find('#dont_respond').prop('disabled', true);
                    $(element).find('#dont_respond_on').prop('disabled', true);
                    $(element).find('#wakeup_change_icon').prop('disabled', true);

                    $(element).find('#wakeup_row').addClass('wakeup-form-row--disabled');
                    $(element).find('#dont_respond_row').addClass('wakeup-form-row--disabled');
                    $(element).find('#wakeup_change_icon_row').addClass('wakeup-form-row--disabled');
                }
            }

            function onDontRespondChange(elem) {
                var isChecked = $(elem).is(':checked');

                if (isChecked) {
                    $(element).find('#dont_respond_on').prop('disabled', false);
                    $(element).find('#dont_respond_row').removeClass('wakeup-form-row--disabled');
                } else {
                    $(element).find('#dont_respond_on').prop('disabled', true);
                    $(element).find('#dont_respond_row').addClass('wakeup-form-row--disabled');
                }
            }

            function onWakeupIconChange(elem) {
                var isChecked = $(elem).is(':checked');

                if (isChecked) {
                    $(element).find('#wakeup_change_icon_row').removeClass('wakeup-form-row--disabled');
                } else {
                    $(element).find('#wakeup_change_icon_row').addClass('wakeup-form-row--disabled');
                }
            }

            $(element).find('#wakeup').change(function (e) {
                onWakeupChange(e.target);
            });

            $(element).find('#dont_respond').change(function (e) {
                onDontRespondChange(e.target);
            });

            $(element).find('#wakeup_change_icon').change(function (e) {
                onWakeupIconChange(e.target);
            });

            onWakeupChange($(element).find('#wakeup'));
        },

        initChangeOfInventoryAction: function (element) {
            $(element).find('.select-inventory-action').on('change', function (e) {

                $(e.target).parents('.items').first().find('.item--mandatory').remove();

                switch ($(e.target).val()) {
                    case 'create':
                        this.addMandatoryParam(e.target, 'invpool');
                        this.addMandatoryParam(e.target, 'quantity');
                        this.addMandatoryParam(e.target, 'invtype');
                        this.addMandatoryParam(e.target, 'inv_aid');
                        this.addMandatoryParam(e.target, 'inv_pid');
                        break;

                    case 'delete':
                        this.addMandatoryParam(e.target, 'invid');
                        break;

                    case 'install':
                        this.addMandatoryParam(e.target, 'invid');
                        this.addMandatoryParam(e.target, 'inv_aid');
                        this.addMandatoryParam(e.target, 'quantity');
                        break;

                    case 'deinstall':
                        this.addMandatoryParam(e.target, 'invid');
                        this.addMandatoryParam(e.target, 'inv_pid');
                        this.addMandatoryParam(e.target, 'quantity');
                        break;

                    case 'undo_install':
                        this.addMandatoryParam(e.target, 'invid');
                        this.addMandatoryParam(e.target, 'quantity');
                        break;

                    case 'undo_deinstall':
                        this.addMandatoryParam(e.target, 'invid');
                        this.addMandatoryParam(e.target, 'quantity');
                        break;
                }

                this._updateResponseJSON();
            }.bind(this));
        },

        initChangeOfDataItems: function () {
            //set checkboxes from local storage
            if (localStorage.getItem('dataItems')) {
                $('.data-items').attr('checked', true);
                $('.data-items-holder').show();

                var dataItems = JSON.parse(localStorage.getItem('dataItems'));

                $('.data-items-holder input').each(function () {
                    if (dataItems.indexOf(this.value) != -1) {
                        $(this).attr('checked', true);
                    }
                });
            }

            //init handlers
            $('.data-items').on('change', function (e) {
                $('.data-items-holder').toggle();
            });
        },

        initChangeOfOpenOption: function (checkboxId, localStorageKey) {
            var optionCheckbox = $('#' + checkboxId);

            this.initLocalStorageOption(localStorageKey);

            if (localStorage.getItem(localStorageKey)) {
                optionCheckbox.attr('checked', true);
            }

            optionCheckbox.on('change', function (e) {
                if ($(this).is(':checked')) {
                    localStorage.setItem(localStorageKey, 'true');
                } else {
                    localStorage.setItem(localStorageKey, '');
                }
            });
        },

        initLocalStorageOption: function (localStorageKey) {
            if (localStorage.getItem(localStorageKey) === null) {
                localStorage.setItem(localStorageKey, 'true');
            }
        },

        initFileInputPreview: function (element, mimeTypes) {
            $(element).find('.value__item.value__file').on('change', function (e) {
                var inputElem = e.target;
                var file = inputElem.files[0];
                var container = $(inputElem).closest('.item').find('.value__file_preview_container');
                var thumb = container.find('.value__file_preview');
                var mimeTypes = ['image/png', 'image/jpeg', 'image/gif'];

                if ($(inputElem).hasClass('image_file')) {
                    mimeTypes = $(inputElem).attr('accept').split(',');
                }

                if (file && -1 !== $.inArray(file.type, mimeTypes)) {
                    thumb.attr('src', URL.createObjectURL(file));
                    container.show();
                } else {
                    container.hide();
                    thumb.attr('src', '');
                }
            }.bind(this));
        },

        initChangeOfValue: function (element) {

            this.initFileInputPreview(element);

            $(element).find('.key.writable').on('input textinput change', function (e) {
                $(e.target).closest('.item').find('.value__item.value__file').attr('data-property-id', $(e.target).text());
            }.bind(this));

            $(element).find('.value__item.writable, .key.writable, #wakeup').on('input textinput change', function (e) {
                $(e.target).parents('.item').addClass('edited');

                this._updateResponseJSON();
            }.bind(this));
        },

        initItemRemove: function (element) {
            $(element).find('.button--remove-item').on('click', function (e) {
                //remove item
                $(e.target).parents('.item').first().remove();

                //reindex actions
                if ($(e.target).parents('.item').first().find('.action-key').length > 0) {
                    $('.item:not(.example-action) .action-key').each(function (index) {
                        $(this).text(index);
                    });
                }

                this._updateResponseJSON();
            }.bind(this));
        },

        initCollapsableKeys: function (element) {
            $(element).find('.key').each(function (index, item) {
                if ($(item).siblings('.value').has('.items').length !== 0) {
                    $(item).addClass('clickable');
                }
            });

            $(element).find('.key').on('click', function () {
                if ($(this).siblings('.value').has('.items').length !== 0) {
                    $(this).siblings('.value').toggle();
                    $(this).toggleClass('collapsed');
                }
            });

            $(element).find('.item-expander').on('click', function (e) {
                var key = $(e.target).parents('.value').first().siblings('.key').first();

                if (key.hasClass('clickable')) {
                    key.trigger('click');
                }
            });
        },

        initAddButtons: function (element) {
            $(element).find('.button--add-property, .button--add-file-property').click(function (e) {
                var clonedElement;
                var isFileProperty = $(e.target).hasClass('button--add-file-property');

                if (isFileProperty) {
                    var entityId = 'action-' + $(e.target).parents('.item').children('.action-key').text();

                    clonedElement = $('.example-file-property').clone().removeClass('example-file-property');
                    clonedElement.find('.value__item.value__file').attr('data-entity-id', entityId);
                } else {
                    clonedElement = $('.example-property').clone().removeClass('example-property');
                }

                this.initChangeOfValue(clonedElement);
                this.initItemRemove(clonedElement);

                $(e.target).parent('.item').before(clonedElement);

                $(e.target).parents('.item').addClass('edited');

                this._updateResponseJSON();
            }.bind(this));

            $(element).find('.button--add-action').click(function (e) {
                var clonedElement = $('.example-action').clone().removeClass('example-action');
                var actionsCount = +$(e.target).parents('.item:not(.item--excluded)').find('.action-key').length;

                clonedElement.find('.action-key').text(actionsCount);

                this.initAddButtons(clonedElement);
                this.initCollapsableKeys(clonedElement);
                this.initChangeOfValue(clonedElement);
                this.initChangeOfInventoryAction(clonedElement);
                this.initItemRemove(clonedElement);

                $(e.target).parent('.item').before(clonedElement);

                $(e.target).parents('.item').addClass('edited');

                this._updateResponseJSON();
            }.bind(this));
        },

        initProcedureActions: function (element) {
            $(element).find('.button__send-procedure').click(function (e) {

                var jsonToSend = $(element).find('.json__procedure-new').text().replace(/%%uniqueId%%/g, this.generateCallId());

                this.showProcedureJson(element, 'request', jsonToSend);
                this._sendPostMessageData(jsonToSend);
            }.bind(this));
        },

        processProcedureResult: function (element, receivedJson) {
            this.showProcedureJson(element, 'response', receivedJson);
        },

        /**
         * @param {Element} element - DOM element whose children will be affected
         * @param {String} jsonType - 'request' or 'response'
         * @param {String} json
         */
        showProcedureJson: function (element, jsonType, json) {

            if ('request' !== jsonType && 'response' !== jsonType) {
                console.error('Unknown jsonType', jsonType);
            }

            var jsonList = $(element).find('.procedures-json-list');

            var eventTime = this.getCurrentTime();
            var callId = '';

            try {
                var jsonObject = JSON.parse(json);

                callId = jsonObject.callId || '';
                json = JSON.stringify(jsonObject, null, 4);
            } catch (e) { }

            var procedureContainer = $(element).find('.section__procedure[data-call-id="' + callId + '"]');
            var isContainerExisted = !!(callId && procedureContainer.length);

            if (!isContainerExisted) {
                procedureContainer = $('.section__procedure-example').clone().removeClass('section__procedure-example');
            }

            var containerDataSet = procedureContainer.get(0).dataset;

            containerDataSet.callId = callId;
            containerDataSet[jsonType + 'Time'] = eventTime;

            procedureContainer.find('.json__procedure-' + jsonType).text(json).removeClass('json__procedure-hidden');
            procedureContainer.find('.procedure-' + jsonType + '-time').text(eventTime);

            if (!isContainerExisted) {
                var procedureNumber = ++jsonList.get(0).dataset.procedureCount;

                containerDataSet.procedureNumber = '' + procedureNumber;
                procedureContainer.find('.procedure-number').text('#' + procedureNumber).click(function() {
                    procedureContainer.find('.json__procedure').toggleClass('json__procedure-full');
                });

                jsonList.prepend(procedureContainer);
            }

            json = null;
            jsonObject = null;
        },

        getCurrentTime: function () {
            var d = new Date();

            return '' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + '.' + ('00' + d.getMilliseconds()).slice(-3);
        },

        generateCallId: function () {
            return btoa(String.fromCharCode.apply(null, window.crypto.getRandomValues(new Uint8Array(16))));
        },

        /**
         * Render JSON object to DOM
         *
         * @param {Object} data - JSON object
         *
         * @returns {jQuery}
         */
        renderForm: function (data) {
            return this.renderCollection('data', data, true);
        },

        /**
         * Render JSON object to follow HTML:
         *
         * <div class="item">
         *     <div class="key">{key}</div>
         *     <div class="value">{value}</div>
         * </div>
         * <div class="item">
         *     <div class="key">{key}</div>
         *     <div class="value">
         *         <div class="items">
         *              <div class="item">
         *                  <div class="key">{key}</div>
         *                  <div class="value">{value}</div>
         *              </div>
         *              <div class="item">
         *                  <div class="key">{key}</div>
         *                  <div class="value">{value}</div>
         *              </div>
         *              ...
         *         </div>
         *     </div>
         * </div>
         * ...
         *
         * @param {String} key - Collection name
         * @param {Object} items - Child items of collection
         * @param {Boolean} [isWritable] - Will render as writable?
         * @param {number} [level] - Level of recursion
         * @param {string} [parentKey] - parent Key
         *
         * @returns {jQuery}
         */
        renderCollection: function (key, items, isWritable, level, parentKey) {
            var render_item = $('<div>').addClass('item');
            var render_key = $('<div>').addClass('key').text(key);
            var render_value = $('<div>').addClass('value value__collection');
            var render_items = $('<div>').addClass('items');

            isWritable = isWritable || false;
            level = level || 1;
            parentKey = parentKey || '';

            var newParentKey = key;
            var entityId = '';

            if ('activity' === key || 'activityList' == parentKey) {
                entityId = items.aid;
            } else if ('inventory' === key || 'inventoryList' == parentKey ) {
                entityId = items.invid;
            }

            if (items) {
                $.each(items, function (key, value) {
                    if (value && typeof value === 'object') {
                        render_items.append(this.renderCollection(key, value, isWritable, level + 1, newParentKey));
                    } else {
                        render_items.append(this.renderItem(key, value, isWritable, level + 1, newParentKey, entityId).get(0));
                    }
                }.bind(this));
            }

            render_item.append('<div class="item-expander"></div>');
            render_item.append(render_key);

            render_value.append(render_items);
            render_item.append($('<br>'));
            render_item.append(render_value);

            return render_item;
        },

        /**
         * Render key and value to follow HTML:
         *
         * <div class="item">
         *     <div class="key">{key}</div>
         *     <div class="value">{value}</div>
         * </div>
         *
         * @param {String} key - Key
         * @param {String} value - Value
         * @param {Boolean} [isWritable] - Will render as writable?
         * @param {Number} [level] - Level of recursion
         * @param {String} [parentKey] - parent Key
         * @param {String} [entityId] - id of OFSC entity to associate the file input with
         *
         * @returns {jQuery}
         */
        renderItem: function (key, value, isWritable, level, parentKey, entityId) {
            var render_item = $('<div>').addClass('item');
            var render_value;
            var render_key;

            isWritable = isWritable || false;
            level = level || 1;
            parentKey = parentKey || '';

            render_key = $('<div>').addClass('key').text(key);
            render_item.append('<div class="item-expander"></div>')
                .append(render_key)
                .append('<span class="delimiter">: </span>');

            if (value === null) {
                value = '';
            }

            if (
                typeof this.renderReadOnlyFieldsByParent[parentKey] !== 'undefined' &&
                typeof this.renderReadOnlyFieldsByParent[parentKey][key] !== 'undefined' &&
                this.renderReadOnlyFieldsByParent[parentKey][key] === true
            ) {
                isWritable = false;
            }

            switch (key) {
                case "csign":
                    if (isWritable) {
                        render_value = $('<button>').addClass('button button--item-value button--generate-sign').text('Generate');
                    }
                    break;
                default:

                    var pluginInitData = false;
                    var attributeDescription = {};

                    if (this._isJson(localStorage.getItem('pluginInitData'))) {
                        pluginInitData = JSON.parse(localStorage.getItem('pluginInitData'));
                        attributeDescription = pluginInitData.attributeDescription || {};
                    }

                    if (this.dictionary[key]) {
                        render_value = this.renderSelect(this.dictionary, key, value, isWritable).addClass('value value__item');
                    } else if (
                        attributeDescription[key] &&
                        "enum" == attributeDescription[key].type &&
                        attributeDescription[key].enum
                    ) {
                        render_value = this.renderEnumSelect(attributeDescription[key].enum, key, value, isWritable).addClass('value value__item');
                    } else if (
                        attributeDescription[key] &&
                        "file" == attributeDescription[key].type &&
                        "signature" !== attributeDescription[key].gui
                    ) {
                        render_value = this.renderFile(entityId, key);
                    } else {
                        render_value = $('<div>').addClass('value value__item').text(value);

                        if (isWritable) {
                            render_value.addClass('writable').attr('contenteditable', true);
                        }
                    }

                    break;
            }

            render_item.append(render_value);

            return render_item;
        },

        /**
         * Render enums with validate of outs values
         *
         * <select class="value [writable]" [disabled]>
         *     <option value="{value}" [selected]>{dictionary}</option>
         *     ...
         * </select>
         *
         * @param {Object} dictionary - Dictionary that will be used for Enum rendering
         * @param {String} key - Just field name
         * @param {String} value - Selected value
         * @param {Boolean} isWritable - Will render as writable?
         *
         * @returns {HTMLElement}
         */
        renderSelect: function (dictionary, key, value, isWritable) {
            var render_value;

            var outs = dictionary[key][value].outs;
            var allowedValues = [value].concat(outs);
            var disabled = '';

            render_value = $('<select>').css({ background: dictionary[key][value].color });

            if (!outs.length || !isWritable) {
                render_value.attr('disabled', true);
            } else {
                render_value.addClass('writable');
            }

            $.each(allowedValues, function (index, label) {
                render_value.append('<option' + (label === value ? ' selected' : '') + ' value="' + dictionary[key][label].label + '">' + dictionary[key][label].translation + '</option>');
            });

            return render_value;
        },

        renderFile: function (entityId, key) {
            var render_value = $('<div>')
                .addClass('writable value value__item value__file')
                .attr('data-entity-id', entityId)
                .attr('data-property-id', key);

            var input = $('<input type="file">').addClass('value__file_input');
            var preview =
                $('<div>').addClass('value__file_preview_container')
                    .append($('<img>').addClass('value__file_preview'));

            render_value.append(input);
            render_value.append(preview);

            return render_value;
        },

        /**
         * Render enums
         *
         * <select class="value [writable]" [disabled]>
         *     <option value="{value}" [selected]>{dictionary}</option>
         *     ...
         * </select>
         *
         * @param {Object} dictionary - Dictionary that will be used for Enum rendering
         * @param {String} key - Just field name
         * @param {String} value - Selected value
         * @param {Boolean} isWritable - Will render as writable?
         *
         * @returns {HTMLElement}
         */
        renderEnumSelect: function (dictionary, key, value, isWritable) {
            var render_value;

            var disabled = '';

            render_value = $('<select>');

            if (isWritable) {
                render_value.addClass('writable');
            } else {
                render_value.attr('disabled', true);
            }

            $.each(dictionary, function (index, label) {
                var option = $('<option' + (index === value ? ' selected' : '') + ' value="' + index + '"></option>').text(label.text);

                render_value.append(option);
            });

            return render_value;
        },

        /**
         * Generate output JSON
         *
         * @returns {Object}
         */
        generateJson: function () {
            var outputJson = {
                apiVersion: 1,
                method: 'close',
                backScreen: $('.back_method_select').val(),
                wakeupNeeded: $('#wakeup').is(':checked')
            };

            if (
                outputJson.backScreen === 'activity_by_id' ||
                outputJson.backScreen === 'end_activity' ||
                outputJson.backScreen === 'cancel_activity' ||
                outputJson.backScreen === 'notdone_activity' ||
                outputJson.backScreen === 'start_activity' ||
                outputJson.backScreen === 'suspend_activity' ||
                outputJson.backScreen === 'delay_activity'
            ) {
                $.extend(outputJson, {
                    backActivityId: $('.back_activity_id').val()
                });
            }

            if (outputJson.backScreen === 'inventory_by_id') {
                $.extend(outputJson, {
                    backInventoryId: $('.back_inventory_id').val()
                });
            }

            var backActivityId = $('.back_activity_id').val();
            if (outputJson.backScreen === 'inventory_list' && backActivityId) {
                $.extend(outputJson, {
                    backActivityId: backActivityId,
                });
            }

            if (
                outputJson.backScreen === 'install_inventory' ||
                outputJson.backScreen === 'deinstall_inventory'
            ) {
                $.extend(outputJson, {
                    backActivityId: $('.back_activity_id').val(),
                    backInventoryId: $('.back_inventory_id').val()
                });
            }

            if (outputJson.backScreen === 'plugin_by_label' ) {

                $.extend(outputJson, {
                    backPluginLabel: $('.back_plugin_label').val(),
                });

                if ($('.back_plugin_link_id').val()) {
                    $.extend(outputJson, {
                        backPluginLinkId: $('.back_plugin_link_id').val()
                    });
                }

                if ($('.back_plugin_params').val()) {
                    $.extend(outputJson, {
                        backPluginOpenParams: JSON.parse($('.back_plugin_params').val())
                    });
                }
            }

            //icon data
            $.extend(outputJson, this.parseIconData($('.icon-options-holder')));

            //parse entity
            $.extend(outputJson, this.parseCollection($('.form')).data);

            //parse actions
            var actionsJson = this.parseCollection($('.actions-form'), true);

            if (actionsJson.actions.length > 0) {
                $.extend(outputJson, actionsJson);
            }

            delete outputJson.entity;
            delete outputJson.resource;

            return outputJson;
        },

        /**
         * Convert HTML elements to JSON
         *
         * @param {HTMLElement} rootElement - Root element that should be parsed recursively
         * @param {Boolean} [parseAllExceptExcluded] - Need to parse all elements except excluded
         *
         * @returns {Object}
         *
         * <div class="key">activity</div>
         * <div class="value value__collection">
         *     <div class="items"> <-------------------------------- rootElement !!!
         *         <div class="item edited">
         *             <div class="key">WO_COMMENTS</div>
         *             <div class="value">text_comments</div>
         *         </div>
         *         <div class="item">
         *             <div class="key">aid</div>
         *             <div class="value">4225274</div>
         *         </div>
         *         <div class="item">
         *             <div class="key">caddress</div>
         *             <div class="value">text_address</div>
         *         </div>
         *     </div>
         * </div>
         *
         * converts to:
         *
         * {
         *     "aid": "4225274",
         *     "WO_COMMENTS": "text_comments"
         * }
         *
         */
        parseCollection: function (rootElement, parseAllExceptExcluded) {
            parseAllExceptExcluded = parseAllExceptExcluded || false;

            var returnObject;

            if ($(rootElement).hasClass('items--without-key')) {
                returnObject = [];
            } else {
                returnObject = {};
            }

            $(rootElement).children('.item').each(function (itemIndex, item) {
                var parentKey;
                var valueKey;
                var value;
                var mandatoryField = false;

                var dataItemKey;

                parentKey = $(rootElement).parent().siblings('.key').get(0);
                valueKey = $(item).children('.key').get(0);
                dataItemKey = $(valueKey).text();

                //Logic of mandatory fields
                if ((parentKey !== undefined) && (
                        ('activity' === $(parentKey).text() && 'aid' === dataItemKey) || ('inventory' === $(parentKey).text() && 'invid' === dataItemKey)
                    )) {
                    mandatoryField = true;
                }

                if (
                    ($(item).hasClass('edited') || parseAllExceptExcluded || mandatoryField) &&
                    !$(item).hasClass('item--excluded')
                ) {

                    value = $(item).children('.value').get(0);

                    if ($(value).children('.items').length > 0) {
                        var parsedChild = this.parseCollection($(value).children('.items').get(0), parseAllExceptExcluded);

                        if ($(rootElement).hasClass('items--without-key')) {
                            returnObject.push(parsedChild);
                        } else {
                            returnObject[dataItemKey] = parsedChild;
                        }
                    } else {
                        switch ($(value).prop("tagName")) {
                            case 'SELECT':
                                returnObject[dataItemKey] = $(value).val();
                                break;

                            case 'CANVAS':
                                returnObject[dataItemKey] = value.toDataURL();
                                break;

                            default:

                                if ($(value).hasClass('value__file')) {
                                    var fileInput = $(value).find('.value__file_input').get(0);
                                    var file = fileInput.files && fileInput.files[0];

                                    if (file) {
                                        returnObject[dataItemKey] = {
                                            fileName: file.name,
                                            fileContents: {}
                                        };
                                    }
                                } else {
                                    returnObject[dataItemKey] = $(value).text();
                                }

                                break;
                        }
                    }
                }
            }.bind(this));

            return returnObject;
        },

        parseIconData: function (rootElement) {

            var colorItem = rootElement.find('#iconColor');
            var textItem = rootElement.find('#iconText');
            var blobItem = rootElement.find('#iconImage');
            var linkIdItem = rootElement.find('#iconLinkId');

            var iconData = {};
            var hasData = false;

            if (colorItem.hasClass('edited')) {
                hasData = true;
                iconData.color = colorItem.find('.value__item').val();
            }

            if (textItem.hasClass('edited')) {
                hasData = true;
                iconData.text = textItem.find('.value__item').text();
            }

            if (blobItem.hasClass('edited')) {
                hasData = true;
                iconData.image = {};
            }

            if (!hasData) {
                return {};
            }

            var linkId = linkIdItem.find('.value__item').text();

            if (linkId.length) {
                var linksIconData = {};

                linksIconData[linkId] = iconData;

                return {
                    linksIconData: linksIconData
                };
            }

            return {
                iconData: iconData
            }
        },

        _attachFiles: function(data) {

            if (!$.isPlainObject(data)) {
                return false;
            }

            $.each(data, function(dataKey, dataValue) {
                var entityId = '';

                if ('activity' === dataKey || 'inventory' === dataKey) {

                    if ('activity' === dataKey) {
                        entityId = dataValue.aid;
                    } else {
                        entityId = dataValue.invid;
                    }

                    if (!entityId) {
                        return true;
                    }

                    $.each(dataValue, function (propertyName, propertyValue)
                    {
                        if ($.isPlainObject(propertyValue) && propertyValue.fileContents) {
                            var fileInput = $('.value__item.value__file[data-entity-id="' + entityId + '"][data-property-id="' + propertyName + '"]').find('.value__file_input').get(0);
                            var file = fileInput.files && fileInput.files[0];

                            if (file) {
                                propertyValue.fileContents = file;
                            }
                        }
                    });
                } else if ('activityList' === dataKey || 'inventoryList' === dataKey) {
                    $.each(dataValue, function (entityId, entity)
                    {
                        $.each(entity, function (propertyName, propertyValue)
                        {
                            if ($.isPlainObject(propertyValue) && propertyValue.fileContents) {
                                var fileInput = $('.value__item.value__file[data-entity-id="' + entityId + '"][data-property-id="' + propertyName + '"]').find('.value__file_input').get(0);
                                var file = fileInput.files && fileInput.files[0];

                                if (file) {
                                    propertyValue.fileContents = file;
                                }
                            }
                        });
                    });
                } else if ('actions' === dataKey) {
                    $.each(dataValue, function (actionId, action)
                    {
                        if (!action.properties) {
                            return true;
                        }

                        $.each(action.properties, function (propertyName, propertyValue)
                        {
                            if ($.isPlainObject(propertyValue) && propertyValue.fileContents) {
                                var fileInput = $('.value__item.value__file[data-entity-id="action-' + actionId + '"][data-property-id="' + propertyName + '"]').find('.value__file_input').get(0);
                                var file = fileInput.files && fileInput.files[0];

                                if (file) {
                                    propertyValue.fileContents = file;
                                }
                            }
                        });
                    });
                } else if ('iconData' === dataKey) {

                    if ($.isPlainObject(dataValue.image)) {
                        var fileInput = $('.icon-options-holder #iconImage .value__file_input').get(0);
                        var file = fileInput.files && fileInput.files[0];

                        if (file) {
                            dataValue.image = file;
                        }
                    }
                } else if ('linksIconData' === dataKey) {

                    if (!$.isPlainObject(dataValue)) {
                        return;
                    }

                    Object.keys(dataValue).forEach(function (linkId) {
                        var iconData = dataValue[linkId];

                        if ($.isPlainObject(iconData.image)) {
                            var fileInput = $('.icon-options-holder #iconImage .value__file_input').get(0);
                            var file = fileInput.files && fileInput.files[0];

                            if (file) {
                                iconData.image = file;
                            }
                        }
                    });

                }
            });
        },

        /**
         * Update JSON
         *
         * @private
         */
        _updateResponseJSON: function () {
            var jsonToSend = this.generateJson();

            $('.json__response').text(JSON.stringify(jsonToSend, null, 4));
        },

        /**
         * Initialization function
         */
        init: function () {
            this._log(window.location.host + ' PLUGIN HAS BEEN STARTED');

            $('.back_activity_id').hide();
            $('.back_inventory_id').hide();
            $('.back_plugin_label').hide();
            $('.back_plugin_link_id').hide();
            $('.back_plugin_params').hide();

            $('.back_method_select').on('change', function () {
                var selectValue = $('.back_method_select').val();

                $('.back_activity_id').val('').hide();
                $('.back_inventory_id').val('').hide();
                $('.back_plugin_label').val('').hide();
                $('.back_plugin_link_id').val('').hide();
                $('.back_plugin_params').val('').hide();

                if (
                    selectValue === 'inventory_list' ||
                    selectValue === 'activity_by_id'||
                    selectValue === 'end_activity' ||
                    selectValue === 'cancel_activity' ||
                    selectValue === 'notdone_activity' ||
                    selectValue === 'start_activity' ||
                    selectValue === 'suspend_activity' ||
                    selectValue === 'delay_activity'
                ) {
                    $('.back_activity_id').show();
                } else if (selectValue === 'plugin_by_label') {
                    $('.back_plugin_label').show();
                    $('.back_plugin_link_id').show();
                    $('.back_plugin_params').show();
                } else if (selectValue === 'inventory_by_id') {
                    $('.back_inventory_id').show();
                } else if (
                    selectValue === 'install_inventory' ||
                    selectValue === 'deinstall_inventory'
                ) {
                    $('.back_activity_id').show();
                    $('.back_inventory_id').show();
                }
            });

            $('.json_local_storage_toggle').on('click', function () {
                $('.json__local-storage').toggle();
            });

            $('.json_request_toggle').on('click', function () {
                $('.column-item--request').toggle();
            });

            $('.json_response_toggle').on('click', function () {
                $('.column-item--response').toggle();
            }.bind(this));

            $('.json__procedure-new').html(JSON.stringify({
                apiVersion: 1,
                callId: '%%uniqueId%%',
                method: 'callProcedure',
                procedure: 'openLink',
                params: {
                    url: 'https://docs.oracle.com/en/cloud/saas/field-service/18c/fapcf/toc.htm'
                }
            }, null, 4));

            window.addEventListener("message", this._getPostMessageData.bind(this), false);

            this.initLocalStorageOption('showHeader');
            this.initLocalStorageOption('backNavigationFlag');

            var jsonToSend = {
                apiVersion: 1,
                method: 'ready',
                sendInitData: true,
                showHeader: !!localStorage.getItem('showHeader'),
                enableBackButton: !!localStorage.getItem('backNavigationFlag')
            };

            //parse data items
            var dataItems = JSON.parse(localStorage.getItem('dataItems'));

            if (dataItems) {
                $.extend(jsonToSend, {dataItems: dataItems});
            }

            this._sendPostMessageData(jsonToSend);
        }
    });

})(jQuery);
