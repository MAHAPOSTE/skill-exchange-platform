
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });

  io.engine.on("connection_error", (err) => {
    console.log("Socket connection error details:");
    console.log("Code:", err.code);
    console.log("Message:", err.message);
    console.log("Context:", err.context);
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      next();
    } catch (error) {
      console.log("Socket authentication failed:", error.message);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Authenticated user connected:", socket.userId);

    socket.join(String(socket.userId));

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });

  return io;
};

export default initializeSocket;
