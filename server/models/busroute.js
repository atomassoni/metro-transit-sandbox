var mongoose = require('mongoose');

var BusrouteSchema = mongoose.Schema({
  created: { type: Date},
  apiData: Object,//technically this should be another schema... extra credit to create it!
  //var2: Number
});

module.exports = mongoose.model('Busroute', BusrouteSchema);
