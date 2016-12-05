var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var encoder = require('wav-encoder');

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

    var song = {
        sampleRate: 44100,
        channelData: [
            new Float32Array(signals)
        ]
    };

    encoder.encode(song).then((buffer) => {
        fs.writeFile('song.wav', new Buffer(buffer), function(error) {
            if (error) {
                res.sendStatus(400);
                return;
            }

            res.sendStatus(200);
        })    
    });
});

app.listen(3000, function() {
    console.log('server has started!');
});