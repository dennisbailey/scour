var cheerio = require('cheerio');
var request = require('request');

var links = [];
var images = [];

// Find unique values by sorting the array and checking a value against the previous value
// This is destructive
var findUnique = function (input) {
  return input.sort().filter(function(item, pos, arr) {
      return !pos || item != arr[pos - 1];
  });
};

// Find href and src attributes within <a> and <img> tags respectively
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

// Parse the HTML for a give URL
var requestHTML = function (url) {

  request(url, function(error, response, html) {

    if (error) { console.log(error); }

    else if (response.statusCode === 200) { find(cheerio.load(html)); }

  });

};

module.exports = {
  links : links,
  images : images,
  find : find,
  requestHTML : requestHTML
};
