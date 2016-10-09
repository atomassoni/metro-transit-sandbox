var express = require('express');
var router = express.Router();
var request = require('request');
var Busroute = require('../models/busroute');
var wgs84util = require("wgs84-util");

//Metro Transit API calls
var metroTransitBaseURL = 'http://svc.metrotransit.org/NexTrip/'
var allBusLocationsAPI = 'http://svc.metrotransit.org/NexTrip/VehicleLocations/0?format=json';
var allBusRoutesAPI = 'http://svc.metrotransit.org/NexTrip/Routes?format=json';
var busStopsTimeNodes = 'http://svc.metrotransit.org/NexTrip/5/4/7SOL?format=json';
var routeDirectionTimepoints = 'http://svc.metrotransit.org/NexTrip/Stops/'; //{ROUTE}/{DIRECTION}';
//{ROUTE}/{DIRECTION}/{STOP};

//MetroGIS API calls
var allBusRoutesMapBaseAPI = 'http://gis2.metc.state.mn.us/arcgis/rest/services/MetroGIS/Transit/MapServer/15/query';

// obtain an array of all bus locations
router.get('/bus', function (req, res) {

    request(allBusLocationsAPI, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            res.send(body);
        }
    });

});
//get routes matching route number selected
router.get('/bus/maps/:routenum', function (req, res) {
    var routeNum = req.params.routenum;
    var query = '?where=route+%3D+%27' + routeNum + '%27' + '&outSR=4326&f=pjson';
    request(allBusRoutesMapBaseAPI + query, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            res.send(body);
        }

    });
});

//no longer necessary
router.post('/maps/conversion', function (req, res) {
    var pathPointsUTM = req.body;
    var pathPointsWGS84 = [];

    if (pathPointsUTM[0]) {

        pathPointsUTM.forEach(function (line, i) {
            pathPointsWGS84[i] = [];
            line.forEach(function (point, ind) {
                pathPointsWGS84[i].push(wgs84util.UTMtoLL(point));
            });
        });

    } else {
        console.log('no path data');
    }
    //console.log('wgs84', pathPointsWGS84);
    res.send(pathPointsWGS84);

});

//obtain an array with descriptions of transit options running today
router.get('/bus/routes', function (req, res) {

    request(allBusRoutesAPI, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            res.send(body);
        }
    });

});

//
router.post('/bus/timepoints1/', function (req, res) {
    var routeNum = req.body[0].Route;
    var direction = req.body[0].Direction;
    var rq = routeDirectionTimepoints + routeNum + '/' + direction + '?format=json';
    console.log('rq1', rq);
    request(rq, function (error, response) {
        if (!error && response.statusCode == 200) {
            console.log(response.body);
            res.send(response.body);
        }
    });

});

router.post('/bus/timepoints2/', function (req, res) {
    var routeNum = req.body[0].Route;
    switch (req.body[0].Direction) {
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

    var rq = routeDirectionTimepoints + routeNum + '/' + direction + '?format=json';
    console.log('rq2', rq);
    request(rq, function (error, response) {
        if (!error && response.statusCode == 200) {
            console.log(response.body);
            res.send(response.body);
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


//gets the trip document from the db. Ideally this would be the only call we make to the database, but since the dataset is so large, I ran out of space to store data on a free account. I had to reduce redundancy by having seperate tables for trips, stops and shapes. 
router.get('/trip', function (req, res) {
   var route_id = req.body.Route + '-95';
    Trip.find({route_id: route_id}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.send(data);
        }
    });
});

router.get('/stop', function (req, res) {
   var route_id = req.body.stop_id;
    Stop.findOne({stop_id: stop_id}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.send(data);
        }
    });
});

router.get('/shape', function (req, res) {
   var shape_id = req.body.shape_id;
    Shape.find({shape_id: shape_id}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.send(data);
        }
    });
});

module.exports = router;
