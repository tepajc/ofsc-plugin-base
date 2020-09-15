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
    class ActivityModel extends AbstractModel {

        /**
         * @param {string} id
         * @param {string} apptNumber
         * @param {string} status
         * @param {string} worktype
         * @param {string} address
         * @param {String} city
         * @param {String} state
         * @param {number} zip
         *
         * @param {String} orderItems
         * @param {String} orderDestinationType
         * @param {String} orderShipmentNumber
         * @param {String} orderReceivedItems
         * @param {String} orderStatus
         * @param {String} orderFollowupAid
         * @param {String} orderFollowupApptnumber
         * @param {String} orderInitialAid
         * @param {String} orderInitialApptnumber
         * @param {String} orderInitialType
         * @param {String} orderInitialAddress
         */
        constructor({id, apptNumber, status, worktype, address, city, state, zip, orderItems = null, orderDestinationType = null, orderShipmentNumber = null, orderReceivedItems = null, orderStatus = null, orderFollowupAid = null, orderFollowupApptnumber = null, orderInitialAid = null, orderInitialApptnumber = null, orderInitialType = null, orderInitialAddress = null}) {
            super();

            this._id = this.constructor._getArgumentAsObservable(id);
            this._apptNumber = this.constructor._getArgumentAsObservable(apptNumber);
            this._status = this.constructor._getArgumentAsObservable(status);
            this._worktype = this.constructor._getArgumentAsObservable(worktype);
            this._address = this.constructor._getArgumentAsObservable(address);
            this._city = this.constructor._getArgumentAsObservable(city);
            this._state = this.constructor._getArgumentAsObservable(state);
            this._zip = this.constructor._getArgumentAsObservable(zip);

            this._orderItems = this.constructor._getArgumentAsObservable(orderItems);
            this._orderDestinationType = this.constructor._getArgumentAsObservable(orderDestinationType);
            this._orderShipmentNumber = this.constructor._getArgumentAsObservable(orderShipmentNumber);
            this._orderReceivedItems = this.constructor._getArgumentAsObservable(orderReceivedItems);
            this._orderStatus = this.constructor._getArgumentAsObservable(orderStatus);
            this._orderFollowupAid = this.constructor._getArgumentAsObservable(orderFollowupAid);
            this._orderFollowupApptnumber = this.constructor._getArgumentAsObservable(orderFollowupApptnumber);
            this._orderInitialAid = this.constructor._getArgumentAsObservable(orderInitialAid);
            this._orderInitialApptnumber = this.constructor._getArgumentAsObservable(orderInitialApptnumber);
            this._orderInitialType = this.constructor._getArgumentAsObservable(orderInitialType);
            this._orderInitialAddress = this.constructor._getArgumentAsObservable(orderInitialAddress);
        }

        /** @returns {string} */
        get id() {
            return this._id();
        }

        set id(value) {
            this._id(value);
        }

        /** @returns {string} */
        get apptNumber() {
            return this._apptNumber();
        }

        set apptNumber(value) {
            this._apptNumber(value);
        }

        /** @returns {string} */
        get status() {
            return this._status();
        }

        set status(value) {
            this._status(value);
        }

        /** @returns {string} */
        get worktype() {
            return this._worktype() || '';
        }

        /** @param {string} value */
        set worktype(value) {
            this._worktype(value);
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

        /** @returns {string} */
        get orderItems() {
            return this._orderItems();
        }

        /** @param {string} value */
        set orderItems(value) {
            this._orderItems(value);
        }

        /** @returns {string} */
        get orderDestinationType() {
            return this._orderDestinationType();
        }

        /** @param {string} value */
        set orderDestinationType(value) {
            this._orderDestinationType(value);
        }

        /** @returns {string} */
        get orderShipmentNumber() {
            return this._orderShipmentNumber();
        }

        /** @param {string} value */
        set orderShipmentNumber(value) {
            this._orderShipmentNumber(value);
        }

        /** @returns {string} */
        get orderReceivedItems() {
            return this._orderReceivedItems();
        }

        /** @param {string} value */
        set orderReceivedItems(value) {
            this._orderReceivedItems(value);
        }

        /** @returns {string} */
        get orderStatus() {
            return this._orderStatus();
        }

        /** @param {string} value */
        set orderStatus(value) {
            this._orderStatus(value);
        }

        /** @returns {string} */
        get orderFollowupAid() {
            return this._orderFollowupAid();
        }

        /** @param {string} value */
        set orderFollowupAid(value) {
            this._orderFollowupAid(value);
        }

        /** @returns {string} */
        get orderFollowupApptnumber() {
            return this._orderFollowupApptnumber();
        }

        /** @param {string} value */
        set orderFollowupApptnumber(value) {
            this._orderFollowupApptnumber(value);
        }

        /** @returns {string} */
        get orderInitialAid() {
            return this._orderInitialAid();
        }

        /** @param {string} value */
        set orderInitialAid(value) {
            this._orderInitialAid(value);
        }

        /** @returns {string} */
        get orderInitialApptnumber() {
            return this._orderInitialApptnumber();
        }

        /** @param {string} value */
        set orderInitialApptnumber(value) {
            this._orderInitialApptnumber(value);
        }

        /** @returns {string} */
        get orderInitialType() {
            return this._orderInitialType();
        }

        /** @param {string} value */
        set orderInitialType(value) {
            this._orderInitialType(value);
        }

        /** @returns {string} */
        get orderInitialAddress() {
            return this._orderInitialAddress();
        }

        /** @param {string} value */
        set orderInitialAddress(value) {
            this._orderInitialAddress(value);
        }
    }

    return ActivityModel;
});