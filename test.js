var dotest = require ('dotest');
var app = require ('./');

var config = {
  timeout: process.env.Timeout || 20000,
  endpoint: process.env.Endpoint || null
};

var ssl = app (config);


dotest.add ('Module', function (test) {
  test ()
    .info ('config.timeout:   ' + config.timeout)
    .info ('config.endpoint:  ' + (config.endpoint ? 'custom' : 'live'))
    .isFunction ('fail', 'exports', app)
    .isObject ('fail', 'interface', ssl)
    .isFunction ('fail', '.host', ssl && ssl.host)
    .done ();
});

dotest.run ();
