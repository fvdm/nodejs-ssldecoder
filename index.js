/*
Name:            ssldecoder
Description:     Access SSLDecoder.org API methods (unofficial)
Author:          Franklin van de Meent (https://frankl.in)
License:         Unlicense (Public Domain, see LICENSE file)
Source code:     https://github.com/fvdm/nodejs-ssldecoder
Contact & bugs:  https://github.com/fvdm/nodejs-ssldecoder/issues
*/


var httpreq = require ('httpreq');

var config = {
  endpoint: 'https://ssldecoder.org',
  timeout: 5000
};


/**
 * Process API response
 *
 * @callback callback
 * @param err {Error, null} - Error
 * @param res {object} - Response object
 * @param callback {function} - `function (err, data) {}`
 * @returns {void}
 */

function processResponse (err, res, callback) {
  var data = res && res.body || '';
  var error = null;

  if (err) {
    callback (err);
    return;
  }

  try {
    data = JSON.parse (data);
  } catch (e) {
    callback (new Error ('Invalid response'));
    return;
  }

  callback (null, data);
}


/**
 * Send API request
 *
 * @callback callback
 * @param params {object} - Data fields to send
 * @param callback {function} - `function (err, data) {}`
 * @returns {void}
 */

function sendRequeet (params, callback) {
  var options = {
    url: config.endpoint + '/json.php',
    parameters: params,
    method: 'GET',
    timeout: config.timeout,
    headers: {
      'User-Agent': 'ssldecoder (https://github.com/fvdm/nodejs-ssldecoder)'
    }
  };

  httpreq.doRequest (options, function (err, res) {
    processResponse (err, res, callback);
  });
}


/**
 * Method .host
 *
 * @callback callback
 * @param params {obiect} - Method parameters
 * @param callback {function} - `function (err, data) {}`
 */

function methodHost (params, callback) {
  talk (params, callback);
}

/**
 * Configuration
 *
 * @param [cnf] {object} - Config object
 * @param [cnf.timeout = 5000] {number} - Time out in ms
 * @param [cnf.endpoint = https://ssldecoder.org] {string} - API endpoint
 * @returns {object} - Interface methods
 */

function setup (cnf) {
  config.timeout = cnf.timeout || config.timeout;
  config.endpoint = cnf.endpoint || config.endpoint;

  return {
    host: methodHost
  };
}

module.exports = setup;
