import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*", // 개발 중 허용
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("join_room", ({ roomId }) => {
    socket.join(roomId);
  });

  socket.on("send_message", (data) => {
    const { roomId, ...message } = data;
    io.to(roomId).emit("receive_message", message);
  });

  socket.on("typing", ({ roomId, senderId }) => {
    socket.to(roomId).emit("user_typing", { senderId });
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.roomId).emit("stop_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("🔌 user disconnected:", socket.id);
  });
});

const port = 3001;
httpServer.listen(port, () => {
  console.log(`🟠 Socket.IO server listening on http://localhost:${port}`);
});
