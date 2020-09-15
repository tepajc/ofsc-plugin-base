/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
'use strict';
define([
    'ofsc-connector',
    'knockout'
], (
    OfscConnector,
    ko
) => {

    class BarcodeDataService {

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

            this.isBarcodeScannerAvailable = ko.observable(true);
        }

        /**
         * @see https://docs.oracle.com/en/cloud/saas/field-service/19b/fapcf/plug-in-api-messages.html#r_scanbarcode
         * @returns {Promise.<{text: String, format: String, cancelled: Boolean}>}
         */
        scanBarcode() {
            let callId = this._connector.constructor.generateCallId();

            return this._connector.sendMessage({
                method: 'callProcedure',
                procedure: 'scanBarcode',
                callId: callId
            }).then((data) => {
                if (!data.resultData) {
                    console.error('No data.resultData in callProcedure response');

                    return Promise.reject(data);
                }

                if (data.callId !== callId) {
                    console.error('callId does not equal to each other');
                    return Promise.reject(data);
                }

                return data.resultData;
            }).catch((data) => {
                if (data.method === 'error') {
                    switch (data.errors[0].code) {
                        case 'CODE_PROCEDURE_UNAVAILABLE':
                            this.isBarcodeScannerAvailable(false);
                            throw(new Error('NOT_AVAILABLE'));
                        default:
                            throw(data.errors[0]);
                    }
                }
            });

        }
    }

    return BarcodeDataService;
});
