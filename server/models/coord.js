var mongoose = require('mongoose');

var CoordSchema = mongoose.Schema({
    lat: { type: Number},
    lon: { type: Number}

});

module.exports = mongoose.model('Coord', CoordSchema);
