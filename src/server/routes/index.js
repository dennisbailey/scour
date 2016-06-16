var express = require('express');
var router = express.Router();
// var request = require('request');
// var cheerio = require('cheerio');
var scour = require('../helpers/scour.js')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/scour', function(req, res, next) {
  // The URL we will scour
  url = req.query.url || 'http://www.sweetactionicecream.com/';

  scour.requestHTML(url);
    
});

module.exports = router;
