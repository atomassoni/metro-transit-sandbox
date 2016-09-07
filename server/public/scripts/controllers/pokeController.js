myApp.controller('pokeController', ['$scope', '$http', '$timeout', 'DataFactory', function($scope, $http, $timeout, DataFactory) {

    loadAPI();
    $scope.busLocations = [];//locations of buses with info
    $scope.busRoutes = [];//all bus routes for the day
    $scope.directions = [0,"&darr;", "&rarr;", '&larr;', '&uarr;'];
    $scope.routeSearch = '';
    $scope.selectedItem;



$scope.filterAPI = function(routeNum) {
        loadAPI();
        var newBusRoutes = [];
        $scope.busLocations.forEach(function(item){
            if (routeNum == item.Route) {
                newBusRoutes.push(item);
            }
        });
        $scope.busLocations = newBusRoutes;
};

$scope.matchRoutes = function(routeSearch) {
    loadRoutes();
    var newBusRoutes = [];

    $scope.busRoutes.forEach(function(item){
        if (item.Description.search(routeSearch)!=-1) {
            console.log('description', item.Description);
            console.log('search', routeSearch);
            newBusRoutes.push(item);
        }
    });
    $scope.busRoutes = newBusRoutes;
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

function loadRoutes() {
    if(DataFactory.factoryGetBusRoutes() === undefined) {
      DataFactory.factorySetBusRoutes().then(function() {
        $scope.busRoutes = DataFactory.factoryGetBusRoutes();
      });
    } else {
      $scope.busRoutes = DataFactory.factoryGetBusRoutes();
    }
}





}]);
