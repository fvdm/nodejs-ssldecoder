/*
Name:            ssldecoder
Description:     Access SSLDecoder.org API methods (unofficial)
Author:          Franklin van de Meent (https://frankl.in)
License:         Unlicense (Public Domain, see LICENSE file)
Source code:     https://github.com/fvdm/nodejs-ssldecoder
Contact & bugs:  https://github.com/fvdm/nodejs-ssldecoder/issues
*/


var httpreq = require ('httpreq');
var dns = require ('dns');

var config = {
  endpoint: 'https://ssldecoder.org',
  timeout: 5000
};


/**
 * Convert an object to an array
 *
 * @param obj {object} - The object to convert
 * @returns {array} - The array
 */

function Object2Array (obj) {
  var key;
  var result = [];

  if (obj instanceof Array) {
    return obj;
  }

  if (obj instanceof Object) {
    for (key in obj) {
      result.push (obj [key]);
    }

    return result;
  }

  return obj;
}


/**
 * Deep object iteration
 * Loosely based on http://stackoverflow.com/a/25334210
 *
 * @param obj {object} - The object to process
 * @param func {function} - `function (val, key) { return val + 2; }`
 * @returns {object} - The processed object
 */

function deepMap (obj, func) {
  return Object.keys (obj) .reduce (function (acc, k) {
    if (typeof obj [k] === 'object') {
      acc [k] = deepMap (obj [k], func);
    } else {
      acc [k] = func (obj [k], k);
    }

    return acc;
  }, {});
}


/**
 * Look for certain keys and convert their value to a boolean
 *
 * '1'     -> true
 * ''      -> false
 * 'true'  -> true
 * 'false' -> false
 *
 * @param obj {object} - The object to process
 * @param keys {array} - Keys to look for
 * @returns {object} - The processed object
 */

function boolDozer (obj, keys) {
  obj = deepMap (obj, function (val, key) {
    if (!!~keys.indexOf (key)) {
      if (typeof val === 'string' && !!val.match (/^(1|true)$/)) {
        return true;
      }

      if (typeof val === 'string' && !!val.match (/^(|false)$/)) {
        return false;
      }

      return val;
    }

    return val;
  });

  return obj;
}


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
    error = new Error ('Client error');
    error.error = err;
    callback (error);
    return;
  }

  try {
    data = JSON.parse (data);
  } catch (e) {
    error = new Error ('Invalid response');
    error.statusCode = res.statusCode;
    error.error = e;
    callback (error);
    return;
  }

  if (data && data.error) {
    error = new Error ('API error');
    error.statusCode = res.statusCode;
    error.error = data.error;
    callback (error);
    return;
  }

  if (data && !data.data) {
    error = new Error ('Invalid response');
    error.statusCode = res.statusCode;
    error.data = data;
    callback (error);
    return;
  }

  callback (null, data.data);
}


/**
 * Send API request
 *
 * @callback callback
 * @param params {object} - Data fields to send
 * @param callback {function} - `function (err, data) {}`
 * @returns {void}
 */

function sendRequest (params, callback) {
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
 * Process host response data
 *
 * @callback callback
 * @param err {Error, null} - Response error
 * @param data {object} - Response data
 * @param callback {function} - `function (err, data) {}`
 */

function processHost (err, data, callback) {
  var itm;
  var i;

  var bools = [
    'tlsv1.2',
    'tlsv1.1',
    'tlsv1.0',
    'sslv3',
    'sslv2',
    'working',
    'heartbeat',
    'ca',
    'general',
    'cert_issued_in_future',
    'cert_expired',
    'cert_expires_in_less_than_thirty_days',
    'issuer_valid'
  ];

  if (err) {
    callback (err);
    return;
  }

  // Set boolean values
  data = boolDozer (data, bools);

  // Convert numbered objects to arrays
  data.connection.chain = Object2Array (data.connection.chain);
  data.connection.supported_ciphersuites = Object2Array (data.connection.supported_ciphersuites);
  data.chain = Object2Array (data.chain);

  for (i = 0; i < data.chain.length; i++) {
    itm = data.chain [i];

    if (itm.ocsp) {
      itm.ocsp = Object2Array (itm.ocsp);
    }

    if (itm.crl) {
      itm.crl = Object2Array (itm.crl);
    }

    data.chain [i] = itm;
  }

  // All done
  callback (null, data);
}


/**
 * Method .host
 *
 * @callback callback
 * @param params {object} - Method parameters
 * @param callback {function} - `function (err, data) {}`
 * @returns {void}
 */

function methodHost (params, callback) {
  var send = {
    host: '',
    port: params.port || 443,
    fastcheck: params.fastcheck ? 1 : 0
  };

  // host:ip
  if (typeof params.host === 'string' && !!params.host.match (/:/)) {
    send.host = params.host;
    sendRequest (send, function (rErr, rData) {
      processHost (rErr, rData, callback);
    });
    return;
  }

  // host && ip
  if (params.host && params.ip) {
    send.host = params.host + ':' + params.ip;
    sendRequest (send, function (rErr, rData) {
      processHost (rErr, rData, callback);
    });
    return;
  }

  // host && !ip
  if (params.host && !params.ip) {
    dns.resolve (params.host, function (err, res) {
      if (err) {
        callback (err);
        return;
      }

      send.host = params.host + ':' + res [0];
      sendRequest (send, function (rErr, rData) {
        processHost (rErr, rData, callback);
      });
    });

    return;
  }

  // !host && ip
  if (!params.host && params.ip) {
    dns.reverse (params.ip, function (err, res) {
      if (err) {
        callback (err);
        return;
      }

      send.host = res [0] + ':' + params.ip;
      sendRequest (send, function (rErr, rData) {
        processHost (rErr, rData, callback);
      });
    });

    return;
  }

  callback (new Error ('Invalid host or IP address'));
}
  sendRequest (params, callback);


/**
 * Method .cert
 *
 * @callback callback
 * @param cert {string} - PEM string or filepath
 * @param callback {function} - `function (err, data) {}`
 * @returns {void}
 */

function methodCert (cert, callback) {
  var params = {
    cert: cert
  };

  if (!cert || !(typeof cert === 'string')) {
    callback (new Error ('Cert must be a string'));
    return;
  }

  if (!!cert.match (/^-----BEGIN/)) {
    sendRequest (params, callback);
    return;
  }

  fs.readFile (cert, { encoding: 'utf8' }, function (err, file) {
    params.cert = file;
    sendRequest (params, callback);
  });
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
  if (cnf instanceof Object) {
    config.timeout = cnf.timeout || config.timeout;
    config.endpoint = cnf.endpoint || config.endpoint;
  }

  return {
    host: methodHost,
    cert: methodCert
  };
}

module.exports = setup;
