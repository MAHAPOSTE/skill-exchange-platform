
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  transports: ["polling"],
});

export const connectSocket = (token) => {
  if (!token) {
    console.log("Token not found");
    return;
  }

  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.log("Socket connection error:", error.message);
  console.log("Error description:", error.description);
  console.log("Error context:", error.context);
  console.log("Error data:", error.data);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;
