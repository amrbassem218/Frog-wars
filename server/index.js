import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})
let queue = [];
app.use(cors());
io.on("connection", (socket) => {
    console.log("user logged in");
    socket.on("joinQueue", () => {
        queue.push(socket);
        console.log(queue);
        if(queue.length >= 2){
            const player1 = queue.shift();
            const player2 = queue.shift();
            const gameId = `${player1}-${player2}`;
            player1.emit("gameStart", {gameId: gameId, opponent: player2.id});
            player2.emit("gameStart", {gameId: gameId, opponent: player1.id});
            console.log("they're paired");
            player1.on("message", (message) => {
                player2.emit("message", message);
            })
            player2.on("message", (message) => {
                player1.emit("message", message);
            })
            player1.on("disconnect", () => {
                player1.emit("message","Player disconnected");
                queue = queue.filter((player) => player.id !== player1.id);
            })
            player2.on("disconnect", () => {
                player2.emit("message","Player disconnected");
                queue = queue.filter((player) => player.id !== player2.id);
            })
        }
    })

    socket.on("disconnect", ()=> {
        queue = queue.filter((player) => player.id !== socket.id);
    })
})

const PORT = 5000;
server.listen(PORT, () => {`Listening to port: ${PORT}`})