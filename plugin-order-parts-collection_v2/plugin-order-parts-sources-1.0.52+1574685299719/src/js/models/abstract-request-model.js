/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
    'knockout',
    './abstract-model'
], (ko, AbstractModel) => {

    class AbstractRequestModel extends AbstractModel {
        /**
         * @param {Object} properties
         * @param {String} [properties.id] unique id
         * @param {String} properties.ownerResourceId external id
         * @param {String} properties.date - yyyy-mm-dd
         * @param {String} properties.shiftType regular or on-call
         * @param {Number} [properties.createdAt] unix timestamp in seconds
         */
        constructor(properties) {
            super();

            this._properties = {};

            this._properties.id = this.constructor._getArgumentAsObservable(properties.id || this.constructor.generateUniqueId());
            this._properties.ownerResourceId = this.constructor._getArgumentAsObservable(properties.ownerResourceId);
            this._properties.date = this.constructor._getArgumentAsObservable(properties.date);
            this._properties.shiftType = this.constructor._getArgumentAsObservable(properties.shiftType);
            this._properties.createdAt = this.constructor._getArgumentAsObservable(properties.createdAt || this.constructor.getCurrentUnixTimestamp());
        }

        static getCurrentUnixTimestamp() {
            return Math.round((new Date()).getTime() / 1000);
        }

        static get REQUEST_SHIFT_TYPE_REGULAR() {
            return 'regular';
        }

        static get REQUEST_SHIFT_TYPE_ONCALL() {
            return 'on-call';
        }

        static get KEY_PROPERTY() {
            return 'id';
        }

        get id() {
            return this._properties.id;
        }

        get ownerResourceId() {
            return this._properties.ownerResourceId;
        }

        set ownerResourceId(value) {
            this._properties.ownerResourceId(value);
        }

        get date() {
            return this._properties.date;
        }

        set date(value) {
            this._properties.date(value);
        }

        get shiftType() {
            return this._properties.shiftType;
        }

        set shiftType(value) {
            this._properties.shiftType(value);
        }

        get createdAt() {
            return this._properties.createdAt;
        }

        update(properties) {
            Object.entries(properties).forEach(([propertyName, value]) => {
                if (!this._properties.hasOwnProperty(propertyName)) {
                    return;
                }
                let propertyInstance = this._properties[propertyName];
                if (this.constructor.isPropertyArray(propertyInstance)) {
                    if (!this._compareArrays(propertyInstance.peek(), value)) {
                        propertyInstance(value);
                    }
                } else if (this.constructor.isPropertyObject(propertyInstance)) {
                    if (!this._compareObjects(propertyInstance.peek(), value)) {
                        propertyInstance(value);
                    }
                } else {
                    propertyInstance(value);
                }
            });
        }

        _compareObjects(obj1, obj2) {
            if (typeof obj1 !== typeof obj2) {
                return false;
            }
            let keys1 = Object.keys(obj1);
            let keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) {
                return false;
            }
            for (let i = 0; i < keys1.length; ++i) {
                let key = keys1[i];
                let obj1Item = obj1[key];
                let obj2Item = obj2[key];

                if (typeof obj1Item !== typeof obj2Item) {
                    return false;
                }
                if (obj1Item instanceof Array) {
                    if (!this._compareArrays(obj1Item, obj2Item)) {
                        return false;
                    }
                } else if (typeof obj1Item === 'object') {
                    if (!this._compareObjects(obj1Item, obj2Item)) {
                        return false;
                    }
                } else {
                    if (obj1Item !== obj2Item) {
                        return false;
                    }
                }
            }
        }

        _compareArrays(array1, array2) {
            if (array1.length !== array2.length || typeof array1 !== typeof array2) {
                return false;
            }
            for (let i = 0; i < array1.length; ++i) {
                let array1Item = array1[i];
                let array2Item = array2[i];

                if (typeof array1Item !== typeof array2Item) {
                    return false;
                }
                if (array1Item instanceof Array) {
                    if (!this._compareArrays(array1Item, array2Item)) {
                        return false;
                    }
                } else if (typeof array1Item === 'object') {
                    if (!this._compareObjects(array1Item, array2Item)) {
                        return false;
                    }
                } else {
                    if (array1Item !== array2Item) {
                        return false;
                    }
                }
            }
            return true;
        }
    }

    return AbstractRequestModel;
});