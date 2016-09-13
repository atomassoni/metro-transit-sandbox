myApp.controller('pokeController', ['$scope', '$http', '$timeout', 'DataFactory', function($scope, $http, $timeout, DataFactory) {

    loadAPI();
    $scope.busLocations = [];//locations of buses with info
    $scope.busRoutes = [];//all bus routes for the day
    $scope.directions = [0,"&darr;", "&rarr;", '&larr;', '&uarr;'];
    $scope.routeSearch = '';
    $scope.selectedItem;
    $scope.busRouteMaps = false;

$scope.filterAPI = function(routeNum) {
    loadAPI();
    loadRouteMaps(routeNum);
    console.log('$scopebusdata in filter', $scope.busRouteMaps);
};

$scope.matchRoutes = function(routeSearch) {
    loadRoutes(routeSearch);
    console.log('$scopebusdata in match', $scope.busRouteMaps);
};

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
        convertUTMtoWGS84();
        $scope.busLocations = DataFactory.factoryGetSelectedRoutes();
      });
}

function convertUTMtoWGS84() {
      DataFactory.factoryUTMtoWGS84().then(function() {
        $scope.busRouteMaps = DataFactory.factoryGetLL();
      });
}



}]);
