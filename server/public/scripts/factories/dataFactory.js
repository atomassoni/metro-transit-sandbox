myApp.factory('DataFactory', ['$http', function ($http) {
    console.log('dataFactory running');

    // PRIVATE
    var currentLocation = undefined;//users current location (not yet implemented in factory)
    var busLocations = undefined;//the array of bus locations from Metro Transit
    var busRoutes = undefined;//the array of bus routes for today from Metro Transit
    var selectedRoute = undefined;//route number, may be multiple numbers eventually
    var busRouteMaps = undefined;//route paths from MetroGIS in long, lat coords
    var busRouteMapsWGS84 = undefined;//route path with lat, long coords for use with Google Maps API, same as above but with coords flipped
    var timepoints = undefined;//an array of 4 letter Metro Transit timepoints for a given route and direction.
    var selectedRoutes = undefined; //the array of route objects from selected routes
    var routeTrips = undefined; //the trips that match a route from Google's static transit data stored in "local" db
    var APICallTime = 0;

    // PUBLIC
    var publicApi = {
        factorySetLocation: function () {
            return geoLocation();
        },
        factoryGetLocation: function () {
            return currentLocation;
        },
        factorySetBusLocations: function () {
            return getBusLocations();
        },
        factoryGetBusLocations: function () {
            // return our array
            return busLocations;
        },
        factorySetBusRoutes: function () {
            return getBusRoutes();
        },
        factoryGetBusRoutes: function () {
            // return our array
            return busRoutes;
        },
        factorySetBusRouteMaps: function (num) {
            return getBusRouteMaps(num);
        },
        factoryGetBusRouteMaps: function () {
            // return our array
            return busRouteMaps;
        },
        factoryUTMtoWGS84: function () {
            return utm2LL();
        },
        factoryGetLL: function () {
            return busRouteMapsWGS84;
        },
        factoryGetSelectedRoutes: filterRouteAPI,
        factorySearchRoutes: function (routeSearch) {
            return searchRoutes(routeSearch);
        },
        factorySetBusTimepoints1: function () {
            return getBusTimepoints1();
        },
        factorySetBusTimepoints2: function () {
            return getBusTimepoints2();
        },
        factoryGetBusTimepoints: function () {
            return timepoints;
        },
        factoryGetAPICallTime: function () {
            return APICallTime;
        },

    };

    return publicApi;

    //PRIVATE
    function getBusLocations() {
        var promise = $http.get('/poke/bus')
            .then(function (response) {
                busLocations = response.data;
                console.log('one location', busLocations[0]);
                dateFilter();
                APICallTime = Date.now();
            });
        return promise;
    }

    function getBusRoutes() {
        var promise = $http.get('/poke/bus/routes')
            .then(function (response) {
                busRoutes = response.data;
            });
        return promise;
    }

    function getBusRouteMaps(num) {
        selectedRoute = num;
        var promise = $http.get('/poke/bus/maps/' + num)
            .then(function (response) {
                if (response.data.features) {
                    response.data.features.forEach(function (item) {
                        if (item.attributes.route == num) {
                            busRouteMaps = item;
                            busRouteMapsWGS84 = [];
                            item.geometry.paths.forEach(function (item, index) {
                                busRouteMapsWGS84[index] = [];
                                item.forEach(function (point, ind) {
                                    var coords = [
                                        point[1],
                                        point[0]
                                    ];
                                    busRouteMapsWGS84[index].push(coords);
                                });

                            });
                            selectedRoutes = filterRouteAPI();
                        }
                    });
                }
            });
        return promise;
    }

    function filterRouteAPI() {
        var newBusRoutes = [];
        busLocations.forEach(function (item) {
            if (selectedRoute == item.Route) {
                newBusRoutes.push(item);
            }
        });
        return newBusRoutes;
    }

    //changes date from server to seconds elapsed
    function dateFilter() {
        busLocations.forEach(function (item) {
            var match = item.LocationTime.match(/\(([^)]+)\-/);
            var now = Date.now();
            item.LocationTime = Math.round((now - match[1]) / 1000);
        });
    }


    function searchRoutes(routeSearch) {
        var newBusRoutes = [];
        busRoutes.forEach(function (item) {
            if (item.Description.toLowerCase().search(routeSearch.toLowerCase()) != -1) {
                newBusRoutes.push(item);
            }
        });
        return newBusRoutes;
    }

    function getBusTimepoints1() {

        var promise = $http.post('/poke/bus/timepoints1', selectedRoutes)
            .then(function (response) {
                timepoints = [];
                timepoints[0] = response.data;
                console.log('timepoints1', timepoints);
            });
        return promise;
    }

    function getBusTimepoints2() {
        var promise = $http.post('/poke/bus/timepoints2', selectedRoutes)
            .then(function (response) {
                timepoints[1] = response.data;
                console.log('timepoints2', timepoints);
                var tests1 = { 'pathDir1': pathDirection([0, -1], [-5, -1]), 'pathDir2': pathDirection([3, 1], [1, 3]), 'pathDir3': pathDirection([0, -1], [1, 3]) };
                console.log(tests1);
                var tests2 = { 'pathLR1': pointLine([0, -1], [-5, -1], [-5, 1]), 'pathLR2': pointLine([3, 1], [1, 3], [4, 4]), 'pathLR3': pointLine([0, -1], [1, 3], [0, 1]) };
                console.log(tests2);
                console.log('path', busRouteMapsWGS84);
            });


        return promise;
    }

//gets all the trips for a route number from Google's static transit data'
    function getTrips() {
        var promise = $http.get('/poke/trips', selectedRoutes)
            .then(function (response) {
                routeTrips = response.data;
            });

        return promise;
    }
    // function thatfindthestopitsbtw (route) {
    //     route.filter(getOneTrip()
            
    //     })
    // }

    function getOneTrip(match) {
         if (match.block_id == selectedRoutes.BlockNumber) {
             return match;
         }
    }

    function getStops() {

    }
    //not used
    // function utm2LL() {
    //     //conversion
    //     var routePath = [];

    //     busRouteMaps.geometry.paths.forEach(function(line, index) {
    //         routePath[index] = [];
    //         line.forEach(function(point) {

    //             var utm = {
    //                 "type": "Feature",
    //                 "geometry": {
    //                     'coordinates': [point[0], point[1]]
    //                 },
    //                 "properties": {
    //                     "zoneLetter": 'N',
    //                     "zoneNumber": 15
    //                 }
    //             };
    //             routePath[index].push(utm);

    //         });


    //     });

    //     var promise = $http.post('/poke/maps/conversion', routePath)
    //         .then(function(response) {
    //             busRouteMapsWGS84 = [];

    //             response.data.forEach(function(item, index) {
    //                 busRouteMapsWGS84[index] = [];
    //                 item.forEach(function (point, ind) {

    //                     var coords = [
    //                         point.coordinates[1],
    //                         point.coordinates[0]
    //                     ];
    //                     busRouteMapsWGS84[index].push(coords);
    //                 });

    //             });

    //         });

    //     return promise;
    // }





    // function buildOneWayRoute () {
    //     var newRoute = busRouteMapsWGS84;
    //     var direction = selectedRoutes[0].Directon;
    //     var otherDirection = getOtherDirection(direction);
    //     var completeRoute = {
    //         routeNum: selectedRoute,
    //         path1:
    //         { direction: direction,
    //             path: []
    //         },
    //         path2:
    //         { direction: otherDirection,
    //             path: []
    //         }
    //     };

    //     //get route dir from selectedRoutes
    //     while (newRoute.length) {
    //         var lastIndex = newRoute[0].length - 1;
    //         var point1 = newRoute[0][lastIndex-1];
    //         var point2 = newRoute[0][lastIndex];
    //         if (point2==newRoute[1][0] && point2==newRoute[2][0]) {//path forks
    //             if (pathDirection(point1,point2)*pointDistFromLine(point1,point2,newRoute[1][0])>pathDirection(point1,point2)*pointDistFromLine(point1,point2,newRoute[2][0])) {//true if the first path is to the right
    //                 completeRoute.path1.path.push(newRoute[1][0]);
    //                 completeRoute.path2.path.push(newRoute[2][0]);
    //             } else {
    //                 completeRoute.path1.path.push(newRoute[2][0]);
    //                 completeRoute.path2.path.push(newRoute[1][0]);
    //             }
    //             newRoute.splice(2,0);
    //         } else {//path does not fork
    //             completeRoute.path1.path.push(newRoute[1][0]);
    //             completeRoute.path2.path.push(newRoute[1][0]);
    //             newRoute.shift();
    //         }
    //     }
    //     console.log(completeRoute);
    // }

    //finds the direction the bus is moving, for use with buildOneWayRoute. Returns an angle in radians.
    function pathDirection(point1, point2) {
        var angle = Math.atan2(point2[0] - point1[0], point2[1] - point1[1]);
        return angle > 0 ? 1 : -1;
    }

    //point1 and point2 form a directional line starting at point1, point3 is either in the -x direction or the +x direction from the line.
    function pointLine(point1, point2, point3) {
        var y = (point2[0] - point1[0]) / (point3[1] - point1[1]) * (point2[1] - point1[1]) + point1[0];
        var pointDistFromLine = y - point3[0];
        return pointDistFromLine;
    }


    function reversePath() {

    }

    //gets the integer correspoding to other of the route's 2 directions
    function getOtherDirection(directionInt) {
        var direction = 0;
        switch (directionInt) {
            case 1:
                direction = "4";
                break;
            case 2:
                direction = "3";
                break;
            case 3:
                direction = "2";
                break;
            case 4:
                direction = "1";
                break;
        }
        return direction;
    }




}]);
