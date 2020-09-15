/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define(['knockout'], (ko) => {
    let idCounter = 1;

    class AbstractModel {
        getId() {
            return this[this.constructor.KEY_PROPERTY];
        }

        static _getArgumentAsObservable(value) {
            if (ko.isObservable(value)) {
                return value;
            }
            if (value instanceof Array) {
                return ko.observableArray(value);
            }
            return ko.observable(value);
        }

        static generateUniqueId() {
            let timestamp = (new Date).getTime();

            let numbers = window.crypto.getRandomValues(new Uint8Array(8));

            let randomHexString = '';

            numbers.forEach((number) => {
                let hexNumber = number.toString(16);
                randomHexString += hexNumber.length < 2 ? '0' + hexNumber : hexNumber;
            });

            let counter = idCounter++;

            return `${timestamp}-${counter}-${randomHexString}`;
        }

        static definePropertyAsArray(property) {
            property.__isArray = true;
        }

        static definePropertyAsObject(property) {
            property.__isObject = true;
        }

        static isPropertyArray(property) {
            return property.__isArray;
        }

        static isPropertyObject(property) {
            return property.__isObject;
        }

        static get KEY_PROPERTY() {
            return 'id';
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

    return AbstractModel;
});