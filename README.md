After cloning the repository you can get this project to launch using npm and node.js.

If you haven't installed them yet:
- [node.js](https://nodejs.org/en/)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Navigate to project folder and execute `npm install`
 
After installing necessary packages the application can be launched using `node app` command.

[Link to the project: Local host](http://localhost:3000/)

*Certain actions are logged to console which may help to understand how the application works.*

For testing the application successfully you need **two** instances running at the same time. Simply put open **two** tabs.

![Starting screen](./public/images/socket-io-guessing-01.png)

After both instances have successfully connected to server and confirmed they are **ready** you should see the actual game.

![Starting screen](./public/images/socket-io-guessing-02.png)

The goal is simple. Be the first to guess the randomly generated number. The application tells if your guess was too high or too low. You can also chat with your opponent with *wholesome* chat feature.

*Note: Wholesomeness depends on the players.*

![Starting screen](./public/images/socket-io-guessing-04.png)

After finishing the round, a new round starts shortly after automatically clearing the guesses.

![Starting screen](./public/images/socket-io-guessing-03.png)

And that's the application.

![Fin](https://media1.giphy.com/media/dToLqyWr703rFSzxL3/giphy.gif?cid=ecf05e47kd6pz4kc78d3lp5wsjaq9p0j3kagetmqgunn0owp&rid=giphy.gif&ct=g)
