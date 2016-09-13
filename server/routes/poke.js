var express = require('express');
var router = express.Router();
var request = require('request');
var Busroute = require('../models/busroute');
var wgs84util = require("wgs84-util");

var allBusLocationsAPI = 'http://svc.metrotransit.org/NexTrip/VehicleLocations/0?format=json';
var allBusRoutesAPI = 'http://svc.metrotransit.org/NexTrip/Routes?format=json';
var busStops = 'http://svc.metrotransit.org/NexTrip/5/4/7SOL?format=json';
var allBusRoutesMapBaseAPI = 'http://gis2.metc.state.mn.us/arcgis/rest/services/MetroGIS/Transit/MapServer/14/query'; //?where=&text=54&objectIds=&time=&geometry=&geometryType=esriGeometryPolyline&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson';

// obtain an array of all bus locations
router.get('/bus', function(req, res) {

    request(allBusLocationsAPI, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            res.send(body);
        }
    });

});
//obtain an array with descriptions of transit options running today
router.get('/bus/maps/:routenum', function(req, res) {
    var routeNum = req.params.routenum;
    var query = '?text=' + routeNum + '&f=pjson';
    request(allBusRoutesMapBaseAPI + query, function(error, response, body) {
        if (!error && response.statusCode == 200) {

            res.send(body);
        }

    });
});

router.post('/maps/conversion', function(req, res) {
    var pathPointsUTM = req.body;
    var pathPointsWGS84 = [];

    if (pathPointsUTM[0]) {

        pathPointsUTM.forEach(function(line, i) {
            pathPointsWGS84[i] = [];
            line.forEach(function(point, ind) {
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
router.get('/bus/routes', function(req, res) {

    request(allBusRoutesAPI, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body);
            res.send(body);
        }
    });

});

router.get('/busdb', function(req, res) {
    Busroute.find({}, function(err, data) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        res.send(data);
    });
});

router.delete('/busremove', function(req, res) {
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
        apiData: []
    };

    Busroute.create(newBusRoutes, function(err) {
        if (err) {
            console.log(err);
        } else {
            res.send(req.body);
        }
    });

});

router.put('/bus', function(req, res) {
    var buses = req.body; // {object}
    console.log('req.body', req.body);
    Busroute.findOne(function(err, busroute) {
        if (err) {
            res.sendStatus(500);
            return;
        }

        if (buses.length > 0) {
            buses.foreach(function(item, index) {
                busroute.apiData.push(item);
            });

        }
        busroute.save(function(err) {
            if (err) {
                res.sendStatus(500);
                return;
            }

            res.sendStatus(204);
        });
    });

});

module.exports = router;
