/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
'use strict';

if ('undefined' !== typeof module) {
    let appConstants = require('./app-constants');
    module.exports = getProperties(appConstants);
}

if ('undefined' !== typeof define) {
    define([
        './app-constants'
        // Dependencies - modules
    ], (
        appConstants
        // Dependencies - references
    ) => {
        return getProperties(appConstants);
    });
}

function getProperties(AppConstants) {
    let propertyList = {
        // propertyLabel: [ entity, configureForPlugin, createProperty, name ]

        [AppConstants.ACTIVITY_PROPERTY_STATUS]                        : [ 1, true,  false ],
        [AppConstants.ACTIVITY_PROPERTY_ADDRESS]                       : [ 1, true,  false ],
        [AppConstants.ACTIVITY_PROPERTY_CITY]                          : [ 1, true,  false ],
        [AppConstants.ACTIVITY_PROPERTY_ZIP]                           : [ 1, true,  false ],
        [AppConstants.ACTIVITY_PROPERTY_STATE]                         : [ 1, true,  false ],
        [AppConstants.ACTIVITY_PROPERTY_WORKTYPE]                      : [ 1, true,  false ],
        [AppConstants.ACTIVITY_PROPERTY_APPT_NUMBER]                   : [ 1, true,  false ],
        [AppConstants.ACTIVITY_PROPERTY_NEEDED_BY_DATE]                : [ 1, true,  false ],
        [AppConstants.INVENTORY_PROPERTY_SN]                           : [ 2, true,  false ],
        [AppConstants.INVENTORY_PROPERTY_AID]                          : [ 2, true,  false ],
        [AppConstants.INVENTORY_PROPERTY_PID]                          : [ 2, true,  false ],
        [AppConstants.INVENTORY_PROPERTY_POOL]                         : [ 2, true,  false ],
        [AppConstants.INVENTORY_PROPERTY_TYPE]                         : [ 2, true,  false ],
        [AppConstants.INVENTORY_PROPERTY_ID]                           : [ 2, true,  false ],
        [AppConstants.INVENTORY_PROPERTY_QTY]                          : [ 2, true,  false ],
        [AppConstants.RESOURCE_PROPERTY_ID]                            : [ 3, true,  false ],
        [AppConstants.RESOURCE_PROPERTY_EXTERNAL_ID]                   : [ 3, true,  false ],

        [AppConstants.ACTIVITY_PROPERTY_ARRIVAL_DATE]                  : [ 1, true,  true, 'Order Arrival Date' ],
        [AppConstants.ACTIVITY_PROPERTY_ORDER_DATE]                    : [ 1, true,  true, 'Order Date' ],
        [AppConstants.ACTIVITY_PROPERTY_ORDER_NUMBER]                  : [ 1, true,  true, 'Order Number' ],
        [AppConstants.ACTIVITY_PROPERTY_ORDER_STATUS]                  : [ 1, true,  true, 'Order Status' ],
        [AppConstants.ACTIVITY_PROPERTY_ORDER_ITEMS]                   : [ 1, true,  true, 'Order Items' ],
        [AppConstants.ACTIVITY_PROPERTY_DESTINATION_TYPE]              : [ 1, true,  true, 'Order Destination Type' ],
        [AppConstants.ACTIVITY_PROPERTY_FOLLOWUP_AID]                  : [ 1, true,  true, 'Order Follow-up Activity ID' ],
        [AppConstants.ACTIVITY_PROPERTY_FOLLOWUP_APPTNUMBER]           : [ 1, true,  true, 'Order Follow-up Activity Number' ],
        [AppConstants.ACTIVITY_PROPERTY_INITIAL_AID]                   : [ 1, true,  true, 'Order Initial Activity ID' ],
        [AppConstants.ACTIVITY_PROPERTY_INITIAL_APPTNUMBER]            : [ 1, true,  true, 'Order Initial Activity Number' ],
        [AppConstants.ACTIVITY_PROPERTY_RECEIVED_ITEMS]                : [ 1, false, true, 'Order Received Items' ],
        [AppConstants.ACTIVITY_PROPERTY_INITIAL_TYPE]                  : [ 1, false, true, 'Order Initial Activity Type' ],
        [AppConstants.ACTIVITY_PROPERTY_INITIAL_ADDRESS]               : [ 1, false, true, 'Order Initial Activity Address' ],
        [AppConstants.INVENTORY_PROPERTY_MODEL]                        : [ 2, true,  true, 'Part Item + Revision' ],
        [AppConstants.INVENTORY_PROPERTY_PART_ITEM]                    : [ 2, true,  true, 'Part Item' ],
        [AppConstants.INVENTORY_PROPERTY_PART_ITEM_REVISION]           : [ 2, true,  true, 'Part Revision' ],
        [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_DETAILS]           : [ 2, true,  true, 'Order Item Details' ],
        [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_DESCR]             : [ 2, true,  true, 'Order Item Description' ],
        [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_INITIAL_AID]       : [ 2, true,  true, 'Order Item Initial Activity ID' ],
        [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_STATUS]            : [ 2, true,  true, 'Order Item Status' ],
        [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_SHIPMENT_NUMBER]   : [ 2, false, true, 'Order Item Shipment Number' ],
        [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_RECEIVED_QUANTITY] : [ 2, false, true, 'Order Item Received Quantity' ],
        [AppConstants.RESOURCE_PROPERTY_WAREHOUSE_LIST]                : [ 3, true,  true, 'Order Warehouse List' ],


        // not used by the plugin, only by integration:
        transfer_order_header_id                                       : [ 1, true,  true, 'Transfer Order Header' ]
    };

    return propertyList;
}