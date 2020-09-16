/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define(['knockout'], (ko) => {
    class AbstractCollection {
        constructor() {
            /**
             * @type {Object.<AbstractModel>}
             */
            this._dictionary = {};

            this.items = ko.observableArray([]);
        }

        getByIdOrCreate(id) {
            if (!this.has(id)) {
                let model = this.constructor.createEmptyModel(id);
                this.items.push(model);
                return this._dictionary[id] = model;
            }
            return this._dictionary[id];
        }

        /**
         * @param {AbstractModel} model
         */
        add(model) {
            this._dictionary[model.getId()] = model;
            this.items.push(model);
        }

        /**
         * @param id
         * @abstract
         * @protected
         */
        static createEmptyModel(id) {
            throw new Error('Not implemented');
        }

        has(id) {
            return this._dictionary.hasOwnProperty(id);
        }

    }

    return AbstractCollection;
});