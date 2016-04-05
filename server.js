var express = require('express');
var app = express();
var path = require('path');
app.use(express.static(path.join(__dirname, '/static')));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = {};
var users_connections = {};

var openGames = [];
var openGames_index = 0;

var activeGames = {};

var game_id = 0;
var user_count = 0;

app.get('/game', function(req, res) {
    res.sendFile(__dirname + '/static/game.html');
});

io.on('connection', function(socket) {
    user_count += 1;
    console.log("user_count: "+user_count);
    console.log('new connection ' + socket.id);
    
    socket.on('message', function(msg) {
        console.log('Got message from client: ' + msg);
    });

    socket.on('login',function(userId){
        console.log(userId + ' is login');
        socket.userId = userId; 

        if (!users[userId]) {    
            console.log('creating new user');
            users[userId] = {userId: socket.userId, games:{}};
            users_connections[userId] = socket;
        } else {
            console.log('user found!');
            Object.keys(users[userId].games).forEach(function(gameId) {
                console.log('gameid - ' + gameId);
            });
        }

        socket.emit('login', {session: socket.id});
    });

    socket.on('playnow',function(mode){
        console.log(socket.userId + ' is login');
        var open_new_game = true;
        //FIND AVAILABLE GAME
        if (openGames.length> 0) {
            for (var i=openGames_index;i<openGames.length;i++){
                var game = openGames[i];
                if (game.users.white == null) {
                    socket.gameId = game.id;
                    game.users.white = socket.userId;
                    users[game.users.white].games[game.id] = game.id;
                    socket.emit('startgame', {game: game, color: 'white'});

                    open_new_game = false;
                } else if (game.users.black == null) {
                    game.users.black = socket.userId;
                    users[game.users.black].games[game.id] = game.id;
                    socket.emit('startgame', {game: game, color: 'black'});
                    open_new_game = false;
                }

                if (open_new_game == false) {
                    activeGames[game.id] = game;
                    openGames_index = 1; 
                    break;
                }
            }
        }

        //NEW GAME
        if (open_new_game) {
            game_id ++;
            var game = {
                id: game_id,
                board: null, 
                users: {white: null, black: null}
            };
            socket.gameId = game.id;
            var user_color = Math.floor(Math.random() * 2) + 1;
            if (user_color == 1) {
                game.users.white = socket.userId;
                users[game.users.white].games[game.id] = game.id;
                socket.emit('startgame', {game: game, color: 'white'});
            } else {
                game.users.black = socket.userId;
                users[game.users.black].games[game.id] = game.id;
                socket.emit('startgame', {game: game, color: 'black'});
            }
            //openGames[game.id] = game;
            openGames.push(game);
        }

    });

    socket.on('move', function(move) {
        console.log('Got move from client: ' + move.move);
        socket.broadcast.emit('move', move);
        activeGames[move.gameId].board = move.board;
        //game_id = users[socket.userId].gameid;
    });

    socket.on("resign", function(s) {

    });    

    socket.on("disconnect", function(s) {
        user_count -= 1;
        console.log("Disconnected!!");
        console.log("user_count: "+user_count);
    });
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
});