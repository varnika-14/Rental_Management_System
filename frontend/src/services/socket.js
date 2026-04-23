import { io } from "socket.io-client";

let socketInstance = null;

export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!socketInstance) {
    socketInstance = io("http://localhost:5000", {
      transports: ["websocket"],
      auth: { token },
    });
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
