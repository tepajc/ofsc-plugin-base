/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
    'knockout',
    'ojs/ojcore',
    'app-constants',
    // non-referenced:
    'ojs/ojvalidation'
], (ko, oj, AppConstants) => {

    const converterFactory = oj.Validation.converterFactory("datetime");
    const converter = converterFactory.createConverter();

    class OrderListItemViewModel {

        /**
         * @param {OrderItemModel} orderItemModel
         * @param {OrderModel} orderModel
         * @param activityExistsInQueue
         * @param orderNumberClicked
         * @param receiveClicked
         */
        constructor(orderItemModel, orderModel, activityExistsInQueue, orderNumberClicked, receiveClicked) {
            /** @type {OrderItemModel} */
            this.orderItemModel = orderItemModel;

            /** @type {OrderModel} */
            this.orderModel = orderModel;

            this.description = this.orderItemModel.fields[AppConstants.PARTS_CATALOG_FIELD_ITEM_DESCRIPTION];

            this.fields = [
                {
                    title: 'Order',
                    value: '#' + this.orderModel.orderNumber,
                    onClick: activityExistsInQueue ? () => {
                        orderNumberClicked(this.orderModel.orderNumber)
                    } : null
                },
                {
                    title: 'Quantity',
                    value: this.orderItemModel.quantity
                },
                {
                    title: 'Status',
                    value: this.orderModel.constructor.STATUSES[this.orderItemModel.orderStatus].title
                },
                {
                    title: 'Needed By',
                    value: converter.format(this.orderModel.neededByDate)
                },
                {
                    title: 'Shipment Number',
                    value: this.orderItemModel.shipmentNumber ? '#' + this.orderItemModel.shipmentNumber : '-'
                },
                {
                    title: 'Delivery To',
                    value: `${this.orderModel.destinationType} address`
                }
            ];

            this.isReceiveAvailable = this.orderItemModel.orderStatus === this.orderModel.constructor.STATUSES.partially_received.key ||
                this.orderItemModel.orderStatus === this.orderModel.constructor.STATUSES.delivered.key;

            this.receiveClicked = () => {receiveClicked(this)};
        }

    }

    return OrderListItemViewModel;
});
