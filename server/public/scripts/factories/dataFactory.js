myApp.factory('DataFactory', ['$http', function($http) {
    console.log('dataFactory running');

    // PRIVATE
    var busLocations = undefined;
    var busRoutes = undefined;
    var selectedRoute = undefined;
    var busRouteMaps = undefined;
    var busRouteMapsWGS84 = undefined;
    var APICallTime = 0;

    // PUBLIC
    var publicApi = {
        factorySetBusLocations: function() {
            return getBusLocations();
        },
        factoryGetBusLocations: function() {
            // return our array
            return busLocations;
        },
        factorySetBusRoutes: function() {
            return getBusRoutes();
        },
        factoryGetBusRoutes: function() {
            // return our array
            return busRoutes;
        },
        factorySetBusRouteMaps: function(num) {
            return getBusRouteMaps(num);
        },
        factoryGetBusRouteMaps: function() {
            // return our array
            return busRouteMaps;
        },
        factoryUTMtoWGS84: function() {
            return utm2LL();
        },
        factoryGetLL: function() {
            return busRouteMapsWGS84;
        },
        factoryGetSelectedRoutes: filterRouteAPI,
        factorySearchRoutes: function(routeSearch) {
            return searchRoutes(routeSearch);
        },
        factoryGetAPICallTime: function() {
            return APICallTime;
        },

    };

    return publicApi;

    //PRIVATE
    function getBusLocations() {
        var promise = $http.get('/poke/bus')
            .then(function(response) {
                busLocations = response.data;
                console.log(busLocations);
                dateFilter();
                APICallTime = Date.now();
            });
        return promise;
    }

    function getBusRoutes() {
        var promise = $http.get('/poke/bus/routes')
            .then(function(response) {
                busRoutes = response.data;
            });
        return promise;
    }

    function getBusRouteMaps(num) {
        selectedRoute = num;
        var promise = $http.get('/poke/bus/maps/' + num)
            .then(function(response) {

                if (response.data.features) {
                    response.data.features.forEach(function(item) {
                        if (item.attributes.route == num) {
                            busRouteMaps = item;

                        }
                    });
                }
            });
        return promise;
    }

    function filterRouteAPI() {
        var newBusRoutes = [];
        busLocations.forEach(function(item) {
            if (selectedRoute == item.Route) {
                newBusRoutes.push(item);
            }
        });
        return newBusRoutes;
    }

//changes date from server to an actual data object.. now expressed as seconds elapsed
    function dateFilter () {
        busLocations.forEach(function(item) {
            var match = item.LocationTime.match(/\(([^)]+)\-/);
            var now = Date.now();
            item.LocationTime = Math.round((now - match[1])/1000);
        });
    }
    function secondsElapsed () {

    }
    function searchRoutes(routeSearch) {
        var newBusRoutes = [];
        busRoutes.forEach(function(item) {
            if (item.Description.toLowerCase().search(routeSearch.toLowerCase()) != -1) {
                newBusRoutes.push(item);
            }
        });
        return newBusRoutes;
    }

    function utm2LL() {
        //conversion
        var routePath = [];

        busRouteMaps.geometry.paths.forEach(function(line, index) {
            routePath[index] = [];
            line.forEach(function(point) {

                var utm = {
                    "type": "Feature",
                    "geometry": {
                        'coordinates': [point[0], point[1]]
                    },
                    "properties": {
                        "zoneLetter": 'N',
                        "zoneNumber": 15
                    }
                };
                routePath[index].push(utm);

            });


        });

        var promise = $http.post('/poke/maps/conversion', routePath)
            .then(function(response) {
                busRouteMapsWGS84 = [];

                response.data.forEach(function(item, index) {
                    busRouteMapsWGS84[index] = [];
                    item.forEach(function (point, ind) {

                        var coords = [
                            point.coordinates[1],
                            point.coordinates[0]
                        ];
                        busRouteMapsWGS84[index].push(coords);
                    });

                });

            });
        return promise;
    }

    // function getLatestData() {
    //       var get1 = $http.get('/poke/busdb')
    //           .then(function(response) {
    //               console.log(response.data);
    //               if (response.data.length > 0) {
    //               $scope.busDataFromAPI = response.data;
    //           }
    //               var timeElapsed = Date.now();
    //               console.log('timeElapsed', timeElapsed);
    //
    //               if (timeElapsed > 30000 || timeElapsed!==timeElapsed) {
    //                   $http.delete('/poke/busremove')
    //                       .then(function(response) {
    //
    //                               console.log('removed db info');
    //                               $http.get('/poke/bus')
    //                                   .then(function(resp) {
    //                                       $scope.busDataFromAPI = resp.data;
    //                                       $http.post('/poke/busdbroutes',$scope.busDataFromAPI)
    //                                           .then(function(resp1) {
    //
    //                                           $http.put('/poke/bus', resp1)
    //                                           .then(function(resp2) {
    //                                               console.log('added to db', resp2.data);
    //                                               });
    //
    //                                           });
    //
    //                                   });
    //
    //                       });
    //
    //               }
    //           });
    //   }



}]);
