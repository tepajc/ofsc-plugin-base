/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */

/*
 * Your dashboard ViewModel code goes here
 */
define([
    'knockout',
    'jquery',
    'utils/dom',
    'ojs/ojcore',
    'ojs/ojcollectiontabledatasource',
    'ojs/ojlistview',
    'ojs/ojbutton',
    'ojs/ojcollapsible',
    'ojs/ojarraydataprovider'
], function (
    ko,
    $,
    dom,
    oj
) {

    class DashboardViewModel {
        constructor() {
            // Below are a subset of the ViewModel methods invoked by the ojModule binding
            // Please reference the ojModule jsDoc for additional available methods.

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

                this.openData = ko.pureComputed(() => {
                    return JSON.stringify(this._controller.openData(), null, 4);
                });

                this.laborItems = this._controller.laborItems;
                this.expenseItems = this._controller.expenseItems;
                this.usedPartsCollection = this._controller.usedPartsCollection;
                this.returnedPartsCollection = this._controller.returnedPartsCollection;

                this.laborDataProvider = new oj.ArrayDataProvider(this.laborItems, {'idAttribute': 'id'});
                this.expenseDataProvider = new oj.ArrayDataProvider(this.expenseItems, {'idAttribute': 'id'});

                this.usedPartsObservableArray = ko.observableArray(this._getUsedPartsArray());
                this.usedPartsDataSource = new oj.ArrayDataProvider(this.usedPartsObservableArray, {idAttribute: 'id'});

                this.returnedPartsObservableArray = ko.observableArray(this._getReturnedPartsArray());
                this.returnedPartsDataSource = new oj.ArrayDataProvider(this.returnedPartsObservableArray, {idAttribute: 'id'});

                this.selectedUsedParts = ko.observableArray();
                this.selectedReturnedParts = ko.observableArray();
                this.selectedLabors = ko.observableArray();
                this.selectedExpenses = ko.observableArray();

                this._activityModel = this._controller.ofscActivityModel;
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

            /**
             * Optional ViewModel method invoked after the View is removed from the
             * document DOM.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {Array} info.cachedNodes - An Array containing cached nodes for the View if the cache is enabled.
             */
            this.handleDetached = function (info) {
                // Implement if needed
            };
        }

        _getUsedPartsArray() {
            return this.usedPartsCollection
                .filter(inventoryModel => (parseInt(inventoryModel.get('quantity', 10)) || 0) >= 1)
                .map(inventoryModel => this.getInventoryViewModel(inventoryModel));
        }

        _getReturnedPartsArray() {
            return this.returnedPartsCollection
                .filter(inventoryModel => (parseInt(inventoryModel.get('quantity', 10)) || 0) >= 1)
                .map(inventoryModel => this.getInventoryViewModel(inventoryModel));
        }

        getInventoryViewModel(inventory) {
            return {
                id: inventory.get('part_item_number_rev'),
                inventory: inventory,
                serviceActivityUsed: inventory.get('part_service_activity_used') && this._controller.attributeDescription.part_service_activity_used.enum[inventory.get('part_service_activity_used')] && this._controller.attributeDescription.part_service_activity_used.enum[inventory.get('part_service_activity_used')].text,
                serviceActivityReturned: inventory.get('part_service_activity_returned') && this._controller.attributeDescription.part_service_activity_returned.enum[inventory.get('part_service_activity_returned')] && this._controller.attributeDescription.part_service_activity_returned.enum[inventory.get('part_service_activity_returned')].text,
                measuredQuantity: `${inventory.get('quantity')} ${this._controller.attributeDescription.part_uom_code.enum[inventory.get('part_uom_code')].text}`,
                dispositionText: inventory.get('part_disposition_code') && this._controller.attributeDescription.part_disposition_code.enum[inventory.get('part_disposition_code')].text
            };
        }

        removeSelectedUsedParts() {
            let partIds = this.selectedUsedParts();
            this.selectedUsedParts([]);
            partIds.forEach(partId => this._controller.removeUsedPart(partId));
            this.usedPartsObservableArray(this._getUsedPartsArray());
        }

        removeSelectedReturnedParts() {
            let partIds = this.selectedReturnedParts();
            this.selectedReturnedParts([]);
            partIds.forEach(partId => this._controller.removeReturnedPart(partId));
            this.returnedPartsObservableArray(this._getReturnedPartsArray());
        }

        onCloseButtonClick() {
            this._controller.terminatePlugin();
        }

        onPreviewInvoiceButtonClick() {
            this._controller.router.go('invoice');
        }

        onSaveButtonClick() {
          this._activityModel.unset('csign');
          this._activityModel.unset('invoice');
          this._controller.submitPluginData();
        }

        addLabor({activityId, itemId, startTime, endTime}) {
            return this._controller.addLabor({activityId, itemId, startTime, endTime});
        }

        removeSelectedLabors() {
            let laborsIds = this.selectedLabors();
            this.selectedLabors([]);
            laborsIds.forEach(laborId => this._controller.removeLabor(laborId));
        }

        removeSelectedExpenses() {
            let expensesIds = this.selectedExpenses();
            this.selectedExpenses([]);
            expensesIds.forEach(expenseId => this._controller.removeExpense(expenseId));
        }

        gotoAddLabor() {
            return this._controller.router.go('add-labor');
        }

        gotoAddExpense() {
            return this._controller.router.go('add-expense');
        }

        gotoAddUsedPart() {
            return this._controller.router.go('add-used-part');
        }

        gotoAddReturnedPart() {
            return this._controller.router.go('add-returned-part');
        }

        /**
         * @param {Number} duration - duration in minutes
         *
         * @return {String} - duration in the format of h:i (0:59, 10:08 etc)
         */
        formatDuration(duration) {
            return '' + ~~(duration / 60) + ':' + ('0' + duration % 60).slice(-2);
        }
    }

    /*
     * Returns a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.  Return an instance of the ViewModel if
     * only one instance of the ViewModel is needed.
     */
    return new DashboardViewModel();
});
