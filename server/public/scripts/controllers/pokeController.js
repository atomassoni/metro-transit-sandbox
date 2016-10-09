myApp.controller('pokeController', ['$scope', '$http', '$timeout', 'DataFactory', function($scope, $http, $timeout, DataFactory) {

    loadAPI();
    // getLocation();
    var noLocation = {
      lat: 44.886656,
      lng: -93.2258133
    };
    $scope.currentLocation = noLocation;
    $scope.busLocations;//locations of buses with info
    $scope.busRoutes;//all bus routes for the day
    $scope.directions = [0,"&darr;", "&rarr;", '&larr;', '&uarr;'];
    $scope.routeSearch = undefined;
    $scope.selectedItem = undefined;
    $scope.busRouteMaps = false;
    $scope.timepoints = undefined;


//Modal Functions
$scope.pinSelect = function (routeNum) {
    loadAPI();
    loadRouteMaps(routeNum);
    $scope.pinSelected = true;
};

$scope.closeModal = function() {
    $scope.pinSelected = false;
};

//API scope functions
$scope.refresh = function () {
    loadAPI();
};

$scope.filterAPI = function(routeNum) {
    loadAPI();
    loadRouteMaps(routeNum);
};

$scope.matchRoutes = function(routeSearch) {
    loadRoutes(routeSearch);
};
//Factory functions
function loadAPI() {
    var timeElapsed = Date.now() - DataFactory.factoryGetAPICallTime();
    console.log('TIME ELAPSED', timeElapsed);
    if(DataFactory.factoryGetBusLocations() === undefined || timeElapsed > 30000) {
      DataFactory.factorySetBusLocations().then(function() {
        $scope.busLocations = DataFactory.factoryGetBusLocations();
        });
    } else {
      $scope.busLocations = DataFactory.factoryGetBusLocations();
    }
}

function loadRoutes(routeSearch) {
    if(DataFactory.factoryGetBusRoutes() === undefined) {
      DataFactory.factorySetBusRoutes().then(function() {
        $scope.busRoutes = DataFactory.factorySearchRoutes(routeSearch);
      });
    } else {
      $scope.busRoutes = DataFactory.factorySearchRoutes(routeSearch);
    }
}

function loadRouteMaps(num) {
     DataFactory.factorySetBusRouteMaps(num).then(function() {
         $scope.busRouteMaps = DataFactory.factoryGetLL();
         $scope.busLocations = DataFactory.factoryGetSelectedRoutes();
         DataFactory.factorySetBusTimepoints1().then(function() {
              DataFactory.factorySetBusTimepoints2().then(function() {
             $scope.timepoints = DataFactory.factoryGetBusTimepoints();
              
         });
        });
      });

}




}]);
