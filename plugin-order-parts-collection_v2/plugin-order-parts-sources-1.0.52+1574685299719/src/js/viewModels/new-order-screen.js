/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
    'jquery',
    'ojs/ojcore',
    'knockout',
    './abstract-screen-view-model',
    'app-constants',
    'models/order-collection',
    'models/order-model',
    'models/order-item-model',
    'storage/persistent-storage',
    'text!icons/new-order-screen-icon.svg',
    'ojs/ojarraydataprovider',
    '../utils/error-handler',
    //--
    'ojs/ojformlayout',
    'ojs/ojlabel',
    'ojs/ojdatetimepicker',
    'ojs/ojinputtext',
    'ojs/ojinputnumber',
    'ojs/ojradioset',
    'ojs/ojselectcombobox',
    'ojs/ojcheckboxset',
    'ojs/ojdatetimepicker',
    'ojs/ojtimezonedata',
    'ojs/ojbutton',
    'ojs/ojdialog',
    'ojs/ojlistview',
    'ojs/ojvalidationgroup'
], (
    $,
    oj,
    ko,
    AbstractScreenViewModel,
    AppConstants,
    OrderCollection,
    OrderModel,
    OrderItemModel,
    PersistentStorage,
    icon,
    ArrayDataProvider,
    ErrorHandler
) => {

    const MIN_QUANTITY = 1;

    const TECHNICIAN_DESTINATION_TYPE = {
        value: OrderModel.DESTINATION_TYPES.technician.key,
        label: OrderModel.DESTINATION_TYPES.technician.title
    };

    const ACTIVITY_DESTINATION_TYPE = {
        value: OrderModel.DESTINATION_TYPES.activity.key,
        label: OrderModel.DESTINATION_TYPES.activity.title
    };

    const ACTIVITY_ADDRESS_CODE = -1;
    const TECHNICIAN_ADDRESS_CODE = -2;

    const ACTIVITY_LOCATION = {
        key: ACTIVITY_ADDRESS_CODE,
        title: 'Activity address',
        pickUpLocation: 'Activity address'
    };

    const TECHNICIAN_LOCATION = {
        key: TECHNICIAN_ADDRESS_CODE,
        title: 'Technician address',
        pickUpLocation: 'Technician address'
    };

    class NewOrderScreen extends AbstractScreenViewModel {

        constructor() {
            super();

            this.label = 'new-order-screen';

            this.errorHandler = new ErrorHandler();

            this._popupText = ko.observable('');
            this._popupCloseHandler = null;

            this.OrderModel = OrderModel;

            this.groupValid = ko.observable();
        }

        handleAttached(info) {
            this.checkForCartIncreasing();

            this.loaded = ko.observable(false);

            this.isSmall = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(
                oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY)
            );

            this.labelEdge = ko.computed(() => {
                return this.isSmall() ? "top" : "start";
            }, this);

            const orderItemModels = this.app.currentOrder().orderItems;

            this.orderItemsDataProvider = new ArrayDataProvider(orderItemModels, { keyAttributes: 'itemId' });

            this.initFormValues();

            this.createFollowUpOptions = ko.observableArray([]);

            this.initActivities();

            this.initDestinationTypes();

            this.initPickUpLocations();

            this.readOnlyAddress = ko.pureComputed(() => {
                /** @type OrderModel */
                const order = this.app.currentOrder();

                return order.getAddressText();
            });

            this.load();
        }

        initFormValues() {
            this.formValues = {
                createFollowUp: ko.pureComputed({
                    read: () => this.createFollowUpOptions.indexOf('createFollowUp') !== -1,

                    write: (value) => {
                        if (value) {
                            this.createFollowUpOptions().push('createFollowUp')
                        } else {
                            let pos = this.createFollowUpOptions.indexOf('createFollowUp');

                            if (pos !== -1) {
                                this.createFollowUpOptions().splice(pos, 1);
                            }
                        }
                    }
                }),
                selectedPickUpLocationId: ko.observable(null)
            };
        }

        initPickUpLocations() {
            this.initialPickUpLocationList = [];

            this.visiblePickUpLocationsList = ko.observableArray();

            this.pickUpLocationsListDataProvider = ko.pureComputed(() => {
                const list =  this.visiblePickUpLocationsList().map(pickUpLocation => ({
                        value: pickUpLocation.key,
                        label: pickUpLocation.title
                    }));

                return new ArrayDataProvider(list, { keyAttributes: 'value' });
            });
        }

        initActivities() {
            this.activityList = this.app.activityDataService.getCustomerActivityList()
                .map(activityModel => this.getActivityViewModel(activityModel));

            this.activityListDataProvider = ko.pureComputed(() =>
                new ArrayDataProvider(this.activityList.map((activity) => {
                    return {
                        value: activity.key,
                        label: activity.identifier
                    }
                }), { keyAttributes: 'value' })
            );
        }

        initDestinationTypes() {
            this.destinationTypes = [TECHNICIAN_DESTINATION_TYPE];

            if (this.hasActivities()) {
                this.destinationTypes.push(ACTIVITY_DESTINATION_TYPE);
            }

            this.destinationTypesDataProvider = new ArrayDataProvider(this.destinationTypes);
        }

        load() {
            const resourceId = this.app.resourceId;

            const pickUpLocationPromise = this.app.locationsDataService.getPickUpLocationsList(resourceId)
                .then(pickUpLocationsList => {
                    this.initialPickUpLocationsList = pickUpLocationsList;
                });

            const resourceLocationsPromise = this.app.locationsDataService.getResourceDefaultLocation(resourceId)
                .then(location => {
                    if (location) {
                        this.defaultCity = location.city;
                        this.defaultState = location.state;
                        this.defaultZip = location.zip;
                    }
                })
                .catch(error => this.errorHandler.showError(error));

            Promise.all([
                pickUpLocationPromise,
                resourceLocationsPromise
            ]).then(this.onLoad.bind(this));
        }

        onLoad() {
            this.loadFormDataFromStorage();

            this.setDestination();

            /** @type OrderModel */
            const currentOrder = this.app.currentOrder();

            if (!currentOrder) {
                return;
            }

            const activity = this.getOrderActivity();

            if (activity) {
                this.setCustomerActivity(activity);
            } else {
                this.unsetCustomerActivity();
                this.createFollowUpOptions([]);
            }

            if (currentOrder.customerActivity) {
                const currentOrder = this.app.currentOrder();

                const activityViewModel = this.getOrderActivityViewModel();

                if (activityViewModel) {
                    currentOrder.customerActivity = activityViewModel.activity.id;

                } else if (this.hasActivities()) {
                    currentOrder.customerActivity = this.getFirstActivityId();

                } else {
                    this.unsetCustomerActivity();

                    currentOrder.followupAid = '';
                    currentOrder.followupApptnumber = '';

                    this.formValues.createFollowUp(false);
                }
            }

            const foundDestination = this.destinationTypes.find(type => type.value === currentOrder.destinationType);

            if (!foundDestination) {
                currentOrder.destinationType = this.destinationTypes[0].value;
            }

            if (this.isOrderDestinatedToActivity() && !this.isCustomerActivitySet() && this.hasActivities()) {
                currentOrder.customerActivity = this.getFirstActivityId();
            }

            if (this.app.isOpenedFromActivityDetails()) {
                currentOrder.destinationType = OrderModel.DESTINATION_TYPES.activity.key;
                currentOrder.customerActivity = this.getFirstActivityId();
            }

            this.updatePickUpLocationsList();

            this.setFirstLocationIfSelectedNotFound();

            const selectedLocation = this.formValues.selectedPickUpLocationId();

            this.setOrderAddressByLocationId(selectedLocation);

            this.assignSubscriptions();

            this.loaded(true);
        }

        /**
         * @param {Number} locationId
         */
        setOrderAddressByLocationId(locationId) {
            /** @type OrderModel */
            const activity = this.getOrderActivity();

            if (locationId === ACTIVITY_ADDRESS_CODE && this.isActivityAdressValid(activity)) {
                this.setActivityAddress();
            } else {
                this.setTechnicianAddress(locationId);
            }
        }

        setActivityAddress() {
            const activity = this.getOrderActivity();
            const order = this.app.getCurrentOrder();

            order.populateAddressFromObject(activity);
        }

        /**
         * @param {Number} locationId
         */
        setTechnicianAddress(locationId) {
            const locationItem = this.visiblePickUpLocationsList().find(location => location.key === locationId);

            const pickUpLocation = locationItem && locationItem.pickUpLocation;

            const order = this.app.getCurrentOrder();

            order.populateAddressFromObject({});
        }

        assignSubscriptions() {
            const selectedPickUpLocationId = this.formValues.selectedPickUpLocationId;

            this.selectedPickUpLocationIdSubscription = selectedPickUpLocationId.subscribe((newValue) => {
                this.setOrderAddressByLocationId(newValue);
                this.saveFormState();
            });

            this.selectedActivityIdSubscription = this.app.currentOrder().$customerActivity.subscribe(aid => {
                if (aid) {
                    const activityViewModel = this.activityList.find(viewModel => viewModel.activity.id === aid);
                    const activity = activityViewModel && activityViewModel.activity;

                    this.setCustomerActivity(activity);
                } else {
                    this.unsetCustomerActivity();
                    this.createFollowUpOptions([]);
                }

                this.updatePickUpLocationsList();

                this.saveFormState();
            });

            this.createFollowUpSubscription = this.formValues.createFollowUp.subscribe(() => this.saveFormState());

            this.addressSubscription = this.app.currentOrder().$address.subscribe(() => this.saveFormState());

            this.destinationTypeSubscription = this.app.currentOrder().$destinationType.subscribe(this.onChangeDestinationType.bind(this));

            this.neededBySubscription = this.app.currentOrder().$neededByDate.subscribe(() => this.saveFormState());
        }

        onChangeDestinationType(newValue) {
            this.setDestination(newValue);
            this.updatePickUpLocationsList();
            this.setFirstLocationIfSelectedNotFound();
            this.saveFormState();
        }

        setFirstLocationIfSelectedNotFound() {
            const foundSelectedLocation = this.visiblePickUpLocationsList().find(item =>
                item.key === this.formValues.selectedPickUpLocationId()
            );

            if (!foundSelectedLocation) {
                this.formValues.selectedPickUpLocationId(this.getFirstPickUpLocation());
            }
        }

        getFirstPickUpLocation() {
            const pickUpLocationsList = this.visiblePickUpLocationsList();

            if (pickUpLocationsList.length) {
                return pickUpLocationsList[0].key;
            } else {
                return null;
            }
        }

        getFirstActivityId() {
            return this.activityList[0].activity.id;
        }

        getPreviewFields(model) {
            if (!this.app.catalogCollection.has(model.catalogId)) {
                return [];
            }

            let catalogModel = this.app.catalogCollection.getByIdOrCreate(model.catalogId);

            return catalogModel.previewFieldSchemas.map(fieldSchema => ({
                title: fieldSchema.name,
                label: fieldSchema.label,
                value: model.fields[fieldSchema.label]
            })).filter(resultFieldObject => resultFieldObject.value !== undefined && resultFieldObject.value !== null);
        };

        updatePickUpLocationsList() {
            const visibleLocations = [];

            if (this.isOrderDestinatedToTechnician()) {
                visibleLocations.push(TECHNICIAN_LOCATION);
            }

            if (this.isOrderDestinatedToActivity()) {
                const activity = this.getOrderActivity();

                if (this.isActivityAdressValid(activity)) {
                    visibleLocations.push(ACTIVITY_LOCATION);
                }
            }
            this.visiblePickUpLocationsList(visibleLocations);
        }

        getOrderActivity() {
            const activityViewModel = this.getOrderActivityViewModel();

            return activityViewModel && activityViewModel.activity;
        }

        getOrderActivityViewModel() {
            const aid = this.app.currentOrder().customerActivity;

            if (aid) {
                return this.getActivityById(aid);
            } else {
                return null;
            }
        }

        getActivityById(aid) {
            return this.activityList.find(viewModel => viewModel.activity.id === aid);
        }

        isActivityAdressValid(activity) {
            return activity && activity.address && activity.city && activity.state && activity.zip
        }

        /**
         * @param {PartModel} partModel
         * @param {Number} [quantity=MIN_QUANTITY]
         * @param {Boolean} [redirectToCurrentOrder=true]
         */
        addPartToNewOrder(partModel, quantity = MIN_QUANTITY, redirectToCurrentOrder = true) {
            const order = this.app.getCurrentOrder();

            const existingItemModel = order.orderItems.find(item =>
                item.catalogId === partModel.catalogId && item.itemId === partModel.itemId
            );

            if (!existingItemModel) {
                order.addItem(new OrderItemModel({
                    label: partModel.label,
                    quantity: quantity,
                    imgUrl: partModel.images[0] || null,
                    catalogId: partModel.catalogId,
                    itemId: partModel.itemId,
                    inventoryType: partModel.inventoryType,
                    itemType: partModel.itemType,
                    fields: partModel.fields
                }));
            }

            this.app.ordersDataService.saveOrderToStorage(order);

            if (redirectToCurrentOrder) {
                this.navigateScreen(NewOrderScrQuantityeen.label);
            }
        }

        orderPartsCatalogItemAndNavigate(catalogId, label) {
            this.app.partsCatalogDataService.getParts([{ catalogId, label }]).then(([partModel]) => {
                this.addPartToNewOrder(partModel, 1, false);
                this.app.closeAndNavigateToPlugin(AppConstants.PLUGIN_LABEL_NEW_ORDER, {
                    skipAddItem: 'true',
                    defaultScreen: this.label
                });
            });
        }

        navigateScreen(label, params = null) {
            if (params) {
                this.app.setOpenParams(params);
            }

            this.app.navigate(label);
        }

        checkForCartIncreasing() {
            if (
                this.app.openData.entity === 'partsCatalogItem' &&
                this.app.openData.partsCatalogItem &&
                'true' !== this.app.openParams.skipAddItem
            ) {
                const partsCatalogItem = this.app.openData.partsCatalogItem;
                return this.orderPartsCatalogItemAndNavigate(partsCatalogItem.catalogId, partsCatalogItem.label, NewOrderScreen.label);
            }
        }

        /**
          * @param {ActivityModel} activityModel
          * @returns {{activity: ActivityModel, identifier: String}}
          */
        getActivityViewModel(activityModel) {
            return {
                activity: activityModel,
                identifier: this.app.activityDataService.getActivityIdentifier(activityModel),
                key: activityModel.id
            };
        }

        /**
         * @return {number}
         */
        getCounter() {
            return ko.pureComputed(() => {
                return this.app.currentOrder()
                    ? this.app.currentOrder().orderItems.length || ''
                    : '';
            });
        }

        getIconData() {
            const counter = this.getCounter();

            return {
                image: new Blob([icon], {type: 'image/svg+xml'}),
                text: '' + counter()
            };
        }

        /**
         * @param {ActivityModel} activity
         */
        setCustomerActivity(activity) {
            if (!activity) {
                this.unsetCustomerActivity();
                this.createFollowUpOptions([]);

                return;
            }

            /** @type OrderModel */
            const order = this.app.currentOrder();

            order.customerActivity = activity.id;
            order.customerActivityApptNumber = activity.apptNumber;
            order.customerActivityType = this.app.activityDataService.getActivityWorktypeTitle(activity);
            order.customerActivityAddress = this.getActivityAddress(activity);

            if (this.formValues.selectedPickUpLocationId() === ACTIVITY_ADDRESS_CODE) {
                order.populateAddressFromObject(activity);
            }
        }

        unsetCustomerActivity() {
            /** @type OrderModel */
            const currentOrder = this.app.currentOrder();

            currentOrder.customerActivity = '';
            currentOrder.customerActivityApptNumber = '';
            currentOrder.customerActivityType = '';
            currentOrder.customerActivityAddress = '';
        }

        /**
         *
         * @param {ActivityModel} activityModel
         * @returns {string}
         */
        getActivityAddress(activityModel) {
            const addressList = [];

            if (activityModel.address) {
                addressList.push(activityModel.address);
            }

            if (activityModel.city) {
                addressList.push(activityModel.city);
            }

            if (activityModel.state) {
                addressList.push(activityModel.state);
            }

            if (activityModel.zip) {
                addressList.push(activityModel.zip);
            }

            return addressList.join(', ');
        }

        setDestination(newDestination) {
            const newDestinationToActivity = newDestination === OrderModel.DESTINATION_TYPES.activity.key;

            const orderDestinationToActivity = this.isOrderDestinatedToActivity();

            const toActivity = newDestinationToActivity || orderDestinationToActivity;

            if (toActivity && this.hasActivities() && !this.app.currentOrder().customerActivity) {
                this.app.currentOrder().customerActivity = this.getFirstActivityId();

            } else {
                this.unsetCustomerActivity();
                this.createFollowUpOptions([]);

                this.updatePickUpLocationsList();
                this.app.currentOrder().customerActivity = '';
            }
        }

        /**
         * @param {OrderItemModel} item
         */
        removeItem(item) {
            this.confirmOpen('Do you confirm removing?', () => {

                this.app.currentOrder() && this.app.currentOrder().removeItem(item);
                this.app.ordersDataService.saveOrderToStorage(this.app.currentOrder());

                if (this.app.currentOrder().orderItems.length === 0) {
                    this.app.ordersDataService.removeOrderFromStorage();
                    this.removeFormDataFromStorage();
                    this.app.emptyCurrentOrder();

                    this.app.close();
                }
            });
        }

        removeFormDataFromStorage() {
            PersistentStorage.removeData('i_newOrderFormData');
        }

        saveFormDataToStorage() {
            const obj = ko.toJS(this.formValues);

            PersistentStorage.saveData('i_newOrderFormData', obj);
        }

        loadFormDataFromStorage() {
            const obj = PersistentStorage.loadData('i_newOrderFormData');

            if (obj) {
                Object.entries(obj).forEach(([key, value]) => {
                    if (this.formValues[key]) {
                        this.formValues[key](value)
                    }
                });
            }
        }

        saveFormState() {
            this.app.ordersDataService.saveOrderToStorage(this.app.currentOrder());
            this.saveFormDataToStorage();
        }

        dismissOrder() {
            this.app.close();
        }

        popupOpen(text) {
            this._popupText(text);
            document.querySelector("#popup").open();
        }

        popupClose() {
            document.querySelector("#popup").close();
            this._popupText('');
        }

        confirmOpen(text, handler) {
            this._popupText(text);
            this._popupCloseHandler = handler;
            document.querySelector("#confirm").open();
        }

        confirmClose(result) {
            document.querySelector("#confirm").close();

            this._popupText('');

            if (this._popupCloseHandler && result) {
                this._popupCloseHandler();
            }
            this._popupCloseHandler = null;
        }

        updateQuantity() {
            // it needs timeout to save new value. it's a workaround
            setTimeout(this.saveFormState.bind(this), 500);
        }

        submitOrder() {
            let order = this.app.currentOrder();

            if (order.status !== OrderModel.STATUSES.draft.key) {
                return false;
            }

            const validationError = this.getFirstOrderValidationError();

            if (validationError) {
                this.popupOpen(validationError);
                return false;
            }

            const orderValidationGroup = document.getElementById('new-order-group-validation');

            if (orderValidationGroup.valid !== 'valid') {
                orderValidationGroup.showMessages();
                orderValidationGroup.focusOn("@firstInvalidShown");
                return;
            }

            this.app.currentOrder().orderDate = new Date().toISOString();
            this.app.currentOrder().status = OrderModel.STATUSES.new.key;

            this.app.ordersDataService.createOrder(this.app.currentOrder(), this.app.resourceId, this.formValues.createFollowUp()).then(() => {
                /** @type {OrderModel} */
                const order = this.app.currentOrder();

                this.app.ordersDataService.removeOrderFromStorage();
                this.removeFormDataFromStorage();
                this.app.emptyCurrentOrder();

                if (order.customerActivity) {
                    this.app.closeAndNavigateToActivity(order.customerActivity);
                } else {
                    this.app.closeAndNavigateToHomeScreen();
                }
            }).catch(error => {
                const order = this.app.getCurrentOrder();

                this.popupOpen(error.message);
                order.status = OrderModel.STATUSES.draft.key;
            });
        }

        getFirstOrderValidationError() {
            const order = this.app.getCurrentOrder();

            if (!order.neededByDate) {
                return 'Field "Needed By" is required';
            }

            if (this.isOrderDestinatedToActivity()) {
                if (!order.address) {
                    return 'Field "Address" is required';
                }

                if (!order.city) {
                    return 'Field "City" is required';
                }

                if (!order.state) {
                    return 'Field "State" is required';
                }

                if (!order.zip) {
                    return 'Field "Zip" is required';
                }
            }

            return false;
        }

        isEntityValid(entity) {
            return entity === 'activityList' || entity === 'partsCatalogItem';
        }

        isOrderDestinatedToActivity() {
            const currentOrder = this.app.getCurrentOrder();

            return currentOrder.destinationType === OrderModel.DESTINATION_TYPES.activity.key
        }

        isOrderDestinatedToTechnician() {
            const currentOrder = this.app.getCurrentOrder();

            return currentOrder.destinationType === OrderModel.DESTINATION_TYPES.technician.key
        }

        isCustomerActivitySet() {
            const currentOrder = this.app.getCurrentOrder();

            return Boolean(currentOrder.customerActivity);
        }

        hasActivities() {
            return Boolean(this.activityList.length);
        }

        handleDetached(info) {
            this.loaded = null;
            this.formValues = null;
            this.destinationTypes = null;
            this.activityList = null;

            this.destinationTypeSubscription = null;
            this.selectedPickUpLocationIdSubscription = null;
            this.selectedActivityIdSubscription = null;
            this.createFollowUpSubscription = null;
            this.addressSubscription = null;
            this.neededBySubscription = null;
        }
    }

    return new NewOrderScreen();
});
