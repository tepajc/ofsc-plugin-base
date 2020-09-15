/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
    'signals',
    'utils/parser'
], (Signal, parser) => {
    const OFSC_API_VERSION = 1;

    class OfscConnector {
        constructor() {
            window.addEventListener("message", this.onPostMessage.bind(this), false);

            this.debugMessageSentSignal = new Signal();
            this.debugMessageReceivedSignal = new Signal();
            this.debugIncorrectMessageReceivedSignal = new Signal();

            this.messageFromOfscSignal = new Signal();

            this._currentCommunicationCallback = null;
            this._currentCommunicationPromise = null;
        }

        /**
         * @param {Object} data
         * @returns {Promise.<*>}
         */
        sendMessage(data) {
            if (this._currentCommunicationPromise) {
                return Promise.reject(new Error('Communication chanel is busy'));
            }

            return this._currentCommunicationPromise = new Promise((resolve, reject) => {

                let originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';

                if (originUrl) {
                    this._currentCommunicationCallback = (data) => {
                        this._currentCommunicationCallback = null;
                        this._currentCommunicationPromise = null;

                        if (data instanceof Error) {
                            return reject(data);
                        }

                        if (data.method && data.method === 'error') {
                            return reject(data);
                        }

                        return resolve(data);
                    };

                    data.apiVersion = OFSC_API_VERSION;

                    parent.postMessage(data, this.constructor._getOrigin(originUrl));
                    this.debugMessageSentSignal.dispatch(data);
                } else {
                    return reject("Unable to get referrer");
                }
            });
        }


        onPostMessage(event) {
            // Ignore internal JET messages
            if (event.source === window) {
                return;
            }

            if (typeof event.data === 'undefined') {
                this.debugIncorrectMessageReceivedSignal.dispatch("No data");
                if (this._currentCommunicationCallback) {
                    this._currentCommunicationCallback(new Error('No data'));
                    return;
                }

                return false;
            }

            const data = parser.parseJSON(event.data, null);

            if (data === null) {
                if (this._currentCommunicationCallback) {
                    this._currentCommunicationCallback(new Error('Incorrect JSON'));
                    return;
                }
                this.debugIncorrectMessageReceivedSignal.dispatch("Incorrect JSON", event.data);
                return false;
            }

            this.debugMessageReceivedSignal.dispatch(data);

            if (this._currentCommunicationCallback) {
                this._currentCommunicationCallback(data);
            } else {
                this.messageFromOfscSignal.dispatch(data);
            }
        }

        static generateCallId() {
            return btoa(String.fromCharCode.apply(null, window.crypto.getRandomValues(new Uint8Array(16))));
        }

        static _getOrigin(url) {
            if (typeof url === 'string' && url !== '') {
                if (url.indexOf("://") > -1) {
                    return 'https://' + url.split('/')[2];
                } else {
                    return 'https://' + url.split('/')[0];
                }
            }

            return '';
        }
    }

    return OfscConnector;
});