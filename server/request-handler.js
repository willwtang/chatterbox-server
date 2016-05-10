/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var url = require('url');
var express = require('express');
var fs = require('fs');
var currentID = 0;

var requestHandler = function(request, response) {

  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var handler;
  if (request.method === 'GET') {
    handler = getRequest;
  } else if (request.method === 'POST') {
    handler = postRequest;
  } else if (request.method === 'OPTIONS') {
    handler = optionsRequest;
  }
  var result = handler(request, response) || {statusCode: 404, text: ''};


};


var postRequest = function(request, response) {
  var body = [];
  var endpoint = url.parse(request.url).pathname;
  if (endpoint === '/classes/messages') {
    request.on('data', chunk => body.push(chunk.toString()));
    request.on('end', () => {
      body = body.join('');
      body = JSON.parse(body);
      body.objectId = currentID++;
      fs.appendFile('message.txt', JSON.stringify(body) + ',', 
        (err) => {
          if (err) {
            console.error(err);
            response.writeHead(401, headers);
            response.end('');
            return;
          }
          // Response Actions
          var headers = defaultCorsHeaders;
          headers['Content-Type'] = 'application/json';
          response.writeHead(201, headers);
          response.end('{}');   
        });

    });
  }
};

var getRequest = function(request, response) {
  var responseText, headers, extension;
  var endpoint = url.parse(request.url).pathname;
  if (endpoint === '/classes/messages') {
    fs.readFile('message.txt', 'utf-8', function(err, data) {
      if (err) {
        response.writeHead(404);
        response.end();
        console.error(err);
        return;     
      }
      var messages = '[' + data.slice(0, -1) + ']';
      responseText = '{"results":' + messages + '}';
      // Response Action
      headers = defaultCorsHeaders;
      headers['Content-Type'] = 'application/json';
      response.writeHead(200, headers);
      response.end(responseText);
    });

    return;
  } else {
    // endpoint = /images/spiffygif_46x46.gif
    // read that file in /clients directory
    // Open File 
    // Get Contents
    // Set Response Text to Contents
    if (endpoint === '/') {
      endpoint = '/index.html';
    }
    fs.readFile('../client' + endpoint, 'binary', function (err, data) {
      if (err) {
        response.writeHead(404);
        response.end();
        console.error(err);
        return;
      }
      responseText = data;

      extension = endpoint.split('.').pop();
      extensions = {
        html: 'text/html',
        js: 'text/javascript',
        gif: 'image/gif',
        css: 'text/css'
      };
      
      headers = {'Content-Type': extensions[extension]};
      response.writeHead(200, headers);
      response.end(responseText, 'binary'); 
    });
    return;
  }
  response.writeHead(404);
  response.end();
};
var optionsRequest = function(request, response) {
  var headers = defaultCorsHeaders;
  response.writeHead(200, headers);
  response.end();
};
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
module.exports.requestHandler = requestHandler;

  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.

  // The outgoing status.

  // See the note below about CORS headers.

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
