var dotest = require ('dotest');
var app = require ('./');

var config = {
  timeout: process.env.Timeout || 20000,
  endpoint: process.env.Endpoint || null
};

var ssldecoder = app (config);


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
