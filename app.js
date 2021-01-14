const userNames = require('./users.json');
const express = require('express');
const app = express();
const socket = require('socket.io');
const port = 3000;

const server = app.listen(port, () => {
  console.log(`Listening port: ${port}. Link: http://localhost:${port}`);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const io = socket(server);

function randomNumber(max, min) {
  const randNum = Math.floor(Math.random() * (max - min) + min);
  return randNum;
}

let users = [];
let theNumber = randomNumber(1000, 0);
let ready = 0;
let round = 1;
let waitingTime = 10;

// Päästetään vain kaksi käyttäjää läpi
io.sockets.on('connection', (socket) => {
  // Generate random number which picks random name.
  let randNum = randomNumber(userNames.names.length, 0);
  // Picking a name for user.
  let userName = userNames.names[randNum];

  // Making sure the name isn't same as another user's.
  users.forEach((user) => {
    if (user.name === userName) {
      randNum = randomNumber(userNames.names.length, 0);
      userName = userNames.names[randNum];
    }
  });

  const user = addUser(userName);

  console.log('User connected', user);

  socket.emit('welcome', user);

  socket.on('disconnect', () => {
    if (ready !== 0) ready--;
    console.log('User disconnected', user);
    removeUser(user);
    round = 1;
  });

  socket.on('guess', (data) => {
    user.guesses += 1;

    if (Number(data.message) === theNumber) {
      // Add 1 to the wins
      user.win++;
      // Also add guesses to totalGuesses
      user.totalGuesses += user.guesses;
      // Broadcast this message to every player
      io.sockets.emit('win', {
        message: '<strong>' + user.name + '</strong> is the winner!<span class="guessesUsed">They used ' + 
        user.guesses + ' guesses on this round.</span>',
        //leaderboard: `<p id="${user.name}">${user.name}, wins: ${user.win}, guesses made: ${user.totalGuesses}</p>`,
        leaderboard: `${user.name}, wins: ${user.win}, guesses made: ${user.totalGuesses}`,
        username: user.name
      });
      console.log('User', user.name, 'won! They have', user.win, 'win.');

      // After X secs new round starts
      CountDown();
    }
    else if (Number(data.message) > theNumber) {
      // Broadcast this message to every player
      io.sockets.emit('responseToClient', {
        message: '<p><b>' + user.name + '</b>: ' + data.message + ' too big</p>',
      });
    }
    else if (Number(data.message) < theNumber) {
      // Broadcast this message to every player
      io.sockets.emit('responseToClient', {
        message: '<p><b>' + user.name + '</b>: ' + data.message + ' too small</p>',
      });
    }
  });

  // READY
  // Broadcast user's status. When all players are ready start the game.
  socket.on('ready', () => {
    console.log('User is ready');
    ready++;
    io.sockets.emit('ready', { ready: ready, players: users });
  });

  // CHAT
  socket.on('chatMessage', (msg) => {
    console.log('message:', msg, 'from:', user.name);
    io.emit('chatMessage', { message: msg, name: user.name });
  });
});

function StartNewRound() {
  // New the numebr and increased round value
  theNumber = randomNumber(1000, 0);
  round++;

  // reset guesses
  users.forEach((user) => {
    user.guesses = 0;
  });

  console.log('Starting new round.');
  console.log('The number:', theNumber);
  console.log('Round', round);
}

// When game has a winner -> start counting down when next round starts
function CountDown() {
  setInterval(function() {
    // Message for users
    io.sockets.emit('countdown', {
      message: 'Next round starts in ' + waitingTime + ' second(s).',
      counter: waitingTime,
    });

    // How many secs are left
    waitingTime--;

    // When counter hits below 0 -> stop
    if (waitingTime < 0) {
      waitingTime = 10;
      StartNewRound(); // Start new round
      clearInterval(this); // stops the interval function
      // Client gets the round from this emit function
      io.sockets.emit('newround', {
        round: round
      });
    }
  }, 1000);
}

function addUser(name) {
  const user = {
    name: name,
    guesses: 0,
    totalGuesses: 0,
    win: 0,
  };
  users.push(user);
  updateUsers();
  return user;
}

function removeUser(user) {
  for (let i = 0; i < users.length; i++) {
    if (user.name === users[i].name) {
      users.splice(i, 1);
      updateUsers();
      return;
    }
  }
}

function updateUsers() {
  let string = '';
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    string +=
      user.name + '<span class="guess">(' + user.guesses + ' guesses)</span>';
  }

  io.sockets.emit('users', {
    users: string,
  });
}

/*
    console.log('User connected');

    const user = addUser();
    socket.emit('welcome', user); // Lähetetään yhdelle

    socket.on('disconnect', () => {
      console.log('User disconnected');
      removeUser(user);
      ready--;
    });

    // Broadcast message to other chat users
    socket.on('chatMessage', (msg) => {
      console.log('message:', msg);
      io.emit('chatMessage', msg);
    });

    // Broadcast user's guess to their opponent & check if it's too low or high
    socket.on('guess', (guess) => {
      console.log('Guess:', guess);
      user.guesses += 1;

      const answer = CheckTheGuess(guess, theNumber);

      io.sockets.emit('responseToGuess', answer);
    });

    // Broadcast user's status. When all players are ready start the game.
    socket.on('ready', () => {
      console.log('User is ready');
      ready++;
      io.sockets.emit('ready', { ready: ready });
    });

    socket.on('start', (value) => {
      if (!startGame) {
        startGame = value.start;
        console.log('Game started?', startGame);
        // Arvotaan numero, jota pelaajat arpovat
        theNumber = GenerateNum(1000, 0);
        console.log('The Number:', theNumber);
      }
    });

    // Assign a name to a user.
    socket.on('welcome', () => {
      // Generate random number which picks random name.
      let randNum = GenerateNum(userNames.names.length, 0);
      // Picking a name for user.
      let userName = userNames.names[randNum];

      // Making sure the name isn't same as another user's.
      users.forEach((user) => {
        if (user.name === userName) {
          randNum = GenerateNum(userNames.names.length, 0);
          userName = userNames.names[randNum];
        }
      });
      users.push(addUser(userName));
      console.log(userName, 'Name ID:', randNum);
      console.log(users);

      io.sockets.emit('welcome', user);
    });
*/