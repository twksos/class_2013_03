var express = require('express');
var url = require("url");
var crypto = require('crypto');
var token = 'token';

var app = express();
app.use(express.bodyParser());
app.get('/', function(req, res) {
    var queries = url.parse(req.url, true).query
    var content = validate_query_from_weixin(queries, token);
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end(content);
});

app.post('/', function(req, res) {
    var xml = '';
    req.addListener('data', function(data) {
        xml += data
    });
    req.addListener('end', function(data) {
        console.log(xml);
        var me = match_var(/<ToUserName><!\[CDATA\[(.*?)\]\]><\/ToUserName>/, xml);
        var sender = match_var(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/, xml);
        var msg_type = match_var(/<MsgType><!\[CDATA\[(.*?)\]\]><\/MsgType>/, xml);
        if (sender !== null && me !== null) {
            var return_msg = '不好意思，我只认字。';
            if (msg_type === 'text') {
                var text = match_var(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/, xml);
                return_msg = '你好，你刚才说：\n' + text + '\n对吧';
            }
            
            var response = '<xml>' + '<ToUserName><![CDATA[' + sender + ']]></ToUserName>' + '<FromUserName><![CDATA[' + me + ']]></FromUserName>' + '<CreateTime>' + Date.now() + '</CreateTime>' + '<MsgType><![CDATA[text]]></MsgType>' + '<Content><![CDATA[' + return_msg + ']]></Content>' + '<FuncFlag>0</FuncFlag>' + '</xml>';

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end(response);
        }
    });
});

var port = process.env.PORT || 80
app.listen(port);
function match_var(regex, text){
    if (regex.test(text)){
        return text.match(regex)[1];
    }
}

function validate_query_from_weixin(queries, token) {
    if (queries.nonce) {
        var text = [queries.nonce, queries.timestamp, token].sort().join('');
        var sha1 = crypto.createHash('sha1');
        sha1.update(text);
        if (sha1.digest('hex') === queries.signature) return queries.echostr;
    }
    return 'Hello World!\n';
}