const config = require("./src/config/config");
require("./src/config/database");
const http = require("http");
const socketio = require("socket.io");

const app = require("./app");

const server = app.listen(config.PORT, () => {
  console.log(`🎉 Server running in port ${config.PORT}🎉`);
});
const httpServer = http.createServer(app);

const io = socketio(
  server,
  {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      credentials: true,
    },
    // Other configuration options
  },
  { pingTimeout: 60000 },
  httpServer
);
require("./src/config/socket")(io);
