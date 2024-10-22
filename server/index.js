
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const Jwt = require("jsonwebtoken");
const { createServer } = require("http");
const cookieParser = require("cookie-parser");

const app = express();
const server = createServer(app);
const secretkey = "mailatimal";
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/login", (req, res) => {
  const token = Jwt.sign({ _Id: "asssnm" }, secretkey);
  res.cookie("token", token, {
    // // httpOnly: true,
    // // secure: true,
    // sameSite: "none",
  });
  res.json({ message: "login success" });
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

io.use(async (socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);
    const token = socket.request.headers.cookie;
    if (!token) return next(new Error("not authenticated"));
    next();
  });
});

io.on("connection", (socket) => {
  console.log("A New User is Connected");

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  socket.on("messages", ({ Roomid, messages, senderid }) => {
    console.log(Roomid, messages);
    socket.to(Roomid).emit("recieve-messages", { Roomid, messages, senderid });
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
