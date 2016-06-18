var cheerio = require('cheerio'); // Basically jQuery for node.js 
var rp = require('request-promise');
 
var options = {
    uri: 'http://www.sweetactionicecream.com',
    transform: function (body) {
        return cheerio.load(body);
    }
};
 
rp(options)
    .then(function ($) {
        // Process html like you would with jQuery... 
        console.log($);
    })
    .catch(function (err) {
        // Crawling failed or Cheerio choked... 
        console.log(err);
    });