/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
    '../storage/attributes'
], (
    AttributesStorage
) => {
    'use strict';

    class InventoryDataService {

        static get NON_SEARCHABLE_FIELDS() {
            return {
                invpool: true,
                inv_aid: true,
                quantity: true
            }
        };

        /**
         * @param {Object} inventoryList
         */
        constructor(inventoryList) {
            this.inventoryList = inventoryList || {};
            this.attributeDescription = AttributesStorage.loadData();

            if (!this.attributeDescription) {
                throw new Error('Cannot load i_attributeDescription from Local Storage');
            }
            this.updateNormalizedInventoryList();
        }

        updateNormalizedInventoryList() {
            this.normalizedInventoryList = this._normalizeInventoryList();
        }

        /**
         * Extracts all searchable text data form inventory properties.
         * Represents all text values of inventory as a 1 string at lower case where values are divided by "~" symbol.
         * Example "val1~val2~val3"
         *
         * @private
         * @returns {Array}
         */
        _normalizeInventoryList() {
            let result = [];
            for (let invid in this.inventoryList) {
                if (!this.inventoryList.hasOwnProperty(invid)) {
                    continue;
                }
                let inventory = this.inventoryList[invid];
                let propertyValues = [];
                for (let propertyName in inventory) {
                    if (!inventory.hasOwnProperty(propertyName)) {
                        continue;
                    }

                    if (typeof inventory.invid === 'undefined') {
                        throw new Error('API is not configured with inventory.invid field');
                    }

                    if (typeof inventory.invpool === 'undefined') {
                        throw new Error('API is not configured with inventory.invpool field');
                    }

                    if (this.constructor.NON_SEARCHABLE_FIELDS.hasOwnProperty(propertyName)) {
                        continue;
                    }

                    let propertyValue = inventory[propertyName];
                    let propertyDescription = this.attributeDescription[propertyName];
                    if (!propertyDescription) {
                        continue;
                    }

                    if (propertyDescription.type === 'enum' && propertyDescription.enum && propertyDescription.enum[propertyValue]) {
                        propertyValue = propertyDescription.enum[propertyValue].text;
                    }

                    if (propertyValue === null || propertyValue === undefined) {
                        propertyValue = '';
                    } else {
                        propertyValue = propertyValue.toString().toLowerCase();
                    }

                    if (!propertyValue) {
                        continue;
                    }

                    propertyValues.push(propertyValue);
                }
                result.push({
                    inventory: inventory,
                    searchString: propertyValues.join('~')
                });
            }

            return result;
        }
    }

    return InventoryDataService;
});
