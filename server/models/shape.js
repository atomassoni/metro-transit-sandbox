var mongoose = require('mongoose');


var ShapeSchema = mongoose.Schema({
    shape_id : {type : Number}, 
    path: {type: Array} 
});

module.exports = mongoose.model('Shape', ShapeSchema);