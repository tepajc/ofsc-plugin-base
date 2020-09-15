/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
    'knockout',
    './abstract-model',
    './order-model'
], (
    ko,
    AbstractModel,
    OrderModel
) => {
    class OrderItemModel extends AbstractModel {

        static get KEY_PROPERTY() {
            return 'typeLabel';
        }

        /**
         * @param {string} type
         * @param {string} label
         * @param {string} invid
         * @param {number} quantity
         * @param {number} receivedQuantity
         * @param {string} imgUrl
         * @param {string} catalogId
         * @param {string} itemId
         * @param {string} inventoryType
         * @param {string} itemType
         * @param {Array} fields
         * @param {String} orderStatus
         * @param {String} shipmentNumber
         */
        constructor({ label, invid, quantity, receivedQuantity = 0, imgUrl, catalogId, itemId, inventoryType, itemType, fields, orderStatus, shipmentNumber }) {
            super();

            const status = orderStatus || OrderModel.STATUSES.draft.key;

            this._label         = this.constructor._getArgumentAsObservable(label);
            this._invid         = this.constructor._getArgumentAsObservable(invid || 0);
            this._quantity      = this.constructor._getArgumentAsObservable(quantity);
            this._receivedQuantity = this.constructor._getArgumentAsObservable(receivedQuantity);
            this._imgUrl        = this.constructor._getArgumentAsObservable(imgUrl);
            this._catalogId     = this.constructor._getArgumentAsObservable(catalogId);
            this._itemId        = this.constructor._getArgumentAsObservable(itemId);
            this._inventoryType = this.constructor._getArgumentAsObservable(inventoryType);
            this._itemType      = this.constructor._getArgumentAsObservable(itemType);
            this._fields        = this.constructor._getArgumentAsObservable(fields || []);
            this._orderStatus   = this.constructor._getArgumentAsObservable(status);
            this._shipmentNumber = this.constructor._getArgumentAsObservable(shipmentNumber || '');

            this._typeLabel = ko.pureComputed(() => this._inventoryType() + '_' + this._label());
        }

        /** @deprecated */
        toJSON() {
            return {
                label         : this.label,
                invid         : this.invid,
                quantity      : this.quantity,
                imgUrl        : this.imgUrl,
                catalogId     : this.catalogId,
                itemId        : this.itemId,
                inventoryType : this.inventoryType,
                itemType      : this.itemType,
                fields        : this.fields,
                orderStatus   : this.orderStatus,
                shipmentNumber : this.shipmentNumber
            };
        }

        /** @deprecated */
        static fromJson({ label, quantity, imgUrl, catalogId, itemId, inventoryType, itemType, fields }) {
            return new this({
                label,
                quantity: parseInt(quantity, 10) || 1,
                imgUrl,
                catalogId,
                itemId,
                inventoryType,
                itemType,
                fields
            });
        }

        /** @returns {Number} */
        get typeLabel() {
            return this._typeLabel();
        }

        /** @returns {String} */
        get label() {
            return this._label();
        }

        /** @param {String} value */
        set label(value) {
            this._label(value);
        }

        /** @returns {String} */
        get invid() {
            return this._invid();
        }

        /** @param {String} value */
        set invid(value) {
            this._invid(value);
        }

        /** @returns {String} */
        get imgUrl() {
            return this._imgUrl();
        }

        /** @param {String} value */
        set imgUrl(value) {
            this._imgUrl(value);
        }

        /** @returns {Number} */
        get quantity() {
            return this._quantity();
        }

        /** @param {Number} value */
        set quantity(value) {
            this._quantity(value);
        }

        /** @returns {Number} */
        get receivedQuantity() {
            return this._receivedQuantity();
        }

        /** @param {Number} value */
        set receivedQuantity(value) {
            this._receivedQuantity(value);
        }

        /** @returns {Number} */
        get catalogId() {
            return this._catalogId();
        }

        /** @param {Number} value */
        set catalogId(value) {
            this._catalogId(value);
        }

        /** @returns {Number} */
        get itemId() {
            return this._itemId();
        }

        /** @param {Number} value */
        set itemId(value) {
            this._itemId(value);
        }

        /** @returns {String} */
        get inventoryType() {
            return this._inventoryType();
        }

        /** @param {String} value */
        set inventoryType(value) {
            this._inventoryType(value);
        }

        /** @returns {String} */
        get itemType() {
            return this._itemType();
        }

        /** @param {String} value */
        set itemType(value) {
            this._itemType(value);
        }

        /** @returns {Array} */
        get fields() {
            return this._fields();
        }

        /** @param {Array} value */
        set fields(value) {
            this._fields(value);
        }

        /** @returns {String} */
        get orderStatus() {
            return this._orderStatus();
        }

        /** @param {String} value */
        set orderStatus(value) {
            this._orderStatus(value);
        }

        /** @returns {String} */
        get shipmentNumber() {
            return this._shipmentNumber();
        }

        /** @param {String} value */
        set shipmentNumber(value) {
            this._shipmentNumber(value);
        }
    }

    return OrderItemModel;
});
