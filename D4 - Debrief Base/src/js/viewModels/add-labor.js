/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
    'knockout',
    'jquery',
    'utils/dom',
    'ojs/ojcore',
    'ojs/ojarraydataprovider',
    'ojs/ojselectcombobox',
    'ojs/ojinputtext',
    'ojs/ojdatetimepicker',
    'ojs/ojmessages'
], function (
    ko,
    $,
    dom,
    oj
) {

    class AddLaborViewModel {
        constructor() {
            this.activityId = ko.observable('');
            this.laborItemId = ko.observable('');
            this.startTime = ko.observable('');
            this.endTime = ko.observable('');

            this.isStartTimeValid = ko.observable(true);
            this.isEndTimeValid = ko.observable(true);

            this.isSubmitDisabled = ko.pureComputed(() => {
                return !(this.isStartTimeValid() && this.isEndTimeValid());
            });

            this.laborItemDescription = ko.pureComputed(() =>  {
                return this.laborItemId() ? this.laborItemEnumCollection.get(this.laborItemId()).get('text') : '';
            });

            this.durationHours = ko.pureComputed(() =>  {
                if (!this.startTime() || !this.endTime()) {
                    return '';
                }

                let duration = (this.dateTimeConverter.compareISODates(
                    this.dateTimeConverter.parse(this.endTime()),
                    this.dateTimeConverter.parse(this.startTime())
                ) / 1000 / 60 / 60).toFixed(2);
                return duration < 0 ? +duration + 24 : duration;
            });

            /**
             * Optional ViewModel method invoked when this ViewModel is about to be
             * used for the View transition.  The application can put data fetch logic
             * here that can return a Promise which will delay the handleAttached function
             * call below until the Promise is resolved.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @return {Promise|undefined} - If the callback returns a Promise, the next phase (attaching DOM) will be delayed until
             * the promise is resolved
             */
            this.handleActivated = function (info) {
                this._controller = info.valueAccessor().params.app;

                this.laborActivityEnumCollection = this._controller.laborActivityEnumCollection;
                this.laborItemEnumCollection = this._controller.laborItemEnumCollection;

                this.dateTimeConverter = this._controller.dateTimeConverter;

                this.activityEnumArray = this.laborActivityEnumCollection.map((model) => {
                    return {
                        value: model.get('id'),
                        label: model.get('text')
                    }
                });

                this.laborItemEnumArray = this.laborItemEnumCollection.map((model) => {
                    return {
                        value: model.get('id'),
                        label: model.get('label')
                    }
                });
            };

            /**
             * Optional ViewModel method invoked after the View is inserted into the
             * document DOM.  The application can put logic that requires the DOM being
             * attached here.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {boolean} info.fromCache - A boolean indicating whether the module was retrieved from cache.
             */
            this.handleAttached = function (info) {
                // Implement if needed
            };


            /**
             * Optional ViewModel method invoked after the bindings are applied on this View.
             * If the current View is retrieved from cache, the bindings will not be re-applied
             * and this callback will not be invoked.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             */
            this.handleBindingsApplied = function (info) {
                dom.resetScrolling();
            };

          /*
           * Optional ViewModel method invoked after the View is removed from the
           * document DOM.
           * @param {Object} info - An object with the following key-value pairs:
           * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
           * @param {Function} info.valueAccessor - The binding's value accessor.
           * @param {Array} info.cachedNodes - An Array containing cached nodes for the View if the cache is enabled.
           */
            this.handleDetached = function (info) {
                // Implement if needed
                this.activityId('');
                this.laborItemId('');
            };

            this.startTime.subscribe(() => {
                   document.getElementById('endTimeEl').validate();
            });

            this.appMessages = ko.observable();

            this.durationValidator = {
                validate:  value => {
                    let compareTo = this.startTime();
                    if (!value && !compareTo) {
                        throw new oj.ValidatorError("Time should be indicated", "Please, input time.");
                    } else if (value < compareTo) {
                        this.appMessages([{summary: 'Info', detail: 'Overnight', severity: oj.Message.SEVERITY_TYPE['INFO']}]);
                        return;
                    } else {
                        return;
                    }
                }
            }

            this.onStartTimeValidChanged = event => {
                this.isStartTimeValid(event.detail.value === 'valid');
            }

            this.onEndTimeValidChanged = event => {
                this.isEndTimeValid(event.detail.value === 'valid');
            }
        }

        addLabor() {
            this._controller.addLabor({
                activityId: this.activityId(),
                itemId: this.laborItemId(),
                startTime: this.startTime(),
                endTime: this.endTime()
            });

            this._controller.router.go('dashboard', { historyUpdate: 'replace' });
        }

        onCloseButtonClick() {
            this._controller.router.go('dashboard', { historyUpdate: 'replace' });
        }

    }

    return new AddLaborViewModel();
});
