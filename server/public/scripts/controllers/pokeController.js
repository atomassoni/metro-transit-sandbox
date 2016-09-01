myApp.controller('pokeController', ['$scope', '$http', '$timeout', 'DataFactory', function($scope, $http, $timeout, DataFactory) {

    $scope.busDataFromAPI = [];
    $scope.directions = [0,"&darr;", "&rarr;", '&larr;', '&uarr;'];

    var timeElapsed = Date.now() - DataFactory.factoryGetAPICallTime();
    console.log('TIME ELAPSED', timeElapsed);

    if(DataFactory.factoryGetBusRoutes() === undefined||timeElapsed>30000) {
      DataFactory.factorySetBusRoutes().then(function() {
        $scope.busDataFromAPI = DataFactory.factoryGetBusRoutes();
        console.log('new data', $scope.busDataFromAPI);
      });
    } else {
      $scope.busDataFromAPI = DataFactory.factoryGetBusRoutes();
    }

}]);
