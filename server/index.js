import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173/"
    }
})
app.use(cors());

const PORT = 5000;
server.listen(PORT, `Listening to port: ${PORT}`)