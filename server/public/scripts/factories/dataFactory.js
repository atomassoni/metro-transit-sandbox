myApp.factory('DataFactory', ['$http', function($http) {
  console.log('dataFactory running');

  // PRIVATE
  var busRoutes = undefined;
  var APICallTime = 0;

  // PUBLIC
  var publicApi = {
    factorySetBusRoutes: function() {
      return getBusLocations();
    },
    factoryGetBusRoutes: function() {
      // return our array
      return busRoutes;
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
                busRoutes = response.data;
                APICallTime = Date.now();

            });
      return promise;
    }

    function filterAPI(routeNum) {
            loadAPI();
            var newBusRoutes = [];
            $scope.busData.forEach(function(item){
                if (routeNum == item.Route) {
                    newBusRoutes.push(item);
                }
            });
            $scope.busData = newBusRoutes;
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
  function getFavoriteData() {
    var promise = $http.get('/favorites').then(function(response) {
      console.log('Async data returned: ', response.data);
      favorites = response.data;
    });

    return promise;
  }

  function saveFavorite(newFav) {
    var promise = $http.post('/favorites', newFav).then(function(response) {
      if(response.status == 201) {
        console.log('Hooray! Favorite Saved!');
        return getFavoriteData();
      } else {
        console.log('Boo!', response.data);
      }
    });

    return promise;
  }

  function deleteData(id) {
    var promise = $http.delete('/favorites/' + id).then(function(response) {
      console.log('deleted: ', response.data);
      if(response.status == 204) {
        console.log('Hooray! deleted!');
        return getFavoriteData();
      } else {
        console.log('Boo!', response.data);
      }

    });

    return promise;
  }


}]);
