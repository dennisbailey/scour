var cheerio = require('cheerio');
var request = require('request');

var links = [];
var images = [];

var find = function (parsedHTML) {
  // Map over the parsed HTML to find href's inside <a> tags
  parsedHTML('a').map(function(i, link) {
    var href = cheerio(link).attr('href');
    links.push(href);
  });

  // Map over the parsed HTML to find src's inside <img> tags
  parsedHTML('img').map(function(i, link) {
    var src = cheerio(link).attr('src');
    images.push(src);
  });
  
  

};

var requestHTML = function (url) {

  request(url, function(error, response, html) {

    if (error) { console.log(error); }

    else { find(cheerio.load(html)); }
    
    console.log(images);
    
  });

};

module.exports = {
  links : links,
  images : images,
  find : find,
  requestHTML : requestHTML
};
