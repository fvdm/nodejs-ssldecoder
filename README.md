ssldecoder
==========

Check your domain SSL/TLS setup with the SSL Decoder.org API (unofficial)

[![Build Status](https://travis-ci.org/fvdm/nodejs-ssldecoder.svg?branch=master)](https://travis-ci.org/fvdm/nodejs-ssldecoder)
[![Dependency Status](https://gemnasium.com/badges/github.com/fvdm/nodejs-ssldecoder.svg)](https://gemnasium.com/github.com/fvdm/nodejs-ssldecoder)


* [Node.js](https://nodejs.org)
* [SSL Decoder](https://ssldecoder.org)
* [API documentation](https://github.com/RaymiiOrg/ssl-decoder/blob/master/README.md#json-api)


Example
-------

```js
var ssldecoder = require ('ssldecoder') ();

// Process response data
function processHost (err, data) {
  if (err) {
    console.log (err);
    return;
  }
  
  console.log (data.connection.protocols);
}

// Get certificate details
ssldecoder.host ('myhostname.net', processHost);
```


Installation
------------

`npm install ssldecoder`


#### Configuration

param    | type   | required | default                  | description
:--------|:-------|:---------|:-------------------------|:--------------------------------------
timeout  | number | no       | `20000`                  | Request wait time out in ms, 1000 = 1 sec
endpoint | string | no       | `https://ssldecoder.org` | Send calls to another API


#### Example

```js
// Set timeout to 5 seconds and your own server
var ssldecoder = require ('ssldecoder') ({
  timeout: 5000,
  endpoint: 'https://my-box.tld/path'
});
```


Method .host
------------
**( params, callback )**

Retrieve certificate details from a hostname.


#### Arguments

param    | type             | required | description
:--------|:-----------------|:---------|:-------------------------------------------------------
params   | object or string | yes      | Hostname (string) or [parameters](#parameters) (object)
callback | function         | yes      | `function (err, data) {}`


##### Parameters

param            | type    | required | default                | description
:----------------|:--------|:---------|:-----------------------|:-------------------------------
params.host      | string  | no *     | _resolved from `ip`_   | Hostname
params.ip        | string  | no *     | _resolved from `host`_ | IP address
params.port      | number  | no       | `443`                  | HTTPS port
params.fastcheck | boolean | no       | `false`                | Limited connection data enumeration, no certificate transparency submission


Always provide either `host` or `ip`, or ideally both!
Otherwise the `host` or `ip` is DNS resolved from the other,
selecting only the first result it gets.


#### Example

```js
// Only hostname, let the module lookup the IP
ssldecoder.host ('myhostname.net', processData);

// Only IP, let the module lookup the hostname
var params = {
  ip: '2a01:7c8:aab3:35a::3',
  fastcheck: true
};

ssldecoder.host (params, processData);

// Full control with hostname and IP
var params = {
  host: 'myhostname.net',
  ip: '1.2.3.4'
};

ssldecoder.host (params, processData);
```


Method .csr
-----------
**( csr, callback )**

Process CSR PEM


#### Arguments

argument | type     | required | description
:--------|:---------|:---------|:--------------------------------------------
csr      | string   | yes      | Either `/path/to/csr.pem` or full PEM string
callback | function | yes      | `function (err, data) {}`


#### Example

```js
// Read PEM from path
ssldecoder.csr ('csr.pem', processCSR);

// Send PEM text
var pem = '-----BEGIN CERTIFICATE REQUEST-----\n...';

ssldecoder.csr (pem, processCSR);
```


Author
------

[Franklin van de Meent](https://frankl.in)
