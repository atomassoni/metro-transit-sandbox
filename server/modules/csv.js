
require('dotenv').load();

var csv = require('csv-parser');
var fs = require('fs');
var pg = require('pg');
var Pgb = require('pg-bluebird');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Trip = require('../models/trip');
var Shape = require('../models/shape');
var Stop = require('../models/stop');

var JSONStream = require('JSONStream');
var es = require('event-stream');

var count = 0;
var crayArray = [];

var connectionString = process.env.MONGODB_LOC;

var shapesJSONfilepath = './paths.js';//file with shapes JSON
var stopsJSONfilepath = './stops.js';//stops JSON

mongoose.connect(connectionString);

mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open ', connectionString);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose error connecting ', err);
});

var connectionStringPG = 'postgres://localhost:5432/bus';


// var mysql = require('mysql');
// var connection = mysql.createConnection(process.env.JAWSDB_MARIA_URL);

// connection.connect();

// connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
//   if (err) throw err;

//   console.log('The solution is: ', rows[0].solution);
// });

// connection.end();

//putStopCoords();
//postTrips();
//stops2JSONfile();
//putStops();
//postStops();
//putShapes();
//shapes2JSONfile();
stops2JSONfileSQL();
//readIntoSQL()

function postTrips() {
    fs.createReadStream(process.env.LOCAL_PROJECT_PATH + 'trips.txt')
        .pipe(csv())
        .on('data', function (data) {


            var route = data.route_id.substr(0, data.route_id.length - 3);
            var routeList = ['5', '14', '21', '54', '74', '83', '84', '901', '902'];
            if (routeList.includes(route)) {

                var newTrip = {
                    trip_id: data.trip_id,
                    route_id: data.route_id,
                    shape_id: data.shape_id,
                    block_id: data.block_id,
                    stops: [],
                    paths: []
                };
                Trip.create(newTrip, function (err) {
                    if (err) {
                        console.log("error", err);
                    } else {
                        console.log("stored %d", count);
                        count++;
                    }
                });

            }
        });
}

function putPaths() {
    count = 0;


    var shape_prev = 0;
    var seq_last = 0;
    var path1 = [];


    fs.createReadStream(process.env.LOCAL_PROJECT_PATH + 'shapes.txt')
        .pipe(csv())
        .on('data', function (data) {

            var shape_id = data.shape_id;
            var seq = data.shape_pt_sequence;
            if (crayArray[shape_id] === undefined) {
                crayArray[shape_id] = [];
                //if (shape_prev > 0) {

                //     path1 = crayArray[shape_prev];

                //     Trip.update({ shape_id: shape_id }, { $push: { path: path1 } }, { multi: true }, function (err, trips) {
                //         if (err) {
                //             console.log("error", err);
                //         } else {
                //             console.log("stored shape id");
                //         }
                //     });
                //    }
            }



            var coords = {
                lat: data.shape_pt_lat,
                lon: data.shape_pt_lon
            };
            crayArray[shape_id].push(coords);
            shape_prev = shape_id;
            // seq_last = seq;

        }).on('end', function () {
            console.log("cray");

            //postTrips();

        });

}

function putPaths2() {
    count = 0;
    var path1 = [];

    fs.createReadStream(process.env.LOCAL_PROJECT_PATH + 'shapes.txt')
        .pipe(csv())
        .on('data', function (data) {

            var shape_id = data.shape_id;
            var seq = data.shape_pt_sequence;

            var coords = {
                lat: data.shape_pt_lat,
                lon: data.shape_pt_lon
            };

            Trip.update({ shape_id: shape_id }, { $push: { path: coords } }, { multi: true }, function (err) {
                if (err) {
                    console.log("error", err);
                } else {
                    //console.log("stored shape id ", count);
                    // count++;
                }
            });

        }).on('end', function () {
            console.log("cray");

        });

}

