var mongoose = require('mongoose');

var BusSchema = mongoose.Schema({
  Bearing : {type: Number},
  BlockNumber : {type: Number},
  Direction : {type: Number},
  LocationTime: {type: Date},
  Odometer : {type: Number},
  Route : {type: String},
  Speed : {type: Number},
  Terminal : {type: String},
  VehicleLatitude : {type: Number},
  VehicleLongitude: {type: Number}
});

module.exports = mongoose.model('Bus', BusSchema);
