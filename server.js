var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var morgan = require('morgan');
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

server.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(server.address());
  console.log('mapchat app listening at http://%s:%s', host, port);
});

var test = [
  { coords: { latitude: 37.7742898, longitude: -122.48193109999998 },
    text: 'hello1jgd;lgkjdfg\nsdfjsdfjskdlj'
  },
  { coords: { latitude: 36.7742898, longitude: -122.48193109999998 },
    text: 'hello2'
  },
  { coords: { latitude: 35.7742898, longitude: -122.48193109999998 },
    text: 'hello3'
  }
  ];

var messages = [];
io.on('connection', function (socket) {
  //io.emit('updateMessages', test);
  socket.on('postMessage', function (data) {
    messages = messages.concat(data);
  });
});

var updateMessages = function(){
  if(messages.length === 0) return;
  io.emit('updateMessages', messages);
  messages = [];
};
global.messageRoutine = setInterval(updateMessages, 500);