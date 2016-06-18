var cheerio = require('cheerio');
var request = require('request');
var parseURL = require('url-parse');

// Track the pages that are crawled
var pagesVisited = {};

// Store pages that need to be crawled
var pagesToVisit = [];

// Store the hostname that starts our search
var baseUrlHostname;


// Find href and src attributes within <a> and <img> tags respectively
function find (parsedHTML) {

  // Declare holding arrays for links and image sources
  var links = [];
  var images = [];


  // Map over the parsed HTML to find href's inside <a> tags
  parsedHTML('a').map(function(i, link) {
    var href = cheerio(link).attr('href');
    links.push(href);
  });
  
  parsedHTML('img').map(function(i, link) {
    var src = cheerio(link).attr('src');
    images.push(src);
  });
  
  // Remove duplicates and standardize the link format of all the links found on the current page
  var parsedUniqueLinks = linkCleanup(links);
 
  // Push new links that haven't yet been crawled to the array of pages to visit
  for (var i = 0; i < parsedUniqueLinks.length; i++) {
    
    var parsedBaseHostname = new parseURL(parsedUniqueLinks[i]).hostname;
    var parsedBasePathname = new parseURL(parsedUniqueLinks[i]).pathname;
    var concatParsedBase = parsedBaseHostname.replace(/^www\./,'') + parsedBasePathname;
    
    if ( pagesVisited[concatParsedBase] !== true 
         && pagesVisited[concatParsedBase + '/'] !== true
         && parsedBaseHostname === baseUrlHostname ) { pagesToVisit.push(parsedUniqueLinks[i]) }  
  };

console.log('visited: ', pagesVisited);  
console.log('to visit: ', pagesToVisit);

};

// Parse the HTML for a give URL
function requestHTML (url) {
  
  // Determine the hostname for the starting URL
  baseUrlHostname = new parseURL(url).hostname.replace(/^www\./,'');
  
  // Populate the list of pages to visit with the hostname to start our search
  pagesToVisit.push('http://' + url.replace(/^(https?:\/\/)?(www\.)?/,''));
  
  // Scour pages in the pagesToVisit array as long as there are pages left to visit
  while (pagesToVisit.length) {
    var next = pagesToVisit.pop();
    var nextUrlPathname = new parseURL(next).pathname;
    var nextPageToVisit = baseUrlHostname + nextUrlPathname;
    
    pagesVisited[nextPageToVisit] = true;
    
    var httpNextPage = 'http://' + nextPageToVisit;
    
    requestPromise(httpNextPage)
    .then( function (html) { find(cheerio.load(html)) })
    .catch( function (error) { console.log('ERROR: ', error); return error; });
    
  }
  
};

// Add a promise to the request
function requestPromise(addrCurrPage) {
  return new Promise(function(resolve, reject) {
    request(addrCurrPage, function(error, response, html) {
      if (error) { reject(error); }
      else { resolve(html); }
    });
  });
};

// Cleanup and standardize links for comparison
function linkCleanup(links) {
  
  // Convert relative links to absolute links
  for (var i = 0; i < links.length; i++) { 
    if (links[i].charAt(0) === '/') { links[i] = baseUrlHostname + links[i] }
  }
  
  // Remove duplicate links and strip the protocol and the www.
  var uniqueLinks = findUnique(links);
  
  // Standardize the links scraped from the current page by removing the protocol and the www.
  var parsedUniqueLinks = [];
    
  uniqueLinks.forEach(function(el){
    var hostname = new parseURL(el).hostname;
    var pathname = new parseURL(el).pathname;
    var concat = hostname + pathname;
    var cleanup = 'http://' + concat.replace(/^(https?:\/\/)?(www\.)?/,'');
    parsedUniqueLinks.push(cleanup)
  });
  
  // return an array of links
  return parsedUniqueLinks;

}

// Find unique values by sorting the array and checking a value against the previous value
// This is destructive
function findUnique (input) {
  return input.sort().filter(function(item, pos, arr) {
      return !pos || item != arr[pos - 1];
  });
};


module.exports = {
  requestHTML : requestHTML
};
