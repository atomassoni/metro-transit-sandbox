myApp.controller('pokeController', ['$scope', '$http', '$timeout', 'DataFactory', function($scope, $http, $timeout, DataFactory) {

    loadAPI();
    $scope.busData = [];
    $scope.directions = [0,"&darr;", "&rarr;", '&larr;', '&uarr;'];
    $scope.routeSearch = '';
    $scope.selectedItem;

    $scope.updateAPI = function()  {
        loadAPI();
    };

$scope.filterAPI = function(routeNum) {
        loadAPI();
        var newBusRoutes = [];
        $scope.busData.forEach(function(item){
            if (routeNum == item.Route) {
                newBusRoutes.push(item);
            }
        });
        $scope.busData = newBusRoutes;
};

function loadAPI() {
    var timeElapsed = Date.now() - DataFactory.factoryGetAPICallTime();
    console.log('TIME ELAPSED', timeElapsed);
    if(DataFactory.factoryGetBusRoutes() === undefined || timeElapsed > 30000) {
      DataFactory.factorySetBusRoutes().then(function() {
        $scope.busData = DataFactory.factoryGetBusRoutes();
      });
    } else {
      $scope.busData = DataFactory.factoryGetBusRoutes();
    }
}

}]);
