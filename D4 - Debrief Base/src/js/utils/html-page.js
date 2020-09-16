/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([], () => {

    class HtmlPage {

        /**
         * @param {Number} pageHeight Page height in pixels
         */
        constructor(pageHeight) {
            this.pageHeight = pageHeight;
        }

        /**
         * Remaining height left over division of height by a page height
         * @param {Number} height
         * @returns {Number} remaining height
         */
        remainingPageHeight (height) {
            return height % this.pageHeight;
        }

        /**
         * Calculate is height fit the page height
         * @param {Number} height
         * @returns {Boolean}
         */
        isExceedPageHeight (height) {
            return height > this.pageHeight;
        }

    }

    return HtmlPage;
});
