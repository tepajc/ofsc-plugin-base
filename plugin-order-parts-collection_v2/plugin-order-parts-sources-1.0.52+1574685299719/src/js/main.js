/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
'use strict';

/**
 * Example of Require.js boostrap javascript
 */

requirejs.config({
    baseUrl: 'js',

    // Path mappings for the logical module names
    // Update the main-release-paths.json for release mode when updating the mappings
    paths:
    //injector:mainReleasePaths
        {
            'ofsc-connector': 'ofsc-connector',
            'app-constants': 'app-constants',

            'knockout': 'libs/knockout/knockout-3.4.2.debug',
            'jquery': 'libs/jquery/jquery-3.3.1',
            'jqueryui-amd': 'libs/jquery/jqueryui-amd-1.12.1',
            'promise': 'libs/es6-promise/es6-promise',
            'hammerjs': 'libs/hammer/hammer-2.0.8',
            'ojdnd': 'libs/dnd-polyfill/dnd-polyfill-1.0.0',
            'ojs': 'libs/oj/v6.2.0/debug',
            'ojL10n': 'libs/oj/v6.2.0/ojL10n',
            'ojtranslations': 'libs/oj/v6.2.0/resources',
            'text': 'libs/require/text',
            'signals': 'libs/js-signals/signals',
            'customElements': 'libs/webcomponents/custom-elements.min',
            'proj4': 'libs/proj4js/dist/proj4-src',
            'css': 'libs/require-css/css',
            'touchr': 'libs/touchr/touchr'
        }
    //endinjector
});

/**
 * A top-level require call executed by the Application.
 * Although 'ojcore' and 'knockout' would be loaded in any case (they are specified as dependencies
 * by the modules themselves), we are listing them explicitly to get the references to the 'oj' and 'ko'
 * objects in the callback
 */
require([
    'ojs/ojcore',
    'knockout',
    'app',
    // non-referenced
    'ojs/ojknockout',
], (oj,
    ko,
    app
) => { // this callback gets executed when all required modules are loaded


    const init = () => {
        // Bind your ViewModel for the content of the whole page body.
        app.init(document.getElementById('pluginGlobalBody'));
    };

    // If running in a hybrid (e.g. Cordova) environment, we need to wait for the deviceready
    // event before executing any code that might interact with Cordova APIs or plugins.
    if (document.body.classList.contains('oj-hybrid')) {
        document.addEventListener("deviceready", init);
    } else {
        init();
    }

});
