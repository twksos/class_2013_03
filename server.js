var http = require('http');
var url = require("url");
var crypto = require('crypto');
var sha1 = crypto.createHash('sha1');
var token = 'token';
http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        var queries = url.parse(req.url,true).query
        var text = token + queries.timestamp + queries.nonce;
        if(sha1.update(text) === queries.signature)
          res.end(queries.echostr);
        else 
          res.end('Hello World\n'); 
}).listen(process.env.PORT);
