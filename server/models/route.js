var mongoose = require('mongoose');

var RouteSchema = mongoose.Schema({
  shortName: {type: String},
  longName: {type: String},
  description: {type: String}
});

module.exports = mongoose.model('Route', RouteSchema);