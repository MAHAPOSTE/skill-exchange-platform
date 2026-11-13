
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
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
});

export default socket;
