/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
    'knockout',
    '../utils/parser'
], (
    ko,
    parser
) => {
    const storage = window.localStorage;

    class PersistentStorage {

        static saveData(key, value) {
            storage.setItem(key, JSON.stringify(value));
        }

        static loadData(key) {
            return parser.parseJSON(storage.getItem(key), null);
        }

        static removeData(key) {
            storage.removeItem(key);
        }
    }

    return PersistentStorage;
});
