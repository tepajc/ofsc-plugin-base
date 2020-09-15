/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
    'knockout',
    './abstract-model'
], (
    ko,
    AbstractModel
) => {
    class PickUpLocationModel extends AbstractModel {

        /**
         * @param {string} id
         * @param {string} name
         * @param {string} address
         * @param {{latitude: number, longitude: number}} coordinates
         * @param {String} city
         * @param {String} state
         * @param {number} zip
         */
        constructor({id, name, address, coordinates, city, state, zip}) {
            super();

            this._id = this.constructor._getArgumentAsObservable(id);
            this._name = this.constructor._getArgumentAsObservable(name);
            this._address = this.constructor._getArgumentAsObservable(address);
            this._city = this.constructor._getArgumentAsObservable(city);
            this._state = this.constructor._getArgumentAsObservable(state);
            this._zip = this.constructor._getArgumentAsObservable(zip);
            this._coordinates = this.constructor._getArgumentAsObservable(coordinates);
        }

        /** @returns {string} */
        get id() {
            return this._id();
        }

        set id(value) {
            this._id(value);
        }

        /** @returns {string} */
        get name() {
            return this._name() || '';
        }

        /** @param {string} value */
        set name(value) {
            this._name(value);
        }

        /** @returns {string} */
        get address() {
            return this._address();
        }

        /** @param {string} value */
        set address(value) {
            this._address(value);
        }

        /** @returns {string} */
        get city() {
            return this._city();
        }

        /** @param {string} value */
        set city(value) {
            this._city(value);
        }

        /** @returns {string} */
        get state() {
            return this._state();
        }

        /** @param {string} value */
        set state(value) {
            this._state(value);
        }

        /** @returns {string} */
        get zip() {
            return this._zip();
        }

        /** @param {string} value */
        set zip(value) {
            this._zip(value);
        }

        /** @returns {{latitude: number, longitude: number}} */
        get coordinates() {
            return this._coordinates();
        }

        /** @param {{latitude: number, longitude: number}} value */
        set coordinates(value) {
            this._coordinates(value);
        }
    }

    return PickUpLocationModel;
});
