/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
    'ofsc-connector',
    '../models/part-model',
    '../models/catalog-model',
], (
    OfscConnector,
    PartModel,
    CatalogModel,
) => {
    'use strict';

    class PartsCatalogDataService {

        /**
         * @param {OfscConnector} ofscConnector
         */
        constructor(ofscConnector) {

            if (!ofscConnector || !(ofscConnector instanceof OfscConnector)) {
                throw new TypeError('ofscConnector must be an OfscConnector instance');
            }

            /**
             * @type {OfscConnector}
             * @private
             */
            this._connector = ofscConnector;
        }

        /**
         * @param {string} query
         * @param [limit]
         * @param {Boolean} [cacheOnly = false]
         * @returns {Promise.<{items: PartModel[], isContinueAvailable: Boolean, searchId: Number}>}
         */
        searchParts(query, limit, cacheOnly = false) {
            let params = {
                query
            };
            if (limit) {
                params.limit = limit;
            }
            if (cacheOnly) {
                params.cacheOnly = true;
            }
            return new Promise((resolve, reject) => {
                this._connector.sendMessage({
                    method: 'callProcedure',
                    callId: this._connector.constructor.generateCallId(),
                    procedure: 'searchParts',
                    params
                }).then((procedureResult) => {
                    //console.log("SEARCH RESULT: ", procedureResult.resultData);
                    let parts = procedureResult.resultData.items;
                    let partModels = parts.map((item) => new PartModel(item));

                    resolve({
                        items: partModels,
                        isContinueAvailable: procedureResult.resultData.isContinueAvailable,
                        searchId: procedureResult.resultData.searchId
                    });
                }).catch(reject);
            });
        }

        /**
         * @param {Number} searchId
         * @returns {Promise.<{items: PartModel[], isContinueAvailable: Boolean, searchId: Number}>}
         */
        searchPartsContinue(searchId) {
            let params = {
                searchId
            };
            return new Promise((resolve, reject) => {
                this._connector.sendMessage({
                    method: 'callProcedure',
                    callId: this._connector.constructor.generateCallId(),
                    procedure: 'searchPartsContinue',
                    params
                }).then((procedureResult) => {
                    resolve({
                        items: procedureResult.resultData.items.map((item) => new PartModel(item)),
                        isContinueAvailable: procedureResult.resultData.isContinueAvailable,
                        searchId: procedureResult.resultData.searchId
                    });
                    //console.log("SEARCH RESULT CONTINUE: ", procedureResult.resultData);

                }).catch(reject);
            });
        }

        /**
         * @param {Array.<{ catalogId: number, label: string }>} items
         * @param {Boolean} [cacheOnly=false]
         * @returns {Promise.<PartModel[]>}
         */
        getParts(items, cacheOnly = false) {
            let params = {
                items
            };
            if (cacheOnly) {
                params.cacheOnly = true;
            }
            return new Promise((resolve, reject) => {
                this._connector.sendMessage({
                    method: 'callProcedure',
                    callId: this._connector.constructor.generateCallId(),
                    procedure: 'getParts',
                    params
                }).then((procedureResult) => {

                    let parts = procedureResult.resultData.items;
                    if (procedureResult.resultData.notFoundItems.length > 0) {
                        //console.log("Not found items: ", procedureResult.resultData.notFoundItems);
                    }
                    let partModels = parts.map((item) => new PartModel(item));

                    resolve(partModels);
                }).catch(reject);
            });
        }

        /**
         * @returns {Promise.<CatalogModel[]>}
         */
        getPartsCatalogsStructure() {
            return new Promise((resolve, reject) => {
                this._connector.sendMessage({
                    method: 'callProcedure',
                    callId: this._connector.constructor.generateCallId(),
                    procedure: 'getPartsCatalogsStructure'
                }).then((procedureResult) => {

                    let catalogs = procedureResult.resultData;
                    let catalogModels = catalogs.map((catalog) => new CatalogModel(catalog));

                    resolve(catalogModels);
                }).catch(reject);
            });
        }
    }

    return PartsCatalogDataService;
});
