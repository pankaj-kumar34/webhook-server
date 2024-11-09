const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: "/api/socketio",
  });

  io.on("connection", (socket) => {
    socket.on("join", (webhookId) => {
      socket.join(webhookId);
      console.log(`A client joined room: ${webhookId}`);
    });

    socket.on("disconnect", () => {
      console.log("A client disconnected");
    });
  });

  global.io = io;

  server.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
  });
});
