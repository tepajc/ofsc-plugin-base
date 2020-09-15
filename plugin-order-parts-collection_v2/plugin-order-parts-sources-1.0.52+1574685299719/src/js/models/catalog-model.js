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
    class CatalogModel extends AbstractModel {

        static get KEY_PROPERTY() {
            return 'catalogId';
        }

        /** @returns {Number} */
        get catalogId() {
            return this._catalogId();
        }

        /** @returns {String} */
        get name() {
            return this._name();
        }

        /** @param {String} value */
        set name(value) {
            this._name(value);
        }

        /** @returns {String} */
        get label() {
            return this._label();
        }

        /** @param {String} value */
        set label(value) {
            this._label(value);
        }

        /** @returns {Array.<{label: String, name: String, propertyLabel: String, searchable: Boolean, preview: Boolean}>} */
        get fieldSchemas() {
            return this._fieldSchemas();
        }

        /** @param {Array.<{label: String, name: String, propertyLabel: String, searchable: Boolean, preview: Boolean}>} value */
        set fieldSchemas(value) {
            this._fieldSchemas(value);
        }

        /**
         * Calculated from fieldSchemas (where preview == true)
         * @returns {Array.<{label: String, name: String, propertyLabel: String, searchable: Boolean, preview: Boolean}>}
         */
        get previewFieldSchemas() {
            return this._previewFieldSchemas();
        }

        /**
         * Calculated from fieldSchemas (where preview != true)
         * @returns {Array.<{label: String, name: String, propertyLabel: String, searchable: Boolean, preview: Boolean}>}
         */
        get nonPreviewFieldSchemas() {
            return this._nonPreviewFieldSchemas();
        }

        /**
         * Calculated from fieldSchemas (where searchable == true)
         * @returns {Object.<String, {label: String, name: String, propertyLabel: String, searchable: Boolean, preview: Boolean}>}
         */
        get searchableFields() {
            return this._searchableFields();
        }

        /** @returns {Array.<{itemType: String, inventoryType: String}>} */
        get typeSchemas() {
            return this._typeSchemas();
        }

        /** @param {Array.<{itemType: String, inventoryType: String}>} value */
        set typeSchemas(value) {
            this._typeSchemas(value);
        }

        /**
         * @param {Number} catalogId
         * @param {String} label
         * @param {String} name
         * @param {Array.<{label: String, name: String, propertyLabel: String, searchable: Boolean, preview: Boolean}>} fieldSchemas
         * @param {Array.<{itemType: String, inventoryType: String}>} typeSchemas
         */
        constructor({catalogId, label, name, fieldSchemas, typeSchemas}) {
            super();

            this._catalogId     = this.constructor._getArgumentAsObservable(catalogId);
            this._name          = this.constructor._getArgumentAsObservable(name);
            this._label         = this.constructor._getArgumentAsObservable(label);
            this._fieldSchemas  = this.constructor._getArgumentAsObservable(fieldSchemas);
            this._typeSchemas   = this.constructor._getArgumentAsObservable(typeSchemas);

            this._previewFieldSchemas = ko.pureComputed(() => this._fieldSchemas().filter(schema => schema.preview));
            this._nonPreviewFieldSchemas = ko.pureComputed(() => this._fieldSchemas().filter(schema => !schema.preview));
            this._searchableFields = ko.pureComputed(() => this._fieldSchemas()
                .filter(schema => schema.searchable)
                .reduce((accumulator, schema) => { accumulator[schema.label] = schema; return accumulator; }, {})
            );

            this.constructor.definePropertyAsArray(this._fieldSchemas);
            this.constructor.definePropertyAsArray(this._previewFieldSchemas);
            this.constructor.definePropertyAsArray(this._nonPreviewFieldSchemas);
            this.constructor.definePropertyAsObject(this._searchableFields);
            this.constructor.definePropertyAsArray(this._typeSchemas);
        }

    }

    return CatalogModel;
});
