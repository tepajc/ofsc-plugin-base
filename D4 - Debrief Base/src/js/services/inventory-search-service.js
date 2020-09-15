/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([], () => {


    const SEARCH_DELIMITER = '~';

    class InventorySearchService {

        constructor(inventoryCollection, attributeDescription, searchableProperties, orderByProperty) {
            this.inventoryCollection = inventoryCollection;
            this.attributeDescription = attributeDescription;

            this.searchableProperties = searchableProperties;
            this.orderByProperty = orderByProperty;

            this.normalizedInventoryList = this._normalizeInventoryForSearch(inventoryCollection);
        }

        /**
         * Extracts all searchable text data form inventory properties.
         * Represents all text values of inventory as a 1 string at lower case where values are divided by "~" symbol.
         * Example "val1~val2~val3"
         *
         * @param inventoryCollection
         * @returns {Array}
         */
        _normalizeInventoryForSearch(inventoryCollection) {
            let result = [];
            let searchableProperties = this.searchableProperties.reduce((accumulator, propertyLabel) => {
                let attributeDescription = this.attributeDescription[propertyLabel];
                if (!attributeDescription) {
                    return accumulator;
                }

                accumulator.push({
                    label: propertyLabel,
                    attributeDescription: attributeDescription
                });

                return accumulator;
            }, []);
            let searchablePropertiesLength = searchableProperties.length;

            inventoryCollection.each(inventory => {

                if (!inventory.has(this.orderByProperty)) {
                    return;
                }

                let propertyValues = [];

                for (let i = 0; i < searchablePropertiesLength; ++i) {
                    let searchableProperty = searchableProperties[i];
                    let propertyValue = inventory.get(searchableProperty.label);

                    if (searchableProperty.attributeDescription.type === 'enum') {
                        let enumCollection = searchableProperty.attributeDescription.enum;
                        propertyValue = enumCollection && enumCollection[propertyValue] && enumCollection[propertyValue].text || '';
                    }

                    if (propertyValue === null || propertyValue === undefined) {
                        continue;
                    }
                    propertyValue = propertyValue.toString().toLowerCase().trim();

                    if (!propertyValue) {
                        continue;
                    }
                    propertyValues.push(propertyValue);
                }

                result.push({
                    inventory: inventory,
                    searchString: propertyValues.join(SEARCH_DELIMITER),
                    orderByProperty: inventory.get(this.orderByProperty).toString()
                });
            });
            return result.sort((first, second) => first.orderByProperty.localeCompare(second.orderByProperty));
        }

        _normalizeSearchSubstring(substring) {
            if (substring === null || substring === undefined) {
                return '';
            }

            let stringValue = substring.toString();

            // filter SEARCH_DELIMITER:
            let filteredStringValue = '';
            for (let i = 0, l = stringValue.length; i < l; ++i) {
                if (stringValue[i] !== SEARCH_DELIMITER) {
                    filteredStringValue += stringValue[i];
                }
            }

            return filteredStringValue.toLowerCase().trim();
        }

        searchBySubstring(substring) {
            let normalizedSubstring = this._normalizeSearchSubstring(substring);
            if (!normalizedSubstring) {
                return [];
            }

            return this.normalizedInventoryList
                .filter(item => item.searchString.indexOf(normalizedSubstring) >= 0)
                .map(item => item.inventory);
        }

    }

    return InventorySearchService;
});