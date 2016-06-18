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
function findPromise(storedHTML) {
  return new Promise(function(resolve, reject) {
// function find (parsedHTML) {

    if (storedHTML) {
      // Parse the HTML with cheerio
      var parsedHTML = cheerio.load(storedHTML);
      
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
    
        if ( pagesVisited[concatParsedBase] !== true && pagesVisited[concatParsedBase + '/'] !== true && parsedBaseHostname === baseUrlHostname ) { pagesToVisit.push(parsedUniqueLinks[i]); }
      }
    
      console.log('visited: ', pagesVisited);
      console.log('to visit: ', pagesToVisit);
    
      resolve(pagesToVisit.length);
    }

    else { reject(Error("there was an error in the find function")); }

// }

  });
}

// Parse the HTML for a give URL
function requestHTML (url) {

  // Determine the hostname for the starting URL
  baseUrlHostname = new parseURL(url).hostname.replace(/^www\./,'');

  // Populate the list of pages to visit with the hostname to start our search
  pagesToVisit.push('http://' + url.replace(/^(https?:\/\/)?(www\.)?/,''));

  // Scour pages in the pagesToVisit array as long as there are pages left to visit
  do {
    // Determine the next page to scour
    var httpNextPage = nextPage();
    
    // Pull down the HTML and scour it
    requestPromise(httpNextPage)
    .then(findPromise)
    .then( function (result) { console.log('pages to visit', result); return result;  })
    .catch( function (error) { console.log('ERROR: ', error); return error; });
    
    console.log('end of do while block');
    
  } while (pagesToVisit.length);

}

// Add a promise to the request
function requestPromise(addrCurrPage) {
  return new Promise(function(resolve, reject) {
    request(addrCurrPage, function(error, response, html) {
      if (error) { reject(error); }
      else if (response.statusCode == 200) { resolve(html); }
    });
  });
}

// Cleanup and standardize links for comparison
function linkCleanup(links) {

  // Convert relative links to absolute links
  for (var i = 0; i < links.length; i++) {
    if (links[i].charAt(0) === '/') { links[i] = baseUrlHostname + links[i]; }
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
    parsedUniqueLinks.push(cleanup);
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
}

function nextPage () {
  // Determine the next page to scour
    var next = pagesToVisit.pop();
    var nextUrlPathname = new parseURL(next).pathname;
    var nextPageToVisit = baseUrlHostname + nextUrlPathname;

    // Save this page to the list of pages visited
    pagesVisited[nextPageToVisit] = true;

    // Create a valid URL for the request
    return 'http://' + nextPageToVisit;
}


module.exports = {
  requestHTML : requestHTML
};
