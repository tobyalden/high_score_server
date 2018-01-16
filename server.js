require('./secret.js');
var request = require('request');
var restify = require('restify');
var corsMiddleware = require('restify-cors-middleware')

var server = restify.createServer();

var cors = corsMiddleware({
    origins: ['*'],
    allowedMethods: ['GET', 'POST']
})

server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.bodyParser());

server.get('/', function(req, res, next) {
    var options = {
        url: 'https://gardenerhighscores.firebaseio.com/highScores.json',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'User-Agent': 'high-score-table'
        }
    };
    request(options, function(_err, _res, _body) {
        if(_err) {
            res.send(404, {'status': 'Error'});
        }
        else {
            res.send(200, JSON.parse(_body));
        }
    });
    return next();
});

function hashScore(score) {
    return score * process.env.HASH_SECRET % (2^32);
}

server.post('/', function(req, res, next) {
    var log = req.body.log;
    var score = req.body.score;
    var scoreHash = req.body.scoreHash;
    var validateFields = (
        typeof log == 'string'
        && typeof score == 'number'
        && typeof score == 'scoreHash'
    );
    var validateScore = hashScore(score) == scoreHash;
    if(validateFields && validateScore) {
        var options = {
            url: 'https://gardenerhighscores.firebaseio.com/highScores.json?auth=' + process.env.DB_KEY,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'high-score-table'
            },
            json: true,
            body: {
                'log': log,
                'score': score
            }

        };
        request(options, function(_err, _res, _body) {
            if(_err) {
                res.send(404, {'status': 'Error'});
            }
            else {
                res.send(201, {'status': 'Score submitted'});
            }
        });
    }
    return next();
});

var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log('listening at %s', port);
});
