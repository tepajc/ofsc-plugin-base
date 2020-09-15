/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
    '../ofsc-connector',
    '../classes/transport-error'
], (
    OfscConnector,
    TransportError
) => {

    class ErrorHandler {

        constructor() {
            this.ofscConnector = new OfscConnector();
        }

        showError(error) {
            if (error instanceof TransportError) {
                alert(error.message);
                console.log(error.getType() + '. HTTP Status:' + error.getCode());
                this._closePlugin();
            } else {
                alert(error.message);
                this._closePlugin();
            }
        }

        _closePlugin() {
            let data = {
                method: 'close'
            };

            this.ofscConnector.sendMessage(data);
        }
    }

    return ErrorHandler;
});
