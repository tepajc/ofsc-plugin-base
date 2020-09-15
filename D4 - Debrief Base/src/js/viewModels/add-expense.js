/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
        'knockout',
        'utils/dom',
        // non-referenced:
        'ojs/ojarraydataprovider',
        'ojs/ojselectcombobox',
        'ojs/ojinputtext',
        'ojs/ojinputnumber'
    ], function (ko, dom) {

        class AddExpenseViewModel {
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
            handleActivated(info) {
                this._controller = info.valueAccessor().params.app;

                this.expenseActivityEnumCollection = this._controller.expenseActivityEnumCollection;
                this.expenseItemEnumCollection = this._controller.expenseItemEnumCollection;
                this.expenseCurrencyEnumCollection = this._controller.expenseCurrencyEnumCollection;

                this.activityId = ko.observable('');
                this.expenseItemId = ko.observable('');
                this.amount = ko.observable(0);
                this.currencyKey = ko.observable('');

                this.activityEnumArray = this.expenseActivityEnumCollection.map(model => ({
                    value: model.get('id'),
                    label: model.get('text')
                }));

                this.expenseCurrencyEnumArray = this.expenseCurrencyEnumCollection.map(model => ({
                    value: model.get('id'),
                    label: model.get('text')
                }));

                this.expenseItemEnumArray = this.expenseItemEnumCollection.map((model) => {
                    return {
                        value: model.get('id'),
                        label: model.get('label')
                    }
                });

                this.expenseItemDescription = ko.pureComputed(() =>
                    this.expenseItemId()
                        ? this.expenseItemEnumCollection.get(this.expenseItemId()).get('text')
                        : ''
                );
            }

            /**
             * Optional ViewModel method invoked after the View is inserted into the
             * document DOM.  The application can put logic that requires the DOM being
             * attached here.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {boolean} info.fromCache - A boolean indicating whether the module was retrieved from cache.
             */
            handleAttached(info) {
                // Implement if needed
            }


            /**
             * Optional ViewModel method invoked after the bindings are applied on this View.
             * If the current View is retrieved from cache, the bindings will not be re-applied
             * and this callback will not be invoked.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             */
            handleBindingsApplied(info) {
                dom.resetScrolling();
            }

            /*
             * Optional ViewModel method invoked after the View is removed from the
             * document DOM.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {Array} info.cachedNodes - An Array containing cached nodes for the View if the cache is enabled.
             */
            handleDetached(info) {
                // Implement if needed
            }

            submit() {
                this._controller.addExpense({
                    activityId: this.activityId(),
                    itemId: this.expenseItemId(),
                    amount: this.amount(),
                    currencyKey: this.currencyKey()
                });

                this._controller.router.go('dashboard', {historyUpdate: 'replace'});
            }

            dispose() {
                this._controller.router.go('dashboard', {historyUpdate: 'replace'});
            }
        }

        return new AddExpenseViewModel();
    }
);
