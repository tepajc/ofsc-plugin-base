/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define(['knockout'], (ko) => {
    class AbstractScreenViewModel {

        init(app) {
            this.app = app;
        }

        constructor() {
            this.label = 'unnamed-screen';
        }

        handleActivated(info) {
        }

        handleAttached(info) {

        }

        handleBindingsApplied(info) {
            // Implement if needed, better - don't
        }

        handleDetached(info) {
            this.message = null;
        }

        getIconData() {
            return {};
        }

        isEntityValid() {
            return true;
        }
    }

    return AbstractScreenViewModel;
});