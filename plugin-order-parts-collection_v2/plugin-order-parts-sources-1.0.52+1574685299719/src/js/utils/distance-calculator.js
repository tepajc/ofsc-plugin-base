/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
define(() => {
    const deg2rad = deg => deg * (Math.PI / 180);

    class DistanceCalculator {
        static calculateDistance(point1, point2) {
            let lat1 = point1.latitude;
            let lon1 = point1.longitude;

            let lat2 = point2.latitude;
            let lon2 = point2.longitude;

            let R = 6371000; // Radius of the earth in meters
            let dLat = deg2rad(lat2 - lat1);  // deg2rad below
            let dLon = deg2rad(lon2 - lon1);
            let a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            let d = R * c; // Distance in meters
            return d;
        }

        static calculateTravelTime(distance) {
            if (distance === -1) {
                return -1;
            }
            return Math.ceil(distance / 1000 * 7);
        }

        static formatDistance(distance) {
            if (distance === -1) {
                return null;
            }
            return (distance / 1000).toFixed(2) + ' km';
        }


        static formatTravelTime(time) {
            if (time === -1) {
                return null;
            }
            if (time >= 60) {
                let hours = Math.floor(time / 60);
                let minutes = time % 60;
                if (minutes) {
                    return `${hours} h ${minutes} min`;
                } else {
                    return `${hours} h`;
                }
            }
            return `${time} min`;
        }
    }

    return DistanceCalculator;
});