'use strict';
var session = '';
var socket = io(); //io.connect('locahost:3000', {'sync disconnect on unload': true });
socket.on('login', function (res) {
  console.log("session="+res.session);
  session = res.session;
});
socket.on('startgame', function (res){
  console.log("joined as game id: " + res.game.id );
  console.log("color="+res.color);

  player_color = res.color;
  init(res.game);

  $('#page-opening').hide();
  $('#page-game').show();
});
socket.on('move', function (move) {
  if (serverGame && move.gameId === serverGame.id) {
    game.move(move.move);
    board.position(game.fen()); // fen is the board layout
    updateStatus();
  }
});
socket.on('resign', function (move) {
  $('#page-game').hide();
  $('#page-opening').show();
});

//MENU
function LoginGuest() {
  console.log("LoginGuest");
  var d = new Date();
  var username = 'guest'+d.getTime();

  if (username.length > 0) {
    $('#userLabel').text(username);
    $('#greeting').text(GetGreeting());
    socket.emit('login', username);
    
    $('#page-login').hide();
    $('#page-opening').show();
  }
}
function Play() {
  console.log("PlayNow");
  var mode = '600:0';
  socket.emit('playnow', mode);  
}
//UTIL
function GetGreeting(){
  var greeting = "Hello!!";
  return greeting;
}
//Resign
function Resign(){
  socket.emit('resign', {userId: username, gameId: serverGame.id});
}
//SendMove
function SendMove(move){
  socket.emit('move', {move: move, gameId: serverGame.id, board: game.fen()});
}
//SendMessage
var Client = {
  Hello: function(){
    console.log('Hello,World');
  },
  Init: function(){
    socket.on('move', function (msg) {
        game.move(msg);
        board.position(game.fen()); // fen is the board layout
        Client.UpdateStatus;
    });
  },
  Send: function(msg) {
      console.log(msg);
      socket.emit('message', msg);
    },
    SendMove: function(move) {
      socket.emit('move', move);
    },
};