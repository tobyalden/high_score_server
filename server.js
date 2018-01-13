var request = require('request');
var restify = require('restify');
var corsMiddleware = require('restify-cors-middleware')

var server = restify.createServer();

var cors = corsMiddleware({
    origins: ['*'],
})

server.pre(cors.preflight);
server.use(cors.actual);

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
        res.send(JSON.parse(_body));  
    });
    return next();
});

var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log('listening at %s', port);
});
