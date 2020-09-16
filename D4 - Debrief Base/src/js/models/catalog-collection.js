/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define(['knockout', './abstract-collection', './catalog-model'], (ko, AbstractCollection, CatalogModel) => {
    class CatalogCollection extends AbstractCollection {
        constructor() {
            super();
        }

        /**
         * @param {Number} catalogId
         * @returns {CatalogModel}
         */
        getByIdOrCreate(catalogId) {
            return super.getByIdOrCreate(catalogId);
        }

        /**
         * @param id
         * @returns {CatalogModel}
         */
        static createEmptyModel(id) {
            return new CatalogModel({id, name: '', fieldSchemas: [], typeSchemas: []});
        }
    }

    return CatalogCollection;
});