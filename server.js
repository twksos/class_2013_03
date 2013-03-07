var express = require('express');
var crypto = require('crypto');
var token = 'token';
var http = require('http');

function simsimi(me,sender,msg_type,text,res) {
    var return_msg = '不好意思，我只认字。';
    if (text) {        
        var options = {
            host: 'api.simsimi.com',
            path: '/request.p?key=ab3c48c2-1d95-4266-92f1-e1436aab9b18&text=' + text + '&lc=ch'
        };
        var return_msg = '我是傻的。';
        http.get(options, function(simsimi_res) {
            var reply = '';
            simsimi_res.addListener('data', function(data) {
                reply += data
            });
            simsimi_res.addListener('end', function(data) {
                eval('var json= ' + reply);
                if (json.result == 100) return_msg = json.response;
                //if (return_msg.indexOf('搜微信号') > 0) return_msg = "哎呀，我刚才发了个呆。";
                var response = '<xml>' + '<ToUserName><![CDATA[' + sender + ']]></ToUserName>' + '<FromUserName><![CDATA[' + me + ']]></FromUserName>' + '<CreateTime>' + Date.now() + '</CreateTime>' + '<MsgType><![CDATA[text]]></MsgType>' + '<Content><![CDATA[' + return_msg + ']]></Content>' + '<FuncFlag>0</FuncFlag>' + '</xml>';
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(response);
            });
        }).on('error', function(e) {
            console.log('ERROR: ' + e.message);
            res.writeHead(500, {'Content-Type': 'text/plain'});
        });        
    }
}

function normal_response(me, sender, msg_type, text, res) {
    var return_msg = '不好意思，我只认字。';
    if (text) {
        return_msg = '你好，你刚才说：\n' + text + '\n对吧';
    }
    var response = '<xml>' + '<ToUserName><![CDATA[' + sender + ']]></ToUserName>' + '<FromUserName><![CDATA[' + me + ']]></FromUserName>' + '<CreateTime>' + Date.now() + '</CreateTime>' + '<MsgType><![CDATA[text]]></MsgType>' + '<Content><![CDATA[' + return_msg + ']]></Content>' + '<FuncFlag>0</FuncFlag>' + '</xml>';
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end(response);
}
var app = express.createServer(express.logger())
app.use(express.bodyParser());
app.get('/', function(req, res) {
    var content = validate_query_from_weixin(req.query, token);
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
            if (msg_type === 'text') {
                var text = match_var(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/, xml);
                simsimi(me,sender,msg_type,text,res);
                //normal_response(me,sender,msg_type,text,res);
            }
        }
    });
});

var port = process.env.PORT || 80
app.listen(port);

function match_var(regex, text) {
    if (regex.test(text)) {
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