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
    /**
     * @class OrderModel
     * @extends AbstractModel
     */
    class OrderModel extends AbstractModel {

        static get STATUSES() {
            return {
                canceled:  { key: 'cancelled', externalKey: 'Canceled',         title : 'Canceled' }, // not used
                confirmed: { key: 'confirmed', externalKey: 'Confirmed',        title : 'Confirmed' }, // not used
                delivered: { key: 'delivered', externalKey: 'SHIPPED_RECEIVED', title : 'Delivered' },
                draft:     { key: 'draft',     externalKey: 'Draft',            title : 'Draft' }, // not used
                new:       { key: 'new',       externalKey: 'WAIT_FULFILL',     title : 'Awaiting fulfilment' },
                partially_received:  { key: 'partially_received',  externalKey: 'SHIPPED_P_RECEIVED',  title : 'Partially Received' },
                received:  { key: 'received',  externalKey: 'RECEIVED',         title : 'Received' },
                rejected:  { key: 'rejected',  externalKey: 'REJECTED',         title : 'Rejected' }, // not used
                shipped:   { key: 'shipped',   externalKey: 'SHIPPED',          title : 'Shipped' }
            }
        }

        static get STATUS_KEYS_BY_EXTERNAL_KEY() {
            if (!this._statusesByExternalKey) {
                this._statusesByExternalKey = Object.entries(this.STATUSES).reduce((accumulator, [key, status]) => {
                    accumulator[status.externalKey] = key;
                    return accumulator;
                }, {});
            }
            return this._statusesByExternalKey;
        }

        static get DESTINATION_TYPES() {
            return {
                technician: { key: 'technician', title: 'Van Replenishment' },
                activity: { key: 'activity', title: 'Activity' }
            }
        }

        static get KEY_PROPERTY() {
            return 'id';
        }

        /**
         * @param {Number} id
         * @param {String} status
         * @param {String} address
         * @param {String} city
         * @param {String} state
         * @param {String} zip
         * @param {String} orderDate
         * @param {String} orderNumber
         * @param {String} neededByDate
         * @param {String} arrivalDate
         * @param {Array.<OrderItemModel>} orderItems
         * @param {String} destinationType
         * @param {String} followupAid
         * @param {String} followupApptnumber
         * @param {String} customerActivity
         * @param {String} customerActivityApptNumber
         * @param {String} customerActivityType
         * @param {String} customerActivityAddress
         */
        constructor({
                        id = null,
                        status,
                        address = '',
                        city = '',
                        state = '',
                        zip = '',
                        orderDate = '',
                        orderNumber = '',
                        neededByDate,
                        arrivalDate = '',
                        orderItems = [],
                        destinationType = '',
                        customerActivity = '',
                        customerActivityApptNumber = '',
                        customerActivityType = '',
                        customerActivityAddress = '',
                        followupAid = '',
                        followupApptnumber = '',
        }) {
            super();

            let internalStatus = this.constructor.STATUSES.draft.key;

            if (this.constructor.STATUS_KEYS_BY_EXTERNAL_KEY[status]) {
                internalStatus = this.constructor.STATUS_KEYS_BY_EXTERNAL_KEY[status];
            }

            this._id                    = this.constructor._getArgumentAsObservable(id);
            this._status                = this.constructor._getArgumentAsObservable(internalStatus);
            this._address               = this.constructor._getArgumentAsObservable(address);
            this._city                  = this.constructor._getArgumentAsObservable(city);
            this._state                 = this.constructor._getArgumentAsObservable(state);
            this._zip                   = this.constructor._getArgumentAsObservable(zip);
            this._customerActivity      = this.constructor._getArgumentAsObservable(customerActivity);
            this._customerActivityApptNumber = this.constructor._getArgumentAsObservable(customerActivityApptNumber);
            this._customerActivityType  = this.constructor._getArgumentAsObservable(customerActivityType);
            this._customerActivityAddress = this.constructor._getArgumentAsObservable(customerActivityAddress);
            this._followupAid           = this.constructor._getArgumentAsObservable(followupAid);
            this._followupApptnumber    = this.constructor._getArgumentAsObservable(followupApptnumber);
            this._orderNumber           = this.constructor._getArgumentAsObservable(orderNumber);
            this._orderDate             = this.constructor._getArgumentAsObservable(orderDate);
            this._neededByDate          = this.constructor._getArgumentAsObservable(neededByDate);
            this._arrivalDate           = this.constructor._getArgumentAsObservable(arrivalDate);
            this._orderItems            = this.constructor._getArgumentAsObservable(orderItems);
            this._destinationType       = this.constructor._getArgumentAsObservable(destinationType || this.constructor.DESTINATION_TYPES.technician.key);
        }

        toObject() {
            return {
                id: this.id,
                status: this.constructor.STATUSES[this.status].externalKey,
                address: this.address,
                city: this.city,
                state: this.state,
                zip: this.zip,
                customerActivity: this.customerActivity,
                customerActivityApptNumber: this.customerActivityApptNumber,
                customerActivityType: this.customerActivityType,
                customerActivityAddress: this.customerActivityAddress,
                followupAid: this.followupAid,
                followupApptnumber: this.followupApptnumber,
                orderNumber: this.orderNumber,
                orderDate: this.orderDate,
                arrivalDate: this.arrivalDate,
                neededByDate: this.neededByDate,
                orderItems: this.orderItems.map(item => item.toJSON()),
                destinationType: this.destinationType
            }
        }

        /**
         * @param {OrderItemModel} orderItemModel
         */
        addItem(orderItemModel) {
            this._orderItems.push(orderItemModel);
        }

        /**
         * @param {OrderItemModel} orderItemModel
         */
        removeItem(orderItemModel) {
            return this._orderItems.remove(orderItemModel);
        }

        /** @returns {Number} */
        get id() {
            return this._id();
        }

        /** @type {Number} value */
        set id(value) {
            this._id(value);
        }

        /** @returns {String} */
        get status() {
            return this._status();
        }

        /** @param {String} value */
        set status(value) {
            this._status(value);
        }

        /** @returns {String} */
        get address() {
            return this._address();
        }

        /** @returns {Function.<String>} */
        get $address() {
            return this._address;
        }

        /** @param {String} value */
        set address(value) {
            this._address(value);
        }

        /** @returns {String} */
        get city() {
            return this._city();
        }

        /** @returns {Function.<String>} */
        get $city() {
            return this._city;
        }

        /** @param {String} value */
        set city(value) {
            this._city(value);
        }

        /** @returns {String} */
        get state() {
            return this._state();
        }

        /** @returns {Function.<String>} */
        get $state() {
            return this._state;
        }
        /** @param {String} value */
        set state(value) {
            this._state(value);
        }

        /** @returns {String} */
        get zip() {
            return this._zip();
        }

        /** @returns {Function.<String>} */
        get $zip() {
            return this._zip;
        }
        /** @param {String} value */
        set zip(value) {
            this._zip(value);
        }

        /** @returns {String} */
        get customerActivity() {
            return this._customerActivity();
        }

        /** @returns {String} */
        get $customerActivity() {
            return this._customerActivity;
        }

        /** @param {String} value */
        set customerActivity(value) {
            this._customerActivity(value);
        }

        /** @returns {String} */
        get customerActivityApptNumber() {
            return this._customerActivityApptNumber();
        }

        /** @param {String} value */
        set customerActivityApptNumber(value) {
            this._customerActivityApptNumber(value);
        }

        /** @returns {String} */
        get customerActivityType() {
            return this._customerActivityType();
        }

        /** @param {String} value */
        set customerActivityType(value) {
            this._customerActivityType(value);
        }

        /** @returns {String} */
        get customerActivityAddress() {
            return this._customerActivityAddress();
        }

        /** @param {String} value */
        set customerActivityAddress(value) {
            this._customerActivityAddress(value);
        }

        /** @returns {String} */
        get followupAid() {
            return this._followupAid();
        }

        /** @param {String} value */
        set followupAid(value) {
            this._followupAid(value);
        }

        /** @returns {String} */
        get followupApptnumber() {
            return this._followupApptnumber();
        }

        /** @param {String} value */
        set followupApptnumber(value) {
            this._followupApptnumber(value);
        }

        /** @returns {String} */
        get neededByDate() {
            return this._neededByDate();
        }

        /** @returns {Function.<String>} */
        get $neededByDate() {
            return this._neededByDate;
        }

        /** @param {String} value */
        set neededByDate(value) {
            this._neededByDate(value);
        }

        /** @returns {String} */
        get arrivalDate() {
            return this._arrivalDate();
        }

        /** @param {String} value */
        set arrivalDate(value) {
            this._arrivalDate(value);
        }

        /** @returns {String} */
        get destinationType() {
            return this._destinationType();
        }

        /** @returns {Function.<String>} */
        get $destinationType() {
            return this._destinationType;
        }

        /** @param {String} value */
        set destinationType(value) {
            this._destinationType(value);
        }

        /** @returns {String} */
        get orderNumber() {
            return this._orderNumber();
        }
        /** @param {String} value */
        set orderNumber(value) {
            this._orderNumber(value && value.toString && value.toString() || '');
        }

        /** @returns {String} */
        get orderDate() {
            return this._orderDate();
        }

        /** @param {String} value */
        set orderDate(value) {
            this._orderDate(value);
        }

        /** @returns {Array<OrderItemModel>} */
        get orderItems() {
            return this._orderItems();
        }

        /** @returns {Array<OrderItemModel>} */
        get $orderItems() {
            return this._orderItems;
        }

        /** @param {Array<OrderItemModel>} value */
        set orderItems(value) {
            this._orderItems(value);
        }

        populateAddressFromObject(addressObject) {
            this._address(addressObject.address);
            this._city(addressObject.city);
            this._state(addressObject.state);
            this._zip(addressObject.zip || addressObject.postalCode);
        }

        /**
         * @returns {String}
         */
        getAddressText() {
            const address = [
                this._address(),
                this._city(),
                this._state(),
                this._zip()
            ].filter(item => item).join(', ');

            if (address) {
                return address;
            } else {
                return '';
            }
        }

    }

    return OrderModel;
});
