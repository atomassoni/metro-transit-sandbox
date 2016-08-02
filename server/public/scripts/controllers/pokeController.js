myApp.controller('pokeController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {



    $scope.busDataFromAPI = [];
    $scope.directions = ["&darr;", "&rarr;", '&larr;', '&uarr;'];

    getBusLocations();

    function getBusLocations() {
        $http.get('/poke/bus')
            .then(function(response) {
                $scope.busDataFromAPI = response.data;
                console.log('GET /bus ', response.data);
                // $http.post('/poke/busdbroutes', $scope.busDataFromAPI)
                //     .then(function(resp1) {
                //         console.log('added db data again');
                //     });
            });
    }

    function getLatestData() {
        $http.get('/poke/busdb')
            .then(function(response) {

                $scope.busDataFromAPI = response.data;
                var timeElapsed = response.data.created - Date.now();
                console.log('timeElapsed', timeElapsed);

                if (timeElapsed > 30000) {
                    $http.delete('/poke/busremove')
                        .then(function(response) {
                            if (response == 'success') {
                                console.log('removed db info');
                                $http.get('/poke/bus')
                                    .then(function(resp) {
                                        $scope.busDataFromAPI = resp.data;
                                        $http.post('/poke/busdbroutes', $scope.busDataFromAPI)
                                            .then(function(resp1) {
                                                console.log('added db data again');
                                            });
                                    });
                            }
                        });

                }
            });
    }


}]);
