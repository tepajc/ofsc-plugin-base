/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define([
    'ojs/ojcore',
    'app-constants',
    './ofsc-rest-api-transport',
    // non-referenced:
    'ojs/ojvalidation'
], (
    oj,
    AppConstants,
    OfscRestApiTransport,
) => {
    'use strict';

    class LocationsDataService {

        static get GET_LOCATIONS() {
            return 'ofscCore/v1/resources/{resourceId}/locations';
        }

        static get RESOURCE_ASSIGNED_LOCATIONS() {
            return 'ofscCore/v1/resources/{resourceId}/assignedLocations';
        }

        static get GET_LOCATION() {
            return 'ofscCore/v1/resources/{resourceId}/locations/{locationId}';
        }


        /**
         * @param {OfscRestApiTransport} ofscTransport
         */
        constructor(transport) {

            if (!transport || !(transport instanceof OfscRestApiTransport)) {
                throw new TypeError('transport must be an OfscRestApiTransport instance');
            }

            this._transport = transport;

            this._pickUpLocationsList = {};

            this._resourceLocations = null;
        }

        getPickUpLocationsList(resourceId) {
            if (this._pickUpLocationsList[resourceId]) {
                return Promise.resolve(this._pickUpLocationsList[resourceId].slice(0));
            }

            return this._transport.request(
                this.constructor.GET_LOCATIONS.replace('{resourceId}', resourceId),
                this._transport.constructor.HTTP_METHOD_GET,
            ).then(result => {
                this._pickUpLocationsList[resourceId] = result.items;
                return result.items;
            });
        }

        getResourceLocations(resourceId) {
            if (this._resourceLocations) {
                return Promise.resolve(this._resourceLocations);
            }

            return this._transport.request(
                this.constructor.RESOURCE_ASSIGNED_LOCATIONS.replace('{resourceId}', resourceId),
                this._transport.constructor.HTTP_METHOD_GET,
            ).then(result => {
                this._resourceLocations = result;
                return result;
            });
        }

        getResourceDefaultLocation(resourceId) {
            return this.getResourceLocations(resourceId).then(locations => {
                const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][(new Date()).getDay()];

                const locationId = locations && locations[day] && locations[day].homeZoneCenter || null;

                if (!locationId) {
                    return null;
                }
                return this._transport.request(
                    this.constructor.GET_LOCATION.replace('{resourceId}', resourceId).replace('{locationId}', locationId),
                    this._transport.constructor.HTTP_METHOD_GET,
                ).then(result => {
                    return {
                        address: result.address,
                        city: result.city,
                        state: result.state,
                        zip: result.postalCode
                    };
                });
            });
        }
    }

    return LocationsDataService;
});
