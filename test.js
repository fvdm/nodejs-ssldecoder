var dotest = require ('dotest');
var app = require ('./');

var config = {
  timeout: process.env.Timeout || 20000,
  endpoint: process.env.Endpoint || null
};

var ssldecoder = app (config);

var csr = [];
var pub = [];

csr.push ('-----BEGIN CERTIFICATE REQUEST-----');
csr.push ('MIIC6zCCAdMCAQAwgaUxCzAJBgNVBAYTAk5MMRYwFAYDVQQIEw1FeGFtcGxlLVN0');
csr.push ('YXRlMRUwEwYDVQQHEwxFeGFtcGxlIENpdHkxFTATBgNVBAoTDFRoZSBJbnRlcm5l');
csr.push ('dDEdMBsGA1UECxMUR2xvYmFsIGNvbW11bmljYXRpb24xEjAQBgNVBAMTCWxvY2Fs');
csr.push ('aG9zdDEdMBsGCSqGSIb3DQEJARYOaW5mb0Bsb2NhbGhvc3QwggEiMA0GCSqGSIb3');
csr.push ('DQEBAQUAA4IBDwAwggEKAoIBAQC90DnuvyjUjsIFYVrMR+QO6fb/vUNH2E/lsxbw');
csr.push ('r/RMK6vASm9RRDpTeuuFt+cK+M10n2qdt+nSqzNDaNV3uBS7rStyq5XFy7Js2Gjj');
csr.push ('//+JWuHH3KyqL9tlD4QLP4FBVUidahG6RDtVIAWCf0kTYjYCe4AHnmmvLiigomgs');
csr.push ('l4455BwGpiiqHv+EW1Y5K3kPDojIFayRZunJl3ZoaPkHHBjWYL2fHnF81oyMOoDA');
csr.push ('omSC17kDysN7OdWt4SaYrAUSwePqRlwNRE5Xc1rpndt+SgNOqVnEhsFUhd4GrHf9');
csr.push ('kFfaC0DAwOI6HUkjmo3v86ty0ZEoYcWQPbU8X9YVwkf9GW7VAgMBAAGgADANBgkq');
csr.push ('hkiG9w0BAQUFAAOCAQEAGbAbjZ8eaLTnZNlvEcexMQPXf2fGW1w0No2JjDzwiLQn');
csr.push ('vxuCCqqu8jgU3txkodV16H+Yd3xHwIdFCiZJTaNptSty6vXROREvRrKKB4sHqfWF');
csr.push ('ZSaaugtwGpU9+2LY5/i+rmgO6iiaOsvWx/pCiDPkazer81k1YpneGmRmLwuzLQsm');
csr.push ('NYFYRH+ijk3A3kcrlMZnVVskkpLDMEchfSkz7M1W7MYHLwmiclP9tOybr+z2xW7G');
csr.push ('zt8H5ErnV1AcVFTcr/wKjJyZ1SxAFZvSEs0u5pcmXcqJQKCzd1sFghGXO9lC3RBX');
csr.push ('WkiNl2pKvnoNR7EnqJqgntD+4Ysncr1QcY+CQrKjtQ==');
csr.push ('-----END CERTIFICATE REQUEST-----');

csr = csr.join ('\n');

pub.push ('-----BEGIN PUBLIC KEY-----');
pub.push ('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvdA57r8o1I7CBWFazEfk');
pub.push ('Dun2/71DR9hP5bMW8K/0TCurwEpvUUQ6U3rrhbfnCvjNdJ9qnbfp0qszQ2jVd7gU');
pub.push ('u60rcquVxcuybNho4///iVrhx9ysqi/bZQ+ECz+BQVVInWoRukQ7VSAFgn9JE2I2');
pub.push ('AnuAB55pry4ooKJoLJeOOeQcBqYoqh7/hFtWOSt5Dw6IyBWskWbpyZd2aGj5BxwY');
pub.push ('1mC9nx5xfNaMjDqAwKJkgte5A8rDeznVreEmmKwFEsHj6kZcDUROV3Na6Z3bfkoD');
pub.push ('TqlZxIbBVIXeBqx3/ZBX2gtAwMDiOh1JI5qN7/OrctGRKGHFkD21PF/WFcJH/Rlu');
pub.push ('1QIDAQAB');
pub.push ('-----END PUBLIC KEY-----');
pub.push ('');

