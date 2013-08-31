var urlParse = require('url').parse;
var qsParse = require('querystring').parse;
var randomString = require('./index').randomString;

var sessions = { run: {}, log: {} };
var eventid = 0;

exports = module.exports = function(app) {

  app.get('/remote/:id?', function (req, res, next) {
    var url = urlParse(req.url),
        query = qsParse(url.query);

    // save a new session id - maybe give it a token back?
    // serve up some JavaScript
    var id = req.params.id || randomString();
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.end((query.callback || 'callback') + '("' + id + '");');
  });

  app.get('/remote/:id/log', function (req, res) {
    var id = req.params.id;
    res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache'});
    res.write('eventId:0\n\n');

    sessions.log[id] = res;
    sessions.log[id].xhr = req.headers['x-requested-with'] == 'XMLHttpRequest';
  });

  app.post('/remote/:id/log', function (req, res) {
    // post made to send log to jsconsole
    var id = req.params.id;
    // passed over to Server Sent Events on jsconsole.com
    if (sessions.log[id]) {
      sessions.log[id].write('data: ' + req.body.data + '\neventId:' + (++eventid) + '\n\n');

      if (sessions.log[id].xhr) {
        sessions.log[id].end(); // lets older browsers finish their xhr request
      }
    }

    res.writeHead(200, { 'Content-Type' : 'text/plain' });
    res.end();
  });

  app.get('/remote/:id/run', function (req, res) {
    var id = req.params.id;
    res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache'});
    res.write('eventId:0\n\n');
    sessions.run[id] = res;
    sessions.run[id].xhr = req.headers['x-requested-with'] == 'XMLHttpRequest';
  });

  app.post('/remote/:id/run', function (req, res) {
    var id = req.params.id;

    if (sessions.run[id]) {
      sessions.run[id].write('data: ' + req.body.data + '\neventId:' + (++eventid) + '\n\n');

      if (sessions.run[id].xhr) {
        sessions.run[id].end(); // lets older browsers finish their xhr request
      }
    }
    res.writeHead(200, { 'Content-Type' : 'text/plain' });
    res.end();
  });
}
