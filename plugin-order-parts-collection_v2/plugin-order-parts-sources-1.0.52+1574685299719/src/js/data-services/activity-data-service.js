/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
'use strict';

define([
    'app-constants',
    '../models/activity-model',
    'models/order-model'
], (AppConstants, ActivityModel, OrderModel) => {
    class ActivityDataService {
        /**
         * @param {OfscRestApiTransport} ofscTransport
         * @param attributeDescription
         */
        constructor(ofscTransport, attributeDescription) {
            this._attributeDescription = attributeDescription;

            this._currentRouteActivityListData = [];

            this._activityList = null;
            this._activityDictionary = null;
        }

        setCurrentRouteActivityList(activityList) {
            this._currentRouteActivityListData = activityList;
        }

        _initActivityDictionary() {
            this._activityDictionary = this.getActivityList().reduce((accumulator, activityModel) => {
                accumulator[activityModel.id] = activityModel;
                return accumulator;
            }, {});
        }

        /**
         * @returns {ActivityModel[]}
         */
        getActivityList() {
            if (!this._activityList) {
                this._activityList = this._currentRouteActivityListData
                    .map(item => this.createActivityModelFromObject(item));
            }
            return this._activityList;
        }

        /**
         * @param {ActivityModel} activityModel
         * @returns {String}
         */
        getActivityIdentifier(activityModel) {
            let identifier = [];
            let worktypeTitle = this.getActivityWorktypeTitle(activityModel);
            if (worktypeTitle) {
                identifier.push(worktypeTitle);
            }
            if (activityModel.address) {
                identifier.push(activityModel.address);
            }

            if (!identifier.length) {
                identifier.push(activityModel.id);
            }
            return identifier.join(', ');
        }

        /**
         * @returns {ActivityModel[]}
         */
        getCustomerActivityList() {
            let nonCustomerWorktypeDictionary = AppConstants.ACTIVITY_NON_CUSTOMER_TYPES.reduce((accumulator, item) => {
                accumulator[item] = true;
                return accumulator;
            }, {});

            let groups = this._attributeDescription.aworktype && this._attributeDescription.aworktype.groups;
            if (groups) {
                let nonCustomerGroupsDictionary = AppConstants.ACTIVITY_NON_CUSTOMER_TYPE_GROUPS.reduce((accumulator, item) => {
                    accumulator[item] = true;
                    return accumulator;
                }, {});

                groups.forEach(groupData => {
                    if (nonCustomerGroupsDictionary[groupData.label]) {
                        groupData.items.forEach(label => nonCustomerWorktypeDictionary[label] = true);
                    }
                });
            }

            return this.getActivityList()
                .filter(activityModel => !nonCustomerWorktypeDictionary[activityModel.worktype])
                .filter(activityModel => activityModel.status !== OrderModel.STATUSES.canceled.key);
        }

        /**
         * @param id
         * @returns {ActivityModel|undefined}
         */
        getActivityById(id) {
            if (!this._activityDictionary) {
                this._initActivityDictionary();
            }

            return this._activityDictionary[id] || undefined;
        }

        /**
         * @param {ActivityModel} activityModel
         * @returns {string}
         */
        getActivityWorktypeTitle(activityModel) {
            let description = this._attributeDescription.aworktype && this._attributeDescription.aworktype.enum && this._attributeDescription.aworktype.enum[activityModel.worktype];
            if (!description) {
                return activityModel.worktype;
            }
            return description.text;
        }

        createActivityModelFromObject(obj) {
            return new ActivityModel({
                id: obj.aid,
                apptNumber: obj.appt_number,
                status: obj.astatus,
                worktype: obj.aworktype,
                address: obj[AppConstants.ACTIVITY_PROPERTY_ADDRESS],
                city: obj[AppConstants.ACTIVITY_PROPERTY_CITY],
                state: obj[AppConstants.ACTIVITY_PROPERTY_STATE],
                zip: obj[AppConstants.ACTIVITY_PROPERTY_ZIP],

                orderItems:                 obj[AppConstants.ACTIVITY_PROPERTY_ORDER_ITEMS],
                orderDestinationType:       obj[AppConstants.ACTIVITY_PROPERTY_DESTINATION_TYPE],
                orderShipmentNumber:        obj[AppConstants.ACTIVITY_PROPERTY_SHIPMENT_NUMBER],
                orderReceivedItems:         obj[AppConstants.ACTIVITY_PROPERTY_RECEIVED_ITEMS],
                orderStatus:                obj[AppConstants.ACTIVITY_PROPERTY_ORDER_STATUS],
                orderFollowupAid:           obj[AppConstants.ACTIVITY_PROPERTY_FOLLOWUP_AID],
                orderFollowupApptnumber:    obj[AppConstants.ACTIVITY_PROPERTY_FOLLOWUP_APPTNUMBER],
                orderInitialAid:            obj[AppConstants.ACTIVITY_PROPERTY_INITIAL_AID],
                orderInitialApptnumber:     obj[AppConstants.ACTIVITY_PROPERTY_INITIAL_APPTNUMBER],
                orderInitialType:           obj[AppConstants.ACTIVITY_PROPERTY_INITIAL_TYPE],
                orderInitialAddress:        obj[AppConstants.ACTIVITY_PROPERTY_INITIAL_ADDRESS]
            });
        }
    }

    return ActivityDataService;
});