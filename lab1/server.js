var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/send-signals', function(req, res) {
  var signals = req.body;
  console.dir(signals);
});

app.listen(3000);

console.log('server has started!');
