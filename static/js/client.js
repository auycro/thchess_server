'use strict';
var session = '';
var socket = io(); //io.connect('locahost:3000', {'sync disconnect on unload': true });
var player_color = '';
socket.on('login', function (res) {
  console.log("session="+res.session);
  session = res.session;
});

socket.on('joingame', function (res) {
  console.log("join as game id: " + res.game.id );

  if (player_color == 'white'){
    $('#opponentId').text(res.game.users.black);
  } else {
    $('#opponentId').text(res.game.users.white);    
  }
});

socket.on('startgame', function (res) {
  console.log("start as game id: " + res.game.id );
  console.log("color="+res.color);

  player_color = res.color;
  init(res.game);

  $('#page-opening').hide();
  $('#page-game').show();

  if (player_color == 'white'){
    $('#playerId').text(res.game.users.white);
    $('#opponentId').text(res.game.users.black);
  } else {
    $('#playerId').text(res.game.users.black);
    $('#opponentId').text(res.game.users.white);    
  }

  $('#gameId').text(res.game.id);
});
socket.on('move', function (move) {
  if (serverGame && move.gameId === serverGame.id) {
    game.move(move.move);
    board.position(game.fen()); // fen is the board layout
    updateStatus();
  }
});
socket.on('resign', function (msg) {
  console.log('resign');
  $('#page-game').hide();
  $('#page-opening').show();

  if (player_color == msg.color){
    $('#greeting').text('คุณแพ้!!');
  } else {
    $('#greeting').text('คุณชนะ!!'); 
  }
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
  var greeting = "สวัสดี!!";
  return greeting;
}
//Resign
function Resign(){
  socket.emit('resign', {gameId: serverGame.id, color: player_color});
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