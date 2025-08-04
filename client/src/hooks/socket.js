// socket.js
import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    console.log("[socket] 새로 연결합니다.");
    socket = io("http://localhost:3001", {
      transports: ['websocket'],
      reconnection: true
    });
  }
  return socket;
}

