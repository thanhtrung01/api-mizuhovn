
module.exports = (io) => {
 
  io.on("connection", (socket) => {
    

    socket.on("disconnect", (_) => {
      socket.disconnect();
    });
  });
};
