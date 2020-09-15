/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
    // Dependencies - modules
], (
    // Dependencies - references
) => {
    'use strict';

    class OfscRestApiAuthToken {

        static get EXPIRE_THRESHOLD () { return 10000;  }

        get tokenString () { return this._tokenString; }

        constructor(tokenString, expiresInSeconds) {

            if (!tokenString || (typeof tokenString  !== 'string')) {
                throw new TypeError('tokenString must be a non-empty string');
            }

            if (!expiresInSeconds || (typeof expiresInSeconds  !== 'number')) {
                throw new TypeError('expiresInSeconds must be a number');
            }

            this._tokenString = tokenString;
            this._expireTimestamp = this.constructor._getCurrentTimestamp() + expiresInSeconds*1000 - OfscRestApiAuthToken.EXPIRE_THRESHOLD;
        }

        isExpired() {
            return this._expireTimestamp < this.constructor._getCurrentTimestamp();
        }

        static _getCurrentTimestamp() {
            return new Date().getTime();
        }
    }

    return OfscRestApiAuthToken;
});