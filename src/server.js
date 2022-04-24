import http from "http";
import SocketIO from "socket.io";
import express from "express"; // handling http

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

const getPublicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
};

const countRoomUsers = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};

wsServer.on("connection", (socket) => {
  socket["nickname"] = "";
  socket.onAny((event) => {
    console.log(`Socket event: ${event}`);
  });
  socket.on("enter_room", (roomName, nickname, done) => {
    socket.join(roomName);
    done();
    socket["nickname"] = nickname;
    socket.to(roomName).emit("welcome", nickname, countRoomUsers(roomName));
    wsServer.sockets.emit("room_change", getPublicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket["nickname"], countRoomUsers(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", getPublicRooms());
  });
  socket.on("new_message", (message, room, done) => {
    socket.to(room).emit("new_message", message, socket["nickname"]);
    done();
  });
});

httpServer.listen(3000, () =>
  console.log(`Listening on http://localhost:3000`)
);
