var express = require('express');
var fs = require('fs');
var app = express();
var currentID = +(fs.readFileSync('currentID.txt') || 0);
var incrementCurrentID = () => fs.writeFile('currentID.txt', ++currentID);

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

app.options('/classes/messages', (req, res) => {
  var headers = defaultCorsHeaders;
  res.writeHead(200, headers);
  res.end();
});

app.get('/classes/messages', (req, res) => {
  fs.readFile('message.txt', 'utf-8', function(err, data) {
    if (err) {
      res.writeHead(404);
      res.end();
      console.error(err);
      return;
    }
    var messages = '[' + data.slice(0, -1) + ']';
    var responseText = '{"results":' + messages + '}';

    // Response Action
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'application/json';
    res.writeHead(200, headers);
    res.end(responseText);
  });
});

app.post('/classes/messages', (req, res) => {
  var body = [];
  req.on('data', chunk => body.push(chunk.toString()));
  req.on('end', () => {
    body = body.join('');
    body = JSON.parse(body);
    body.objectId = currentID;
    incrementCurrentID();
    
    fs.appendFile('message.txt', JSON.stringify(body) + ',', 
      (err) => {
        if (err) {
          console.error(err);
          res.writeHead(401, headers);
          res.end('');
          return;
        }
        // Response Actions
        var headers = defaultCorsHeaders;
        headers['Content-Type'] = 'application/json';
        res.writeHead(201, headers);
        res.end('{}');   
      });

  });

});

app.use(express.static('../client'));

app.listen(3000);