pub = pub.join ('\n');


dotest.add ('Module', function (test) {
  test ()
    .info ('config.timeout:   ' + config.timeout)
    .info ('config.endpoint:  ' + (config.endpoint ? 'custom' : 'live'))
    .isFunction ('fail', 'exports', app)
    .isObject ('fail', 'interface', ssldecoder)
    .isFunction ('fail', '.host', ssldecoder && ssldecoder.host)
    .isFunction ('fail', '.csr', ssldecoder && ssldecoder.csr)
    .done ();
});


dotest.add ('Method .csr - from text', function (test) {
  ssldecoder.csr (csr, function (err, data) {
    test (err)
      .isObject ('fail', 'data', data)
      .isArray ('fail', 'data.chain', data && data.chain)
      .isNotEmpty ('fail', 'data.chain', data && data.chain)
      .isObject ('fail', 'data.chain[0]', data && data.chain && data.chain [0])
      .isExactly ('warn', 'data.chain[0].key', data && data.chain && data.chain [0] .key, pub)
      .done ();
  });
});


dotest.add ('Method .csr - from file', function (test) {
  ssldecoder.csr ('./test.csr', function (err, data) {
    test (err)
      .isObject ('fail', 'data', data)
      .isArray ('fail', 'data.chain', data && data.chain)
      .isNotEmpty ('fail', 'data.chain', data && data.chain)
      .isObject ('fail', 'data.chain[0]', data && data.chain && data.chain [0])
      .isExactly ('warn', 'data.chain[0].key', data && data.chain && data.chain [0] .key, pub)
      .done ();
  });
});


dotest.add ('Method .host', function (test) {
  ssldecoder.host ('myhostname.net', function (err, data) {
    var chain = data && data.chain;
    var chainOcsp = chain && chain [0] && chain [0] .ocsp;
    var connection = data && data.connection;
    var connChain = connection && connection.chain;
    var protocols = connection && connection.protocols;
    var ciphers = connection && connection.supported_ciphersuites;

    test (err)
      .isObject ('fail', 'data', data)
      .isObject ('fail', 'data.connection', connection)
      .isExactly ('fail', 'data.connection.checked_hostname', connection && connection.checked_hostname, 'myhostname.net')
      .isArray ('fail', 'data.connection.chain', connChain)
      .isNotEmpty ('fail', 'data.connection.chain', connChain)
      .isObject ('fail', 'data.connection.chain[0]', connChain && connChain [0])
      .isObject ('fail', 'data.connection.protocols', protocols)
      .isExactly ('warn', 'data.connection.protocols [tlsv1.2]', protocols ['tlsv1.2'], true)
      .isExactly ('warn', 'data.connection.protocols [sslv2]', protocols.sslv2, false)
      .isArray ('fail', 'data.connection.supported_ciphersuites', ciphers)
      .isString ('fail', 'data.connection.supported_ciphersuites[0]', ciphers [0])
      .isArray ('fail', 'data.chain', chain)
      .isNotEmpty ('fail', 'data.chain', chain)
      .isObject ('fail', 'data.chain[0]', chain && chain [0])
      .isObject ('fail', 'data.chain[0].cert_data', chain && chain [0] && chain [0] .cert_data)
      .isArray ('fail', 'data.chain[0].ocsp', chainOcsp)
      .isObject ('warn', 'data.chain[0].ocsp[0]', chainOcsp && chainOcsp [0])
      .done ();
  });
});


dotest.run ();
