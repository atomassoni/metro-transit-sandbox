var mongoose = require('mongoose');
var CoordSchema = require('./coord').schema;
var StopSchema = require('./stop').schema;
var RouteSchema = require('./route').schema;

var TripSchema = mongoose.Schema({
    trip_id: {type: String},
    shape_id: {type: String},
    route_id: {type: String},
    block_id: {type: Number},
    paths: {type: Array},
    route: RouteSchema,
    stops: [StopSchema]
});

module.exports = mongoose.model('Trip', TripSchema);