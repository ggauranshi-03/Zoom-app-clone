const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server); // socketio is used to establish real time connections
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidv4 } = require("uuid"); //using specific version of uuid i.e v4
app.set("view engine", "ejs"); // we are setting the view engine for us as ejs
app.use(express.static("public")); // script.js is going to contain all the front-end of the clone
app.use("/peerjs", peerServer); // PeerJS wraps the browser's WebRTC implementation to provide a complete, configurable, and easy-to-use peer-to-peer connection API.
app.get("/", (req, res) => {
  res.redirect(`${uuidv4()}`); //on reaching the root it redirects you to the room whose room id it generates
});
app.get("/:room", (req, res) => {
  res.render("room", { roomID: req.params.room }); //  we are passing roomID to the front in the form of parameter
});

io.on("connection", (socket) => {
  // it basically sets the connection
  socket.on("join-room", (ID, userId) => {
    //console.log("joined room");
    socket.join(ID);
    socket.broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(ID).emit("createMessage", message); //sending the message
    });
  });
});
server.listen(process.env.PORT || 3030);
