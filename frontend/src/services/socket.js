import { io } from "socket.io-client";

let socketInstance = null;

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
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
