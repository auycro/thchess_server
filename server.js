var express = require('express');
var app = express();
var path = require('path');
app.use(express.static(path.join(__dirname, '/static')));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var users = {};

var openGames = {};
var openGames_users = {};

var activeGames = {};

var game_id = 0;
var user_count = 0;

app.get('/game', function(req, res) {
    //res.sendFile(__dirname + '/static/index.html');
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
        } else {
            console.log('user found!');
            Object.keys(users[userId].games).forEach(function(gameId) {
                console.log('gameid - ' + gameId);
            });
        }

        socket.emit('login', {session: socket.id});
    });

    socket.on('playnow',function(mode){

        var open_new_game = true;
        //FIND AVAILABLE GAME
        if (openGames.length > 0) {
            openGames.forEach(function(game) {
                if (game.users.white == null) {
                    socket.gameId = game.id;
                    game.users.white = socket.userId;
                    users[game.users.white].games[game.id] = game.id;
                    socket.emit('startgame', {game: game, color: 'white'});
                    open_new_game = false;
                } else if (game.users.white == null) {
                    game.users.black = socket.userId;
                    users[game.users.black].games[game.id] = game.id;
                    socket.emit('startgame', {game: game, color: 'black'});
                    open_new_game = false;
                }

                if (open_new_game == false) {
                    delete openGames[game.users.white];
                    activeGames[game.id] = game;
                }
            });
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
            openGames[game.id] = game;
            openGames_users[socket.userId] = socket;
        }

    });

    socket.on('move', function(move) {
    	console.log('Got move from client: ' + move.color);
    	socket.broadcast.emit('move', move);
    	//socket.emit('move', move);
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