import io from "socket.io-client";
const API_URL = process.env.API_URL || "http://localhost:3000";

const socket = io(API_URL, {
  transports: ["websocket", "polling"],
});

export default socket;
