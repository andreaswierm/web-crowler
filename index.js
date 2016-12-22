const crowler = require('./src/crowler');
const fs = require('fs');
const parseDomain = require('parse-domain');
const path = require('path');

const url = process.argv[2];

const parsedUrl = parseDomain(url);

if (!parsedUrl) {
  process.stdout.write('Invalid URL');

  return;
}

/**
 * @name onProcessFinish
 * @description Saves the collection result to the /reports folder
 */
const onProcessFinish = (result) => {
  var file = path.join(__dirname, 'reports/' + parsedUrl.domain + '.json');

  fs.writeFile(
    file,
    JSON.stringify(result, null, 2),
    null,
    () => {
      process
        .stdout
        .write('\rYour report is ready in this file /reports/' + parsedUrl.domain + '.json');
    });
};

/**
 * @name reportProcessState
 * @description Updates the progress of the URL analysis in the terminal
 */
const reportProcessState = (status) => {
  process
    .stdout
    .write('\rSit back and relax, because this may take awhile (' + status.numberOfUrlsFetched + '/' + status.urlsToFetch + ')');
};

crowler
  .start(
    url,
    reportProcessState,
    onProcessFinish);
