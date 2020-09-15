/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([], () => {
    const TRANSPORT_ERROR_TYPE = {
        BAD_REQUEST: 'BAD_REQUEST',
        CONFLICT: 'CONFLICT',
        UNKNOWN_ERROR : 'UNKNOWN_ERROR',
        UNAUTHORIZED : 'UNAUTHORIZED',
        NO_NETWORK : 'NO_NETWORK',
        LOW_ACCESS : 'LOW_ACCESS',
        BAD_TOKEN: 'BAD_TOKEN'
    };

    return TRANSPORT_ERROR_TYPE;
});
