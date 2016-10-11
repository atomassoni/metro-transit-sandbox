var mongoose = require('mongoose');
var CoordSchema = require('./coord').schema;

var StopSchema = mongoose.Schema({
  stop_id: {type: String},
  arrival: {type: String},
  departure: {type: String},
  coordinates: [CoordSchema],
});

module.exports = mongoose.model('Stop', StopSchema);
