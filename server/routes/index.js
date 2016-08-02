var express = require('express');
var router = express.Router();
var path = require('path');

// Handle index file separately
// Also catches any other request not explicitly matched elsewhere
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../public/views/index.html'));
});

module.exports = router;
