var dotest = require ('dotest');
var app = require ('./');

var ssl = app ();

dotest.add ('Module', function (test) {
  test ()
    .isFunction ('fail', 'exports', app)
    .isObject ('fail', 'interface', ssl)
    .isFunction ('fail', '.host', ssl && ssl.host)
    .done ();
});

dotest.run ();
