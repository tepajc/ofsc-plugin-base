/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define(['knockout', './abstract-collection', './order-model'], (ko, AbstractCollection, OrderModel) => {
    class OrderCollection extends AbstractCollection {
        constructor() {
            super();
        }

        /**
         * @param id
         * @returns {OrderModel}
         */
        static createEmptyModel(id) {
            return new OrderModel({id: id, orderItems: []});
        }
    }

    return OrderCollection;
});