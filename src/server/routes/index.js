var express = require('express');
var router = express.Router();
// var request = require('request');
// var cheerio = require('cheerio');
// var rp = require('request-promise');
var scour = require('../helpers/scour.js');
// var test = require('../helpers/test.js');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/scour', function(req, res, next) {
  // The URL we will scour
  var url = req.query.url || 'http://www.sweetactionicecream.com/';

  res.send('scouring...')
  
  scour.requestHTML(url);
    
});


module.exports = router;
