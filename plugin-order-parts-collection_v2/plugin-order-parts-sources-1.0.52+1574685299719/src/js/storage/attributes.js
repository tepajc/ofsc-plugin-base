/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
    './persistent-storage',
], (
    PersistentStorage
) => {

    const ROOT_KEY = 'i_attributeDescription';

    /**
     * Stores and gives access to attributes of the plugin
     */
    class AttributesStorage {

        static saveData(value) {
            PersistentStorage.saveData(ROOT_KEY, value);
        }

        static loadData() {
            return PersistentStorage.loadData(ROOT_KEY);
        }

        static removeData() {
            PersistentStorage.removeItem(ROOT_KEY);
        }
    }

    return AttributesStorage;
});
