/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
    'knockout',
    './abstract-screen-view-model',
    'app-constants',
    '../models/order-model',
    './order-list-item-view-model',
    'ojs/ojarraydataprovider',
    'text!../icons/order-list-screen-icon.svg',
    '../utils/error-handler',
    // non-referenced:
    'ojs/ojlistview',
    'ojs/ojinputtext',
    'ojs/ojbutton',
    'ojs/ojdialog',
    'ojs/ojinputnumber',
    'ojs/ojcollapsible'
], (
    ko,
    AbstractScreenViewModel,
    AppConstants,
    OrderModel,
    OrderListItemViewModel,
    ArrayDataProvider,
    icon,
    ErrorHandler
) => {

    class OrderListScreen extends AbstractScreenViewModel {

        constructor() {
            super();

            this.label = 'order-list-screen';
            this.errorHandler = new ErrorHandler();
            this.primaryFields = ['Quantity', 'Status'];
        }

        handleAttached(info) {
            this.isLoaded = ko.observable(false);

            this.selectedItem = ko.observable(null);

            this.receiveQuantity = ko.observable(1);
            this.receiveMaxQuantity = ko.observable(1);
            this.receiveDisabled = ko.observable(false);
            this.selectAllDisabled = ko.pureComputed(() => this.receiveQuantity() >= this.receiveMaxQuantity());
            this.scanNextBarcodeSet = ko.observableArray([]);

            this.isBarcodeReaderAvailable = ko.observable(true);

            this.filterValue = ko.observable("");

            this.ordersList = ko.observableArray();
            this.numberOfNotReceivedParts = ko.pureComputed(() => {
                let result = 0;

                this.ordersList().forEach(itemViewModel => {
                    const orderItemModel = itemViewModel.orderItemModel;

                    if (orderItemModel.orderStatus !== OrderModel.STATUSES.delivered.key &&
                        orderItemModel.orderStatus !== OrderModel.STATUSES.partially_received.key) {
                        return;
                    }
                    result += Math.max(orderItemModel.quantity - orderItemModel.receivedQuantity, 0);
                });
                return result;
            });

            this.isScanNextBarcodeAvailable = ko.pureComputed(() =>
                this.isBarcodeReaderAvailable() &&
                this.numberOfNotReceivedParts() > 0 //1 - 1 > 0
            );

            this.scanNextBarcode = ko.pureComputed(() => this.scanNextBarcodeSet().length > 0 && this.isScanNextBarcodeAvailable());

            this.dataSource = ko.pureComputed(() => {
                const sourceItems = this.getNotReceived();
                const filterValue = this.filterValue().trim().toLowerCase();

                const filteredItems = this.filterItemsByString(sourceItems, filterValue);
                const filteredItemsWithFields = this.addFieldsByCategories(filteredItems);

                return listToDataProvider(filteredItemsWithFields);
            });

            this.historyDataSource = ko.pureComputed(() => {
                const receivedItems = this.getReceived();
                const filteredItemsWithFields = this.addFieldsByCategories(receivedItems);

                return listToDataProvider(filteredItemsWithFields);
            });

            this.loadList().then(() => {
                this.isLoaded(true);
            });
        }

        getNotReceived() {
            return this.ordersList().filter(itemViewModel => {
                return itemViewModel.orderItemModel.orderStatus !== OrderModel.STATUSES.received.key;
            });
        }

        getReceived() {
            return this.ordersList().filter(itemViewModel => {
                return itemViewModel.orderItemModel.orderStatus === OrderModel.STATUSES.received.key;
            });
        }

        addFieldsByCategories(sourceItems) {
            return sourceItems.map(item => {
                item.fieldsByCategories = this.getCategorizedFields(item.fields);
                return item;
            });
        }

        getCategorizedFields(fields) {
            return fields.reduce((res, field) => {
                if (this.primaryFields.indexOf(field.title) > -1) {
                    res.primaryFields.push(field);

                } else {
                    res.secondaryFields.push(field);
                }
                return res;
            }, {
                primaryFields: [],
                secondaryFields: []
            });
        }

        filterItemsByString(itemsList, substr) {
            if (substr.length < 3) {
                return itemsList;
            }

            return itemsList.filter(item => {
                if (hasSubstring(item.orderModel.orderNumber, substr)) {
                    return true;
                }
                if (hasSubstring(item.orderItemModel.label, substr)) {
                    return true;
                }
                if (hasSubstring(item.description, substr)) {
                    return true;
                }
                if (hasSubstring(item.orderItemModel.shipmentNumber, substr)) {
                    return true;
                }
                return false;
            });
        }

        loadList() {
            const statusPriority = {
                [OrderModel.STATUSES.delivered.key]: 1,
                [OrderModel.STATUSES.partially_received.key]: 1,
                [OrderModel.STATUSES.shipped.key]: 2,
                [OrderModel.STATUSES.new.key]: 3,
                [OrderModel.STATUSES.draft.key]: 3,
                [OrderModel.STATUSES.confirmed.key]: 3,
                [OrderModel.STATUSES.received.key]: 4,
                [OrderModel.STATUSES.rejected.key]: 4,
                [OrderModel.STATUSES.canceled.key]: 4
            };

            let promise;

            if (this.app.activityId) {
                promise = this.app.ordersDataService.getOrderById(this.app.activityId).then(orderModel => [orderModel]);
            } else {
                promise = this.app.ordersDataService.getOrderCollectionByResourceId(this.app.resourceId);
            }

            return promise.then(orders => {
                this.ordersList(orders.reduce((accumulator, orderModel) => {
                    orderModel.orderItems.forEach((orderItemModel, index) => {
                        accumulator.push(
                            new OrderListItemViewModel(
                                orderItemModel,
                                orderModel,
                                this.isActivityInRoute(orderModel.id),
                                this.goToActivity.bind(this),
                                this.receive.bind(this)
                            )
                        );
                    });
                    return accumulator;
                }, []).sort((first, second) => {
                    const firstStatusPriority = statusPriority[first.orderItemModel.orderStatus];
                    const secondStatusPriority = statusPriority[second.orderItemModel.orderStatus];

                    if (firstStatusPriority !== secondStatusPriority) {
                        return firstStatusPriority - secondStatusPriority;
                    }

                    const firstOrderId = first.orderModel.id;
                    const secondOrderId = second.orderModel.id;

                    if (firstOrderId !== secondOrderId) {
                        return firstOrderId - secondOrderId;
                    }

                    return first.orderItemModel.label.localeCompare(second.orderItemModel.label);
                }));
            }).catch(error => this.errorHandler.showError(error));
        }

        callBarcodeReader() {
            this.app.barcodeDataService && this.app.barcodeDataService.scanBarcode().then(result => {
                if (!result.cancelled) {
                    this.filterValue(result.text);
                    if (this.dataSource().data.length === 1) {
                        /** @type {OrderListItemViewModel} */
                        const foundItem = this.dataSource().data[0];
                        if (foundItem.isReceiveAvailable && foundItem.orderItemModel.label === result.text) {
                            this.receive(foundItem, true);
                        }
                    }
                }
            }).catch(e => {
                if (e && e.message === 'NOT_AVAILABLE') {
                    this.isBarcodeReaderAvailable(false);
                    this.scanNextBarcodeSet([]);
                    return Promise.resolve();
                } else {
                    console.error(e);
                }
            });
        }

        isActivityInRoute(aid) {
            return !!this.app.activityDataService.getActivityById(aid);
        }

        goToActivity(aid) {
            this.app.closeAndNavigateToActivity(aid);
        }

        /**
         * @param {OrderListItemViewModel} itemViewModel
         * @param {Boolean} [fromBarcodeScanner=false]
         */
        receive(itemViewModel, fromBarcodeScanner = false) {
            if (fromBarcodeScanner) {
                this.scanNextBarcodeSet(["scan"]);
            } else {
                this.scanNextBarcodeSet([]);
            }

            this.selectedItem(itemViewModel);
            this.receiveQuantity(1);
            this.receiveMaxQuantity(itemViewModel.orderItemModel.quantity - itemViewModel.orderItemModel.receivedQuantity);
            document.getElementById('receiveDialog').open();
        }

        receiveSubmit() {
            if (this.receiveDisabled()) {
                return;
            }

            /** @type {OrderListItemViewModel} */
            const orderListItemViewModel = this.selectedItem();

            if (!orderListItemViewModel) {
                return;
            }

            this.closeReceiveDialog();

            this.isLoaded(false);

            return this.app.ordersDataService.receiveOrderItem(
                orderListItemViewModel.orderItemModel,
                orderListItemViewModel.orderModel,
                this.receiveQuantity(),
                this.app.resourceId
            ).then(() => this.loadList()).then(() => {
                this.isLoaded(true);
                if (this.scanNextBarcode()) {
                    this.callBarcodeReader();
                }
            }).catch(error => this.errorHandler.showError(error));
        }

        receiveInputValidChanged(e) {
            this.receiveDisabled(e.detail.value === 'invalidShown');
        }

        selectAll() {
            this.receiveQuantity(this.receiveMaxQuantity());
        }

        closeReceiveDialog() {
            document.getElementById('receiveDialog').close();
        }

        getCounter() {
            return '';
        }

        getIconData() {
            return {
                image: new Blob([icon], {type: 'image/svg+xml'}),
                text: '' + this.getCounter()
            };
        }

        handleDetached(info) {
            this.message = null;
        }

        isEntityValid(entity) {
            return entity === 'activityList' || entity === 'partsCatalogItem' || entity === 'activity';
        }

    }

    function hasSubstring(value, substr) {
        if(value == undefined) {
            return false;
        }
        return value.toLowerCase().indexOf(substr) >= 0;
    }

    function listToDataProvider(list) {
        return new ArrayDataProvider(list, {keyAttributes: 'key'});
    }

    return new OrderListScreen();
});
