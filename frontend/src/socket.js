import { io } from "socket.io-client";

const socket = io("http://localhost:5001", {
  query: { userId: localStorage.getItem("userId") }, // Ensure userId is saved during login
});

export default socket;
