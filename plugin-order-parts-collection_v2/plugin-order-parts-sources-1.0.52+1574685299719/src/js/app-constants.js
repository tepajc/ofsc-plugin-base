/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
(function() {
    class AppConstants {

        static get PLUGIN_LABEL_NEW_ORDER() {
            return 'part-cart';
        };

        static get PLUGIN_LABEL_RESERVED_PARTS() {
            return 'parts-reserved';
        };

        static get PLUGIN_LABEL_ORDER_LIST() {
            return 'parts-ordered';
        };

        static get PLUGIN_LABEL_FIND_NEARBY() {
            return 'find-nearby-warehouse';
        };

        static get PLUGIN_LABEL_RECEIVE() {
            return 'parts-receive';
        };

        static get PARTS_CATALOG_FIELD_ITEM_DESCRIPTION() {
            return 'part_item_desc';
        };

        static get PARTS_CATALOG_FIELD_PART_ITEM() {
            return 'number';
        };

        static get PARTS_CATALOG_FIELD_PART_ITEM_REVISION() {
            return 'revision';
        };

        static get RESOURCE_PROPERTY_ID() {
            return 'pid';
        };

        static get INVENTORY_TYPE_PART() {
            return 'part';
        };

        static get INVENTORY_TYPE_ORDERED_PART() {
            return 'ordered_part';
        };

        static get INVENTORY_TYPE_RECEIVED_PART() {
            return 'received_part';
        };

        static get RESOURCE_PROPERTY_EXTERNAL_ID() {
            return 'external_id';
        };

        static get RESOURCE_PROPERTY_WAREHOUSE_LIST() {
            return 'order_warehouse_list';
        };

        static get INVENTORY_PROPERTY_SN() {
            return 'invsn';
        };

        static get INVENTORY_PROPERTY_POOL() {
            return 'invpool';
        };

        static get INVENTORY_PROPERTY_TYPE() {
            return 'invtype';
        };

        static get INVENTORY_PROPERTY_ID() {
            return 'invid';
        };

        static get INVENTORY_PROPERTY_AID() {
            return 'inv_aid';
        };

        static get INVENTORY_PROPERTY_PID() {
            return 'inv_pid';
        };

        static get INVENTORY_PROPERTY_ORDER_ITEM_INITIAL_AID() {
            return 'order_item_initial_aid';
        };

        static get INVENTORY_PROPERTY_ORDER_ITEM_STATUS() {
            return 'order_item_status';
        };

        static get INVENTORY_PROPERTY_ORDER_ITEM_SHIPMENT_NUMBER() {
            return 'order_item_shipment_number';
        };

        static get INVENTORY_PROPERTY_ORDER_ITEM_RECEIVED_QUANTITY() {
            return 'order_item_received_quantity';
        };

        static get INVENTORY_PROPERTY_MODEL() {
            return 'part_item_number_rev';
        };

        static get INVENTORY_PROPERTY_PART_ITEM() {
            return 'part_item_number';
        };

        static get INVENTORY_PROPERTY_PART_ITEM_REVISION() {
            return 'part_item_revision';
        };

        static get INVENTORY_PROPERTY_ORDER_ITEM_DETAILS() {
            return 'order_item_details';
        };

        static get INVENTORY_PROPERTY_ORDER_ITEM_DESCR() {
            return 'order_item_description';
        };

        static get INVENTORY_PROPERTY_QTY() {
            return 'quantity';
        };

        static get ACTIVITY_PROPERTY_ADDRESS() {
            return 'caddress';
        };

        static get ACTIVITY_PROPERTY_CITY() {
            return 'ccity';
        };

        static get ACTIVITY_PROPERTY_ZIP() {
            return 'czip';
        };

        static get ACTIVITY_PROPERTY_STATE() {
            return 'cstate';
        };

        static get ACTIVITY_PROPERTY_STATUS() {
            return 'astatus';
        };

        static get ACTIVITY_PROPERTY_WORKTYPE() {
            return 'aworktype';
        };

        static get ACTIVITY_PROPERTY_APPT_NUMBER() {
            return 'appt_number';
        };

        static get ACTIVITY_PROPERTY_NEEDED_BY_DATE() {
            return 'sla_window_end';
        };

        static get ACTIVITY_PROPERTY_ORDER_DATE() {
            return 'order_date';
        };

        static get ACTIVITY_PROPERTY_ORDER_NUMBER() {
            return 'order_number';
        };

        static get ACTIVITY_PROPERTY_ORDER_ITEMS() {
            return 'order_items';
        };

        static get ACTIVITY_PROPERTY_DESTINATION_TYPE() {
            return 'order_destination_type';
        };

        static get ACTIVITY_PROPERTY_RECEIVED_ITEMS() {
            return 'order_received_items';
        };

        static get ACTIVITY_PROPERTY_ORDER_STATUS() {
            return 'order_status';
        };

        static get ACTIVITY_PROPERTY_ARRIVAL_DATE() {
            return 'order_arrival_date';
        };

        static get ACTIVITY_PROPERTY_FOLLOWUP_AID() {
            return 'order_followup_aid';
        };

        static get ACTIVITY_PROPERTY_FOLLOWUP_APPTNUMBER() {
            return 'order_followup_apptnumber';
        };

        static get ACTIVITY_PROPERTY_INITIAL_AID() {
            return 'order_initial_aid';
        };

        static get ACTIVITY_PROPERTY_INITIAL_APPTNUMBER() {
            return 'order_initial_apptnumber';
        };

        static get ACTIVITY_PROPERTY_INITIAL_TYPE() {
            return 'order_initial_type';
        };

        static get ACTIVITY_PROPERTY_INITIAL_ADDRESS() {
            return 'order_initial_address';
        };

        static get ACTIVITY_TYPE_ORDER() {
            return 'ORD';
        };

        static get ACTIVITY_TYPE_RETURN() {
            return 'RTN';
        };

        static get ACTIVITY_TYPE_RESERVE() {
            return 'RSV';
        };

        static get ACTIVITY_NON_CUSTOMER_TYPE_GROUPS() {
            return [
                'internal',
                'teamwork'
            ];
        }

        /**
         * @returns {string[]}
         */
        static get ACTIVITY_NON_CUSTOMER_TYPES() {
            return [
                this.ACTIVITY_TYPE_ORDER,
                this.ACTIVITY_TYPE_RESERVE,
                this.ACTIVITY_TYPE_RETURN
            ];
        }

        static get RESERVATION_DAYS() {
            return 10;
        }

        /**
         * @return {string} - 2017-11-03
         */
        static get DATE_FORMAT_ISO() {
            return 'YYYY-MM-DD';
        };

        /**
         * @return {string} - Nov 3, Fri
         */
        static get DATE_FORMAT_SHORT() {
            return 'MMM D, ddd';
        };

        /**
         * @return {string} - Friday, November 3
         */
        static get DATE_FORMAT_FULL() {
            return 'dddd, MMMM D';
        };

        /**
         * @return {string} - Nov 3
         */
        static get DATE_FORMAT_DAY_MONTH() {
            return 'MMM D';
        }

        /**
         * @return {string} - Fri
         */
        static get DATE_FORMAT_DAY_OF_WEEK() {
            return 'ddd';
        };

        /**
         * @return {string} - 3
         */
        static get DATE_FORMAT_SHORT_DAY_NUMBER() {
            return 'D';
        };

        /**
         * @return {string} - 8:40 pm
         */
        static get TIME_FORMAT() {
            return 'hh:mma';
        }

        /**
         * @return {string} - 20:40
         */
        static get TIME_FORMAT_INTERNAL() {
            return 'HH:mm';
        }
    }

    if ('undefined' !== typeof module) {
        module.exports = AppConstants;
    }

    if ('undefined' !== typeof define) {
        define([
            // Dependencies - modules
        ], (
            // Dependencies - references
        ) => {
            return AppConstants;
        });
    }
})();
