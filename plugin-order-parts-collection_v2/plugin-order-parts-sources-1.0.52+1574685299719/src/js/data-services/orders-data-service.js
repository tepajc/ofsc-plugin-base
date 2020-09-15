/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
    'app-constants',
    './ofsc-rest-api-transport',
    '../storage/persistent-storage',
    '../models/order-collection',
    '../models/order-model',
    '../models/order-item-model',
    '../utils/parser'
], (
    AppConstants,
    OfscRestApiTransport,
    PersistentStorage,
    OrderCollection,
    OrderModel,
    OrderItemModel,
    parser
) => {
    'use strict';

    class OrdersDataService {

        static get NON_SCHEDULED_PATH() {
            return 'ofscCore/v1/resources/{resourceId}/routes/nonScheduled';
        }

        static get CREATE_ACTIVITY_PATH() {
            return 'ofscCore/v1/activities';
        }

        static get GET_ACTIVITY_PATH() {
            return 'ofscCore/v1/activities/{activityId}';
        }

        static get CREATE_CUSTOMER_INVENTORY_PATH() {
            return 'ofscCore/v1/activities/{activityId}/customerInventories';
        }

        static get CREATE_INVENTORY_PATH() {
            return 'ofscCore/v1/inventories';
        }

        static get UPDATE_ACTIVITY_PATH() {
            return 'ofscCore/v1/activities/{activityId}';
        }

        static get ACTIVITY_CUSTOMER_INVENTORY_PATH() {
            return 'ofscCore/v1/activities/{activityId}/customerInventories';
        }

        static get UPDATE_INVENTORY_PATH() {
            return 'ofscCore/v1/inventories/{inventoryId}';
        }

        static get REQUIRED_INVENTORY_PATH() {
            return 'ofscCore/v1/activities/{activityId}/requiredInventories';
        }

        static get RESOURCE_INVENTORIES() {
            return 'ofscCore/v1/resources/{resourceId}/inventories';
        }

        constructor(transport) {

            if (!transport || !(transport instanceof OfscRestApiTransport)) {
                throw new TypeError('transport must be an OfscRestApiTransport instance');
            }

            this._ordersNumber = this.loadOrdersNumber() || 0;

            /**
             * @type {OfscRestApiTransport}
             * @private
             */
            this._transport = transport;
        }

        getOrdersNumber() {
            return this._ordersNumber;
        }

        loadOrdersNumber() {
            let number = window.localStorage.getItem('order_orders_number');
            if (number !== undefined && number !== null && !isNaN(number)) {
                return parseInt(number, 10) || 0;
            }
            return undefined;
        }

        updateOrdersNumber(number) {
            this._ordersNumber = number;
            window.localStorage.setItem('order_orders_number', number);
        }

        /**
         * @param {String} resourceId
         * @returns {Promise.<OrderCollection>}
         */
        getOrderCollectionByResourceId(resourceId) {
            let path = this.constructor.NON_SCHEDULED_PATH.replace(/{resourceId}/g, resourceId);

            let pendingStatuses = {
                [OrderModel.STATUSES.delivered.key]: true,
                [OrderModel.STATUSES.new.key]: true
            };

            return this._transport.request(path).then((orderData) =>
                Promise.all(orderData.items && orderData.items
                    .filter(item => item.activityType === AppConstants.ACTIVITY_TYPE_ORDER)
                    .map(item => this._getOrderItems(item.activityId).then(orderItems =>
                        this._createOrderModelFromRestApi(item, orderItems)
                    )) || [])
            ).then(orderModels => {
                let pendingOrderItems = 0;
                orderModels.forEach(order => order.orderItems.forEach(orderItem =>
                    pendingOrderItems += pendingStatuses[orderItem.orderStatus] ? 1 : 0
                ));

                this.updateOrdersNumber(pendingOrderItems);

                return orderModels;
            });
        }

        getOrderById(activityId) {
            const path = this.constructor.GET_ACTIVITY_PATH.replace(/{activityId}/g, activityId);

            return this._transport.request(path).then(activityData =>
                this._getOrderItems(activityId).then(orderItems => this._createOrderModelFromRestApi(activityData, orderItems))
            );
        }

        _createOrderModelFromRestApi(activityData, orderItems) {
            const activitySlaWindowEnd = activityData.slaWindowEnd || '';

            return new OrderModel({
                id: activityData.activityId,
                status: activityData[AppConstants.ACTIVITY_PROPERTY_ORDER_STATUS],
                address: activityData.streetAddress,
                city: activityData.city,
                state: activityData.stateProvince,
                zip: activityData.postalCode,
                orderDate: activityData[AppConstants.ACTIVITY_PROPERTY_ORDER_DATE],
                orderNumber: activityData[AppConstants.ACTIVITY_PROPERTY_ORDER_NUMBER],
                neededByDate: activitySlaWindowEnd.split(' ')[0],
                arrivalDate: activityData[AppConstants.ACTIVITY_PROPERTY_ARRIVAL_DATE],
                orderItems,
                destinationType: activityData[AppConstants.ACTIVITY_PROPERTY_DESTINATION_TYPE],
                customerActivity: activityData[AppConstants.ACTIVITY_PROPERTY_INITIAL_AID],
                customerActivityApptNumber: activityData[AppConstants.ACTIVITY_PROPERTY_INITIAL_APPTNUMBER],
                customerActivityType: activityData[AppConstants.ACTIVITY_PROPERTY_INITIAL_TYPE],
                customerActivityAddress: activityData[AppConstants.ACTIVITY_PROPERTY_INITIAL_ADDRESS],
                followupAid: activityData[AppConstants.ACTIVITY_PROPERTY_FOLLOWUP_AID],
                followupApptnumber: activityData[AppConstants.ACTIVITY_PROPERTY_FOLLOWUP_APPTNUMBER]
            })
        }

        _getOrderItems(activityId) {
            return this._transport.request(
                this.constructor.ACTIVITY_CUSTOMER_INVENTORY_PATH.replace(/{activityId}/g, activityId),
                this._transport.constructor.HTTP_METHOD_GET,
                {
                    limit: 100
                }
            )
                .then((customerInventory) => {

                    const customerInventoryList = customerInventory && customerInventory.items || [];

                    const receivedQuantityByLabel = customerInventoryList.filter(inventoryData =>
                        inventoryData.inventoryType === AppConstants.INVENTORY_TYPE_RECEIVED_PART
                    ).reduce((accumulator, inventoryData) => {
                        accumulator[inventoryData[AppConstants.INVENTORY_PROPERTY_MODEL]] = (accumulator[inventoryData[AppConstants.INVENTORY_PROPERTY_MODEL]] || 0) + inventoryData.quantity;
                        return accumulator;
                    }, {});

                    return customerInventoryList
                        .filter(inventoryData => inventoryData.inventoryType === AppConstants.INVENTORY_TYPE_ORDERED_PART)
                        .map(inventoryData => {
                            const orderItemModelData = parser.parseJSON(inventoryData[AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_DETAILS], {});

                            orderItemModelData.invid = inventoryData.inventoryId;
                            orderItemModelData.quantity = inventoryData.quantity;
                            orderItemModelData.orderStatus = OrderModel.STATUS_KEYS_BY_EXTERNAL_KEY[inventoryData[AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_STATUS]];
                            orderItemModelData.receivedQuantity = receivedQuantityByLabel[inventoryData[AppConstants.INVENTORY_PROPERTY_MODEL]] || 0;
                            orderItemModelData.shipmentNumber = inventoryData[AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_SHIPMENT_NUMBER];

                            return new OrderItemModel(orderItemModelData);
                        });
                });
        }

        /**
         * @param {OrderModel} orderModel
         * @param {String} resourceId
         * @private
         */
        _orderToActivityProperties(orderModel, resourceId = null) {
            let orderProperties = orderModel.toObject();

            let slaWindowEnd = orderProperties.neededByDate;
            if (slaWindowEnd.indexOf(' ') < 0) {
                slaWindowEnd += ' 00:00:00';
            }

            let result = {
                activityType: AppConstants.ACTIVITY_TYPE_ORDER,
                date: null,
                setPositionInRoute: {position: 'notOrdered'},
                slaWindowEnd: slaWindowEnd,
                [AppConstants.ACTIVITY_PROPERTY_ADDRESS]: orderProperties.address,
                [AppConstants.ACTIVITY_PROPERTY_CITY]: orderProperties.city,
                [AppConstants.ACTIVITY_PROPERTY_STATE]: orderProperties.state,
                [AppConstants.ACTIVITY_PROPERTY_ZIP]: String(orderProperties.zip),
                [AppConstants.ACTIVITY_PROPERTY_ORDER_STATUS]: orderProperties.status,
                [AppConstants.ACTIVITY_PROPERTY_ARRIVAL_DATE]: orderProperties.arrivalDate,
                [AppConstants.ACTIVITY_PROPERTY_ORDER_DATE]: orderProperties.orderDate,
                [AppConstants.ACTIVITY_PROPERTY_ORDER_ITEMS]: JSON.stringify(orderProperties.orderItems),
                [AppConstants.ACTIVITY_PROPERTY_DESTINATION_TYPE]: orderProperties.destinationType,
                [AppConstants.ACTIVITY_PROPERTY_INITIAL_AID]: '' + orderProperties.customerActivity,
                [AppConstants.ACTIVITY_PROPERTY_INITIAL_APPTNUMBER]: orderProperties.customerActivityApptNumber,
                [AppConstants.ACTIVITY_PROPERTY_INITIAL_TYPE]: orderProperties.customerActivityType,
                [AppConstants.ACTIVITY_PROPERTY_INITIAL_ADDRESS]: orderProperties.customerActivityAddress,
                [AppConstants.ACTIVITY_PROPERTY_FOLLOWUP_AID]: '' + orderProperties.followupAid,
                [AppConstants.ACTIVITY_PROPERTY_FOLLOWUP_APPTNUMBER]: orderProperties.followupApptnumber,
                [AppConstants.ACTIVITY_PROPERTY_ORDER_NUMBER]: orderProperties.orderNumber
            };

            if (resourceId) {
                result.resourceId = resourceId;
            }

            return result;
        }

        /**
         * @param {OrderModel} orderModel
         * @param {String} resourceId
         * @param {Boolean} createFollowUpActivity
         * @returns {Promise.<OrderModel>}
         */
        createOrder(orderModel, resourceId, createFollowUpActivity = false) {
            let postData = this._orderToActivityProperties(orderModel, resourceId);

            return this._transport.request(
                this.constructor.CREATE_ACTIVITY_PATH,
                OfscRestApiTransport.HTTP_METHOD_POST,
                null,
                postData
            ).then((responseData) => {
                let activityId = responseData.activityId;

                orderModel.id = activityId;
                orderModel.orderNumber = activityId;

                return Promise.all([
                    this._createInventoryForOrder(activityId, orderModel.customerActivity, orderModel.orderItems),
                    this._transport.request(
                        this.constructor.UPDATE_ACTIVITY_PATH.replace('{activityId}', orderModel.id),
                        OfscRestApiTransport.HTTP_METHOD_PATCH,
                        null,
                        {
                            [AppConstants.ACTIVITY_PROPERTY_ORDER_NUMBER]: orderModel.orderNumber
                        }
                    )
                ]);
            }).then(() => {
                this.updateOrdersNumber(this.getOrdersNumber() + 1);

                if (createFollowUpActivity) {
                    return this._createFollowUpActivity(
                        orderModel.customerActivity,
                        orderModel.neededByDate
                    ).then(followupActivityData => {
                        orderModel.followupAid = followupActivityData.activityId;
                        orderModel.followupApptnumber = followupActivityData.apptNumber;

                        return this.updateOrder(orderModel);
                    });
                }
            }).then(() => {
                if (createFollowUpActivity) {
                    return this._updateRequiredInventory(
                        orderModel.followupAid,
                        orderModel.orderItems.map((model) => ({
                            inventoryType: model.inventoryType,
                            model: model.label,
                            quantity: parseInt(model.quantity, 10)
                        }))
                    );
                } else {
                    return Promise.resolve();
                }
            }).then(() => {
                return orderModel;
            });
        }

        /**
         * @param {Number} activityId
         * @param {Number} initialAid
         * @param {OrderItemModel[]} orderItems
         * @return {Promise}
         * @private
         */
        _createInventoryForOrder(activityId, initialAid, orderItems) {

            return Promise.all(orderItems.map((orderItemModel) => {
                let postData = {
                    inventoryType: AppConstants.INVENTORY_TYPE_ORDERED_PART,
                    quantity: parseInt(orderItemModel.quantity, 10),
                    [AppConstants.INVENTORY_PROPERTY_MODEL]: orderItemModel.label,
                    [AppConstants.INVENTORY_PROPERTY_PART_ITEM]: orderItemModel.fields[AppConstants.PARTS_CATALOG_FIELD_PART_ITEM] || '',
                    [AppConstants.INVENTORY_PROPERTY_PART_ITEM_REVISION]: '' + (orderItemModel.fields[AppConstants.PARTS_CATALOG_FIELD_PART_ITEM_REVISION] || ''),
                    [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_DESCR]: orderItemModel.fields[AppConstants.PARTS_CATALOG_FIELD_ITEM_DESCRIPTION] || '',
                    [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_DETAILS]: JSON.stringify(orderItemModel),
                    [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_INITIAL_AID]: '' + (initialAid || ''),
                    [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_STATUS]: OrderModel.STATUSES.new.externalKey,
                    [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_SHIPMENT_NUMBER]: orderItemModel.shipmentNumber
                };

                return this._transport.request(
                    this.constructor.CREATE_CUSTOMER_INVENTORY_PATH.replace(/{activityId}/g, activityId),
                    OfscRestApiTransport.HTTP_METHOD_POST,
                    null,
                    postData
                )
            }));
        }

        /**
         * @param {OrderModel} orderModel
         * @returns {Promise.<OrderModel>}
         */
        updateOrder(orderModel) {
            let postData = this._orderToActivityProperties(orderModel);

            return this._transport.request(
                this.constructor.UPDATE_ACTIVITY_PATH.replace('{activityId}', orderModel.id),
                OfscRestApiTransport.HTTP_METHOD_PATCH,
                null,
                postData
            ).then(() => {
                return orderModel;
            });
        }

        /**
         * @param {OrderItemModel} orderItemModel
         * @param {OrderModel} orderModel
         * @param {number} quantity
         * @param {string} resourceId
         */
        receiveOrderItem(orderItemModel, orderModel, quantity, resourceId) {
            quantity = Math.min(quantity, orderItemModel.quantity - orderItemModel.receivedQuantity);
            orderItemModel.orderStatus = quantity < orderItemModel.quantity - orderItemModel.receivedQuantity
                ? OrderModel.STATUSES.partially_received.key
                : OrderModel.STATUSES.received.key;

            return Promise.all([
                // update ordered part at customer pool:
                this._transport.request(
                    this.constructor.UPDATE_INVENTORY_PATH.replace('{inventoryId}', orderItemModel.invid),
                    this._transport.constructor.HTTP_METHOD_PATCH,
                    null,
                    {
                        [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_STATUS]: OrderModel.STATUSES[orderItemModel.orderStatus].externalKey
                    }
                ),
                // create received part at installed pool (or update it's quantity if it exists already):
                this._transport.request(
                    this.constructor.ACTIVITY_CUSTOMER_INVENTORY_PATH.replace('{activityId}', orderModel.id),
                    this._transport.constructor.HTTP_METHOD_GET,
                    {
                        limit: 100
                    }
                ).then(result => {
                    const customerInventoryList = result && result.items || [];

                    const existingInventory =
                        customerInventoryList.find(inventoryData =>
                            inventoryData.inventoryType === AppConstants.INVENTORY_TYPE_RECEIVED_PART
                            && inventoryData[AppConstants.INVENTORY_PROPERTY_MODEL] === orderItemModel.label
                        );

                    if (existingInventory) {
                        const resultQuantity = parseInt(quantity, 10) + parseInt(existingInventory.quantity, 10);

                        this._transport.request(
                            this.constructor.UPDATE_INVENTORY_PATH.replace('{inventoryId}', existingInventory.inventoryId),
                            this._transport.constructor.HTTP_METHOD_PATCH,
                            null,
                            {
                                quantity: resultQuantity,
                            }
                        );
                    } else {
                        return this._transport.request(
                            this.constructor.CREATE_INVENTORY_PATH,
                            this._transport.constructor.HTTP_METHOD_POST,
                            null,
                            {
                                activityId: parseInt(orderModel.id, 10),
                                status: 'customer',
                                quantity: quantity,
                                inventoryType: AppConstants.INVENTORY_TYPE_RECEIVED_PART,

                                [AppConstants.INVENTORY_PROPERTY_MODEL]: orderItemModel.label,
                                [AppConstants.INVENTORY_PROPERTY_PART_ITEM]: orderItemModel.fields[AppConstants.PARTS_CATALOG_FIELD_PART_ITEM] || '',
                                [AppConstants.INVENTORY_PROPERTY_PART_ITEM_REVISION]: '' + (orderItemModel.fields[AppConstants.PARTS_CATALOG_FIELD_PART_ITEM_REVISION] || ''),
                                [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_DESCR]: orderItemModel.fields[AppConstants.PARTS_CATALOG_FIELD_ITEM_DESCRIPTION] || '',
                                [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_SHIPMENT_NUMBER]: orderItemModel.shipmentNumber
                            }
                        );
                    }
                }),
                // create part at resource pool (or update it's quantity if it exists already):
                this._transport.request(
                    this.constructor.RESOURCE_INVENTORIES.replace('{resourceId}', resourceId),
                    this._transport.constructor.HTTP_METHOD_GET,
                    {
                        limit: 100
                    }
                ).then(result => {
                    const resourceInventoryList = result && result.items || [];

                    const existingInventory =
                        resourceInventoryList.find(inventoryData =>
                            inventoryData.inventoryType === AppConstants.INVENTORY_TYPE_PART
                            && inventoryData[AppConstants.INVENTORY_PROPERTY_MODEL] === orderItemModel.label
                        );

                    if (existingInventory) {
                        const resultQuantity = parseInt(quantity, 10) + parseInt(existingInventory.quantity, 10);

                        this._transport.request(
                            this.constructor.UPDATE_INVENTORY_PATH.replace('{inventoryId}', existingInventory.inventoryId),
                            this._transport.constructor.HTTP_METHOD_PATCH,
                            null,
                            {
                                quantity: resultQuantity,
                            }
                        );
                    } else {
                        return this._transport.request(
                            this.constructor.CREATE_INVENTORY_PATH,
                            this._transport.constructor.HTTP_METHOD_POST,
                            null,
                            {
                                resourceId: '' + resourceId,
                                status: 'resource',
                                quantity: quantity,
                                inventoryType: AppConstants.INVENTORY_TYPE_PART,

                                [AppConstants.INVENTORY_PROPERTY_MODEL]: orderItemModel.label,
                                [AppConstants.INVENTORY_PROPERTY_PART_ITEM]: orderItemModel.fields[AppConstants.PARTS_CATALOG_FIELD_PART_ITEM] || '',
                                [AppConstants.INVENTORY_PROPERTY_PART_ITEM_REVISION]: '' + (orderItemModel.fields[AppConstants.PARTS_CATALOG_FIELD_PART_ITEM_REVISION] || ''),
                                [AppConstants.INVENTORY_PROPERTY_ORDER_ITEM_DESCR]: orderItemModel.fields[AppConstants.PARTS_CATALOG_FIELD_ITEM_DESCRIPTION] || '',
                            }
                        );
                    }
                }),

            ]);
        }

        /**
         * @param {String} initialActivityId
         * @param {String} date
         *
         * @return {Promise}
         * @private
         */
        _createFollowUpActivity(initialActivityId, date) {
            let followUpActivityData = null;

            return this._transport.request(
                this.constructor.UPDATE_ACTIVITY_PATH.replace(/{activityId}/g, initialActivityId),
                OfscRestApiTransport.HTTP_METHOD_GET
            ).then((activityData) => {
                activityData.activityId = undefined;
                activityData.resourceInternalId = undefined;
                activityData.date = date;
                activityData[AppConstants.ACTIVITY_PROPERTY_INITIAL_AID] = '' + initialActivityId;
                activityData[AppConstants.ACTIVITY_PROPERTY_INITIAL_APPTNUMBER] = activityData.apptNumber;

                if (activityData.apptNumber) {
                    activityData.apptNumber = 'follow-up-' + activityData.apptNumber;
                } else {
                    activityData.apptNumber = 'follow-up';
                }

                return this._transport.request(
                    this.constructor.CREATE_ACTIVITY_PATH,
                    OfscRestApiTransport.HTTP_METHOD_POST,
                    null,
                    activityData
                );

            }).then((createdActivityData) => {

                let data = {};

                followUpActivityData = createdActivityData;

                data[AppConstants.ACTIVITY_PROPERTY_FOLLOWUP_AID] = '' + followUpActivityData.activityId;

                this._transport.request(
                    this.constructor.UPDATE_ACTIVITY_PATH.replace('{activityId}', initialActivityId),
                    OfscRestApiTransport.HTTP_METHOD_PATCH,
                    null,
                    data
                )

            }).then(() => {
                return followUpActivityData;
            });
        }

        /**
         * @param {String} activityId
         *
         * @param {Array.<{inventoryType: String, model: String, quantity: Number}>} requiredInventoryItems
         *
         * @return {Promise}
         * @private
         */
        _updateRequiredInventory(activityId, requiredInventoryItems) {
            return new Promise((resolve, reject) => {
                let path = this.constructor.REQUIRED_INVENTORY_PATH.replace(/{activityId}/g, activityId);
                this._transport.request(path, OfscRestApiTransport.HTTP_METHOD_PUT, null, {
                    items: requiredInventoryItems
                }).then(resolve).catch(reject);
            });
        }

        /**
         * @returns {OrderModel}
         */
        static createNewEmptyOrder() {
            return new OrderModel({
                status: OrderModel.STATUSES.draft.key,
                orderItems: []
            });
        }

        /**
         * @returns {OrderModel|Null}
         */
        static getOrderFromStorage() {
            let orderData = PersistentStorage.loadData('i_currentOrder') || null;
            if (orderData) {
                orderData.orderItems = orderData.orderItems.map(data => new OrderItemModel(data));
                return new OrderModel(orderData);
            }

            return null;
        }

        /**
         * @param {OrderModel} orderModel
         */
        saveOrderToStorage(orderModel) {
            PersistentStorage.saveData('i_currentOrder', orderModel.toObject());
        }

        removeOrderFromStorage() {
            PersistentStorage.removeData('i_currentOrder');
        }
    }

    return OrdersDataService;
});
