import http from "http";
import WebSocket from "ws";
import express from "express"; // handling http
import { parse } from "path";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  // socket => contact line with browser

  sockets.push(socket);
  socket["nickname"] = "Anonymous";

  console.log("Connected to the Browser");

  socket.on("close", () => console.log("Disconnected from the Browser"));
  socket.on("message", (message) => {
    const parsed = JSON.parse(message);
    switch (parsed.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${parsed.payload}`)
        );
        break;
      case "nickname":
        socket["nickname"] = parsed.payload;
        break;
    }
  });
});

server.listen(3000, () => console.log(`Listening on http://localhost:3000`));