function shapes2JSONfile() {
    count = 0;

    fs.createReadStream(process.env.LOCAL_PROJECT_PATH + 'shapes.txt')
        .pipe(csv())
        .on('data', function (data) {

            var shape_id = data.shape_id;
            var seq = data.shape_pt_sequence;
            if (crayArray[shape_id] === undefined) {

                crayArray[shape_id] = {
                    shape: shape_id,
                    path: []
                };

            }

            var coords = {
                lat: data.shape_pt_lat,
                lon: data.shape_pt_lon
            };


            crayArray[shape_id].path.push(coords);

        }).on('end', function () {
            console.log("cray", crayArray);
            fs.writeFile(shapesJSONfilepath, JSON.stringify(crayArray), function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Output saved to " + shapesJSONfilepath);
                }
            });
            //postTrips();

        });

}

function stops2JSONfile() {
    count = 0;
    var tripArray = [];
    var prev = '';
    var logStream = fs.createWriteStream(stopsJSONfilepath, { 'flags': 'a' });
    // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file

    fs.createReadStream(process.env.LOCAL_PROJECT_PATH + 'stop_times.txt')
        .pipe(csv())
        .on('data', function (data) {

            var trip_id = data.trip_id;
            var stop_id = data.stop_id;
            Stop.findOne({ stop_id: stop_id })
                .then(function (stopdb) {
                    console.log(stopdb);
                    var stop = {
                        stop_id: data.stop_id,
                        arrival: data.arrival_time,
                        departure: data.departure_time,
                        lat: stopdb.lat,
                        lon: stopdb.lon
                    };

                    if (prev != trip_id) {
                        tripArray['previous'] = tripArray['current'];
                        tripArray['current'] = {
                            trip: trip_id,
                            stops: []
                        };
                        if (prev != '') {
                            logStream.write(JSON.stringify(tripArray['previous']) + ',');
                        } else {
                            logStream.write('[');
                        }
                    }
                    console.log(count++);
                    tripArray['current'].stops.push(stop);
                    prev = trip_id;
                });
        }).on('end', function () {
            console.log("cray");
            logStream.end(JSON.stringify(tripArray['current']) + ']');

        });

}

function stops2JSONfileSQL() {
    count = 0;
    var tripArray = [];
    var prev = '';
    var logStream = fs.createWriteStream(stopsJSONfilepath, { 'flags': 'a' });
    // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file

    fs.createReadStream(process.env.LOCAL_PROJECT_PATH + 'stop_times.txt')
        .pipe(csv())
        .on('data', function (data) {

            var pgb = new Pgb();

            var cnn;
            var stopdb;
            var trip_id = data.trip_id;
            var stop_id = data.stop_id;
            pgb.connect(connectionStringPG)
                .then(function (connection) {

                    cnn = connection;

                    return cnn.client.query("SELECT stop_id, lon, lat FROM stops WHERE stop_id = $1",
                        [data.stop_id]);
                })
                .then(function (result) {

                     stopdb = result.rows[0];
                     stop = {
                        stop_id: stop_id,
                        arrival: data.arrival_time,
                        departure: data.departure_time,
                        lat: stopdb.lat,
                        lon: stopdb.lon
                    };

                    if (prev != trip_id) {
                        tripArray['previous'] = tripArray['current'];
                       tripArray['current'] = {
                            trip: trip_id,
                            stops: []
                        };
                        if (prev != '') {
                            logStream.write(JSON.stringify(tripArray['previous']) + ',');
                        } else {
                            logStream.write('[');
                        }
                    }
                    console.log(count++);
                    tripArray['current'].stops.push(stop);
                    prev = trip_id;
                    cnn.done();
                })

                .catch(function (error) {

                    console.log(error);
                });

        }).on('end', function () {
            console.log("cray");
            logStream.end(JSON.stringify(tripArray['current']) + ']');

        });

}
function postStops() {
    count = 0;

    fs.createReadStream(process.env.LOCAL_PROJECT_PATH + 'stops.txt')
        .pipe(csv())
        .on('data', function (data) {

            var stop_id = data.stop_id;

            var newStop = {
                stop_id: stop_id,
                lat: data.stop_lat,
                lon: data.stop_lon
            };

            Stop.create(newStop, function (err) {
                if (err) {
                    console.log("error", err);
                } else {
                    console.log("stored %d stops", count);
                    count++;
                }
            });
        }).on('end', function () {
            console.log("cray");
        });

}

