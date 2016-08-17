require('dotenv').load();//loads environment variables locally
var express = require("express");
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var poke = require('./routes/poke');
var index = require('./routes/index');

// middleware
app.use(express.static(path.join(__dirname, './public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// express routes

app.use('/poke', poke);
app.use('/*', index);


// mongoose connection, if you'd like to run a local database, set MONGODB_URI in .env file to local address

var connectionString = process.env.MONGODB_URI;

mongoose.connect(connectionString);

mongoose.connection.on('connected', function () {
  console.log('Mongoose connection open ', connectionString);
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose error connecting ', err);
});
// Handle index file separately
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, './public/views/index.html'));
})

app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function() {
    console.log('Listening on port: ', app.get('port'));
});
