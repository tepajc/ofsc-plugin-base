/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
        'knockout',
        'utils/dom',
        // non-referenced:
        'ojs/ojarraydataprovider',
        'ojs/ojinputtext',
        'ojs/ojinputnumber',
        'ojs/ojlistview',
        'utils/ko-text-highlighted-binding'
], function (ko, dom) {

        class AddUsedPartViewModel {
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

                this.partActivityUsedEnumCollection = this._controller.partActivityUsedEnumCollection;
                this.activityId = ko.observable('');
                this.searchSubstring = ko.observable('');
                this.searchSubstringDebounced = ko.pureComputed(() => this.searchSubstring()).extend({rateLimit: 250});
                this.searchSubstringIsEmpty = ko.pureComputed(() => this.searchSubstringDebounced().length <= 0);

                this.searchResults = ko.computed(() =>
                    this._controller.inventorySearchService.searchBySubstring(this.searchSubstringDebounced())
                        .map(inventory => this.getInventoryViewModel(inventory))
                        .slice(0, 20)
                );

                // converting computed array to observable array:
                this.searchResultsObservableArray = ko.observableArray();
                this.searchResultsSubscription = this.searchResults.subscribe((newValue) => {
                    this.searchResultsObservableArray(newValue);
                });
                this.searchResultsDataProvider = new oj.ArrayDataProvider(this.searchResultsObservableArray, {'idAttribute': 'id'});
                this.listViewSelection = ko.observable([]);

                this.listViewSelection.subscribe((newValue) => {
                    if (newValue && newValue.length === 1) {
                        let id = newValue[0];
                        let inventoryViewModel = this.searchResults().find(viewModel => viewModel.id === id);
                        if (inventoryViewModel) {
                            this.selectedInventory(inventoryViewModel);
                        }
                    }
                });

                this.selectedInventory = ko.observable(null);
                this.selectedIventoryMeasureUnit = ko.pureComputed(() => {
                    let inventoryViewModel = this.selectedInventory();
                    if (!inventoryViewModel) {
                        return '';
                    }
                    return this._controller.attributeDescription.part_uom_code.enum[inventoryViewModel.inventory.get('part_uom_code')].text;
                });
                this.activityEnumArray = this.partActivityUsedEnumCollection.map((model) => {
                  return {
                    value: model.get('id'),
                    label: model.get('text')
                  }
                });
                this.quantity = ko.observable(1);
            }

            getInventoryViewModel(inventory) {
                return {
                    id: inventory.get('part_item_number_rev'),
                    inventory: inventory,
                    measuredQuantity: `${inventory.get('quantity')} ${this._controller.attributeDescription.part_uom_code.enum[inventory.get('part_uom_code')].text}`,
                    dispositionText: inventory.get('part_disposition_code') && this._controller.attributeDescription.part_disposition_code.enum[inventory.get('part_disposition_code')].text
                };
            }

            submit() {
                let inventory = this.selectedInventory().inventory;
                let quantity = this.quantity();

                this._controller.addUsedPart(
                    inventory.get('part_item_number_rev'),
                    this.activityId(),
                    quantity
                );

                this._controller.router.go('dashboard', {historyUpdate: 'replace'});
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
                this.searchResultsSubscription && this.searchResultsSubscription.dispose && this.searchResultsSubscription.dispose();
                this.searchResultsSubscription = null;
                this.activityId('');
            }


            dismiss() {
                if (this.selectedInventory()) {
                    this.listViewSelection([]);
                    this.selectedInventory(null);
                } else {
                    this._controller.router.go('dashboard', {historyUpdate: 'replace'});
                }
            }
        }

        return new AddUsedPartViewModel();
    }
);
