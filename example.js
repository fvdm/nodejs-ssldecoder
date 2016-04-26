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
