var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({
  extended: true,
  parameterLimit: 1000000
}));

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});

app.post('/send-signals', function(req, res) {
  var signals = req.body.signals;
  var buffers = [];

  for (var i = 0; i < signals.length; i++) {
    buffers.push(new Buffer(signals[i] + ','));
  }

  var mainBuffer = Buffer.concat(buffers);

  fs.writeFile('signals.bin', mainBuffer, function(error) {
    if (error) {
      throw error;
    }
  });

  res.sendStatus(200);
});

app.get('/get-signals', function(req, res) {
  fs.readFile('signals.bin', function(error, data) {
    if (error) {
      throw error;
    }

    res.send({
      signals: data.toString().split(',')
    });
  });
});

app.listen(3000, function() {
  console.log('server has started!');
});