function putStopCoords() {
    count = 0;

    fs.createReadStream(process.env.LOCAL_PROJECT_PATH + 'stops.txt')
        .pipe(csv())
        .on('data', function (data) {

            var stop_id = data.stop_id;
            var coords = {
                lat: data.stop_lat,
                lon: data.stop_lon
            };

            Trip.findOne({ 'stops.$.stop_id': stop_id }, function (err, stoplist) {
                if (err) {
                    console.log("error", err);
                } else {
                    // if (stoplist!=null) {
                    // stoplist.forEach(function (stop, index) {
                    //     if (stop.stop_id == stop_id) {
                    //         stop.coordinates = coords;
                    //     }
                    // });
                    console.log(stoplist);
                    //}
                    // stops.save(function (err) {
                    //     if (err) {
                    //         console.error(err);
                    //     }
                    // });
                }
            });
        }).on('end', function () {
            console.log("cray");
        });

}

function putShapes() {
    var getStream = function () {
        var jsonData = shapesJSONfilepath,
            stream = fs.createReadStream(jsonData, { encoding: 'utf8' }),
            parser = JSONStream.parse('*');
        return stream.pipe(parser);
    }

    getStream().pipe(es.mapSync(function (data) {
        //console.log(data.shape);

        Trip.update({ shape_id: data.shape }, { paths: data.path }, { multi: true }, function (err) {
            if (err) {
                console.log("error", err);
            } else {
                console.log("stored %d shapes", count);
                count++;
            }
        });
    })).on('error', function (err) {
        console.log(err);
    }).on('end', function () {
        console.log("done with streaming/storing json");
    });
}

function postShapes() {
    var getStream = function () {
        var jsonData = shapesJSONfilepath,
            stream = fs.createReadStream(jsonData, { encoding: 'utf8' }),
            parser = JSONStream.parse('*');
        return stream.pipe(parser);
    }

    getStream().pipe(es.mapSync(function (data) {
        // console.log(data.path);
        var newShape = {
            shape_id: data.shape,
            path: data.path
        };

        Shape.create(newShape, function (err) {
            if (err) {
                console.log("error", err);
            } else {
                console.log("stored %d shapes", count);
                count++;
            }
        });
    })).on('error', function (err) {
        console.log(err);
    }).on('end', function () {
        console.log("done with streaming/storing json");
    });
}

function putStops() {
    var getStream = function () {
        var jsonData = stopsJSONfilepath,
            stream = fs.createReadStream(jsonData, { encoding: 'utf8' }),
            parser = JSONStream.parse('*');
        return stream.pipe(parser);
    }

    getStream().pipe(es.mapSync(function (data) {
        //console.log('sssss', data.trip);
        Trip.update({ trip_id: data.trip }, { stops: data.stops }, function (err) {
            if (err) {
                console.log("error", err);
            } else {
                console.log("put ", count);
                count++;
            }
        });
    })).on('error', function (err) {
        console.log(err);
    }).on('end', function () {
        console.log("done with streaming/storing json");
    });
}

function readIntoSQL() {
    count = 0;
    fs.createReadStream(process.env.LOCAL_PROJECT_PATH + 'stops.txt')
        .pipe(csv())
        .on('data', function (data) {

            pg.connect(connectionStringPG, function (err, client, done) {
                if (err) {
                    console.log(err);
                }

                client.query('INSERT INTO stops (stop_id, lat, lon) ' +
                    'VALUES ($1, $2, $3)',
                    [data.stop_id, data.stop_lat, data.stop_lon],
                    function (err, result) {
                        done();

                        if (err) {
                            console.log(err);
                            return;
                        }

                        console.log(count++);
                    });
            });

        }).on('end', function () {
            console.log("cray");

        });


}

