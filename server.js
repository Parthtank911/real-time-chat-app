import express from "express";
import http from "http";
import { Server } from "socket.io";
import session from "express-session";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import db from "./config/db.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true
}));

app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));
app.use(express.static(path.join(path.resolve(), "public")));

app.use("/", authRoutes);
app.use("/chat", chatRoutes);

const onlineUsers = {}; // userId -> socket.id

io.on("connection", socket => {
  socket.on("join", (userId) => {
    socket.userId = userId;
    onlineUsers[userId] = socket.id;
    io.emit("updateUsers", Object.keys(onlineUsers));
  });

  socket.on("typing", ({ sender_id, receiver_id }) => {
    const receiverSocket = onlineUsers[receiver_id];
    if (receiverSocket) io.to(receiverSocket).emit("typing", sender_id);
  });

  socket.on("sendMessage", ({ sender_id, receiver_id, message }) => {
    db.query(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?,?,?)",
      [sender_id, receiver_id, message],
      (err, result) => {
        if (err) return console.log(err);

        const msgData = {
          id: result.insertId,
          sender_id,
          receiver_id,
          message,
          seen: false
        };

        const senderSocket = onlineUsers[sender_id];
        const receiverSocket = onlineUsers[receiver_id];

        if (senderSocket) io.to(senderSocket).emit("newMessage", msgData);
        if (receiverSocket) io.to(receiverSocket).emit("newMessage", msgData);
      }
    );
  });

  socket.on("disconnect", () => {
    delete onlineUsers[socket.userId];
    io.emit("updateUsers", Object.keys(onlineUsers));
  });
});

const PORT = 3000;
server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
