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

    class PartModel extends AbstractModel {
        /**
         * @param {Object} properties
         */
        constructor(properties) {
            super();

            this._properties = {};

            this._properties.itemId        = this.constructor._getArgumentAsObservable(properties.itemId || this.constructor.generateUniqueId());
            this._properties.catalogId     = this.constructor._getArgumentAsObservable(properties.catalogId);
            this._properties.label         = this.constructor._getArgumentAsObservable(properties.label);
            this._properties.itemType      = this.constructor._getArgumentAsObservable(properties.itemType);
            this._properties.inventoryType = this.constructor._getArgumentAsObservable(properties.inventoryType);
            this._properties.fields        = this.constructor._getArgumentAsObservable(properties.fields);
            this._properties.linkedItems   = this.constructor._getArgumentAsObservable(properties.linkedItems || []);
            this._properties.images        = this.constructor._getArgumentAsObservable(properties.images || []);

            this.constructor.definePropertyAsObject(this._properties.fields);
            this.constructor.definePropertyAsObject(this._properties.linkedItems);
            this.constructor.definePropertyAsArray(this._properties.images);
        }

        static get KEY_PROPERTY() {
            return 'itemId';
        }

        /** @returns {Number} */
        get itemId() {
            return this._properties.itemId();
        }

        /** @returns {Number} */
        get catalogId() {
            return this._properties.catalogId();
        }

        /** @returns {String} */
        get label () {
            return this._properties.label();
        }

        /** @param {String} value */
        set label(value) {
            this._properties.label(value);
        }

        /** @returns {String} */
        get itemType () {
            return this._properties.itemType();
        }

        /** @param {String} value */
        set itemType(value) {
            this._properties.itemType(value);
        }

        /** @returns {String} */
        get inventoryType () {
            return this._properties.inventoryType();
        }

        /** @param {String} value */
        set inventoryType(value) {
            this._properties.inventoryType(value);
        }

        /** @returns {Object.<String, String>} */
        get fields () {
            return this._properties.fields();
        }

        /** @param {Object<String, String>} value */
        set fields(value) {
            this._properties.fields(value);
        }

        /** @returns {Array.<{id: Number, label: String, displayData: String}>} */
        get linkedItems () {
            return this._properties.linkedItems();
        }

        /** @param {Array.<{id: Number, label: String, displayData: String}>} value */
        set linkedItems(value) {
            this._properties.linkedItems(value);
        }

        /** @returns {Array.<String>} */
        get images () {
            return this._properties.images();
        }

        /** @param {Array.<String>} value */
        set images(value) {
            this._properties.images(value);
        }

        toObject() {
            return {
                itemId: this.itemId,
                catalogId: this.catalogId,
                label: this.label,
                inventoryType: this.inventoryType,
                itemType: this.itemType,
                fields: this.fields,
                images: this.images
            };
        }
    }

    return PartModel;
});