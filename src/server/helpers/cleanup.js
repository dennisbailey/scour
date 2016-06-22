var parseURL = require('url-parse');

// Cleanup and standardize links for comparison
function linkCleanup(links) {
  // Convert relative links to absolute links
  for (var i = 0; i < links.length; i++) {
    if (links[i] === undefined) { continue; }
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

// Cleanup and standardize links for images
function imageLinkCleanup(images) {
  // Convert relative links to absolute links
  for (var i = 0; i < images.length; i++) {
    if (images[i] === undefined) { continue; }
    if (images[i].charAt(0) === '/') { images[i] = baseUrlHostname + links[i]; }
  }

  // Remove duplicate links and strip the protocol and the www.
  var uniqueImages = findUnique(images);

  // Standardize the links scraped from the current page by removing the protocol and the www.
  var parsedUniqueImages = [];

  uniqueImages.forEach(function(el){
    var hostname = new parseURL(el).hostname;
    var pathname = new parseURL(el).pathname;
    var concat = hostname + pathname;
    var cleanup = 'http://' + concat.replace(/^(https?:\/\/)?(www\.)?/,'');
    parsedUniqueImages.push(cleanup);
  });

  // return an array of links
  return parsedUniqueImages;

}

// Find unique values by sorting the array and checking a value against the previous value
// This is destructive
function findUnique (input) {
  return input.sort().filter(function(item, pos, arr) {
      return !pos || item != arr[pos - 1];
  });
}

module.exports = {
  linkCleanup : linkCleanup,
  imageLinkCleanup : imageLinkCleanup
};
