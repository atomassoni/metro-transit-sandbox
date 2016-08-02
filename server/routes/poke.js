var express = require('express');
var router = express.Router();
var request = require('request');
var Busroute = require('../models/busroute');

var allBusLocationsAPI = 'http://svc.metrotransit.org/NexTrip/VehicleLocations/0?format=json';



// obtain an array of all buses
router.get('/bus', function(req, res) {

    request(allBusLocationsAPI, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            res.send(body);

        }
    });

});

router.get('/busdb', function (req, res) {
  Busroute.find({}, function (err, data) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.send(data);
  });
 });

router.delete('/busremove',function(req, res) {
    Busroute.remove({}, function(err) {
        if (err) {
            console.log(err)
        } else {
            res.send('success');
        }
    });
});

router.post('/busdbroutes', function(req, res) {

    var newBusRoutes = {
      created: Date.now(),
      apiData: req.body
    };

    Busroute.create(newBusRoutes, function(err) {
        if (err) {
            console.log(err);
        } else {
            res.sendStatus(200);
        }
    });

});

module.exports = router;
