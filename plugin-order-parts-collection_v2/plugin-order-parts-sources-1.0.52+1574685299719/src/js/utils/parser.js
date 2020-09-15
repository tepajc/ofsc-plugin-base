/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([], () => {

    /**
     * @param {String} text
     * @param {*} defaultValue
     * @returns {Null}
     */
    const parseJSON = function (text, defaultValue = null) {
        try {
            return JSON.parse(text);
        } catch (err) {
            return defaultValue;
        }
    }

    return {
        parseJSON
    };
});
