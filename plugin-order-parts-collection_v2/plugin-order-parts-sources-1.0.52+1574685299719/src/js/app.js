/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
/*
 * Your application specific code will go here
 */
define(['ojs/ojcore',
    'knockout',
    'ofsc-connector',
    './storage/persistent-storage',
    './storage/attributes',
    './data-services/ofsc-rest-api-transport',
    // data-services:
    './data-services/orders-data-service',
    './data-services/parts-catalog-data-service',
    './data-services/barcode-data-service',
    './data-services/inventory-data-service',
    './data-services/locations-data-service',
    './data-services/activity-data-service',
    // models:
    './models/catalog-collection',
    './models/order-model',
    './models/order-item-model',
    // screens:
    './viewModels/new-order-screen',
    './viewModels/order-list-screen',
    // properties
    './property-list',
    'app-constants',
    // non-referenced:
    'ojs/ojknockout',
    'ojs/ojmodule',
    'text!views/new-order-screen.html',
    'text!views/order-list-screen.html'
], (oj,
    ko,
    OfscConnector,
    PersistentStorage,
    AttributesStorage,
    OfscRestApiTransport,
    // data services:
    OrdersDataService,
    PartsCatalogDataService,
    BarcodeDataService,
    InventoryDataService,
    LocationsDataService,
    /** @type {typeof ActivityDataService} */
    ActivityDataService,
    // models:
    CatalogCollection,
    OrderModel,
    OrderItemModel,
    // screens:
    newOrderScreen,
    orderListScreen,
    // properties
    propertyList,
    AppConstants

) => {
    class App {

        get KEY_OFSC_INSTANCE() {
            return 'ofscInstance'
        };

        get KEY_OFSC_REST_ENDPOINT() {
            return 'ofscRestEndpoint'
        };

        get KEY_OFSC_REST_CLIENT_ID() {
            return 'ofscRestClientId'
        };

        get KEY_OFSC_REST_CLIENT_SECRET() {
            return 'ofscRestClientSecret'
        };

        get KEY_DEFAULT_SCREEN_NAME() {
            return 'defaultScreen';
        }


        constructor() {
            this.openParams = {};

            /*
             * Initialize instance fields
             */
            this.openData = ko.observable('');
            this.moduleConfig = ko.observable({});

            /*
             * OFSC Plugin API integration
             */
            this.ofscConnector = new OfscConnector();

            this.ofscConnector.debugMessageReceivedSignal.add((data) => {
                console.info('-> INV MGMT PLUGIN: ', data);
            });

            this.ofscConnector.debugMessageSentSignal.add((data) => {
                console.info('<- INV MGMT PLUGIN: ', data);
            });

            this.ofscConnector.debugIncorrectMessageReceivedSignal.add((error, data) => {
                console.error('-> IMV MGMT PLUGIN: incorrect message: ', error, data);
            });

            this.screens = {
                [newOrderScreen.label]: newOrderScreen,
                [orderListScreen.label]: orderListScreen
            };

            Object.values(this.screens).forEach(screen => screen.init(this));

            this.currentPosition = ko.observable(null);
            this.currentPositionInitialPromise = null;
        }

        init(domElement) {
            this.domElement = domElement;

            this.ofscConnector.sendMessage({
                method: 'ready',
                sendInitData: true
            }).then(this.onReadyMessage.bind(this)).catch((e) => {
                console.error("Unable to start application: ", e);
            });
        }

        onReadyMessage(message) {
            this._securedData = {};

            if (message.securedData) {
                Object.keys(message.securedData).forEach((key) => {
                    this._securedData[key] = message.securedData[key].trim();
                });
            }

            switch (message.method) {
                case 'init':
                    this.onInitMessage(message);
                    break;

                case 'open':
                    this.onOpenMessage(message);
                    break;

                case 'error':
                    this._showErrorAlert(message);
                    break;
            }
        }

        onInitMessage(message) {
            AttributesStorage.saveData(message.attributeDescription);
            PersistentStorage.saveData('inv_mgmt_buttons', message.buttons);

            this.initBaseServices();

            this.sendMessageWithButtonsIcons({
                method: 'initEnd'
            });
        }

        onOpenMessage(message) {
            this.initBaseServices();
            this.setOpenParams(message.openParams);

            if (!this.isValid(message)) {
                this.close();
                return;
            }

            this.resourceId = (message.resource && message.resource.external_id) || null;
            this.activityId = (message.activity && message.activity.aid) || null;

            this._initServices(message);
            this.loadInitialData().then(() => this.open());
        }

        isValid(message) {
            const attributeDescription = AttributesStorage.loadData();
            let errorsMsg = this._verifyProperties(propertyList, attributeDescription);

            if (errorsMsg !== '') {
                alert(errorsMsg);
                console.error(errorsMsg);
                return false;
            }

            errorsMsg = this._verifyActivityTypes(attributeDescription);

            if (errorsMsg !== '') {
                alert(errorsMsg);
                console.error(errorsMsg);
                return false;
            }

            errorsMsg = this._verifyInventoryTypes(attributeDescription);

            if (errorsMsg !== '') {
                alert(errorsMsg);
                console.error(errorsMsg);
                return false;
            }

            if (!this.isScreenSettingsValid(message)) {
                return false;
            }

            return true;
        }

        isScreenSettingsValid(message) {
            const screenName = this.getScreenName();

            if (!screenName) {
                alert('Parameter "defaultScreen" is missed. Please check parameters for the button');
                return false;
            }

            const screen = this.getScreen();

            if (!screen) {
                alert('The screen is not valid. Please check parameters for the button');
                return false;
            }

            if (!screen.isEntityValid(message.entity)) {
                alert('The screen entity is not valid. Please check parameters for the button');
                return false;
            }

            return true;
        }

        initBaseServices() {
            /**
             * @type {OfscRestApiTransport}
             * @private
             */
            this._ofscRestApiTransport = new OfscRestApiTransport(
                this._securedData[this.KEY_OFSC_REST_ENDPOINT].trim(),
                this._securedData[this.KEY_OFSC_INSTANCE].trim(),
                this._securedData[this.KEY_OFSC_REST_CLIENT_ID].trim(),
                this._securedData[this.KEY_OFSC_REST_CLIENT_SECRET].trim()
            );

            /**
             * @type {OrdersDataService}
             */
            this.ordersDataService = new OrdersDataService(this._ofscRestApiTransport);

            /**
             * @type {Function.<OrderModel|null>}
             * @public
             */
            this.currentOrder = ko.observable(OrdersDataService.getOrderFromStorage());

            if (!this.currentOrder()) {
                this.emptyCurrentOrder();
            }

            this.activityDataService = new ActivityDataService(
                this._ofscRestApiTransport,
                AttributesStorage.loadData()
            );

            /**
             * @type {LocationsDataService}
             */
            this.locationsDataService = new LocationsDataService(this._ofscRestApiTransport);
        }

        getCurrentOrder() {
            if (!this.currentOrder()) {
                this.emptyCurrentOrder();
            }
            return this.currentOrder();
        }

        emptyCurrentOrder() {
            this.currentOrder(OrdersDataService.createNewEmptyOrder());
        }

        open() {
            const screenName = this.getScreenName();

            if (!this.screens[screenName]) {
                alert('Invalid default screen');
                this.close();
            }

            this.navigate(screenName);

            this.startGeoLocation();

            ko.applyBindings(this, this.domElement);
        }

        close() {
            this.sendMessageWithButtonsIcons({
                method: 'close'
            });
        }

        closeAndNavigateToActivity(aid) {
            this.sendMessageWithButtonsIcons({
                method: 'close',
                backScreen: 'activity_by_id',
                backActivityId: aid.toString()
            });
        }

        closeAndNavigateToHomeScreen() {
            this.sendMessageWithButtonsIcons({
                method: 'close',
                backScreen: 'activity_list'
            });
        }

        closeAndNavigateToPlugin(pluginLabel, openParams) {
            this.sendMessageWithButtonsIcons({
                method: 'close',
                backScreen: 'plugin_by_label',
                backPluginLabel: pluginLabel,
                backPluginOpenParams: openParams
            });
        }

        getIconData() {
            const screenName = this.getScreenName();

            if (screenName && this.screens[screenName]) {
                return this.screens[screenName].getIconData();
            }

            return {};
        }

        getScreen() {
            const screenName = this.getScreenName();

            return this.screens[screenName];
        }

        getScreenName() {
            const screenName = this.openParams[this.KEY_DEFAULT_SCREEN_NAME];

            return screenName && screenName.trim();
        }

        loadInitialData() {
            return this.partsCatalogDataService.getPartsCatalogsStructure().then((catalogModelList) => {
                catalogModelList.forEach(catalogModel => {
                    this.catalogCollection.add(catalogModel);
                });
            });
        }

        navigate(screenName, args = {}) {
            this.moduleConfig({
                name: screenName,
                params: {
                    app: this,
                    args: args
                }
            });
        }

        /**
         * @params {Object} paramsObj
         */
        setOpenParams(paramsObj) {
            Object.assign(this.openParams, paramsObj);
        }

        startGeoLocation() {
            this.currentPositionInitialPromise = new Promise(resolve => {
                let resolved = false;
                let resolveFirstResult = () => {
                    if (resolved) {
                        return;
                    }
                    resolve(this.currentPosition());
                    resolved = true;
                    this.currentPositionInitialPromise = null;
                };


                if (navigator.geolocation) {
                    navigator.geolocation.watchPosition((position) => {
                        this.currentPosition({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                        resolveFirstResult();
                    }, () => {
                        if (!this.currentPosition()) {
                            this.currentPosition(-1);
                        }
                        resolveFirstResult();
                    }, {
                        enableHighAccuracy: true,
                        timeout: 10000
                    });
                } else {
                    this.currentPosition(-1);
                    resolveFirstResult();
                }
            });
        }

        _initServices(message) {
            /** @type ActivityModel */
            this.activity = null;

            let activityList = message.activityList && Object.values(message.activityList) || [];

            if (message.activity) {
                this.activity = this.activityDataService.createActivityModelFromObject(message.activity);

                if (activityList.length <= 0) {
                    activityList.push(message.activity);
                }
            }

            this.activityDataService.setCurrentRouteActivityList(activityList);

            /**
             * @type {PartsCatalogDataService}
             */
            this.partsCatalogDataService = new PartsCatalogDataService(this.ofscConnector);

            this.catalogCollection = new CatalogCollection();

            /**
             * @type {BarcodeDataService}
             */
            this.barcodeDataService = new BarcodeDataService(this.ofscConnector);

            if (!message.inventoryList) {
                throw new Error('Plugin was started on unsupported screen: Plugin could be placed only on Activity List, Activity Details and/or Inventory List');
            }

            /** @type {InventoryDataService} */
            this.inventoryDataService = new InventoryDataService(message.inventoryList);

            this.openData = message;
        }

        _verifyProperties(propertiesToConfig, attributeDescription) {
            let errorsArray = [];

            Object.entries(propertiesToConfig).forEach(([property, config]) => {
                if (!attributeDescription[property] && config[1]) {
                    errorsArray.push(property);
                }
            });

            return errorsArray.length > 0 ? 'These properties must be configured: ' + errorsArray.join(', ') + '.' : '';
        }

        _verifyActivityTypes(attributeDescription) {
            const ordActivityType = AppConstants.ACTIVITY_TYPE_ORDER;
            const list = attributeDescription['aworktype']['enum'];

            if (list && list[ordActivityType] && list[ordActivityType].label === ordActivityType) {
                return '';
            } else {
                return 'These activity types must be configured: ' + ordActivityType + '.';
            }
        }

        _verifyInventoryTypes(attributeDescription) {
            const inventoryTypes = [
                AppConstants.INVENTORY_TYPE_PART,
                AppConstants.INVENTORY_TYPE_ORDERED_PART,
                AppConstants.INVENTORY_TYPE_RECEIVED_PART
            ];

            const errorsArray = inventoryTypes.reduce((errorsList, type) => {
                const list = attributeDescription['invtype']['enum'];

                if (!list[type] || list[type].label !== type) {
                    errorsList.push(type);
                }
                return errorsList;
            }, []);

            return errorsArray.length > 0 ? 'These inventory types must be configured: ' + errorsArray.join(', ') + '.' : '';
        }

        _showErrorAlert(data) {
            let errorArray = data.errors.map((error) => {
                switch(error.code) {
                    case 'CODE_ACTION_INVENTORY_ACTIVITY_STATUS_INVALID':
                        return 'Activity must be started';
                    case 'CODE_ACTION_ON_PAST_DATE_NOT_ALLOWED':
                        return 'Activity can\'t be in the past';
                    default:
                        return error;
                }
            });

            if (errorArray.length === 0) {
                return;
            }

            if (errorArray.length === 1 && typeof(error[0]) === 'string') {
                alert(errorArray.join());
                console.error(errorArray.join());
            } else {
                alert(JSON.stringify(errorArray, null, 4));
            }
        }

        /**
         * @param {Object} data
         */
        sendMessageWithButtonsIcons(data) {
            const message = Object.assign({}, data);
            const buttonsIconData = this.getButtonsIconData();

            if (buttonsIconData) {
                message.buttonsIconData = buttonsIconData;
            } else {
                message.iconData = this.getIconData();
            }

            this.ofscConnector.sendMessage(message);
        }

        /**
         * @returns {Boolean|Object} False if no buttons stored
         */
        getButtonsIconData() {
            const buttons = PersistentStorage.loadData('inv_mgmt_buttons');

            if (!buttons) {
                return false;
            }

            return buttons.reduce((result, button) => {
                const buttonScreenName = button.params.defaultScreen;

                if (buttonScreenName && this.screens[buttonScreenName]) {
                    result[button.buttonId] = buttonScreenName ?
                        this.screens[buttonScreenName].getIconData(this) :
                        this.getIconData();
                }

                return result;
            }, {});
        }

        isOpenedFromActivityDetails() {
            return Boolean(this.activity);
        }

    }

    return new App();
});
