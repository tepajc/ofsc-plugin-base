/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
    './ofsc-rest-api-auth-token',
    '../classes/transport-error-type-constants',
    '../classes/transport-error',
    '../utils/parser'
], (
    OfscRestApiAuthToken,
    TRANSPORT_ERROR_TYPE,
    TransportError,
    parser
) => {
    'use strict';

    const TRANSPORT_ERROR_CODES_MAP = {
        400: TRANSPORT_ERROR_TYPE.BAD_REQUEST,
        401: TRANSPORT_ERROR_TYPE.UNAUTHORIZED,
        403: TRANSPORT_ERROR_TYPE.LOW_ACCESS,
        409: TRANSPORT_ERROR_TYPE.CONFLICT,
        0: TRANSPORT_ERROR_TYPE.NO_NETWORK
    };

    class OfscRestApiTransport {

        static get HTTP_METHOD_POST()   { return 'POST';  }
        static get HTTP_METHOD_PATCH()  { return 'PATCH'; }
        static get HTTP_METHOD_PUT()    { return 'PUT';   }
        static get HTTP_METHOD_GET()    { return 'GET';   }

        static get POST_DATA_TYPE_JSON ()  { return 'json'; }
        static get POST_DATA_TYPE_FORM ()  { return 'form'; }

        static get AUTH_TOKEN_SERVICE_PATH () { return 'oauthTokenService/v1/token';  }

        constructor(endpoint, instanceName, clientId, clientSecret) {

            if (!endpoint || (typeof endpoint !== 'string'))
            {
                throw new TypeError('endpoint must be a non-empty string');
            }

            if (!instanceName || (typeof instanceName !== 'string'))
            {
                throw new TypeError('instanceName must be a non-empty string');
            }

            if (!clientId || (typeof clientId !== 'string'))
            {
                throw new TypeError('clientId must be a non-empty string');
            }

            if (!clientSecret || (typeof clientSecret !== 'string'))
            {
                throw new TypeError('clientSecret must be a non-empty string');
            }

            /**
             * @type {String}
             * @private
             */
            this._endpoint = endpoint.replace(/\/+$/, '');

            /**
             * @type {String}
             * @private
             */
            this._instanceName = instanceName;

            /**
             * @type {String}
             * @private
             */
            this._clientId = clientId;

            /**
             * @type {String}
             * @private
             */
            this._clientSecret = clientSecret;

            /**
             * @type {OfscRestApiAuthToken}
             * @private
             */
            this._token = null;
        }

        /**
         * @param path
         * @param getParams
         * @param method
         * @param {Object} [postData]
         * @param {String} [postDataType]
         * @returns {Promise.<Object>}
         */
        request(path = '', method = OfscRestApiTransport.HTTP_METHOD_GET, getParams = null, postData = null, postDataType = OfscRestApiTransport.POST_DATA_TYPE_JSON) {
            return this._renewToken().then(() => {
                return this.__doRequest(path, method, getParams, postData, {
                    'Authorization': 'Bearer ' + this._token.tokenString
                }, postDataType);
            });
        }

        __doRequest(path, method, getParams, postData, headers, postDataType) {

            return new Promise((resolve, reject) => {
                let url = this._endpoint + '/' + path;
                let xhr = this._getXhr();

                if (OfscRestApiTransport.HTTP_METHOD_GET === method && getParams) {

                    let params = this.constructor.__serializeFormParams(getParams);

                    if (-1 === url.indexOf('?')) {
                        url += '?';
                    } else {
                        url += '&';
                    }

                    url += params;
                }

                xhr.open(method, url, true);

                Object.entries(headers).forEach(([headerName, headerValue]) => {
                    xhr.setRequestHeader(headerName, headerValue);
                });

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === xhr.DONE) {
                        if (200 === xhr.status || 201 === xhr.status || 204 === xhr.status) {
                            if (!xhr.responseText) {
                                return resolve('');
                            }

                            const json = parser.parseJSON(xhr.responseText, null);

                            if (json === null) {
                                return resolve('');
                            } else {
                                return resolve(json);
                            }
                        }

                        const errorInst = getTransportErrorInstance(xhr);

                        return reject(errorInst);
                    }
                };

                if (
                    OfscRestApiTransport.HTTP_METHOD_POST === method ||
                    OfscRestApiTransport.HTTP_METHOD_PATCH === method ||
                    OfscRestApiTransport.HTTP_METHOD_PUT === method
                ) {
                    if (postDataType === this.constructor.POST_DATA_TYPE_JSON) {
                        xhr.send(JSON.stringify(postData));
                    } else {
                        xhr.send(this.constructor.__serializeFormParams(postData));
                    }
                } else {
                    xhr.send();
                }
            });
        }

        _renewToken() {
            return new Promise((resolve, reject) => {
                if (this._token && !this._token.isExpired()) {
                    return resolve();
                }

                this._obtainToken().then(resolve).catch(() => {
                    return reject(new TransportError(TRANSPORT_ERROR_TYPE.UNAUTHORIZED, 401));
                });
            });
        }

        _obtainToken() {
            if (this._currentRequestForToken) {
                return this._currentRequestForToken;
            }

            let headers = {
                'Authorization': 'Basic ' + btoa(`${this._clientId}@${this._instanceName}:${this._clientSecret}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            this._currentRequestForToken = this.__doRequest(
                OfscRestApiTransport.AUTH_TOKEN_SERVICE_PATH,
                OfscRestApiTransport.HTTP_METHOD_POST,
                null,
                { grant_type: 'client_credentials' },
                headers,
                this.constructor.POST_DATA_TYPE_FORM
            );

            this._currentRequestForToken.then((responseData) => {
                this._currentRequestForToken = null;
                this._token = new OfscRestApiAuthToken(responseData.token, responseData.expires_in);
            }).catch(e => {
                this._currentRequestForToken = null;
            });

            return this._currentRequestForToken;
        }

        _getXhr() {
            return new XMLHttpRequest();
        }

        static __serializeFormParams(params) {
            let paramsArray = [];

            Object.entries(params).forEach(([paramName, paramValue]) => {
                paramsArray.push(encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue));
            });

            return paramsArray.join('&');
        }
    }

    /**
     * @param {XMLHttpRequest} xhr
     * @returns {TransportError}
     */
    function getTransportErrorInstance(xhr) {
        const errorCode = Number(xhr.status);
        const errorType = TRANSPORT_ERROR_CODES_MAP[errorCode] || TRANSPORT_ERROR_TYPE.UNKNOWN_ERROR;

        const errorJson = parser.parseJSON(xhr.responseText, null);

        if (errorJson) {
            return new TransportError(errorType, errorCode, errorJson.detail);
        } else {
            return new TransportError(errorType, errorCode);
        }
    }

    return OfscRestApiTransport;
});
