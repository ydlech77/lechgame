import { io } from "socket.io-client";

const socket = io(
  "https://lechgame-server.onrender.com"
);

export default socket;