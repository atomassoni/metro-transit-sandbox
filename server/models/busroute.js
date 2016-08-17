var mongoose = require('mongoose');
var BusSchema = require('./bus').schema;

var BusrouteSchema = mongoose.Schema({
  created: { type: Number},
  apiData: [BusSchema],
});

module.exports = mongoose.model('Busroute', BusrouteSchema);
