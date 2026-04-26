import { io } from "socket.io-client";

let socketInstance = null;

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

  if (!token) {
    console.log("No token available for socket connection");
    return null;
  }

  if (socketInstance && !socketInstance.connected) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  }

  return socketInstance;
};

export const getSocket = () => {
  if (!socketInstance || !socketInstance.connected) {
    return connectSocket();
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
