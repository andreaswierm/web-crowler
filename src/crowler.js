const cheerio = require('cheerio');
const parseDomain = require('parse-domain');
const queue = require('./queue');
const request = require('request');

var urlWhitelist,
    urlsToFetch,
    originalUrl,
    parsedDomain,
    statusCallback,
    resultCallback,
    result = [];

/**
 * @name buildLinkUrl
 * @description Unsure that the URL is absolute
 */
const buildLinkUrl = (path) => {
  if (path.indexOf('#') !== -1) {
    path = path.slice(0, path.indexOf('#'));
  }

  const parsedPath = parseDomain(path);

  if (!parsedPath || !parseDomain(path).domain) {
    return originalUrl + path;
  }

  return path;
}

/**
 * @name canFetchUrl
 * @description Checks if the URL is valid or if it was already fetched
 */
const canFetchUrl = (urlToCheck) => {
  if (
    !!urlWhitelist[urlToCheck] ||
    !!urlsToFetch[urlToCheck] ||
    !parseDomain(urlToCheck) ||
    parseDomain(urlToCheck).domain !== parsedDomain.domain ||
    !!parseDomain(urlToCheck).subdomain
  ) {

    return false;
  } else {
    urlsToFetch[urlToCheck] = true;

    statusCallback({
      numberOfUrlsFetched: Object.keys(urlWhitelist).length,
      urlsToFetch: Object.keys(urlsToFetch).length
    });

    return true;
  }
};

/**
 * @name fetchUrl
 * @description Fetches an URL and extrack all the information
 */
const fetchUrl = (url, onSuccessCallback, onErrorCallback) => {
  var newLinks = [],
      status = {
        url: url,
        assets: []
      };

  request(url, (error, response, html) => {
    if (error || !html) {
      onErrorCallback(status);

      return;
    }

    $ = cheerio.load(html);

    status.assets = getPageAssets($);

    $('a').map((key, linkNode) => {
      var href = linkNode.attribs.href;

      if (!href) {
        return;
      }

      href = buildLinkUrl(href);

      if (!canFetchUrl(href)) {
        return;
      }

      newLinks.push(href);
    });

    onSuccessCallback(status, newLinks);
  });
}

/**
 * @name getPageAssets
 * @description Gets the URLs of all images, scripts and style link tags
 */
const getPageAssets = ($) => {
  var urls = [];

  $('img').map((key, imgNode) => {
    if (imgNode.attribs.src) {
      urls.push(imgNode.attribs.src);
    }
  });

  $('script').map((key, scriptNode) => {
    if (scriptNode.attribs.src) {
      urls.push(scriptNode.attribs.src);
    }
  });

  $('link').map((key, linkNode) => {
    if (linkNode.attribs.href) {
      urls.push(linkNode.attribs.href);
    }
  });

  return urls;
}

/**
 * @name onError
 * @description Handle an error while trying to fetch an URL
 */
const onError = (status) => {
  setUrlFlag(status);
}

/**
 * @name onSuccess
 * @description Handle when the URL was successfully fetched
 */
const onSuccess = (status) => {
  result.push(status);

  setUrlFlag(status);
}

/**
 * @name setUrlFlag
 * @description Sets that an URL was fetched
 */
const setUrlFlag = (status) => {
  urlWhitelist[status.url] = true;

  statusCallback({
    numberOfUrlsFetched: Object.keys(urlWhitelist).length,
    urlsToFetch: Object.keys(urlsToFetch).length
  });

  if (Object.keys(urlWhitelist).length === Object.keys(urlsToFetch).length) {
    resultCallback(result);
  }
}

/**
 * @name start
 * @description Sets up the crowler configuration and starts the process
 */
const start = (url, _statusCallback, _resultCallback) => {
  originalUrl = url;
  parsedDomain = parseDomain(url);
  urlsToFetch = {};
  urlWhitelist = {};

  resultCallback = _resultCallback;
  statusCallback = _statusCallback;

  queue
    .create([url], 10, (item, next) => {
      fetchUrl(item, (status, newLinks) => {
        onSuccess(status);
        queue.push(newLinks);

        next();
      }, (status) => {
        onError(status);

        next()
      });
    });
};

module.exports = {
  buildLinkUrl: buildLinkUrl,
  canFetchUrl: canFetchUrl,
  fetchUrl: fetchUrl,
  getPageAssets: getPageAssets,
  onError: onError,
  onSuccess: onSuccess,
  setUrlFlag: setUrlFlag,
  start: start
};
