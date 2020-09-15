/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
    '../ofsc-connector',
    './transport-error-type-constants'
], (
    OfscConnector,
    TRANSPORT_ERROR_TYPE
) => {
    const ERROR_MESSAGES = {
        BAD_REQUEST: 'Bad request',
        CONFLICT: 'Conflict',
        UNKNOWN_ERROR : 'Unknown error',
        UNAUTHORIZED : 'Wrong credentials',
        NO_NETWORK : 'No network',
        LOW_ACCESS : 'Low access level to entity'
    };

    class TransportError extends Error {

        /**
         * @param {String} type
         * @param {String} code
         * @param {String} message
         */
        constructor(type = TRANSPORT_ERROR_TYPE.UNKNOWN_ERROR, code = '', message = '') {
            super();

            this.name = "TransportError";
            this.message = message || ERROR_MESSAGES[type];

            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, TransportError);
            } else {
                this.stack = (new Error()).stack;
            }
            this._type = type;
            this._code = code;
        }


        /**
         * Return type and code of the error
         *
         * @return {Object} - type and code of the error
         */

        toJson() {
            return {
                type: TRANSPORT_ERROR_TYPE[this._type],
                code: this._code
            };
        }

        /**
         * Return type of the error
         *
         * @return {String} - One of TYPE_* constants
         */
        getType()
        {
            return TRANSPORT_ERROR_TYPE[this._type];
        }

        /**
         * Return code of the error
         *
         * @return {String} - One of code
         */
        getCode()
        {
            return this._code;
        }

    }

    return TransportError;
});
