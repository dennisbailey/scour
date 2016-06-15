var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/scour', function(req, res, next) {
  // The URL we will scour
  url = req.query.url || 'http://www.sweetactionicecream.com/';

  // The structure of our request call
  // The first parameter is our URL
  // The callback function takes 3 parameters, an error, response status code and the html

  request(url, function(error, response, html) {

      // First we'll check to make sure no errors occurred when making the request
      if (error) { console.log(error); }

      else {
        // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
        var parsedHTML = cheerio.load(html);

        parsedHTML('a').map(function(i, link) {
          var href = cheerio(link).attr('href');
          console.log(href);
        });
      }
  });

});

module.exports = router;
