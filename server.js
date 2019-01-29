const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);

var users = [];
var connections = [];

const port = process.env.PORT || 5000;

server.listen(port);
console.log(`Server is running on PORT ${port} ...`);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", socket => {
  connections.push(socket);
  console.log(`connected: ${connections.length} sockets connected`);

  // Disconnect
  socket.on("disconnect", data => {
    if (!socket.username) return;
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log(`Disconnected: ${connections.length} sockets connected`);
  });

  //send message
  socket.on("send message", data => {
    io.sockets.emit("new message", {
      msg: data,
      user: socket.username
    });
  });

  //new user
  socket.on("new user", (data, callback) => {
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames() {
    io.sockets.emit("get users", users);
  }
});
